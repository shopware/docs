# Storefront

You can modify the whole appearance of the Storefront within your app. This includes [customizing templates](../../plugins/storefront/customize-templates.md), [adding custom Javascript](../../plugins/storefront/add-custom-javascript.md) and [custom styling](../../plugins/storefront/add-custom-styling.md).

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
    │   └── views
    │       └── storefront
    │           └── ...
    └── manifest.xml
```
