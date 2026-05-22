---
nav:
  title: Storefront Themes
  position: 20

---

# Storefront Themes

Storefront Themes let you customize the visual appearance of the Shopware [Storefront](../../../concepts/framework/architecture/index.md). They are not a separate extension type, but are either implemented as plugins or, in Cloud environments, delivered via apps.

Unlike regular plugins, themes do not contain backend logic. Their purpose is purely storefront presentation, and they are managed per sales channel through the Theme Manager.

Shopware comes with a default theme built on top of Bootstrap 5. Everything you can do with Bootstrap, you can do with the Shopware Storefront.

```text
Extensions
├── Plugin
│   └── can include a Theme (not for Cloud)
└── App
    └── can include a Theme (Cloud-ready)
```

Themes support tasks such as:

* overriding Twig templates
* adding custom SCSS/CSS styling — adjust layout, typography, colors, images, and other visual elements to match your brand identity and desired user experience
* defining configurable theme settings in the Administration
* controlling the inheritance order of styles and templates

::: info
A plugin can also override templates.
:::

## Differences between themes vs. plugins and apps

A theme is a specialized type of plugin or app that is focused on changing the visual appearance of the Storefront. For more information about plugins and apps, see the [Plugin Base Guide](../plugins/plugin-base-guide.md) and [App Base Guide](../apps/app-base-guide.md).

There are several ways to change the appearance of the Storefront. Regular plugins or apps are mainly used to add functionality and change shop behavior. They can also include SCSS/CSS and JavaScript to integrate those features into the Storefront.

A theme is technically also a plugin or app, but once activated, it appears in the Theme Manager and can be assigned to a specific sales channel. Plugins and apps, by contrast, are activated globally.

To distinguish a theme from a regular plugin or app, it must implement the interface `Shopware\Storefront\Framework\ThemeInterface`. A theme can also [inherit](../themes/inheritance/index.md) from other themes, override default configuration values such as colors, fonts, and media, and introduce additional [configuration](../themes/configuration/index.md) options.

You do not need to write any PHP code in a theme. If your extension requires PHP code, you should use a plugin instead.

Another key difference is scope: themes only take effect for the sales channels they are assigned to, whereas plugins and apps affect the Shopware installation globally.

## Getting started

* [Theme Base Guide](./theme-base-guide.md)
* [Create a first theme](./create-a-theme.md)
