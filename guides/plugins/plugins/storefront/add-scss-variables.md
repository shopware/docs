# Add SCSS variables

::: info
The configuration flag `css` is available from Shopware Version 6.4.13.0
:::

## Overview

In order to add SCSS variables to your plugin, you can configure fields in your `config.xml` to be exposed as scss variables.

We recommend to use the declaration of SCSS variables via the `config.xml` but you can still use a subscriber if you need to be more flexible as described [here](./add-scss-variables-via-subscriber.md).

## Prerequisites

You won't learn how to create a plugin in this guide, head over to our Plugin base guide to create your first plugin:

<PageRef page="../plugin-base-guide" />

## Setup a default value for a custom SCSS variable

Before you start adding your config fields as SCSS variables, you should provide a fallback value for your custom SCSS variable in your plugin `base.scss`:

```css
// <plugin root>/src/Resources/app/storefront/src/scss/base.scss
// The value will be overwritten when the plugin is installed and activated
$sass-plugin-header-bg-color: #ffcc00 !default;

.header-main {
    background-color: $sass-plugin-header-bg-color;
}
```

## Plugin config values as SCSS variables

Now you can declare a config field in your plugin `config.xml` to be available as scss variable.
The new tag is `<css>` and takes the name of the scss variable as its value.

```xml
<input-field>
    <name>sassPluginHeaderBgColor</name>
    <label>Header backgroundcolor</label>
    <label lang="de-DE">Kopfzeile Hintergrundfarbe</label>
    <css>sass-plugin-header-bg-color</css>
    <defaultValue>#eee</defaultValue>
</input-field>
```

This value will now be exposed as SCSS variable and will have the value set in the Administration or the default value if not set. **When this value is changed you still have to recompile the theme manually for the changes to take effect.**
Plugin configurations with declared SCSS variable in its config.xml have a notice in the Administration that changes can change the theme.
