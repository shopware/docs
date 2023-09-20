---
nav:
  title: Apps as themes
  position: 10

---

# Apps as themes

It is absolutely possible to ship whole [themes](../../themes/) inside an app. All you have to do is include your theme configuration \(in the form of a `theme.json` file\) inside your apps Resources folder.  
So the folder structure of a theme may look like this:

```text
└── DemoTheme
      └── Resources
            └── ...
            └── theme.json
      └── manifest.xml
```

## Themes vs. "ordinary" apps

If your app provides a `theme.json` file, it is considered to be a theme. All the changes you make to the Storefront's appearance inside your theme will be visible only if your theme is assigned to the Storefront. In contrast, if you don't provide a `theme.json` file, your app is an "ordinary" app. The changes will be applied to all sales channels automatically, as long as your app is active.

## Migrating existing themes

If you already created Shopware 6 themes via plugins, it is effortless to migrate them to the app system. Don't worry - you don't have to do all work twice. Instead of providing a `composer.json` and plugin base class, provide a `manifest.xml` file with the metadata for your app. After you created a new folder for your app and added the `manifest.xml`, you can copy the `YourThemePlugin/src/Resources` folder from your plugin to the `YourThemeApp/Resources` folder inside your app. It should not be necessary to change anything inside your template or Javascript code at all.
