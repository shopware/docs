# Adding Composer Dependencies

In this guide you'll learn how to add Composer dependencies to your project.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course you'll have to understand PHP, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. Further a basic understanding Node and NPM is required.

## Adding a composer package to the `composer.json` file

In this guide we will install [`exporter`](https://github.com/sebastianbergmann/exporter), which provides the functionality to export PHP variables for visualization.

Now we can simply install the `exporter` package by adding `"sebastian/exporter": "*"` to the list in `require` section of the `composer.json` of our plugin.

```javascript
{
    "name": "swag/basic-example",
    "description": "Description for the plugin SwagBasicExample",
    "version": "1.0.0",
    "type": "shopware-platform-plugin",
    "license": "MIT",
    "authors": [
        {
            "name": "Shopware"
        }
    ],
    "require": {
        "shopware/core": "6.5.*", 
        "sebastian/exporter": "*" // <--- the package we want to install
    },
    "extra": {
        "shopware-plugin-class": "Swag\\BasicExample\\SwagBasicExample",
        "label": {
            "de-DE": "Der angezeigte lesbare Name für das Plugin",
            "en-GB": "The displayed readable name for the plugin"
        },
        "description": {
            "de-DE": "Beschreibung in der Administration für das Plugin",
            "en-GB": "Description in the administration for this plugin"
        }
    },
    "autoload": {
        "psr-4": {
            "Swag\\BasicExample\\": "src/"
        }
    }
}
```

## Executing composer commands during plugin installation

In order that the additional package our plugin requires are installed as well when our plugin is installed, shopware need to execute composer commands to do so.
Therefore, we need to overwrite the `executeComposerCommands` method in our plugin base class and return true.

{% code title="<plugin root>/src/SwagBasicExample.php" %}

```php
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

{% endcode %}

This will lead to the execution of a `composer require swag/basic-example` on plugin installation and update and `composer remove swag/basic-example` upon plugin uninstall.
Thus, we don't have to ship the dependencies with our plugin anymore and composer will pick the correct version of our dependencies even if some other plugin may also require the same package (as long as the requirements are generally compatible).

## Using the composer package

PHP doesn't require a build system, which means that we can just add `use` statements and then use the composer dependency directly.

The following code sample imports `SebastianBergmann\Exporter\Exporter` and logs `hello, world!` to the Symfony profiler logs whenever the `NavigationPageLoadedEvent` is fired. Learn how to [register this listener](listening-to-events.md).

{% code title="<plugin root>/src/SwagBasicExample.php" %}

```php
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

{% endcode %}

## Adding private composer dependencies

You can bundle composer dependencies with your plugin by adding them to the `/packages/` folder of your plugin.

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
