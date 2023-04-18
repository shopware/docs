---
nav:
  title: Extensions
  position: 10

---

# Extensions

As a Shopware developer, your main work will be to develop extensions that enhance or modify the functionality of Shopware in a specific way. Shopware supports different types of extensions, each with its own benefits and implications.

Below is a condensed comparison between Apps and Plugins

<div class="grid grid-cols-2 my-14 divide-x divide-gray-300">

<div class="pr-6">
<div class="font-bold p-2 mb-4 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-white">Apps</div>

<div class="m-2 text-sm text-gray-600 leading-6">
<b>Shallow</b> core modifications and extension via <b>app scripts</b>, <b>configurations</b> or <b>APIs</b> (REST, webhooks). Deployed with the Shopware server, more complex apps require an additional separate server.
</div>

<div class="m-2 text-sm mt-4 leading-6">
Apps can be installed in <b>self-hosted</b>, <b>PaaS</b> and <b>cloud</b> environments.
</div>

<a href="apps/capabilities" class="m-2 mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">Learn more about Apps</a>

</div>

<div class="pl-6">
<div class="font-bold p-2 mb-4 rounded-md bg-gradient-to-r from-purple-500 to-purple-700 text-white">Plugins</div>

<div class="m-2 text-sm text-gray-600 leading-6">
Deep core modifications written in <b>PHP</b>. Apply patterns like <b>dependency injection</b> and <b>event listeners</b>. Can modify Shopware's internal <b>database schema</b> using Migrations. Deployed on the Shopware server.
</div>

<div class="m-2 text-sm mt-4 leading-6">
Plugins can be installed in <b>self-hosted</b> and <b>PaaS</b> environments only.
</div>

<a href="plugins/plugin-base-guide" class="m-2 mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">Learn more about Plugins</a>

</div>

</div>

## Comparison

The comparison above in not exhaustive, but it should give you a good idea of the differences between Apps and Plugins. In general, Apps are more lightweight and easier to develop and maintain, while Plugins are more powerful and require more effort to develop and maintain.

Topics that might factor into your decision include:

* How deep does the extension need to go into the Shopware core
* What is the targeted deployment environment (e.g. cloud, on-premise, etc.)
* What parts of Shopware are affected by the extension (e.g. storefront, administration, cart calculation etc.)
* Should the extension be available for all Shopware users or only for a specific customer

See a table of both extension system's capabilities below.

| | App | Plugin |
| :--- | :--- | :--- |
| Install in Shopware Cloud | ✅ | ❌ |
| Install in Shopware PaaS | ✅ | ✅ |
| Install in Shopware Self-Hosted | ✅ | ✅ |
| Theme the storefront | ✅ | ✅ |
| Add admin modules | ✅ | ✅ |
| Modify database structure | ❌ | ✅ |
| Integrate payment providers | ✅ | ✅ |
| Publish in the Shopware store | ✅ | ✅ |
| Add custom entities | ✅ | ✅ |
| Add custom API endpoints | ✅ | ✅ |
| Extend core PHP code | ❌ | ✅ |
| Control storefront data loading | ✅ | ✅ |

## Why two extension systems?

Shopware has two extension systems because they serve different purposes as Shopware can be used in different ways.

By origin, Shopware is a PHP application that can be extended with plugins. This is the reason why the plugin system is the core extension system of Shopware. It is the most powerful and flexible extension system, but it requires a lot of effort to develop and maintain, as it requires a lot of knowledge about the Shopware core and the core is subject to change often and in a breaking way.

Over time, Shopware has evolved into a platform that can be used in different ways. For example, it can be used as a headless API hosted in the cloud, or it can be used as a PaaS solution that is hosted by Shopware. In order to accommodate these use cases, Shopware needed a more robust extensions system that allows us to make changes that improve the cores performance and resilience without breaking existing extensions.

The App system was created to address these use cases. It provides more concise and domain-specific APIs, that are designed around third party developers use cases rather than the internal needs of the Shopware core. However, it comes at the cost of some flexibility as it is not possible to modify the core in the same way as with plugins.

## Limitations of the app system

The App system is designed around what we think are the most common use cases of third party developers - which might exclude some more specific use cases - especially modifications that could harm the stability of the core. However, for most of these cases there are alternative solutions that can be used to achieve the same result.

### No direct database access

Even if it's discouraged in most cases, plugins have direct access to the Shopware database. They can also modify the database structure by using migrations. Apps don't have direct database access. Instead, they can defined custom entities and use the Admin API to create, access and modify them.

### No service decoration and dependency injection

Service decoration and dependency injection are patterns that are used in the Shopware core to modify the behavior of existing services. Apps cannot do this, as they don't have access to the Shopware application. However, they are able to execute custom code and modify results of the Shopware core services by using script hooks or webhooks.
