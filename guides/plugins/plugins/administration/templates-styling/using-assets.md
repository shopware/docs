---
nav:
  title: Using Assets
  position: 180

---

# Using Assets

## Overview

When working with an own plugin, the usage of own custom images or other assets is a natural requirement. So of course you can do that in Shopware as well. In this guide we will explore how you can add custom assets in your plugin in order to use them in the Administration.

## Prerequisites

Refer to the [plugin base guide](../../plugin-base-guide.md) to learn how to make a plugin. An image or other asset type is also required.

## Add custom assets

In order to add your own custom assets, you need to save your assets in the `Resources/app/administration/static` folder.

```bash
# PluginRoot
.
├── composer.json
└── src
    ├── Resources
    │   ├── app
    │       └── administration
    │             └── static
    │                   └── your-image.png <-- Asset file here
    └── SwagBasicExample.php
```

Similar as in [using custom assets in Storefront](../../storefront/styling/add-custom-assets.md), you need to execute the following command:

```bash
//
bin/console assets:install
```

This way, your plugin assets are copied to the `public/bundles` folder:

```bash
# shopware-root/public/bundles
.
├── administration
├── framework
├── storefront
└── swagbasicexample
    └── your-image.png <-- Your asset is copied here
```

## Use custom assets in the Administration

After adding your assets to the `public/bundles` folder, you can start using them in the Administration. Simply utilize the `asset` filter.

Create a computed component to make them easy to use in your template.

```javascript
computed: {
    assetFilter() {
        return Shopware.Filter.getByName('asset');
    },
}
```

```html
<img :src="assetFilter('/<plugin root>/administration/static/your-image.png')">
```

You're able to use this line in your `twig`/`html` files as you please and that's basically it. You successfully added your own asset to the Administration.
