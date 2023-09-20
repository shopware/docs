# Storefront

You can modify the whole appearance of the Storefront within your app. This includes [customizing templates](../../plugins/storefront/customize-templates), [adding custom Javascript](../../plugins/storefront/add-custom-javascript) and [custom styling](../../plugins/storefront/add-custom-styling).

As the Shopware server will build the Storefront, you don't have to set up any external servers for this. All you have to do is include your modifications \(in form of `.html.twig`, `.js` or `.scss` files\) inside the `Resources` folder of your app. The base folder structure of your app may look like this:

```text
└── DemoApp
    ├── Resources
    │   ├── app
    │   │   └── storefront
    │   │       └── src
    │   │           ├── scss
    │   │           │   └── base.scss
    │   │           └── main.js
    │   ├── views
    │   │   └── storefront
    │   │       └── ...
    │   └── public
    │       └── ... // public assets go here
    └── manifest.xml
```

## Custom Assets in Apps

::: info
Note that this feature was introduced in Shopware 6.4.8.0, and is not supported in previous versions.
:::

You may want to include custom assets inside your app, like custom fonts, etc.
Therefore, place the assets you need in the `/Resources/public` folder. All files inside this folder are available over the [asset-system](../../plugins/storefront/add-custom-assets#adding-custom-assets-to-your-plugin).

## Custom Template Priority

::: info
Note that this feature was introduced in Shopware 6.4.12.0, and is not supported in previous versions.
:::

You may want your templates loaded before or after other extensions. To do so, you can define a `load-priority` inside your `manifest.xml`. The default value to this is 0, with positive numbers your template will be loaded earlier, and with negative numbers later.

```xml
// manifest.xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
        ....
    </meta>
    <storefront>
        <load-priority>100</load-priority>
    </storefront>    
</manifest>
```
