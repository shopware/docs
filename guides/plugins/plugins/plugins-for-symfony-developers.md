---
nav:
  title: Plugins for Symfony developers
  position: 20

---

# Plugins for Symfony Developers

## Overview

This guide serves as an entry point for developers familiar with the concepts of `Symfony bundles`.

::: info
Check out our [Shopware Toolbox PHPStorm extension](../../../resources/tooling/ide/shopware-toolbox) with useful features like autocompletion, code generation or guideline checks.
:::

## Prerequisites

This guide handles some base concepts of Shopware plugins. Therefore, you may want to have a look at [Plugin base guide](plugin-base-guide) first.

As this guide also references the functionality of Symfony bundles, you should have at least a basic knowledge of it. You may want to have a look or refresh your knowledge on Symfony's [Bundle system](https://symfony.com/doc/current/bundles.html).

## Symfony bundles

A bundle is the Symfony's preferred way to provide additional third-party features to any Symfony application. Those bundles are everywhere: Symfony even outsources many of its core features into external bundles. The template engine `Twig`, the `Security` bundle, the `WebProfiler`, as well as many other third-party bundles can be installed on demand to extend your Symfony application in any way. The Bundle System is Symfony's way of providing an extendable framework with plugin capabilities.

## Shopware plugins

Shopware is building upon the `Symfony Bundle System` to extend its functionality even more. This allows the Shopware Plugin System to function as a traditional plugin system with features like plugin lifecycles and more.

Whenever you create a Shopware plugin, you have to extend the `Shopware\Core\Framework\Plugin` class. If you investigate this class, you will see that this class extends `Shopware\Core\Framework\Bundle`, which in return extends the Symfony's `Bundle` class:

```php
// 
class YourNamespace\PluginName extends

    // plugin lifecycles
    abstract class Shopware\Core\Framework\Plugin extends

        // adds support for migrations, filesystem, events, themes
        abstract class Shopware\Core\Framework\Bundle extends

            // Symfony base bundle
            abstract class Symfony\Component\HttpKernel\Bundle
```

As you can see, any Shopware plugin is also a Symfony bundle internally as well, and will be handled as such by Symfony. A plugin adds support for some cases, specific to the Shopware environment. These include, for example, handling plugin migrations and registering Shopware business events.

### Plugin lifecycle

As mentioned before, Shopware extends the `Symfony Bundle System` with some functionality to adjust its use for the Shopware ecosystem. For you as plugin developer, the most important addition is the extended plugin lifecycle.

A Shopware plugin runs through a lifecycle. Your plugin's base class can implement the following methods to execute any sort of installation or maintenance tasks.

| Lifecycle | Description |
| :--- | :--- |
| `install()` | Executed on plugin install |
| `postInstall()` | Executed **after** successful plugin install |
| `update()` | Executed on plugin update |
| `postUpdate()` | Executed **after** successful plugin update |
| `uninstall()` | Executed on plugin uninstallation |
| `activate()` | Executed **before** plugin activation |
| `deactivate()` | Executed **before** plugin deactivation |

## Next steps

Now that you know about the differences between a Symfony bundle and a Shopware plugin, you might also want to have a look into the following Symfony-specific topics and how they are integrated in Shopware 6:

* [Dependency Injection](plugin-fundamentals/dependency-injection)
* [Listening to events](plugin-fundamentals/listening-to-events)

::: info
Here are some useful videos explaining:

* **[Bundle Methods in a plugin](https://www.youtube.com/watch?v=cUXcDwQwmPk)**
* **[Symfony services in Shopware 6](https://www.youtube.com/watch?v=l5QJ8EtilaY)**

Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::
