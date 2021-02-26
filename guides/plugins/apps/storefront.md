# Storefront

You can modify the whole appearance of the storefront within your app. This includes [customizing templates](../plugins/storefront/customize-templates.md), [adding custom Javascript](../plugins/storefront/add-custom-javascript.md) and [custom styling](../plugins/storefront/add-custom-styling.md).

As the storefront will be build on the Shopware server you don't have to set up any external servers for this. All you have to do is including your modifications \(in form of .html.twig, .js. .scss files\) inside the `Resources` folder of your app. The base folder structure of your app my look like this:

```text
└── DemoApp
      └── Resources
            └── ...
      └── manifest.xml
```

## Themes as apps

It is absolutely possible to ship whole [themes]() inside an app. All you have to do is include your theme configuration \(in form of a `theme.json` file\) inside your apps Resources folder.  
So the folder structure of a theme may look like this:

```text
└── DemoTheme
      └── Resources
            └── ...
            └── theme.json
      └── manifest.xml
```

### Themes vs. "ordinary" apps

If your app provides a `theme.json` file it is considered to be a theme. All the changes you do to the storefront's appearance inside your theme, will be visible only if your theme is assigned to the storefront. In contrast if you don't provide a `theme.json` file, your app is a "ordinary" app and the changes of your app will be applied to all saleschannels automatically, as long as your app is active.

### Migrating existing themes

If you already created a Shopware 6 theme via Plugin, it is very simple to migrate it to the app system. So don't worry - you don't need to do all work twice. Instead of providing a `composer.json` and plugin base class, you provide a `manifest.xml` file with the metadata for your app. After you have created a new folder for your app and added the `manifest.xml` you can copy the `YourThemePlugin/src/Resources` folder from your plugin to your app as `YourThemeApp/Resources`. It should not be necessary to change anything inside your template or Javascript code at all.

