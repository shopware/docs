---
nav:
  title: Overview
  position: 10

---

# Overview

The variety of Shopware's extension interfaces can be overwhelming, so let us start with a simple overview comparing the three approaches **Plugins**, **Themes**, and **Apps**.

| Task | Plugin | Theme | App | Remarks |
| :--- | :--- | :--- | :--- | :--- |
| Change Storefront appearance | ✅ | ✅ | ✅ |  |
| Add admin modules | ✅ | ❌ | ✅ |  |
| Execute Webhooks | ✅ | ❌ | ✅ | Apps main functionality is to call Webhooks, but Plugins can be implemented to do that as well. |
| Add custom entities | ✅ | ❌ | ✅ |  |
| Modify database structure | ✅ | ❌ | ❌ |  |
| Integrate payment providers | ✅ | ❌ | ✅ |  |
| Publish in the Shopware Store | ✅ | ✅ | ✅ |  |
| Install in Shopware 6 Cloud Shops | ❌ | ❌ (unless delivered via App) | ✅ | While theme plugins can’t be installed in Cloud, Apps can include themes and provide the same functionality|
| Install in Shopware 6 self-hosted Shops | ✅ | ✅ | ✅ | Apps can be installed and used since Shopware 6.4.0.0 |
| Add custom logic/routes/commands | ✅ | ❌ | ✅ | Apps extract functionalities/logic into separate services, so technically, they can add custom logic |
| Control order of style/template inheritance | ❌ | ✅ | ✅ |  |

## Plugins

Plugins are the most powerful extension mechanism, as they can be used to extend, overwrite and modify almost any part of the software. You will probably need to write a plugin, if you make profound changes or complex functionalities such as:

* Custom price calculation
* Product imports
* Custom Content/Products
* Connecting 3P identity providers
* Dynamic validations
* Customer tracking

Follow our [Plugin Base Guide](plugins/plugin-base-guide) to learn how to develop a plugin. Also refer to [Plugin Fundamentals](plugins/plugin-fundamentals/) section.

::: info
If your extension doesn’t need any of the above functionalities and is only about design changes, a simple template adjustment may be the best choice - typically done through a theme plugin.
:::

## Apps

Apps are the extension mechanism designed for Shopware’s Cloud environment. Unlike plugins, they don’t run code directly inside the shop system. Instead, they work in an event-driven way and communicate with external services through APIs. This makes them less intrusive, but still very flexible.

You’ll probably want to build an app if your use case involves:

* Integrating with third-party services (e.g. ERP, CRM, marketing tools)

* Providing payment methods and forwarding to external payment providers

* Adding storefront customizations, including themes

* Handling data or processes outside of the shop system (e.g. product synchronization, shipping, analytics)

Follow our [App Base Guide](https://developer.shopware.com/docs/guides/plugins/apps/app-base-guide.html) and [App Starter Guide](https://developer.shopware.com/docs/guides/plugins/apps/starter/) to learn how to develop an app.

::: info
Apps also provide theme support, so everything you can do with a theme plugin is also possible in an app — making them the way to customize design in Cloud shops.
:::

## Themes

Basically a theme can be an app/plugin that aims at changing the visual appearance of the Storefront.

Extensions
├── Plugin
│   └── can include a Theme (not for Cloud)
└── App
    └── can include a Theme (Cloud-ready)

A theme lets you perform the tasks listed below.

* Template overrides
* Custom styles
* Configuration interfaces
* Control the order in which styles and templates are loaded

::: info
Note that a plugin can also override templates.
:::

To get started with your first theme, follow our [Theme Base Guide](themes/theme-base-guide).
