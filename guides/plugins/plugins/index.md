---
nav:
  title: Plugins
  position: 10

---

# Plugins

Plugins are Shopware's server-side extension type, giving you deep integration with the e-commerce platform. They allow you to extend, overwrite, and modify Shopware’s core capabilities. Unlike apps and themes, plugins run directly inside the shop environment and can interact tightly with the system.

You will likely create a plugin when you need to make profound changes or require complex functionalities such as:

- Custom price calculation
- Product imports
- Custom content/product logic
- Integrating third-party identity providers
- Dynamic validations
- Customer tracking or behavioral logic

Refer to our [Plugin Base Guide](plugin-base-guide/) and [Plugin Fundamentals](plugin-fundamentals/) for guidance on plugin development.

::: info
If your extension focuses only on design changes, a simple template adjustment—typically done through a theme plugin—may be the best choice.
:::

## Types of plugins

Shopware plugins differ in their folder structure and functionality.

### Plugins

`<shopware project root>/custom/plugins` contains all plugins from the Shopware store. You install and manage these plugins via the Shopware Administration.

### Static plugins

`<shopware project root>/custom/static-plugins` contains all project-specific plugins that are typically committed to the Git repository.

:::info
The Shopware Administration does not detect static plugins. The project must require them via Composer for them to be installable.
:::

```bash
# You can find the vendor/package name in the plugin's composer.json file under "name"
composer req <vendor>/<plugin-name>
```

### Symfony bundle / Shopware bundle

You can also use Shopware/Symfony bundles instead of plugins.
Bundles are a good choice when you want to avoid plugin lifecycle handling or Administration management.
You install bundles via Composer. They are not managed by the Shopware Administration.

## Feature comparison

::: tip

For customizing projects, we recommend using [bundles](https://developer.shopware.com/docs/guides/plugins/plugins/bundle.html) instead of plugins.
As bundles are not managed via Administration and don't have a lifecycle, they offer full control over the project.

:::

| Feature                                       | Plugin             | Static Plugin           | Shopware Bundle                 | Symfony Bundle                  |
|-----------------------------------------------|--------------------|-------------------------|---------------------------------|---------------------------------|
| Installation                                  | Via Shopware Admin | Via Composer            | Via Composer                    | Via Composer                    |
| Repository Location                           | `custom/plugins`   | `custom/static-plugins` | `vendor` or inside `src` folder | `vendor` or inside `src` folder |
| Lifecycle Events (install, update, uninstall) | Yes                | Yes                     | No                              | No                              |
| Can be managed in Administration              | Yes                | No                      | No                              | No                              |
| Can be a Theme                                | Yes                | Yes                     | Yes                             | No                              |
| Can modify Admin / Storefront with JS/CSS     | Yes                | Yes                     | Yes                             | No                              |
