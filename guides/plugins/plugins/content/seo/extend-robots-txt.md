---
nav:
  title: Extend robots.txt Configuration
  position: 20

---

# Extend robots.txt Configuration

## Overview

Since Shopware 6.7.1, the platform provides full `robots.txt` support with all standard directives and user-agent blocks.
This feature was developed as an open-source contribution during Hacktober 2024 ([learn more](https://www.shopware.com/en/news/hacktoberfest-2024-outcome-a-robots-txt-for-shopware/)).
For general configuration, refer to the [user documentation](https://docs.shopware.com/en/shopware-6-en/tutorials-and-faq/creation-of-robots-txt).

::: info
The events and features described in this guide are available since Shopware 6.7.5.
:::

You can extend the `robots.txt` functionality through events to:

* Add custom validation rules during parsing
* Modify or generate directives dynamically
* Support custom or vendor-specific directives
* Prevent warnings for known non-standard directives

## Prerequisites

This guide requires you to have a basic plugin running. If you don't know how to create a plugin, head over to the plugin base guide:

<PageRef page="../../plugin-base-guide" />

You should also be familiar with [Event listeners](../../framework/event/listening-to-events.md).

::: info
This guide uses EventListeners since each example listens to a single event. If you need to subscribe to multiple events in the same class, consider using an [EventSubscriber](../../framework/event/listening-to-events.md#creating-your-own-subscriber) instead.
:::

## Modifying parsed directives

The `RobotsDirectiveParsingEvent` is dispatched after `robots.txt` content is parsed. You can modify the parsed result, add validation, or inject dynamic directives.

This example shows how to dynamically add restrictions for AI crawlers:

<Tabs>
<Tab title="RobotsExtensionListener.php">

```PHP
<?php declare(strict_types=1);

namespace Swag\Example\Listener;

use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Log\Package;
use Shopware\Storefront\Page\Robots\Event\RobotsDirectiveParsingEvent;
use Shopware\Storefront\Page\Robots\Struct\RobotsDirective;
use Shopware\Storefront\Page\Robots\Struct\RobotsDirectiveType;
use Shopware\Storefront\Page\Robots\Struct\RobotsUserAgentBlock;
use Shopware\Storefront\Page\Robots\Parser\ParsedRobots;

#[Package('storefront')]
class RobotsExtensionListener
{
    public function __construct(
        private readonly LoggerInterface $logger,
    ) {
    }

    public function __invoke(RobotsDirectiveParsingEvent $event): void
    {
        $parsedRobots = $event->parsedResult;

        // Add restrictions for AI crawlers
        $aiCrawlers = ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai'];

        $aiBlocks = [];
        foreach ($aiCrawlers as $userAgent) {
            $aiBlocks[] = new RobotsUserAgentBlock(
                userAgent: $userAgent,
                directives: [
                    new RobotsDirective(
                        type: RobotsDirectiveType::DISALLOW,
                        value: '/checkout/',
                    ),
                ],
            );
        }

        $event->parsedResult = new ParsedRobots(
            userAgentBlocks: [...$parsedRobots->userAgentBlocks, ...$aiBlocks],
            orphanedPathDirectives: $parsedRobots->orphanedPathDirectives,
            issues: $parsedRobots->issues,
        );

        $this->logger->info('Extended robots.txt with AI crawler rules');
    }
}
```

</Tab>

<Tab title="services.php">

```php
<?php declare(strict_types=1);

use Shopware\Storefront\Page\Robots\Event\RobotsDirectiveParsingEvent;
use Swag\Example\Listener\RobotsExtensionListener;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(RobotsExtensionListener::class)
        ->args([
            service('logger'),
        ])
        ->tag('kernel.event_listener', ['event' => RobotsDirectiveParsingEvent::class]);
};
```

</Tab>
</Tabs>

## Handling custom directives

The `RobotsUnknownDirectiveEvent` is dispatched when an unknown directive is encountered. Use this to support vendor-specific directives or prevent warnings for known non-standard directives:

<Tabs>
<Tab title="CustomDirectiveListener.php">

```PHP
<?php declare(strict_types=1);

namespace Swag\Example\Listener;

use Shopware\Core\Framework\Log\Package;
use Shopware\Storefront\Page\Robots\Event\RobotsUnknownDirectiveEvent;

#[Package('storefront')]
class CustomDirectiveListener
{
    public function __invoke(RobotsUnknownDirectiveEvent $event): void
    {
        // Support Google and Yandex specific directives
        $knownCustomDirectives = ['noimageindex', 'noarchive', 'clean-param'];

        if (in_array(strtolower($event->directiveType), $knownCustomDirectives, true)) {
            $event->handled = true; // Prevent "unknown directive" warning
        }
    }
}
```

</Tab>

<Tab title="services.php">

```php
<?php declare(strict_types=1);

use Shopware\Storefront\Page\Robots\Event\RobotsUnknownDirectiveEvent;
use Swag\Example\Listener\CustomDirectiveListener;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(CustomDirectiveListener::class)
        ->tag('kernel.event_listener', ['event' => RobotsUnknownDirectiveEvent::class]);
};
```

</Tab>
</Tabs>

## Validation and parse issues

You can add validation warnings or errors during parsing using the `ParseIssue` class. This example shows common validation scenarios:

<Tabs>
<Tab title="RobotsValidationListener.php">

```PHP
<?php declare(strict_types=1);

namespace Swag\Example\Listener;

use Shopware\Core\Framework\Log\Package;
use Shopware\Storefront\Page\Robots\Event\RobotsDirectiveParsingEvent;
use Shopware\Storefront\Page\Robots\Parser\ParseIssue;
use Shopware\Storefront\Page\Robots\Parser\ParseIssueSeverity;
use Shopware\Storefront\Page\Robots\Parser\ParsedRobots;
use Shopware\Storefront\Page\Robots\Struct\RobotsDirectiveType;

#[Package('storefront')]
class RobotsValidationListener
{
    public function __invoke(RobotsDirectiveParsingEvent $event): void
    {
        $parsedRobots = $event->parsedResult;
        $issues = $parsedRobots->issues;
        $lineNumbers = [];

        foreach (explode("\n", $event->text) as $lineIndex => $line) {
            $parts = explode(':', trim($line), 2);
            if (count($parts) !== 2) {
                continue;
            }

            $type = RobotsDirectiveType::tryFromInsensitive(trim($parts[0]));
            if ($type !== null) {
                $key = $type->value . ': ' . trim($parts[1]);
                $lineNumbers[$key][] = [$lineIndex + 1, trim($line)];
            }
        }

        $lineFor = static function (RobotsDirectiveType $type, string $value) use (&$lineNumbers): array {
            $key = $type->value . ': ' . $value;
            $matchingLines = $lineNumbers[$key] ?? [];
            if ($matchingLines === []) {
                return [0, ''];
            }

            $line = array_shift($matchingLines);
            $lineNumbers[$key] = $matchingLines;

            return $line;
        };

        // Validate crawl-delay values
        foreach ($parsedRobots->userAgentBlocks as $block) {
            foreach ($block->directives as $directive) {
                if ($directive->type === RobotsDirectiveType::CRAWL_DELAY) {
                    $value = (int) $directive->value;
                    [$lineNumber, $lineContent] = $lineFor($directive->type, $directive->value);

                    if ($value <= 0) {
                        $issues[] = new ParseIssue(
                            severity: ParseIssueSeverity::ERROR,
                            lineNumber: $lineNumber,
                            lineContent: $lineContent,
                            reason: 'Invalid crawl-delay value: must be a positive integer',
                        );
                    }

                    if ($value > 10) {
                        $issues[] = new ParseIssue(
                            severity: ParseIssueSeverity::WARNING,
                            lineNumber: $lineNumber,
                            lineContent: $lineContent,
                            reason: 'Crawl-delay value is very high. This may significantly slow down indexing.',
                        );
                    }
                }
            }
        }

        // Check for conflicting Allow/Disallow directives
        foreach ($parsedRobots->userAgentBlocks as $block) {
            $disallowed = [];
            $allowed = [];

            foreach ($block->directives as $directive) {
                if ($directive->type === RobotsDirectiveType::DISALLOW) {
                    $disallowed[] = [$directive->value, ...$lineFor($directive->type, $directive->value)];
                } elseif ($directive->type === RobotsDirectiveType::ALLOW) {
                    $allowed[] = [$directive->value, ...$lineFor($directive->type, $directive->value)];
                }
            }

            foreach ($allowed as [$allowPath, $allowLineNumber, $allowLineContent]) {
                foreach ($disallowed as [$disallowPath]) {
                    if ($allowPath === $disallowPath) {
                        $issues[] = new ParseIssue(
                            severity: ParseIssueSeverity::WARNING,
                            lineNumber: $allowLineNumber,
                            lineContent: $allowLineContent,
                            reason: sprintf('Conflicting directives: Path "%s" is both allowed and disallowed', $allowPath),
                        );
                    }
                }
            }
        }

        $event->parsedResult = new ParsedRobots(
            userAgentBlocks: $parsedRobots->userAgentBlocks,
            orphanedPathDirectives: $parsedRobots->orphanedPathDirectives,
            issues: $issues,
        );
    }
}
```

</Tab>

<Tab title="services.php">

```php
<?php declare(strict_types=1);

use Shopware\Storefront\Page\Robots\Event\RobotsDirectiveParsingEvent;
use Swag\Example\Listener\RobotsValidationListener;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(RobotsValidationListener::class)
        ->tag('kernel.event_listener', ['event' => RobotsDirectiveParsingEvent::class]);
};
```

</Tab>
</Tabs>

Issues are automatically logged when the `robots.txt` configuration is saved in the Administration. Use `WARNING` for recommendations and `ERROR` for critical problems that prevent proper generation.
