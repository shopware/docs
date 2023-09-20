---
nav:
  title: Override Bootstrap variables in a Theme
  position: 60

---

# Override Bootstrap Variables in a Theme

## Overview

The storefront theme is implemented as a skin on top of Bootstrap:

<PageRef page="https://getbootstrap.com/" title="Bootstrap · The most popular HTML, CSS, and JS library in the world." target="_blank" />

Sometimes it is necessary to adjust SCSS variables if you want to change the look of the Storefront for example default variables like `$border-radius` which is defined by Bootstrap. This guide will show how you can override those SCSS variables.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files, as well as the command line. You also need to have an installed and activated theme which is assigned to a sales channel. Checkout the [Create a first theme](create-a-theme) guide if you have not yet a working theme setup.

## Override default SCSS variables

Bootstrap 4 is using the `!default` flag for it's own default variables. Variable overrides have to be declared beforehand.

More information can be found [here](https://getbootstrap.com/docs/4.0/getting-started/theming/#variable-defaults).

To be able to override Bootstrap variables there is an additional SCSS entry point defined in your `theme.json` which is declared before `@Storefront`.

This entry point is called `overrides.scss`:

```js
// <plugin root>/src/Resources/theme.jsonon
{
  "name": "SwagBasicExampleTheme",
  "author": "Shopware AG",
  "views": [
        "@Storefront",
        "@Plugins"
  ],
  "style": [
    "app/storefront/src/scss/overrides.scss", <-- Variable overrides
    "@Storefront",
    "app/storefront/src/scss/base.scss"
  ],
  "script": [
    "@Storefront",
    "app/storefront/dist/storefront/js/just-another-theme.js"
  ],
  "asset": [
    "@Storefront",
    "app/storefront/src/assets"
  ]
}
```

In the `<plugin root>/src/Resources/app/storefront/src/scss/overrides.scss` you can now override default variables like `$border-radius` globally and set its value to `0` to reset it in this case:

```css
// <plugin root>/src/Resources/app/storefront/src/scss/overrides.scss
/*
Override variable defaults
==================================================
This file is used to override default SCSS variables from the Shopware Storefront or Bootstrap.

Because of the !default flags, theme variable overrides have to be declared beforehand.
https://getbootstrap.com/docs/4.0/getting-started/theming/#variable-defaults
*/

$border-radius: 0;

// some other override examples
$icon-base-color: #f00;
$modal-backdrop-bg: rgba(255, 0, 0, 0.5);
$disabled-btn-bg: #f00;
$disabled-btn-border-color: #fc8;
$font-weight-semibold: 300;
```

After saving the `overrides.scss` file and running `bin/console theme:compile` go and check out the Storefront in the browser. The `border-radius` should be removed for every element.

::: warning
Please only add variable overrides in this file. You should not write CSS code like `.container { background: #f00 }` in this file.
:::

::: info
When running `composer run watch:storefront` in platform only setups or `./bin/watch-storefront.sh` in the production template, SCSS variables will be injected dynamically by webpack. When writing selectors and properties in the `overrides.scss` the code can appear multiple times in your built CSS.
:::

## Next steps

Now that you know how to override Bootstrap variables, here is a list of related topics which might be interesting for you.

* [Theme configuration](theme-configuration)
* [Add SCSS Styling and JavaScript to a theme](add-css-js-to-theme)
* [Add assets to a theme](add-assets-to-theme)
