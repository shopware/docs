---
nav:
  title: Plugins
  position: 10

---

# Plugins

Plugins are Shopware's server-side extension type, giving you deep integration with the e-commerce platform. They allow you to extend, overwrite, and modify Shopware’s core capabilities. Unlike apps and themes, plugins run directly inside the shop environment and can interact tightly with the system.

You will likely create a plugin when you need deep server-side integration or require complex functionalities such as:

- Custom price calculation
- Product imports
- Custom content/product logic
- Integrating third-party identity providers
- Dynamic validations
- Customer tracking or behavioral logic

| Goal | Guide |
|------|--------|
| Create a new plugin from scratch | [Plugin base guide](plugin-base-guide.md) |
| Add Admin configuration fields (`config.xml`) | [Add plugin configuration](plugin-fundamentals/add-plugin-configuration.md) |
| Read config in PHP, Admin JS, or Storefront | [Use plugin configuration](plugin-fundamentals/use-plugin-configuration.md) |
| React to domain events | [Listening to events](../plugins/framework/event/listening-to-events.md) |
| Register services & DI | [Dependency injection](../plugins/services/dependency-injection.md) |
| Database changes | [Database migrations](../plugins/database/database-migrations.md) |
| Composer dependencies in a plugin | [Adding Composer dependencies](../plugins/dependencies/using-composer-dependencies.md) |
| More topics | [Plugin fundamentals](plugin-fundamentals/index.md) (logging, cache, routes, …) |

::: info
If your extension focuses primarily on Storefront design changes, a [theme plugin](../themes/theme-base-guide.md) is often the best choice.
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

You can also use Shopware/Symfony [bundles](bundle.md) instead of plugins. Bundles are installed bundles with Composer and offer full control over projects. They are not managed by the Shopware Administration, and are a good choice when you want to avoid plugin lifecycle handling or Administration management.

## Feature comparison

| Feature                                       | Plugin             | Static Plugin           | Shopware Bundle                 | Symfony Bundle                  |
|-----------------------------------------------|--------------------|-------------------------|---------------------------------|---------------------------------|
| Installation                                  | Via Shopware Admin | Via Composer            | Via Composer                    | Via Composer                    |
| Repository Location                           | `custom/plugins`   | `custom/static-plugins` | `vendor` or inside `src` folder | `vendor` or inside `src` folder |
| Lifecycle Events (install, update, uninstall) | Yes                | Yes                     | No                              | No                              |
| Can be managed in Administration              | Yes                | No                      | No                              | No                              |
| Can be a Theme                                | Yes                | Yes                     | Yes                             | No                              |
| Can modify Admin / Storefront with JS/CSS     | Yes                | Yes                     | Yes                             | No                              |
