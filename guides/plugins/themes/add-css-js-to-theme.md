# Add SCSS Styling and JavaScript to a Theme

## Overview

This guide explains how you can add your custom styling via SCSS and add your custom JavaScript to your theme.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files, as well as the command line. You also need to have an installed and activated theme which is assigned to a sales channel. Checkout the [Create a first theme](create-a-theme) guide if you have not yet a working theme setup.

## Adding custom SCSS

When it comes to CSS and SCSS, they are processed by a PHP SASS compiler.

The main entry point to deploy your SCSS code is defined in the `theme.json` file. By default it is the `<plugin root>/app/storefront/src/scss/base.scss` file.

```javascript
// <plugin root>/src/Resources/theme.json
 {
   ...
   "style": [
     "app/storefront/src/scss/overrides.scss",
     "@Storefront",
     "app/storefront/src/scss/base.scss"
   ],
   ...
 }
```

When the Storefront gets compiled the PHP SASS compiler will look up the files declared in the `style` section of the theme configuration. You can define the SCSS entry-points individually if you want to.

In order to add some custom SCSS in your theme, you just need to edit the `base.scss` file which in located in `<plugin root>/src/Resources/app/storefront/src/scss` directory.

```bash
.
├── composer.json
└── src
    ├── Resources
    │   ├── app
    │   │   └── storefront
    │   │       └── src
    │   │           └── scss
    │   │               └── base.scss <-- SCSS entry
    └── SwagBasicExampleTheme.php
```

To apply your styles and test them, please use some test code:

```css
// <plugin root>/src/Resources/app/storefront/src/scss/base.scss
body {
    background-color: blue;
}
```

Afterwards, you need to compile your theme by running the `bin/console theme:compile` command in terminal.

After your theme was compiled successfully, go and check your changes by opening the Storefront in your browser.

## Adding custom JS

JavaScript cannot be compiled by PHP, so [webpack](https://webpack.js.org/) is being used for that. All Javascript in Shopware 6 is written in EcmaScript 6. Of course you can write your code in EcmaScript 5 as well.

By default your plugin is using Shopware's default webpack configuration, as you must ship your theme with the JavaScript already compiled.

Since Shopware knows where your style files are located, they are automatically compiled, compressed and loaded into the Storefront. In the case of JavaScript, you have your `main.js` as entry point which has to be located the `src/Resources/app/storefront/src/` directory:

```bash
.
├── composer.json
└── src
    ├── Resources
    │   ├── app
    │   │   └── storefront
    │   │       └── src
    │   │           └── main.js <-- JS entry
    └── SwagBasicExampleTheme.php
```

Add some test code in order to see if it works out:

```javascript
// <plugin root>/src/Resources/app/storefront/src/js/main.js
console.log('SwagBasicExampleTheme JS loaded');
```

In the end, by running the command `bin/console theme:compile` your custom JS plugin is loaded. By default, the compiled JavaScript file is saved as `<plugin root>/src/resources/app/storefront/dist/storefront/js/swag-basic-example-theme.js`. It is detected by Shopware automatically and included in the Storefront. So you do not need to embed the JavaScript file yourself.

## Using the hot-proxy \(live reload\)

Of course, the theme compilation with `bin/console theme:compile` will get tedious if you change files a lot and want to check the changes in the browser. So there is a better way while you are developing your theme with the `hot-proxy` option, which will give you the live reload feature.

To activate the hot-proxy, run the following command in your terminal.

<Tabs>

<Tab title="Template">

```bash
./bin/watch-storefront.sh
```

</Tab>
<Tab title="platform only (contribution setup)">

```bash
composer run watch:admin
```

</Tab>
</Tabs>

This command starts a NodeJS web server on port `9998`. If you open the Storefront of your Shopware installation on `localhost:9998`, this page will be automatically updated when you make changes to your theme.

## Next steps

Now that you know how to customize the styling via SCSS and add JavaScript, here is a list of things you can do.

* [Override Bootstrap variables in a theme](override-bootstrap-variables-in-a-theme)
* [Customize templates](../plugins/storefront/customize-templates)
