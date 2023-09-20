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
| Install in Shopware 6 Cloud Shops | ❌ | ❌ | ✅ |  |
| Install in Shopware 6 self-hosted Shops | ✅ | ✅ | ✅ | Apps can be installed and used since Shopware 6.4.0.0 |
| Add custom logic/routes/commands | ✅ | ❌ | ✅ | Apps extract functionalities/logic into separate services, so technically, they can add custom logic |
| Control order of style/template inheritance | ❌ | ✅ | ✅ |  |

## Plugins

Plugins are the most powerful extension mechanism, as they can be used to extend, overwrite and modify almost any part of the software. At the same time, they can also be the most harmful for the same reasons. You will probably need to write a plugin, if you make profound changes or complex functionalities such as:

* Custom price calculation
* Product imports
* Custom Content/Products
* Connecting 3P identity providers
* Dynamic validations
* Customer tracking

Follow our [Plugin Base Guide](plugins/plugin-base-guide) to learn how to develop a plugin. See the [Plugin Fundamentals](plugins/plugin-fundamentals/) section below for more examples.

::: info
If your extensions do not require any of the above but rather design changes, a template tweak might ideally be appropriate.
:::

## Themes

A theme lets you perform the tasks listed below.

* Template overrides
* Custom styles
* Configuration interfaces
* Control the order in which styles and templates are loaded

Technically, plugins and themes are very similar and overlap in most of their logic. However, some special aspects are handled differently, such as template and style priority or their activation. Once plugins are installed and activated, their styles and templates are applied immediately. If a theme is installed, it must first be selected in the theme manager.

::: info
Note that a plugin can also override templates.
:::

To get started with your first theme, follow our [Theme Base Guide](themes/theme-base-guide).

## Apps

Operation in cloud environments is not possible due to the aspects listed under [Plugins](overview#plugins). Therefore, a different, less intrusive pattern was introduced. Apps enable event-based integrations that communicate with external services via a synchronous API.

Most of the app's logic resides in this third-party service, so developers must ensure that they handle the details of the API and provide their service with appropriate security, protection, and reliability. While it comes with these responsibilities, you are free to choose which operating environment, framework, or programming language you wish to use as long as our [guidelines for Shopware apps](apps/app-base-guide) are followed.

Apps also provide theme support, so all the features of [Themes](overview#themes) are also available for apps. Payments are also supported by apps and the user can be forwarded to a payment provider.
