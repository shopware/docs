---
nav:
  title: Plugin Lifecycle Methods
  position: 40

---

# Plugin Lifecycle Methods

When creating a Shopware plugin, extend the `Shopware\Core\Framework\Plugin` class. It extends `Shopware\Core\Framework\Bundle`, which extends Symfony's `Bundle` class.

A Shopware plugin goes through several lifecycle stages:

* Install
* Activate
* Deactivate
* Update
* Uninstall

| Lifecycle       | Description                                  |
| :-------------- | :------------------------------------------- |
| `install()`     | Executed on plugin install                   |
| `activate()`    | Executed **before** plugin activation        |
| `deactivate()`  | Executed **before** plugin deactivation      |
| `update()`      | Executed on plugin update                    |
| `postInstall()` | Executed **after** successful plugin install |
| `postUpdate()`  | Executed **after** successful plugin update  |
| `uninstall()`   | Executed on plugin uninstallation            |

Each stage allows you to prepare, modify, or clean up your plugin’s integration with the system.

Lifecycle methods are implemented in your base plugin class (`<plugin root>/src/SwagBasicExample.php`), which acts like a bootstrap file, and provide access to the [service container](../services/dependency-injection.md) via `$this->container`.

## Install

`install()` is executed when a plugin is installed. Use this method to:

* Register entities (e.g., payment methods)
* Create initial data
* Prepare system requirements

```php
// <plugin root>/src/SwagBasicExample.php
public function install(InstallContext $installContext): void
{
    // Try creating a new payment method, for example
}
```

The `InstallContext` provides:

* Current plugin version
* Current Shopware version
* System `Context`, which provides information about the system (e.g., current language, currency, and permissions)
* [Plugin migrations](../database/database-migrations.md)
* Auto-migration control (`isAutoMigrate` or `setAutoMigrate` to prevent execution)

::: info
Avoid creating new business data for your plugin in the `install()` method. Creating fully active entities at this stage, when the plugin isn't active yet, may affect the system before the plugin is actually enabled. A good rule of thumb: Only create data that can be safely activated or deactivated independently — for example, a payment method. You can create the entity during `install()`, but keep it inactive until the `activate()` method runs.
:::

## Activate

`activate()` is executed once the plugin is activated. You most likely want to do one of the following next:

* Activate entities that you created in the `install()` method, such as a payment method
* Create new entities or data that you couldn't create with `install()`

```php
// <plugin root>/src/SwagBasicExample.php
public function activate(ActivateContext $context): void
{
    // Activate entities, such as a new payment method
    // Or create new entities, because now your plugin is installed and active
}
```

The `ActivateContext` provides the same information as the `InstallContext`.

## Deactivate

The opposite of `activate()` in most respects. It is executed when the plugin is deactivated.

* Deactivate entities created by the `install` method
* Remove entities that cannot be safely deactivated and that would otherwise interfere with the system if left active while the plugin is inactive

```php
// <plugin root>/src/SwagBasicExample.php
public function deactivate(DeactivateContext $context): void
{
    // Deactivate entities, such as a new payment method
    // Or remove previously created entities
}
```

The `DeactivateContext` provides the same information as the `InstallContext`.

## Update

The `update()` method runs when your plugin is updated to a new version. Database changes should be handled via [plugin migrations](../database/database-migrations.md), rather than inside `update()`, to avoid repeated execution or version checks.

`update()` is still useful for non-database adjustments, feature toggles, configuration changes, or logic that depends on the previous and new plugin versions.

```php
// <plugin root>/src/SwagBasicExample.php
public function update(UpdateContext $context): void
{
    // Update as necessary, rarely database-related
}
```

The `UpdateContext` provides the same information as the `InstallContext`, but comes with one additional method. Use `getUpdatePluginVersion()` to retrieve the target version being installed, and `getCurrentPluginVersion()` to retrieve the version currently installed before the update.

::: warning
Run [CI](../../../development/testing/ci.md) (static analysis, tests, and reproducible artifact) before plugin updates to reduce the risk of upgrade-time failures.
:::

## PostInstall and PostUpdate methods

`PostUpdate` and `PostInstall` are executed **after** a successful install or update. These are useful for actions that should only run once the installation or update process has fully completed.

```php
// <plugin root>/src/SwagBasicExample.php
public function postInstall(InstallContext $context): void
{
}

public function postUpdate(UpdateContext $context): void
{
}
```

