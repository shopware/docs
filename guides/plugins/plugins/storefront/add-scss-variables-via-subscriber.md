# Add SCSS Variables

## Overview

In order to add SCSS variables to your plugin, you can configure fields in your `config.xml` to be exposed as scss variables.

We recommend to use the declaration of [SCSS variables](./add-scss-variables.md) via the `config.xml` but you can still use a subscriber if you need to be more flexible as described below.

## Prerequisites

You won't learn how to create a plugin in this guide, head over to our Plugin base guide to create your first plugin:

<PageRef page="../plugin-base-guide" />

You should also know how to listen to events:

<PageRef page="../plugin-fundamentals/listening-to-events" />

## Setup a default value for a custom SCSS variable

Before you start adding your subscriber, you should provide a fallback value for your custom SCSS variable in your plugin `base.scss`:

```css
// <plugin root>/src/Resources/app/storefront/src/scss/base.scss
// The value will be overwritten by the subscriber when the plugin is installed and activated
$sass-plugin-header-bg-color: #ffcc00 !default;

.header-main {
    background-color: $sass-plugin-header-bg-color;
}
```

## Theme variables subscriber

You can add a new subscriber according to the [Listening to events](../plugin-fundamentals/listening-to-events.md) guide. In this example we name the subscriber `ThemeVariableSubscriber`. The subscriber listens to the `ThemeCompilerEnrichScssVariablesEvent`.

<Tabs>
<Tab title="<plugin root>/src/Subscriber/ThemeVariableSubscriber.php">

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Shopware\Storefront\Event\ThemeCompilerEnrichScssVariablesEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ThemeVariableSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ThemeCompilerEnrichScssVariablesEvent::class => 'onAddVariables'
        ];
    }

    public function onAddVariables(ThemeCompilerEnrichScssVariablesEvent $event): void
    {
        // Will render: $sass-plugin-header-bg-color: "#59ccff";
        $event->addVariable('sass-plugin-header-bg-color', '#59ccff');
    }
}
```

</Tab>

<Tab title="<plugin root>/src/Resources/config/services.xml">

```xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Subscriber\ThemeVariableSubscriber">
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

The `ThemeCompilerEnrichScssVariablesEvent` provides the `addVariable()` method which takes the following parameters:

* `$name:` \(string\): The name of the SCSS variable. In your SCSS, the passed string will be used exactly as its stated here, so please be careful with special characters. We recommend using kebab-case here. The variable prefix `$` will be added automatically. We also recommend prefixing your variable name with your plugin's or company's name to prevent naming conflicts.
* `$value:` \(string\): The value which should be assigned to the SCSS variable.
* `$sanitize` \(bool - optional\): Optional parameter to remove special characters from the variables value. The parameter will also add quotes around the variables value. In most cases quotes are not needed e.g. for color hex values. However, there may be situations where you want to pass individual strings to your SCSS variable.

::: warning
Please note that plugins are not sales channel specific. Your SCSS variables are directly added in the SCSS compilation process and will be globally available throughout all themes and Storefront sales channels. If you want to change a variables value for each sales channel you should use plugin config fields and follow the next example.
:::

## Plugin config values as SCSS variables

Inside your `ThemeVariableSubscriber` you can also read values from the plugin configuration and assign those to a SCSS variable. This makes it also possible to have different values for each sales channel. Depending on the selected sales channel inside the plugin configuration in the Administration.

First, lets add a new plugin configuration field according to the [Plugin Configurations](../plugin-fundamentals/add-plugin-configuration.md):

```xml
// <plugin root>/src/Resources/config/config.xml
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/System/SystemConfig/Schema/config.xsd">

    <card>
        <title>Example configuration</title>
        <input-field type="colorpicker">
            <name>sassPluginHeaderBgColor</name>
            <label>Header background color</label>
        </input-field>
    </card>
</config>
```

As you can see in the example, we add an input field of the type colorpicker for our plugin. In the Administration, the component 'sw-colorpicker' will later be displayed for the selection of the value. You also can set a `defaultValue` which will be pre-selected like the following:

```xml
// <plugin root>/src/Resources/config/config.xml
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/System/SystemConfig/Schema/config.xsd">

    <card>
        <title>Example configuration</title>
        <input-field type="colorpicker">
            <name>sassPluginHeaderBgColor</name>
            <label>Header background color</label>
            <defaultValue>#fff</defaultValue>
        </input-field>
    </card>
</config>
```

In order to be able to read this config, you have to inject the `SystemConfigService` to your subscriber:

<Tabs>
<Tab title="<plugin root>/src/Subscriber/ThemeVariableSubscriber.php">

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Storefront\Event\ThemeCompilerEnrichScssVariablesEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ThemeVariableSubscriber implements EventSubscriberInterface
{
    protected SystemConfigService $systemConfig;

    // add the `SystemConfigService` to your constructor
    public function __construct(SystemConfigService $systemConfig)
    {
        $this->systemConfig = $systemConfig;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            ThemeCompilerEnrichScssVariablesEvent::class => 'onAddVariables'
        ];
    }

    public function onAddVariables(ThemeCompilerEnrichScssVariablesEvent $event): void
    {
        /** @var string $configExampleField */
        $configPluginHeaderBgColor = $this->systemConfig->get('SwagBasicExample.config.sassPluginHeaderBgColor', $event->getSalesChannelId());

        if ($configPluginHeaderBgColor) {
            // pass the value from `configPluginHeaderBgColor` to `addVariable`
            $event->addVariable('sass-plugin-header-bg-color', $configPluginHeaderBgColor);
        }
    }
}
```

</Tab>

<Tab title="<plugin root>/src/Resources/config/services.xml">

```xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Subscriber\ThemeVariableSubscriber">
            <!-- add argument `SystemConfigService` -->
            <argument type="service" id="Shopware\Core\System\SystemConfig\SystemConfigService"/>
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

* The `SystemConfigService` provides a `get()` method where you can access the configuration structure in the first parameter with a dot notation syntax like `SwagBasicExample.config.fieldName`. The second parameter is the sales channel `id`. With this `id` the config fields can be accessed for each sales channel.
* You can get the sales channel id through the getter `getSalesChannelId()` of the `ThemeCompilerEnrichScssVariablesEvent`.
* Now your sass variables can have different values in each sales channel.

### All config fields as SCSS variables

Adding config fields via `$event->addVariable()` for every field individually may be a bit cumbersome in some cases. You could also loop over all config fields and call `addVariable()` for each one. However, this depends on your use case.

```php
// <plugin root>/src/Subscriber/ThemeVariableSubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

// ...
use Symfony\Component\Serializer\NameConverter\CamelCaseToSnakeCaseNameConverter;

class ThemeVariableSubscriber implements EventSubscriberInterface
{
    // ...

    public function onAddVariables(ThemeCompilerEnrichScssVariablesEvent $event): void
    {
        $configFields = $this->systemConfig->get('SwagBasicExample.config', $event->getSalesChannelId());

        foreach($configFields as $key => $value) {
            // convert `customVariableName` to `custom-variable-name`
            $kebabCased = str_replace('_', '-', (new CamelCaseToSnakeCaseNameConverter())->normalize($key));

            $event->addVariable($kebabCased, $value);
        }
    }
}
```

To avoid camelCase variable names when reading from the `config.xml`, we recommend using the `CamelCaseToSnakeCaseNameConverter` to format the variable before adding it.
