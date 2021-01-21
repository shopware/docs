# Add plugin configuration

In our guide on how to [create a plugin configuration page](https://github.com/shopware/docs/tree/3e28edd68069e4dce5eb54183ced37e2260ee0c6/guides/plugins/plugins/plugin-fundamentals/TBA/README.md), you can learn how to provide this possibility to use configuration possibilities in your plugins. This guide will aid you on how to use this configuration in your plugin.

## Prerequisites

In order to add a plugin configuration, you sure need to provide your plugin first. However, you won't learn to create a plugin in this guide. Head over to our \[PLACEHOLDER-LINK: Developer guide\] to create your plugin first. It is also recommended to know how to setup a \[PLACEHOLDER-LINK: plugin configuration\] in the first instance. In this example, the configurations will be read inside of a subscriber, so knowing \[PLACEHOLDER-LINK: Listening to events\] will also be helpful.

## Overview

The plugin in this example will be named `ReadingPluginConfig`. It already knows a subscriber, which listens to the `product.loaded` event and therefore will be called every time a product is loaded.

```php
<?php declare(strict_types=1);

namespace Swag\ReadingPluginConfig\Subscriber;

use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Core\Content\Product\ProductEvents;

class MySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ProductEvents::PRODUCT_LOADED_EVENT => 'onProductsLoaded'
        ];
    }

    public function onProductsLoaded(EntityLoadedEvent $event): void
    {
        // Do stuff with the product
    }
}
```

For this guide, a very small plugin configuration file is available as well:

```markup
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/master/src/Core/System/SystemConfig/Schema/config.xsd">

    <card>
        <title>Minimal configuration</title>
        <input-field>
            <name>example</name>
        </input-field>
    </card>
</config>
```

Just a simple input field with the technical name `example`. This will be necessary in the next step.

## Reading the configuration

Let's get to the important part. Reading the plugin configuration is based on the `Shopware\Core\System\SystemConfig\SystemConfigService`. This service is responsible for reading all configs from Shopware 6, such as the plugin configurations.

Inject this service into your subscriber using the [DI container](https://symfony.com/doc/current/service_container.html).

`services.xml`:

```markup
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\ReadingPluginConfig\Subscriber\MySubscriber">
            <argument type="service" id="Shopware\Core\System\SystemConfig\SystemConfigService" />
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```

Note the new `argument` being provided to your subscriber. Now create a new field in your subscriber and pass in the `SystemConfigService`:

```php
<?php declare(strict_types=1);

namespace Swag\ReadingPluginConfig\Subscriber;

...
use Shopware\Core\System\SystemConfig\SystemConfigService;

class MySubscriber implements EventSubscriberInterface
{
    /**
     * @var SystemConfigService
     */
    private $systemConfigService;

    public function __construct(SystemConfigService $systemConfigService)
    {
        $this->systemConfigService = $systemConfigService;
    }

    public static function getSubscribedEvents(): array
    {
        ...
    }
    ...
}
```

So far, so good. The `SystemConfigService` is now available in your subscriber.

This service comes with a `get` method to read the configurations. The first idea would be to simply call `$this->systemConfigService->get('example')` now, wouldn't it? Simply using the technical name you've previously set for the configuration.

But what would happen, if there were more plugins providing the same technical name for their very own configuration field? How would you access the proper field, how would you prevent plugin conflicts?

That's why the plugin configurations are always prefixed. By default, the pattern is the following: `<BundleName>.config.<configName>` Thus, it would be `ReadingPluginConfig.config.example` here.

```php
<?php declare(strict_types=1);

namespace Swag\ReadingPluginConfig\Subscriber;

...

class MySubscriber implements EventSubscriberInterface
{
    ...
    public function onProductsLoaded(EntityLoadedEvent $event): void
    {
        $exampleConfig = $this->systemConfigService->get('ReadingPluginConfig.config.example');
    }
}
```

