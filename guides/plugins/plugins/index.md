---
nav:
  title: Plugins
  position: 10

---

# Plugins

Shopware plugins are extensions that enhance the functionality and features of the Shopware e-commerce platform. Plugins are designed to extend the core capabilities of Shopware and offer additional functionalities that are not available out of the box. While apps and themes are also extensions but they differ from plugins. To better understand the differences, take a look at the [Overview](../../../guides/plugins/overview) article.

## Feature Comparison

::: tip

For projects customizations, it is recommended to use Bundles instead of plugins. As bundles are not managed via Administration and don't have lifecycle they offer full control over the project.

:::

| Feature                                       | Plugin             | Static Plugin           | Shopware Bundle                 | Symfony Bundle                  |
| --------------------------------------------- | ------------------ | ----------------------- | ------------------------------- | ------------------------------- |
| Installation                                  | Via Shopware Admin | Via Composer            | Via Composer                    | Via Composer                    |
| Repository Location                           | `custom/plugins`   | `custom/static-plugins` | `vendor` or inside `src` folder | `vendor` or inside `src` folder |
| Lifecycle Events (install, update, uninstall) | Yes                | Yes                     | No                              | No                              |
| Can be managed in Administration              | Yes                | No                      | No                              | No                              |
| Can be a Theme                                | Yes                | Yes                     | Yes                             | No                              |
| Can modify Admin / Storefront with JS/CSS     | Yes                | Yes                     | Yes                             | No                              |

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

### Symfony Bundle / Shopware Bundle

It's also possible to use Shopware/Symfony bundles instead of plugins. This is useful if you don't want to have the lifecycle of plugins and don't want it manageable via the Shopware administration. The bundles are typically installed via composer and are not managed by the Shopware administration.

<PageRef page="./bundle.html" title="Bundle" />
