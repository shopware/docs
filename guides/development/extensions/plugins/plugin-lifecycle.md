---
nav:
  title: Plugin lifecycle methods
  position: 3

---

# Plugin Lifecycle Methods

## Overview

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

A Shopware plugin goes through several lifecycle stages:

- Install
- Activate
- Deactivate
- Update
- Uninstall

| Lifecycle | Description |
| :--- | :--- |
| `install()` | Executed on plugin install |
| `activate()` | Executed **before** plugin activation |
| `deactivate()` | Executed **before** plugin deactivation |
| `update()` | Executed on plugin update |
| `postInstall()` | Executed **after** successful plugin install |
| `postUpdate()` | Executed **after** successful plugin update |
| `uninstall()` | Executed on plugin uninstallation |

Each stage allows you to prepare, modify, or clean up your plugin’s integration with the system.

Lifecycle methods are implemented in your base plugin class (`<plugin root>/src/SwagBasicExample.php`), which acts like a bootstrap file, and provide access to the [service container](dependency-injection) via `$this->container`.

## Install

`install()` is executed when the plugin is installed. Use this method to:

- Register entities (e.g., payment methods)
- Create initial data
- Prepare system requirements

```php
// <plugin root>/src/SwagBasicExample
public function install(InstallContext $installContext): void
{
    // Do stuff such as creating a new payment method
}
```

The `InstallContext` provides:

* Current plugin version
* Current Shopware version
* System `Context`, which provides information about the system (e.g., current language, currency, and permissions)
* [Plugin migrations](database-migrations)
* Auto-migration control \(`isAutoMigrate` or `setAutoMigrate` to prevent execution\)

::: info

Avoid creating new business data for your plugin in the `install()` method. Creating fully active entities at this stage, when the plugin isn't active yet, may affect the system before the plugin is actually enabled. A good rule of thumb: Only create data that can be safely activated or deactivated independently—for example, a payment method. You can create the entity during `install()`, but keep it inactive until the `activate()` method runs.
:::

## Activate

`activate()` is executed once the plugin is activated. You most likely want to do one of the following things here:

* Activate entities that you created in the install method, e.g. such as a payment method
* Create new entities or data, that you couldn't create in the install method

```php
// <plugin root>/src/SwagBasicExample
public function activate(ActivateContext $activateContext): void
{
    // Activate entities, such as a new payment method
    // Or create new entities here, because now your plugin is installed and active for sure
}
```

The `ActivateContext` provides the same information as the `InstallContext`.

## Deactivate

The opposite of `activate()` in most respects. It is executed when the plugin is deactivated.

* Deactivate entities created by the `install` method
* Remove entities that cannot be safely deactivated and that would otherwise interfere with the system if left active while the plugin is inactive.

```php
// <plugin root>/src/SwagBasicExample
public function deactivate(DeactivateContext $deactivateContext): void
{
    // Deactivate entities, such as a new payment method
    // Or remove previously created entities
}
```

The `DeactivateContext` provides the same information as the `InstallContext`.

## Update

The `update()` method runs when your plugin is updated to a new version. Database changes should be handled via [plugin migrations](database-migrations), rather than inside `update()`, to avoid repeated execution or version checks. However, `update()` is still useful for non-database adjustments, feature toggles, configuration changes, or logic that depends on the previous and new plugin versions.

```php
// <plugin root>/src/SwagBasicExample
public function update(UpdateContext $updateContext): void
{
    // Update necessary stuff, mostly non-database related
}
```

The `UpdateContext` provides the same information as the `InstallContext`, but comes with one additional method. Use `getUpdatePluginVersion()` to retrieve the target version being installed, and `getCurrentPluginVersion()` to retrieve the version currently installed before the update.

::: warning
Run [CI](../../testing/ci.md) (static analysis, tests, and reproducible artifact) before plugin updates to reduce the risk of upgrade-time failures.
:::

### PostInstall and PostUpdate methods

Two more lifecycle methods are worth mentioning: `PostUpdate` and `PostInstall`. These are executed **after** a successful install or update. These are useful for actions that should only run once the installation or update process has fully completed.

```php
// <plugin root>/src/SwagBasicExample
public function postInstall(InstallContext $installContext): void
{
}

public function postUpdate(UpdateContext $updateContext): void
{
}
```

## Uninstall

The opposite of `install()`, this is executed when the plugin is uninstalled. Use it to remove or clean up data created by your plugin.

::: warning
Do not blindly delete entities your plugin created. For example, if your plugin registered a payment method that was used in real orders, removing it would leave those orders in a broken state. In such cases, it's better to deactivate the entity instead of deleting it. Always consider the impact on existing production data.
:::

```php
// <plugin root>/src/SwagBasicExample
public function uninstall(UninstallContext $uninstallContext): void
{
    // Remove or deactivate the data created by the plugin
}
```

The `uninstall()` method receives an `UninstallContext`, which provides the same information as the `install` method. Important information is available with the `UninstallContext`, plus the`keepUserData()` flag.

### Keeping user data upon uninstall

When uninstalling a plugin, you can choose whether to remove all associated plugin data. If `keepUserData()` returns `true`, you must not delete persistent data created by your plugin. Respect this flag to avoid unintended data loss.

```php
// <plugin root>/src/SwagBasicExample
public function uninstall(UninstallContext $uninstallContext): void
{
    parent::uninstall($uninstallContext);

    if ($uninstallContext->keepUserData()) {
        return;
    }

    // Remove or deactivate the data created by the plugin
}
```

::: info
Refer to this video on **[Uninstalling a plugin](https://www.youtube.com/watch?v=v9OXrUJzC1I)** when dealing with plugin uninstall routines. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Next steps

Now let's [add plugin configuration](plugin-fundamentals/add-plugin-configuration).