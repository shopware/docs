---
nav:
  title: Add plugin configuration
  position: 10

---

# Add Plugin Configuration

The `Shopware plugin system` provides you with the option to create a configuration page for your plugin without any knowledge of templating or the `Shopware Administration`.

## Prerequisites

To build your own configuration page for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide).

## Create your plugin configuration

<YoutubeRef video="XXcmgKBRh-s" title="Backend Development - Adding a plugin configuration - YouTube" target="_blank" />

::: info
This video is part of the online training ["Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma) available on Shopware Academy for **free**.
:::

All you need to do is creating a `config.xml` file inside of a `Resources/config` directory in your plugin root. The content of the `config.xml` will be dynamically rendered in the Administration. Below you'll find an example structure:

```text
└── plugins
    └── SwagBasicExample
        ├── src
        │   ├── Resources
        │   │   └── config
        │   │       └── config.xml 
        │   └── SwagBasicExample.php
        └── composer.json
```

## Fill your plugin configuration with settings

As we now know how to create your configuration, we can start to fill it with life

* or options to configure, in this case.

### Cards in your configuration

The `config.xml` follows a simple syntax. You can organize the content in `<card>` elements. Every `config.xml` must contain a minimum of one `<card>` element and each `<card>` must contain one `<title>` and at least one `<input-field>`. See the minimum `config.xml` below:

```xml
// <plugin root>/src/Resources/config/config.xml
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/System/SystemConfig/Schema/config.xsd">
    <card>
        <title>Minimal configuration</title>
        <input-field>
            <name>example</name>
        </input-field>
    </card>
</config>
```

Please make sure to specify the `xsi:noNamespaceSchemaLocation` as shown above and fetch the external resource into your IDE if possible. This enables auto-completion and suggestions for this XML file and will therefore help you to prevent issues and bugs.

### Card Titles

A `<card>` `<title>` is translatable, this is managed via the `lang` attribute. By default the `lang` attribute is set to `en-GB`, to change the locale of a `<title>` just add the attribute as follows:

```html
    ...
    <card>
        <title>English Title</title>
        <title lang="de-DE">German Titel</title>
    </card>
    ...
```

### Input fields

As you can see above, every `<input-field>` has to contain at least a `<name>` element. The `<name>` element is not translatable and has to be unique, since it will be used as the technical identifier for the config element. The field `<name>` must at least be 4 characters long and consist of only lower and upper case letters. It can contain numbers, but not at first place - see this pattern: `[a-zA-Z][a-zA-Z0-9]*`

### The different types of input field

Your `<input-field>` can be of different types, this is managed via the `type` attribute. Unless defined otherwise, your `<input-field>` will be a text field per default. Below you'll find a list of all available `<input-field type="?">`.

| Type | Configuration settings | Renders |
| :--- | :--- | :--- |
| text | [copyable](add-plugin-configuration#copyable), [placeholder](add-plugin-configuration#label-placeholder-and-help-text) | Text field |
| textarea | [copyable](add-plugin-configuration#copyable), [placeholder](add-plugin-configuration#label-placeholder-and-help-text) | Text area |
| text-editor | [placeholder](add-plugin-configuration#label-placeholder-and-help-text) | HTML editor |
| url | [copyable](add-plugin-configuration#copyable), [placeholder](add-plugin-configuration#label-placeholder-and-help-text) | URL field |
| password | [placeholder](add-plugin-configuration#label-placeholder-and-help-text) | Password field |
| int |  | Integer field |
| float |  | Float field |
| bool |  | Switch |
| checkbox |  | Checkbox |
| datetime |  | Date-time picker |
| date |  | Date picker |
| time |  | Time picker |
| colorpicker |  | Color picker |
| single-select | [options](add-plugin-configuration#options), [placeholder](add-plugin-configuration#label-placeholder-and-help-text) | Single-Select box |
| multi-select | [options](add-plugin-configuration#options), [placeholder](add-plugin-configuration#label-placeholder-and-help-text) | Multi-Select box |

### Input field settings

These settings are used to configure your `<input-field>`. **Every `<input-field>` has to start with the `<name>` element.** After the `<name>` element you can configure any of the other settings mentioned above. Beside these settings, they have the followings in common: [label](add-plugin-configuration#label-placeholder-and-help-text), [helpText](add-plugin-configuration#label-placeholder-and-help-text), [defaultValue](add-plugin-configuration#defaultvalue) and [disabled](add-plugin-configuration#disabled).

#### Label, placeholder and help text

The settings `<label>`, `<placeholder>` and `<helpText>` are used to label and explain your `<input-field>` and are translatable. You define your `<label>`, `<placeholder>` and `<helpText>` the same way as the `<card><title>`, with the `lang` attribute. Please remember, that the `lang` attribute is set to `en-GB` per default.

#### defaultValue

Add the `defaultValue` setting to your `<input-field>` to define a default value for it. This value will be imported into the database on installing and updating the plugin. We use [Symfony\Component\Config\Util\XmlUtils](https://github.com/symfony/config/blob/master/Util/XmlUtils.php#L215) for casting the values into the correct PHP types.

Below you'll find an example how to use this setting.

```html
<input-field type="text">
    <name>textField</name>
    <label>Test field with default value</label>
    <defaultValue>test</defaultValue>
</input-field>
```

#### disabled

You can add the `<disabled>` setting to any of your `<input-field>` elements to disable it.

Below you'll find an example how to use this setting.

```html
<input-field>
    <name>email</name>
    <disabled>true</disabled>
</input-field>
```

_Please note, `<disabled>` only takes boolean values._

#### copyable

You can add the `<copyable>` setting to your `<input-field>` which are of type `text` or extensions of it. This will add a button at the right, which on click copies the content of your `<input-field>` into the clipboard.

Below you'll find an example how to use this setting.

```html
<input-field>
    <name>email</name>
    <copyable>true</copyable>
</input-field>
```

_Please note, that `<copyable>` only takes boolean values_

#### options

You can use `<options>` to add settings to a `<input-field>` of the types `single-select` and `multi-select`. Each `<option>` represents one setting you can select.

Below you'll find an example.

```html
<input-field type="single-select">
    <name>mailMethod</name>
    <options>
        <option>
            <id>smtp</id>
            <name>English label</name>
            <name lang="de-DE">German label</name>
        </option>
        <option>
            <id>pop3</id>
            <name>English label</name>
            <name lang="de-DE">German label</name>
        </option>
    </options>
</input-field>
```

Each `<options>` element must contain at least one `<option>` element. Each `<option>` element must contain at least one `<id>` and one `<name>` element. As you can see above, `<name>` elements are translatable via the `lang` attribute.

### Advanced custom input fields

For more complex and advanced configurations it is possible to declare a `<component name="componentName">` element. This element can render many admin components. It is also possible to render your own admin component which you could deliver with your plugin. The name of the component has to match the components name in the Administration, for example `sw-entity-single-select`. The component also needs a `<name>` element first. All other elements within the component element will be passed to the rendered admin component as properties. For some components you could also use [`label` and `placeholder`](add-plugin-configuration#label-placeholder-and-help-text).

Here are some examples:

### Entity single select for products

```html
<component name="sw-entity-single-select">
    <name>exampleProduct</name>
    <entity>product</entity>
    <label>Choose a product for the plugin configuration</label>
</component>
```

Stores the ID of the selected product into the system config.

### Entity multi ID select for products

```html
<component name="sw-entity-multi-id-select">
    <name>exampleMultiProductIds</name>
    <entity>product</entity>
    <label>Choose multiple products IDs for the plugin configuration</label>
</component>
```

Stores an array with IDs of the selected products into the system config.

### Media selection

```html
<component name="sw-media-field">
    <name>pluginMedia</name>
    <label>Upload media or choose one from the media manager</label>
</component>
```

### Text editor

```html
<component name="sw-text-editor">
    <name>textEditor</name>
    <label>Write some nice text with WYSIWYG editor</label>
</component>
```

### Snippet field

```html
<component name="sw-snippet-field">
    <name>snippetField</name>
    <label>Description</label>
    <snippet>myPlugin.test.snippet</snippet>
</component>
```

Allows you to edit snippet values within the configuration page. This component does not store values in the system config, but changes the translations for the snippet key. **Note: This field is only available from 6.3.4.0 onward.**

### Supported component types

Please Note: It is impossible to allow every component to the config.xml, due to their complexities. If you can't efficiently resolve your plugin's necessities with, it is probably better to create an own module instead. Therefore, Shopware supports the following components by default (also to be found in the [ConfigValidator class](https://github.com/shopware/platform/blob/729fbf368a065177a17e0fc190334ce02b45f418/src/Core/Framework/App/Validation/ConfigValidator.php#L16)):

* sw-entity-single-select
* sw-entity-multi-id-select
* sw-media-field
* sw-text-editor
* sw-snippet-field

## Example

Now all that's left to do is to present you a working example `config.xml` and show you the result.

```xml
// <plugin root>/src/Resources/config/config.xml
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/System/SystemConfig/Schema/config.xsd">

    <card>
        <title>Basic Configuration</title>
        <title lang="de-DE">Grundeinstellungen</title>

        <input-field>
            <name>email</name>
            <copyable>true</copyable>
            <label>eMail address</label>
            <label lang="de-DE">E-Mailadresse</label>
            <placeholder>you@example.com</placeholder>
            <placeholder lang="de-DE">du@beispiel.de</placeholder>
            <helpText>Please fill in your personal eMail address</helpText>
            <helpText lang="de-DE">Bitte trage deine persönliche E-Mailadresse ein</helpText>
        </input-field>

        <input-field type="single-select">
            <name>mailMethod</name>
            <options>
                <option>
                    <id>smtp</id>
                    <name>English smtp</name>
                    <name lang="de-DE">German smtp</name>
                </option>
                <option>
                    <id>pop3</id>
                    <name>English pop3</name>
                    <name lang="de-DE">German pop3</name>
                </option>
            </options>
            <defaultValue>smtp</defaultValue>
            <label>Mail method</label>
            <label lang="de-DE">Versand-Protokoll</label>
        </input-field>
    </card>

    <card>
        <title>Advanced Configuration</title>
        <title lang="de-DE">Erweiterte Einstellungen</title>

        <input-field type="password">
            <name>secret</name>
            <label>Secret token</label>
            <label lang="de-DE">Geheimschlüssel</label>
            <helpText>Your secret token for xyz...</helpText>
            <helpText lang="de-DE">Dein geheimer Schlüssel für xyz...</helpText>
        </input-field>
    </card>
</config>
```

## Next steps

Now you've added your own plugin configuration. But how do you actually read which configurations the shop owner used? This will be covered in our guide about [Using the plugin configuration](use-plugin-configuration).
