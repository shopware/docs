# Adding Composer Dependencies

In this guide you'll learn how to add Composer dependencies to your project.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course you'll have to understand PHP, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. Further a basic understanding Node and NPM is required.

## Adding a Composer plugin to the `composer.json` file

In this guide we will install [`exporter`](https://github.com/sebastianbergmann/exporter), which provides the functionality to export PHP variables for visualization.

We have to manually remove all of the references to Shopware itself from the `composer.json` file, that was created in the [Plugin base guide](../plugin-base-guide), before we add our own dependencies to it. This is done to prevent `composer` from downloading Shopware into the `vendor` folder.

Now we can simply install `exporter` by running `composer require sebastian/exporter` in your plugin directory.

After that we have to add our dependency to shopware back in.

::: warning
The `vendor` directory, where the Composer saves the dependencies, has to be included in the plugin bundle. The plugin bundle size is not allowed to exceed 5 MB.
:::

## Loading the `autoload.php`

The `composer require` command created the `autoload.php` that we now need to require in our plugin.

```php
// <plugin root>/src/SwagBasicExample.php
if (file_exists(dirname(__DIR__) . '/vendor/autoload.php')) {
    require_once dirname(__DIR__) . '/vendor/autoload.php';
}
```

## Using the Composer plugin

PHP doesn't require a build system, which means that we can just add `use` statements and then use the Composer dependency directly.

The following code sample imports `SebastianBergmann\Exporter\Exporter` and logs `hello, world!` to the Symfony profiler logs whenever the `NavigationPageLoadedEvent` is fired. Learn how to [register this listener](listening-to-events).

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

* [Using NPM dependencies](using-npm-dependencies)
* [Adding plugin dependencies](add-plugin-dependencies)
