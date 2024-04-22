---
nav:
  title: Using assets
  position: 180

---

# Using assets

## Overview

When working with an own plugin, the usage of own custom images or other assets is a natural requirement. So of course you can do that in Shopware as well. In this guide we will explore how you can add custom assets in your plugin in order to use them in the Administration.

## Prerequisites

In order to be able to start with this guide, you need to have an own plugin running. As to most guides, this guide is also built upon the Plugin base guide:

<PageRef page="../plugin-base-guide" />

Needless to say, you should have your image or another asset at hand to work with.

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

Similar as in [using custom assets in Storefront](../storefront/add-custom-assets), you need to execute the following command:

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

:::warning
Note that [Vue filters](https://vuejs.org/v2/guide/filters.html) are no longer supported in Vue3 and therefore they will not function in Shopware versions 6.6 and above.
:::

Create a computed component to make them easy to use in your template.

```js
computed: {
    assetFilter() {
        return Filter.getByName('asset');
    },
}
```

```html
<img :src="assetFilter('/<plugin root>/static/your-image.png')">
```

You're able to use this line in your `twig`/`html` files as you please and that's basically it. You successfully added your own asset to the Administration.
