---
nav:
  title: Adding Composer Dependencies
  position: 130

---

# Adding Composer Dependencies

Use this guide when your extension needs another PHP package — for example, a library for exports, PDF generation, or an external API client. Like any PHP project, Shopware plugins declare such packages in their `composer.json` via the `require` section.

## Overview

How the dependency gets installed depends on how your plugin is set up:

- **Static plugins or Composer-managed plugins (recommended):** The project's root Composer installation resolves and installs your plugin's dependencies automatically. No extra steps are needed — this is one of the main reasons the [static plugin approach](../plugin-base-guide.md) is recommended.
- **Zip-installed plugins (e.g., distributed via the Shopware Store):** The dependencies are not resolved by the project. You must either let Shopware run Composer during installation by overriding `executeComposerCommands()`, or bundle the packages with your plugin. Both options are described below.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course you'll have to understand PHP, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Adding a Composer package to the `composer.json` file

As an example, in this guide we will install [`exporter`](https://github.com/sebastianbergmann/exporter), a package that provides the functionality to export PHP variables for visualization. 

Before installing, temporarily remove the `shopware/core` entry from the `require` section of your plugin's `composer.json`. Otherwise, Composer would download Shopware itself into your plugin's `vendor` directory.

Now run the following command in your plugin directory:

```bash
composer require sebastian/exporter
```

This adds the package to the `require` section of your plugin's `composer.json` and installs it. Afterwards, add the `shopware/core` requirement back in.

::: warning
The `vendor` directory, where the Composer saves the dependencies, has to be included in the plugin bundle. The plugin bundle size is not allowed to exceed 5 MB.
:::

## Executing composer commands during plugin installation

In order that the additional package our plugin requires are installed as well when our plugin is installed, shopware need to execute composer commands to do so.
Therefore, we need to overwrite the `executeComposerCommands` method in our plugin base class and return true.

```php
// <plugin root>/src/SwagBasicExample.php
<?php declare(strict_types=1);

namespace Swag\BasicExample;

use Shopware\Core\Framework\Plugin;

class SwagBasicExample extends Plugin
{
    public function executeComposerCommands(): bool
    {
        return true;
    }

}
```

## Using the Composer plugin

PHP doesn't require a build system, which means that we can just add `use` statements and then use the Composer dependency directly.

The following code sample imports `SebastianBergmann\Exporter\Exporter` and logs `hello, world!` to the Symfony profiler logs whenever the `NavigationPageLoadedEvent` is fired. Learn how to [register this listener](../framework/event/listening-to-events.md).

```php
// <plugin root>/src/SwagBasicExample.php
<?php
namespace SwagBasicExample\Subscriber;

use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Storefront\Page\Navigation\NavigationPageLoadedEvent;

use Psr\Log\LoggerInterface;
use SebastianBergmann\Exporter\Exporter;

class MySubscriber implements EventSubscriberInterface
{
     private LoggerInterface $logger;

    public function __construct(
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
    }

    public static function getSubscribedEvents(): array
    {
        // Return the events to listen to as array like this:  <event to listen to> => <method to execute>
        return [
            NavigationPageLoadedEvent::class => 'onNavigationPage'
        ];
    }

    public function onNavigationPage(NavigationPageLoadedEvent $event)
    {
        $exporter = new Exporter;
        $this->logger->info($exporter->export('hello, world!'));
    }
}
```

## Adding private Composer dependencies

You can bundle Composer dependencies with your plugin by adding them to the `/packages/` folder of your plugin.

Example structure:

```text
SwagBasicExample
├── packages
│   └── my-private-dependency/
│       ├── composer.json
│       └── src/
│           └── SomeCoolService.php
├── src/
│   └── SwagBasicExample.php
└── composer.json
```

You can then require them like other dependencies:

```text
"require": {
    "my-vendor-name/my-private-dependency": "^1.2.3",
}
```

## More interesting topics

* [Using NPM dependencies](using-npm-dependencies.md)
* [Adding plugin dependencies](add-plugin-dependencies.md)
