# Overview

The variety of Shopware's extension interfaces can be overwhelming, so let's start with a simple overview comparing the three approaches **Plugins**, **Themes** and **Apps**.

| Task | Plugin | Theme | App | Remarks |
| :--- | :--- | :--- | :--- | :--- |
| Change storefront appearance | ✅ | ✅ | ✅ |  |
| Add admin modules | ✅ | ❌ | ✅ |  |
| Execute Webhooks | ✅ | ❌ | ✅ | Apps main functionality is to call Webhooks, but Plugins can be implemented to do that as well. |
| Modify database structure, add custom entities | ✅ | ❌ | ❌ |  |
| Integrate payment providers | ✅ | ❌ | ✅ |  |
| Publish in the Shopware Store | ✅ | ✅ | ✅ |  |
| Install in Shopware 6 Cloud Shops | ❌ | ❌ | ✅ |  |
| Install in Shopware 6 on-Premise Shops | ✅ | ✅ | ✅ | Apps can be installed and used since Shopware 6.4.0.0 |
| Add custom logic/routes/commands | ✅ | ❌ | ✅ | Apps extract functionalities/logic into separate services, so technically they can add custom logic |
| Control order of style/template inheritance | ❌ | ✅ | ✅ |  |

## Plugins

Plugins are the most powerful extension mechanism, as they can be used to extend, override, modify almost every part of the software. At the same time they can obviously be the most harmful one as well, just for the same reasons. If you want to make deep modifications or add complex functionalities such as

* Custom price calculation
* Product imports
* Customized content / products
* Connecting 3P identity providers
* Dynamic validations
* Customer tracking

You will probably need to write a plugin for that. Follow our [Plugin Base Guide](plugins/plugin-base-guide.md) to learn how to develop a plugin. You will find further examples in the subsequent section [Plugin Fundamentals](plugins/plugin-fundamentals/).

{% hint style="info" %}
If your extensions requires nothing of the above but rather template changes, you might be fine with a Theme.
{% endhint %}

## Themes

A theme lets you perform the tasks listed below.

* Template overrides
* Custom styles
* Configuration interfaces
* Control the order in which styles and templates are loaded

Technically, plugins and themes are very similar and overlap in most of their logic. However, some particular aspects are handled differently, such as template and style priority or activation of the same. Once plugins are installed and activated, their styles and templates are immediately applied. When a theme is installed, it hast to be selected within the theme manager first.

{% hint style="info" %}
Note, that a plugin can also override templates.
{% endhint %}

To start your first theme, follow our [Theme Base Guide](themes/theme-base-guide.md).

## Apps

For the aspects listed under [Plugins](overview.md#plugins), it is not possible to operate those in cloud environments. Therefore, a different, less intrusive pattern has been introduced. Apps allow for event-based integrations which communicate with external services through a synchronous API.

Most of the logic of the app resides within that third party service, so developers have to make sure to work our the details of the API and provide proper security, protection and reliability to their service. While it comes with those responsibilities, it gives you free choice of which operating environments, frameworks or programming languages to use, as long as our [guidelines for Shopware apps](apps/app-base-guide.md) are followed.

Apps also provide theme support, so all functionalities of [Themes](overview.md#themes) are available to apps as well. Payments are also supported by apps and the user can be forwarded to a payment provider.

