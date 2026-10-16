---
nav:
  title: Use Plugin Configuration
  position: 30

---

# Use Plugin Configuration

The [Add a Plugin Configuration Guide](add-plugin-configuration.md) shows how to define configuration options in your plugins. This guide helps you to use them in your plugin, showing you how to read plugin configuration values in PHP, Administration JavaScript, and Storefront code.

## Prerequisites

- First, review the [Plugin Base Guide](../plugin-base-guide.md)
- Then define a plugin configuration field in [Add plugin configuration](add-plugin-configuration.md)
- Get familiar with the [Listening to events](../framework/event/listening-to-events.md) guide, as in this example the configuration is read inside of a subscriber

The example plugin includes a subscriber that listens to the `product.loaded` event and is called every time a product is loaded.

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
<!-- <plugin root>/src/Resources/config/config.xml -->
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

The `SystemConfigService` is now available in your subscriber.

Use the `get` method to read configuration values. Calling `$this->systemConfigService->get('example')` would be ambiguous — multiple plugins could define a field with the same technical name.

To avoid conflicts, plugin configurations are always prefixed. By default, the pattern is the following: `<BundleName>.config.<configName>`. Thus, it would be `SwagBasicExample.config.example` here.

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
Set `salesChannelId` to `null` to apply the configuration to all Sales Channels, or pass a specific Sales Channel ID.
:::

</Tab>
<Tab title="Administration (JS)">

In the Administration, use `systemConfigApiService` (wraps system-config endpoints).

Use `getValues()` to read saved values and `getSchema()` to read the tabs, cards, and fields that define the configuration form.

### Using injection in Vue components

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

### Using direct service access

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

### Reading the configuration form schema

Starting with Shopware 6.7.16.0, use `systemConfigApiService.getSchema(domain)` to load the form definition:

```javascript
const systemConfigApiService = Shopware.Service('systemConfigApiService');
const domain = 'SwagBasicExample.config';
const schema = await systemConfigApiService.getSchema(domain);
const values = await systemConfigApiService.getValues(domain);

for (const tab of schema) {
    for (const card of tab.cards) {
        for (const element of card.elements) {
            const value = values[element.name] ?? element.config.defaultValue;
            console.log(tab.name, card.title, element.name, value);
        }
    }
}
```

The schema is an array of tabs, each containing `cards`, whose `elements` contain the field definitions.

Field names are fully qualified configuration keys, while labels, defaults, and component options are inside `element.config`.

The schema endpoint supplies definitions; read saved values separately with `getValues()` as above.

API clients can retrieve the same schema with this request:

```http
GET /api/_action/system-config/get-schema?domain=SwagBasicExample.config
```

Both the schema endpoint and the values endpoint require the `system_config:read` privilege.

A response excerpt for the [tab example](add-plugin-configuration.md#tabs-in-your-configuration) looks like this:

```json
[
    {
        "name": null,
        "title": null,
        "cards": [
            {
                "title": { "en-GB": "Basic settings" },
                "elements": [
                    {
                        "name": "SwagBasicExample.config.enabled",
                        "type": "bool",
                        "config": {
                            "label": { "en-GB": "Enable integration" },
                            "defaultValue": false
                        },
                        "value": null
                    }
                ]
            }
        ]
    },
    {
        "name": "shipping",
        "title": { "en-GB": "Shipping", "de-DE": "Versand" },
        "cards": [
            {
                "title": { "en-GB": "Delivery settings" },
                "elements": [
                    {
                        "name": "SwagBasicExample.config.deliveryDays",
                        "type": "int",
                        "config": {
                            "label": { "en-GB": "Delivery time in days" },
                            "defaultValue": 3
                        },
                        "value": null
                    }
                ]
            }
        ]
    }
]
```

The tab with `name: null` and `title: null` represents root-level cards and is displayed as **General** when tab navigation is visible.

Even configurations without explicit `<tab>` elements return a tab array containing their cards.

</Tab>
<Tab title="Storefront">

### Twig (`config()`)

In Storefront templates, use the `config()` Twig function to access plugin configuration values directly without making API calls:

```twig
{# Example: Reading plugin configuration in Storefront templates #}
{% set exampleValue = config('SwagBasicExample.config.example') %}

{% if exampleValue %}
    <div class="plugin-config-value">{{ exampleValue }}</div>
{% endif %}
```

### Storefront JavaScript access

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

## Migrating custom configuration form consumers

Starting with Shopware 6.7.16.0, migrate code that loads or modifies configuration form definitions to the tab structure before the legacy APIs are removed in Shopware 6.8.

### Administration and API clients

| Legacy API                                 | Replacement                                  |
| :----------------------------------------- | :------------------------------------------- |
| `systemConfigApiService.getConfig(domain)` | `systemConfigApiService.getSchema(domain)`   |
| `GET /api/_action/system-config/schema`    | `GET /api/_action/system-config/get-schema`  |
| `sw-system-config` data property `config`  | `sw-system-config` data property `schema`    |
| Iteration over `config[].elements[]`       | Iteration over `schema[].cards[].elements[]` |

The legacy schema endpoint also requires `system_config:read`, so integrations that previously called it without that privilege must update their ACL role.

Shopware 6.7 retains compatibility for the component's legacy `config` property and decorated `getConfig()` methods, but new customizations should use `schema` and `getSchema()`.

For example, an override of `sw-system-config` can modify a field after the parent loads the schema:

```javascript
Shopware.Component.override('sw-system-config', {
    methods: {
        async readConfig() {
            await this.$super('readConfig');

            for (const tab of this.schema) {
                for (const card of tab.cards) {
                    const field = card.elements.find(
                        (element) => element.name === 'SwagBasicExample.config.deliveryDays',
                    );

                    if (field) {
                        field.config.disabled = true;
                    }
                }
            }
        },
    },
});
```

### PHP configuration definitions

Continue injecting `Shopware\Core\System\SystemConfig\Service\ConfigurationService` and replace its legacy getters:

| Deprecated method                                              | Replacement                                                             |
| :------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `getConfiguration($domain, $context)`                          | `getSystemConfigDefinition($domain, $context)`                          |
| `getResolvedConfiguration($domain, $context, $salesChannelId)` | `getResolvedSystemConfigDefinition($domain, $context, $salesChannelId)` |

The replacement methods return a list of `SystemConfigTab` DTOs containing `SystemConfigCard` and `SystemConfigElement` DTOs from the `Shopware\Core\System\SystemConfig\DTO` namespace.

Access DTO properties and traverse tabs before cards, instead of reading the legacy array of cards.

With an injected `$configurationService`, a Shopware `$context`, and an optional `$salesChannelId`, read resolved field values like this:

```php
$tabs = $configurationService->getResolvedSystemConfigDefinition(
    'SwagBasicExample.config',
    $context,
    $salesChannelId,
);

$values = [];

foreach ($tabs as $tab) {
    foreach ($tab->cards as $card) {
        foreach ($card->elements as $element) {
            $values[$element->name] = $element->value;
        }
    }
}
```

Use `getSystemConfigDefinition()` when you only need definitions, and `getResolvedSystemConfigDefinition()` when field values should include saved values for the selected sales channel with fallback to XML defaults.

Field options remain available through `$element->config`, for example `$element->config['defaultValue']`.

Reading saved values through `SystemConfigService::get()`, `systemConfigApiService.getValues()`, or the Twig `config()` function uses the same configuration keys as before.
