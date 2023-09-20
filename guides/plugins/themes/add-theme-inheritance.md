# Theme Inheritance

## Overview

This guide explains how you can extend an existing theme. What are use cases to inherit from another theme? Maybe you already use a specific theme for a sales channel and you want to use it in another sales channel for a different project with slight changes.

For example, imagine you want to use a dark version of the theme, so you have different looks for different sales channels. Or maybe you own a store-bought theme and only need to change the appearance of it without changing the code of the theme itself. Sometimes it could be useful to develop some kind of base theme and customize it for different clients.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files, as well as the command line. You also need to have an installed and activated theme which you want to extend. Let's imagine we already have an installed and activated theme called `SwagBasicExampleTheme`.

## Extending an existing theme with a new theme

The first step is to create a new theme which will extend the existing `SwagBasicExampleTheme`. Checkout the [Create a first theme](create-a-theme) guide if you don't know how to create a new theme. In this guide we call the extending theme `SwagBasicExampleThemeExtend`. After `SwagBasicExampleTheme` was installed, activated and assigned to a sales channel we need to set up the inheritance.

## Set up the inheritance

To set up the inheritance we need to edit the theme configuration file called `theme.json` and it is located in the `<plugin root>/src/Resources` folder.

The content of the `theme.json` file looks like this:

```js
// <plugin root>/src/Resources/theme.jsonon
{
  "name": "SwagBasicExampleThemeExtend",
  "author": "Shopware AG",
  "views": [
     "@Storefront",
     "@Plugins",
     "@SwagBasicExampleThemeExtend"
  ],
  "style": [
    "app/storefront/src/scss/overrides.scss",
    "@Storefront",
    "app/storefront/src/scss/base.scss"
  ],
  "script": [
    "@Storefront",
    "app/storefront/dist/storefront/js/swag-example-plugin-theme-extended.js"
  ],
  "asset": [
    "@Storefront",
    "app/storefront/src/assets"
  ]
}
```

As you can see each section `views`, `style`, `script` and `asset` contains the `@Storefront` placeholder. This means that inheritance is already taking place here. Every theme inherits the default theme of Shopware called `@Storefront`.

Now it is easy to see how we can inherit from our base theme `SwagBasicExampleTheme`. We just need to add it in the inheritance chain.

Here is an example:

```js
// <plugin root>/src/Resources/theme.jsonon
{
  "name": "SwagBasicExampleThemeExtend",
  "author": "Shopware AG",
  "views": [
     "@Storefront",
     "@Plugins",
     "@SwagBasicExampleTheme",
     "@SwagBasicExampleThemeExtend"
  ],
  "style": [
    "app/storefront/src/scss/overrides.scss",
    "@Storefront",
    "@SwagBasicExampleTheme",
    "app/storefront/src/scss/base.scss"
  ],
  "script": [
    "@Storefront",
    "@SwagBasicExampleTheme",
    "app/storefront/dist/storefront/js/swag-example-plugin-theme-extended.js"
  ],
  "asset": [
    "@Storefront",
    "@SwagBasicExampleTheme",
    "app/storefront/src/assets"
  ],
  "configInheritance": [
    "@Storefront",
    "@SwagBasicExampleTheme"
]
}
```

Let's walk over each section and have a closer look.

### `views` section

In the `views` section we added the placeholder `@SwagBasicExampleTheme` right before our current theme. This means that when a view gets rendered, the Storefront template is first used as the basis. The extensions of the installed plugins are applied to this. Next, the changes to the `@SwagBasicExampleTheme` theme are taken into account in the rendering process. Finally, the changes to our current theme are applied.

### `script` section

The same applies to the JavaScript `script` section. The javascript of the Storefront serves as the basis. On top of this come the extensions of the theme `@SwagBasicExampleTheme`. Finally, the JavaScript that we can implement in the current theme is applied.

### `style` section

The `style` section behaves similarly to the others. The only difference here is the `override.css` can affect SCSS variables e.g. `$border-radius`. That's why it's at the top of the list. To find out more about overriding variables check out the [Override Bootstrap variables in a theme](override-bootstrap-variables-in-a-theme) guide.

### `asset` section

If you want to use assets from the `@SwagBasicExampleTheme` you have add it to the list here as well.

### `configInheritance` section

Finally, the `configInheritance` section will use the field configuration from the given themes and defines the last of the themes, that is different from the current theme, as the parent theme. The configuration values are inherited from the themes mentioned in `configInheritance`. The Storefront theme configuration will always be inherited, even if no `configInheritance` is given. See [Theme inheritance configuration](theme-inheritance-configuration) for a more detailed example.

## Next steps

Now that you know how the theme inheritance works you can start with own customizations. Here is a list of other related topics where assets can be used.

* [Add SCSS Styling and JavaScript to a theme](add-css-js-to-theme)
* [Customize templates](../plugins/storefront/customize-templates)
