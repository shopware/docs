# Theme with Bootstrap Styling

## Overview

The Shopware default theme is using [Bootstrap](https://getbootstrap.com/) with additional custom styling. But sometimes you want to develop a theme without the Shopware default styling.

## Theme without Shopware default styling

If you want to build your theme only upon the Bootstrap SCSS you can use the `@StorefrontBootstrap` placeholder instead of the `@Storefront` bundle in the `style` section of your `theme.json`. This gives you the ability to use the Bootstrap SCSS without the Shopware Storefront "skin". Therefore all the SCSS from `<plugin root>src/Storefront/Resources/app/storefront/src/scss/skin` will not be available in your theme.

```js
// <plugin root>/src/Resources/theme.jsonon
{
  ...
  "style": [
    "@StorefrontBootstrap",
    "@Plugins",
    "app/storefront/src/scss/base.scss"
  ]
}
```

::: info

* This option can only be used in the `style` section of the `theme.json`. You must not use it in `views` or `script`.
* All theme variables like `$sw-color-brand-primary` are also available when using the Bootstrap option.
* You can only use either `@StorefrontBootstrap` or `@Storefront`. They should not be used at the same time. The `@Storefront` bundle **includes** the Bootstrap SCSS already.
* `@StorefrontBootstrap` does not include `@Plugins`, you have to add it yourself.
:::

## Next steps

Here is a list of related topics which might be interesting for you.

* [Theme configuration](theme-configuration)
* [Add SCSS Styling and JavaScript to a theme](add-css-js-to-theme)
* [Add assets to theme](add-assets-to-theme)
