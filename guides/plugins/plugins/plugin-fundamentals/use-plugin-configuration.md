---
nav:
  title: Use plugin configuration
  position: 20

---

# Use Plugin Configuration

The [Add a Plugin Configuration Guide](add-plugin-configuration.md) shows how to define configuration options in your plugins. This guide helps you to use them in your plugin.

## Prerequisites

- A plugin [Plugin Base Guide](../plugin-base-guide.md)
- [Plugin configuration](add-plugin-configuration.md) in the first instance
- Familiarity with the [Listening to events](listening-to-events.md) guide, as in this example the configurations is read inside of a subscriber

## Overview

The plugin in this example already knows a subscriber, which listens to the `product.loaded` event and therefore will be called every time a product is loaded.

```php
// <plugin root>/src/Subscriber/MySubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

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

```xml
// <plugin root>/src/Resources/config/config.xml
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/System/SystemConfig/Schema/config.xsd">

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

Use the tabs below depending on where you need the value: **PHP** (services, subscribers), **Administration (JavaScript)** (custom Admin modules), or **Storefront** (Twig / theme JS).

<Tabs>
<Tab title="PHP">

Reading in PHP uses `Shopware\Core\System\SystemConfig\SystemConfigService` for all system and plugin config.

Inject this service using the [DI container](https://symfony.com/doc/current/service_container.html).

```php
// <plugin root>/src/Resources/config/services.php
<?php declare(strict_types=1);

use Shopware\Core\System\SystemConfig\SystemConfigService;
use Swag\BasicExample\Subscriber\MySubscriber;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(MySubscriber::class)
        ->args([service(SystemConfigService::class)])
        ->tag('kernel.event_subscriber');
};
```

Note the new `argument` being provided to your subscriber. Now create a new field in your subscriber and pass in the `SystemConfigService`:

```php
// <plugin root>/src/Subscriber/MySubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

...
use Shopware\Core\System\SystemConfig\SystemConfigService;

class MySubscriber implements EventSubscriberInterface
{
    private SystemConfigService $systemConfigService;

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

That's why the plugin configurations are always prefixed. By default, the pattern is the following: `<BundleName>.config.<configName>`. Thus, it would be `SwagBasicExample.config.example` here.

```php
// <plugin root>/src/Subscriber/MySubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

...

class MySubscriber implements EventSubscriberInterface
{
    ...
    public function onProductsLoaded(EntityLoadedEvent $event): void
    {
        $exampleConfig = $this->systemConfigService->get('SwagBasicExample.config.example', $salesChannelId);
    }
}
```

::: info
Set the `saleschannelId` to `null` for the plugin configuration to be used by all Sales Channels else set to the corresponding Sales Channel ID.
:::

</Tab>
<Tab title="Administration (JS)">

In the Administration, use `systemConfigApiService` (wraps system-config endpoints).

## Using injection in Vue components

```javascript
// Example: Reading plugin configuration in Administration Vue component
export default Shopware.Component.wrapComponentConfig({
    inject: ['systemConfigApiService'],

    async created() {
        await this.loadPluginConfig();
    },

    methods: {
        async loadPluginConfig() {
            try {
                const config = await this.systemConfigApiService.getValues('SwagBasicExample.config');
                const exampleValue = config['SwagBasicExample.config.example'];

                console.log('Plugin configuration value:', exampleValue);
                return exampleValue;
            } catch (error) {
                console.error('Error fetching plugin configuration:', error);
            }
        }
    }
});
```

## Using direct service access

```javascript
// Example: Reading plugin configuration using direct service access
async function getPluginConfig() {
    try {
        const systemConfigApiService = Shopware.ApiService.getByName('systemConfigApiService');
        const config = await systemConfigApiService.getValues('SwagBasicExample.config');
        const exampleValue = config['SwagBasicExample.config.example'];

        console.log('Plugin configuration value:', exampleValue);
        return exampleValue;
    } catch (error) {
        console.error('Error fetching plugin configuration:', error);
    }
}
```

::: warning
Your plugin needs the `system_config:read` permission to access this API endpoint.
:::

</Tab>
<Tab title="Storefront">

## Twig (`config()`)

In Storefront templates, use the `config()` Twig function to access plugin configuration values directly without making API calls:

```twig
{# Example: Reading plugin configuration in Storefront templates #}
{% set exampleValue = config('SwagBasicExample.config.example') %}

{% if exampleValue %}
    <div class="plugin-config-value">{{ exampleValue }}</div>
{% endif %}
```

## Storefront JavaScript access

For Storefront JavaScript plugins, you can pass configuration values from Twig templates to your JavaScript code:

```twig
{# In your Storefront template #}
<script>
    window.pluginConfig = {
        example: {{ config('SwagBasicExample.config.example')|json_encode|raw }}
    };
</script>
```

```javascript
// In your Storefront JavaScript plugin
const { PluginBaseClass } = window;

export default class ExamplePlugin extends PluginBaseClass {
    init() {
        // Access the configuration value passed from Twig
        const exampleConfig = window.pluginConfig?.example;

        if (exampleConfig) {
            console.log('Plugin configuration:', exampleConfig);
            // Use the configuration value in your plugin logic
        }
    }
}
```

</Tab>
</Tabs>
