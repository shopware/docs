---
nav:
  title: Plugins
  position: 10

---

# Plugins

Shopware plugins are extensions that enhance the functionality and features of the Shopware e-commerce platform. Plugins are designed to extend the core capabilities of Shopware and offer additional functionalities that are not available out of the box. While apps and themes are also extensions but they differ from plugins. To better understand the differences, take a look at the [Overview](../../../guides/plugins/overview) article.


## Types of plugins
There are different types of plugins in terms of their folder structure and functionality.

### Plugins
`<shopware project root>/custom/plugins` contains all plugins from the shopware store. The plugins are installed and managed via the Shopware administration.

### Static plugins
`<shopware project root>/custom/static-plugins` contains all plugins that are project-specific and are typically committed to the git repository.

:::info
The detection of static plugins is not done via the Shopware administration. They have to be required by the project via composer to be installable.
:::

```bash
# You can find the vendor/package name in the plugin's composer.json file under "name"
composer req <vendor>/<plugin-name>
```