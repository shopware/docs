# Add Assets to a Theme

## Overview

Your theme can include custom assets like images. This short guide will show you where to store your custom assets and how you can link them in Twig and SCSS.

## Prerequisites

This guide is built upon the guide on creating a first theme:

<PageRef page="create-a-theme" />

## Using custom assets

There are basically two ways of adding custom assets to your theme. The first one is using the `theme.json` to define the path to your custom assets, the second being the default way of using custom assets in plugins. We'll take a closer look at them in the following sections.

### Adding assets in theme.json file

While working with your own theme, you might have already come across the [Theme configuration](theme-configuration). In there, you have the possibility to configure your paths to your custom assets like images, fonts, etc. This way, please configure your asset path accordingly.

```javascript
// <plugin root>/src/Resources/theme.json
{
  ...
  "asset": [
     "app/storefront/src/assets"
   ]
  ...
}
```

Next, run the command `bin/console theme:compile`. The assets from the path defined in the `theme.json` file will be copied by the `theme:compile` command to `<shopware root>/public/theme/<theme-asset-uuid>` along with the compiled CSS and JS, which are stored in a separate folder.

```text
// <shopware root>/public
# 
.
└── theme
    ├── <theme-uuid>
    │   ├── css
    │   │   └── all.css
    │   └── js
    │       └── all.js
    └── <theme-asset-uuid>
        └── asset
            └── your-image.png <-- Your asset is copied here  
```

### Adding assets the plugin way

This way of adding custom assets refers to the default way of dealing with assets. For more details, please check out the article that specifically addresses this topic:

<PageRef page="../plugins/storefront/add-custom-assets" />

## Linking to assets

You can link to the asset with the twig [asset](https://symfony.com/doc/current/templates.html#linking-to-css-javascript-and-image-assets) function:

```html
<img src="{{ asset('/assets/your-image.png', 'theme') }}">
```

In SCSS, you can link to the asset like the following:

```css
body {
    background-image: url('#{$app-css-relative-asset-path}/your-image.png');
}
```

## Next steps

Now that you know how to use your assets in a theme, here is a list of other related topics where assets can be used.

* [Customize templates](../plugins/storefront/customize-templates)
