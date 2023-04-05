# Adding Composer Dependencies

In this guide you'll learn how to add Composer dependencies to your project.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course you'll have to understand PHP, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. Further a basic understanding Node and NPM is required.

## Adding a Composer plugin to the `composer.json` file

In this guide we will install [`exporter`](https://github.com/sebastianbergmann/exporter), which provides the functionality to export PHP variables for visualization.

Now we can simply install the `exporter` package by adding `"sebastian/exporter": "*"` to the list in `require` section of the `composer.json` of our plugin.

Now we can simply install `exporter` by running `composer require sebastian/exporter` in your plugin directory.

After that we have to add our dependency to shopware back in.

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

The following code sample imports `SebastianBergmann\Exporter\Exporter` and logs `hello, world!` to the Symfony profiler logs whenever the `NavigationPageLoadedEvent` is fired. Learn how to [register this listener](listening-to-events.md).

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
