---
nav:
  title: Plugins
  position: 10

---

# Plugins

Plugins are Shopware’s PHP-based, server-side extension type for enhancing platform functionality. They allow you to extend, overwrite, and modify Shopware's core capabilities at runtime.

Plugins run directly inside the Shopware environment and provide full access to:

* The Symfony service container
* Events and subscribers
* Database layer and migrations
* CLI commands and scheduled tasks
* Administration extensions
* Storefront extensions

Technically, plugins are extensions of [Symfony bundles](./bundle.md). They follow a defined directory structure and, when used as managed extensions, provide a lifecycle (install, update, deactivate, uninstall).

Plugins can ship their own assets, controllers, services, and tests, enabling deep platform and full extensibility across core and custom functionality.

## When to create and use a plugin

You will typically use a plugin when you need to:

* Implement custom business logic for customer tracking, content, products and product imports, etc.
* Modify or customize checkout or pricing behavior or calculations
* Add database entities or migrations
* Listen to and react to platform events
* Register services in the DI container
* Extend the Administration with custom modules
* Add backend commands or scheduled tasks
* Integrate third-party systems, including identity providers
* Enable dynamic validations
* Add custom [MCP tools, prompts, and resources](mcp-server.md) for AI clients

::: info
For infrastructure and external system integrations (e.g., Redis, Elasticsearch, or custom APIs), refer to the dedicated [integration guides](../plugins/integrations/index.md).
:::

### Choosing the right extension type

| Requirement | Use |
|-------------|------|
| Backend logic or deep integration | Plugin |
| Storefront styling or template overrides only | Plugin-based Theme |
| SaaS-based integration without server access | App |

::: info
If your extension focuses only on design changes, a simple template adjustment, typically done through a plugin-based [theme](../themes/index.md), may be the best choice.
:::

## Plugin types

Shopware supports multiple plugin models, which differ in their folder structure and functionality.

### Feature comparison

| Feature                                       | Plugin             | Static Plugin           | Shopware Bundle                 | Symfony Bundle                  |
|-----------------------------------------------|--------------------|-------------------------|---------------------------------|---------------------------------|
| Installation                                  | Via Shopware Admin | Via Composer            | Via Composer                    | Via Composer                    |
| Repository Location                           | `custom/plugins`   | `custom/static-plugins` | `vendor` or inside `src` folder | `vendor` or inside `src` folder |
| Lifecycle Events (install, update, uninstall) | Yes                | Yes                     | No                              | No                              |
| Can be managed in Administration              | Yes                | No                      | No                              | No                              |
| Can be a Theme                                | Yes                | Yes                     | Yes                             | No                              |
| Can modify Admin / Storefront with JS/CSS     | Yes                | Yes                     | Yes                             | No                              |

### Static plugins (recommended)

Project-specific static plugins live in `<shopware project root>/custom/static-plugins`, which contains all project-specific plugins that are typically committed to the Git repository. The Shopware Administration does not detect static plugins. They must be required via Composer before they can be installed and activated:

```bash
# You can find the vendor/package name in the plugin's composer.json file under "name"
composer req <vendor>/<plugin-name>
```

Static plugins are ideal for:

* Custom project logic
* Team development workflows
* CI/CD pipelines
* Long-term maintainability

Characteristics:

* Versioned in Git
* Live inside your project repository
* Are installed and managed via Composer
* Integrate cleanly into deployment workflows
* No dependency on Administration installation
* Offer clear separation between project code and marketplace extensions

### Managed plugins

Managed plugins are commonly used for marketplace-distributed extensions. They are located in `<shopware root>/custom/plugins` and are typically installed and managed via the Shopware Administration.

### Bundles

Symfony-based [bundles](../plugins/bundle.md) are installed via Composer. They do not have a Shopware plugin lifecycle and are not managed via the Administration.

Bundles are useful when you want:

* Full Symfony-level control
* No lifecycle handling or Administration management
* Pure project-level customization

Choose the extension model that best fits your distribution and maintenance strategy.

## Architectural recommendation

There is no need to create a separate plugin for every distinct functionality.

For custom projects, it is often preferable to:

* Maintain all custom logic in a single repository
* Share one CI pipeline and one set of static analysis rules
* Organize functionality through clean internal directory structure

It does not matter whether static plugins or Symfony bundles internally are used, as much as having:

* Clear domain boundaries
* Consistent structure
* Centralized quality control

It is perfectly valid to ship multiple separate plugins, but keeping them in a single repository with unified tooling significantly reduces long-term maintenance and upgrade friction.

## Next steps

* Review the [Plugin base guide](./plugin-base-guide.md) to learn how to create plugins
* Make note of [CI](../../development/testing/ci.md) and other testing guidance to prevent upgrade-related regressions