## Uninstall

The opposite of `install()`, this is executed when the plugin is uninstalled. Use it to remove or clean up data created by your plugin.

::: warning
Do not blindly delete entities your plugin created. If your plugin registered a payment method used in existing orders, Shopware restricts its deletion. Deactivate the payment method instead. Always consider the impact on existing production data.
:::

```php
// <plugin root>/src/SwagBasicExample.php
public function uninstall(UninstallContext $context): void
{
    // Remove or deactivate the data created by the plugin
}
```

The `uninstall()` method receives an `UninstallContext`, which provides the same information as `InstallContext`, plus the `keepUserData()` flag.

### Keeping user data upon uninstall

When uninstalling a plugin, you can choose whether to remove all associated plugin data or not. If `keepUserData()` returns `true`, you must not delete persistent data created by your plugin. Respect this flag to avoid unintended data loss.

```php
// <plugin root>/src/SwagBasicExample.php
public function uninstall(UninstallContext $uninstallContext): void
{
    if ($uninstallContext->keepUserData()) {
        return;
    }

    // Remove or deactivate the data created by the plugin
}
```

The base `Plugin::uninstall()` is empty, and Shopware does not drop tables created by your plugin's migrations. Implement that cleanup in `uninstall()`, and skip destructive cleanup when `keepUserData()` returns `true`. Delete only data and tables that can safely be removed without breaking existing business records.

#### Setting the flag

The CLI and the Admin API remove data unless you ask to keep it. The API treats a missing `keepUserData` as `false`. The Administration uninstall dialog keeps data unless the user selects removal.

* CLI: `bin/console plugin:uninstall <plugin name> --keep-user-data`
* Admin API: `POST /api/_action/extension/uninstall/plugin/{technicalName}` with the body parameter `keepUserData`
* Administration: the Administration sends `keepUserData` as the inverse of its `removeData` choice

#### What Shopware does during uninstall

Keeping user data does not bypass the uninstall lifecycle: Shopware deactivates the plugin if it is active, then calls your `uninstall()` hook if the preceding steps succeed.

Deactivation fails if other active plugins depend on the plugin. Storefront validation can prevent uninstall when the plugin is a theme still assigned to a sales channel, including when keeping user data.

The following steps run only when user data is **not** kept:

* **Migration records:** Shopware deletes the plugin's rows from the `migration` table before your `uninstall()` hook runs, so a reinstall runs your migrations again. If your `uninstall()` keeps tables around, make those migrations safe to rerun, for example with `CREATE TABLE IF NOT EXISTS`. With kept user data, the rows stay and a reinstall skips them.
* **Plugin configuration:** After your hook, Shopware calls `SystemConfigService::deletePluginConfiguration()` to remove stored `system_config` entries for keys declared in the plugin's current `Resources/config/config.xml`, globally and for sales-channel overrides. If the file is absent, this step does nothing. Cleanup throws and uninstall stops if a key has an effective non-null static value in a scope being cleaned. Shopware always processes global configuration, then sales channels with stored entries for these keys.
* **Custom field sets:** Shopware deletes the custom field sets declared in the plugin's `Resources/config/custom-fields.xml`. Sets your plugin creates in code without setting `extensionName`, for example in `install()`, stay, so remove those yourself.
* **Theme:** If the Storefront is installed, Shopware deletes the plugin's theme and its dependent themes. It attempts to delete media associated with the plugin's theme, preserving media protected by deletion restrictions.

::: warning
A failure in one uninstall step can leave the earlier steps applied. Shopware clears `installedAt` before custom-entity cleanup, custom-field cleanup, Composer handling and post-uninstall subscribers. If a later step fails, the plugin can already be marked uninstalled; rerunning `plugin:uninstall` then skips it.
:::

If `executeComposerCommands()` returns `true` and `shopware.deployment.cluster_setup` is disabled, Shopware attempts Composer removal for the plugin's package. It executes immediately in CLI and is deferred to `kernel.response` for web requests.

::: info
For Academy learning content on plugin lifecycle methods, updates, migrations, and uninstall cleanup, refer to this free course **[Plugin Lifecycle Management](https://hub.shopware.com/learn/unit/plugin-lifecycle-management)** from **Shopware Backend Development Intermediate** learning path.
:::

## Next steps

[Add plugin configuration](add-plugin-configuration.md)
