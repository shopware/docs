# Add assets to a Theme

## Overview

Your theme can include custom assets like images. This short guide will show you where to store your custom assets and how you can link them in Twig and SCSS.

## Prerequisites

This guide is built upon the \[PLACEHOLDER-LINK: Create a first theme\] guide.

## Using custom assets

To add custom assets to your theme, create a new folder called `public` inside the `src/Resources` directory of your theme. Here you can store your assets files.

```bash
# PluginRoot
.
├── composer.json
└── src
    ├── Resources
    │   ├── public
    │   │   └── your-image.png <-- Asset file here
    └── SwagBasicExampleTheme.php
```

Next, please run the `bin/console assets:install` command. This will copy your plugin assets over to the `public/bundles` folder:

```text
# shopware-root/public/bundles
.
├── administration
├── framework
├── storefront
└── swagbasicexampletheme
    └── your-image.png <-- Your asset is copied here
```

## Linking to assets:

You can link to the asset with the twig [asset](https://symfony.com/doc/current/templates.html#linking-to-css-javascript-and-image-assets) function:

```markup
<img src="{{ asset('bundles/swagbasicexampletheme/your-image.png') }}">
```

In SCSS you can link to the asset like the following:

```css
body {
    background-image: url("/bundles/swagbasicexampletheme/your-image.png");
}
```

## Next steps

Now that you know how to use your assets in a themes, here is a list of other related topics where assets can be used.

* Use assets in your SCSS \[PLACEHOLDER-LINK: Add SCSS Styling and JavaScript to a Theme\] 
* Customize Templates \[PLACEHOLDER-LINK: Customize templates\]

