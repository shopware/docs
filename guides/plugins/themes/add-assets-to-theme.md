# Add assets to a Theme

## Overview

Your theme can include custom assets like images. This short guide will show you where to store your custom assets and how you can link them in Twig and SCSS.

## Prerequisites

This guide is built upon the guide on creating a first theme:

<PageRef page="create-a-theme" title="<<<title-missing>>>" />

## Using custom assets

There are basically two ways of adding custom assets to your theme. The first one is using the `theme.json` to define the path to your custom assets, the second being the default way of using custom assets in plugins. We'll take a closer look at them in the following sections.

### Adding assets in theme.json file

While working with your own theme, you might have already come across the [theme configuration](theme-configuration). In there, you have the possibility to configure your paths to your custom assets like images, fonts, etc. This way, please configure your asset path accordingly.

<CodeBlock title="<plugin root>/src/Resources/theme.json">

```javascript
# src/Resources/theme.json
{
  ...
  "asset": [
     "app/storefront/src/assets"
   ]
  ...
}
```

</CodeBlock>

Next, please run the bin/console assets:install command. This will copy your plugin assets over to the public/bundles folder:

<CodeBlock title="<shopware root>/public/bundles">

```text
# 
.
├── administration
├── framework
├── storefront
└── <your-theme-name> <-- e.g. swagbasicexampletheme
    └── your-image.png <-- Your asset is copied here
```

</CodeBlock>

### Adding assets the plugin way

This way of adding custom assets refers to the default way of dealing with assets. For more details, please check out the article that specifically addresses this topic:

<PageRef page="../plugins/storefront/add-custom-assets" title="<<<title-missing>>>" />

## Linking to assets

You can link to the asset with the twig [asset](https://symfony.com/doc/current/templates.html#linking-to-css-javascript-and-image-assets) function:

```xml
<img src="{{ asset('bundles/swagbasicexampletheme/your-image.png', 'asset') }}">
```

In SCSS you can link to the asset like the following:

```css
body {
    background-image: url("/bundles/swagbasicexampletheme/your-image.png");
}
```

## Next steps

Now that you know how to use your assets in a theme, here is a list of other related topics where assets can be used.

* [Customize templates](../plugins/storefront/customize-templates)
