---
nav:
  title: Extend robots.txt configuration
  position: 20

---

# Extend robots.txt configuration

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

You should also be familiar with [Event listeners](../../plugin-fundamentals/listening-to-events).

::: info
This guide uses EventListeners since each example listens to a single event. If you need to subscribe to multiple events in the same class, consider using an [EventSubscriber](../../plugin-fundamentals/listening-to-events#listening-to-events-via-subscriber) instead.
:::

## Modifying parsed directives

The `RobotsDirectiveParsingEvent` is dispatched after `robots.txt` content is parsed. You can modify the parsed result, add validation, or inject dynamic directives.

This example shows how to dynamically add restrictions for AI crawlers:

```PHP
<?php declare(strict_types=1);

namespace Swag\Example\Listener;

use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Log\Package;
use Shopware\Storefront\Page\Robots\Event\RobotsDirectiveParsingEvent;
use Shopware\Storefront\Page\Robots\ValueObject\RobotsDirective;
use Shopware\Storefront\Page\Robots\ValueObject\RobotsDirectiveType;
use Shopware\Storefront\Page\Robots\ValueObject\RobotsUserAgentBlock;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[Package('storefront')]
#[AsEventListener(event: RobotsDirectiveParsingEvent::class)]
class RobotsExtensionListener
{
    public function __construct(
        private readonly LoggerInterface $logger,
    ) {
    }

    public function __invoke(RobotsDirectiveParsingEvent $event): void
    {
        $parsedRobots = $event->getParsedRobots();

        // Add restrictions for AI crawlers
        $aiCrawlers = ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai'];

        $aiBlock = new RobotsUserAgentBlock(
            userAgents: $aiCrawlers,
            directives: [
                new RobotsDirective(
                    type: RobotsDirectiveType::DISALLOW,
                    value: '/checkout/',
                ),
            ],
        );

        $parsedRobots->addUserAgentBlock($aiBlock);

        $this->logger->info('Extended robots.txt with AI crawler rules');
    }
}
```

The `#[AsEventListener]` attribute registers this class as an event listener automatically, so no manual service registration is needed. The `LoggerInterface` dependency is resolved through autowiring.

## Handling custom directives

The `RobotsUnknownDirectiveEvent` is dispatched when an unknown directive is encountered. Use this to support vendor-specific directives or prevent warnings for known non-standard directives:

```PHP
<?php declare(strict_types=1);

namespace Swag\Example\Listener;

use Shopware\Core\Framework\Log\Package;
use Shopware\Storefront\Page\Robots\Event\RobotsUnknownDirectiveEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[Package('storefront')]
#[AsEventListener(event: RobotsUnknownDirectiveEvent::class)]
class CustomDirectiveListener
{
    public function __invoke(RobotsUnknownDirectiveEvent $event): void
    {
        // Support Google and Yandex specific directives
        $knownCustomDirectives = ['noimageindex', 'noarchive', 'clean-param'];

        if (in_array(strtolower($event->getDirectiveName()), $knownCustomDirectives, true)) {
            $event->setHandled(true); // Prevent "unknown directive" warning
        }
    }
}
```

The `#[AsEventListener]` attribute registers this class as an event listener automatically, so no manual service registration is needed.

## Validation and parse issues

You can add validation warnings or errors during parsing using the `ParseIssue` class. This example shows common validation scenarios:

```PHP
<?php declare(strict_types=1);

namespace Swag\Example\Listener;

use Shopware\Core\Framework\Log\Package;
use Shopware\Storefront\Page\Robots\Event\RobotsDirectiveParsingEvent;
use Shopware\Storefront\Page\Robots\Parser\ParseIssue;
use Shopware\Storefront\Page\Robots\Parser\ParseIssueSeverity;
use Shopware\Storefront\Page\Robots\ValueObject\RobotsDirectiveType;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[Package('storefront')]
#[AsEventListener(event: RobotsDirectiveParsingEvent::class)]
class RobotsValidationListener
{
    public function __invoke(RobotsDirectiveParsingEvent $event): void
    {
        $parsedRobots = $event->getParsedRobots();

        // Validate crawl-delay values
        foreach ($parsedRobots->getUserAgentBlocks() as $block) {
            foreach ($block->getDirectives() as $directive) {
                if ($directive->getType() === RobotsDirectiveType::CRAWL_DELAY) {
                    $value = (int) $directive->getValue();

                    if ($value <= 0) {
                        $event->addIssue(new ParseIssue(
                            severity: ParseIssueSeverity::ERROR,
                            message: 'Invalid crawl-delay value: must be a positive integer',
                            lineNumber: null,
                        ));
                    }

                    if ($value > 10) {
                        $event->addIssue(new ParseIssue(
                            severity: ParseIssueSeverity::WARNING,
                            message: 'Crawl-delay value is very high. This may significantly slow down indexing.',
                            lineNumber: null,
                        ));
                    }
                }
            }
        }

        // Check for conflicting Allow/Disallow directives
        foreach ($parsedRobots->getUserAgentBlocks() as $block) {
            $disallowed = [];
            $allowed = [];

            foreach ($block->getDirectives() as $directive) {
                if ($directive->getType() === RobotsDirectiveType::DISALLOW) {
                    $disallowed[] = $directive->getValue();
                } elseif ($directive->getType() === RobotsDirectiveType::ALLOW) {
                    $allowed[] = $directive->getValue();
                }
            }

            foreach ($allowed as $allowPath) {
                foreach ($disallowed as $disallowPath) {
                    if ($allowPath === $disallowPath) {
                        $event->addIssue(new ParseIssue(
                            severity: ParseIssueSeverity::WARNING,
                            message: sprintf('Conflicting directives: Path "%s" is both allowed and disallowed', $allowPath),
                            lineNumber: null,
                        ));
                    }
                }
            }
        }
    }
}
```

The `#[AsEventListener]` attribute registers this class as an event listener automatically, so no manual service registration is needed.

Issues are automatically logged when the `robots.txt` configuration is saved in the Administration. Use `WARNING` for recommendations and `ERROR` for critical problems that prevent proper generation.
