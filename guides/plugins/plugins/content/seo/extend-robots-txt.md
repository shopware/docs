---
nav:
  title: Extend robots.txt configuration
  position: 20

---

# Extend robots.txt configuration

## Overview

Since Shopware 6.7.1, the platform provides full `robots.txt` support with all standard directives and user-agent blocks. This feature was developed as an open-source contribution during October 2024 ([learn more](https://www.shopware.com/en/news/hacktoberfest-2024-outcome-a-robots-txt-for-shopware/)). For general configuration, refer to the [user documentation](https://docs.shopware.com/en/shopware-6-en/tutorials-and-faq/creation-of-robots-txt).

Starting with Shopware 6.7.5, you can extend the `robots.txt` functionality through events to:

* Add custom validation rules during parsing
* Modify or generate directives dynamically
* Support custom or vendor-specific directives
* Prevent warnings for known non-standard directives

::: info
The events described in this guide require Shopware 6.7.5 or later.
:::

## Prerequisites

This guide requires you to have a basic plugin running. If you don't know how to create a plugin, head over to the plugin base guide:

<PageRef page="../../plugin-base-guide" />

You should also be familiar with [Event subscribers](../../plugin-fundamentals/listening-to-events).

## Modifying parsed directives

The `RobotsDirectiveParsingEvent` is dispatched after `robots.txt` content is parsed. You can modify the parsed result, add validation, or inject dynamic directives.

This example shows how to add AI crawler restrictions and validate crawl-delay values:

<Tabs>
<Tab title="RobotsExtensionSubscriber.php">

```php
<?php declare(strict_types=1);

namespace Swag\Example\Subscriber;

use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\Log\Package;
use Shopware\Storefront\Page\Robots\Event\RobotsDirectiveParsingEvent;
use Shopware\Storefront\Page\Robots\Parser\ParseIssue;
use Shopware\Storefront\Page\Robots\Parser\ParseIssueSeverity;
use Shopware\Storefront\Page\Robots\ValueObject\RobotsDirective;
use Shopware\Storefront\Page\Robots\ValueObject\RobotsDirectiveType;
use Shopware\Storefront\Page\Robots\ValueObject\RobotsUserAgentBlock;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

#[Package('storefront')]
class RobotsExtensionSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly LoggerInterface $logger,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            RobotsDirectiveParsingEvent::class => 'onRobotsParsing',
        ];
    }

    public function onRobotsParsing(RobotsDirectiveParsingEvent $event): void
    {
        $parsedRobots = $event->getParsedRobots();

        // 1. Add restrictions for AI crawlers
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

        // 2. Validate existing crawl-delay values
        foreach ($parsedRobots->getUserAgentBlocks() as $block) {
            foreach ($block->getDirectives() as $directive) {
                if ($directive->getType() === RobotsDirectiveType::CRAWL_DELAY) {
                    $value = (int) $directive->getValue();

                    if ($value > 60) {
                        $event->addIssue(new ParseIssue(
                            severity: ParseIssueSeverity::WARNING,
                            message: sprintf(
                                'Crawl-delay of %d seconds may be too high',
                                $value
                            ),
                            lineNumber: null,
                        ));
                    }
                }
            }
        }

        $this->logger->info('Extended robots.txt with AI crawler rules');
    }
}
```

</Tab>

<Tab title="services.xml">

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\Example\Subscriber\RobotsExtensionSubscriber">
            <argument type="service" id="logger"/>
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

## Handling custom directives

The `RobotsUnknownDirectiveEvent` is dispatched when an unknown directive is encountered. Use this to support vendor-specific directives or prevent warnings for known non-standard directives:

<Tabs>
<Tab title="CustomDirectiveSubscriber.php">

```php
<?php declare(strict_types=1);

namespace Swag\Example\Subscriber;

use Shopware\Core\Framework\Log\Package;
use Shopware\Storefront\Page\Robots\Event\RobotsUnknownDirectiveEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

#[Package('storefront')]
class CustomDirectiveSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            RobotsUnknownDirectiveEvent::class => 'handleCustomDirective',
        ];
    }

    public function handleCustomDirective(RobotsUnknownDirectiveEvent $event): void
    {
        // Support Google and Yandex specific directives
        $knownCustomDirectives = ['noimageindex', 'noarchive', 'clean-param'];

        if (in_array(strtolower($event->getDirectiveName()), $knownCustomDirectives, true)) {
            $event->setHandled(true); // Prevent "unknown directive" warning
        }
    }
}
```

</Tab>

<Tab title="services.xml">

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\Example\Subscriber\CustomDirectiveSubscriber">
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

## Parse issues

You can add validation warnings or errors during parsing using the `ParseIssue` class. This example shows a complete subscriber that validates sitemap directives:

<Tabs>
<Tab title="RobotsValidationSubscriber.php">

```php
<?php declare(strict_types=1);

namespace Swag\Example\Subscriber;

use Shopware\Core\Framework\Log\Package;
use Shopware\Storefront\Page\Robots\Event\RobotsDirectiveParsingEvent;
use Shopware\Storefront\Page\Robots\Parser\ParseIssue;
use Shopware\Storefront\Page\Robots\Parser\ParseIssueSeverity;
use Shopware\Storefront\Page\Robots\ValueObject\RobotsDirectiveType;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

#[Package('storefront')]
class RobotsValidationSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            RobotsDirectiveParsingEvent::class => 'validateRobots',
        ];
    }

    public function validateRobots(RobotsDirectiveParsingEvent $event): void
    {
        $parsedRobots = $event->getParsedRobots();

        // Check if sitemap directive exists
        $hasSitemap = false;
        foreach ($parsedRobots->getDirectives() as $directive) {
            if ($directive->getType() === RobotsDirectiveType::SITEMAP) {
                $hasSitemap = true;
                break;
            }
        }

        if (!$hasSitemap) {
            $event->addIssue(new ParseIssue(
                severity: ParseIssueSeverity::WARNING,
                message: 'Consider adding a sitemap directive for better SEO',
                lineNumber: null,
            ));
        }

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
                }
            }
        }
    }
}
```

</Tab>

<Tab title="services.xml">

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\Example\Subscriber\RobotsValidationSubscriber">
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

Issues are automatically logged when the `robots.txt` configuration is saved in the Administration. Use `WARNING` for recommendations and `ERROR` for critical problems that prevent proper generation.
