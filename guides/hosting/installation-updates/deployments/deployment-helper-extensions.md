---
nav:
  title: Extensions and Apps
  position: 18

---

# Extensions and Apps

Deployment Helper automatically manages extensions found in `custom/plugins`, `custom/apps`, and via Composer. This page explains how apps and plugins differ, how extension state is managed, and how to handle them during deployment.

## Apps vs Plugins

Deployment Helper manages two types of extensions: [apps](../../../plugins/apps/index.md) and [plugins](../../../plugins/plugins/index.md). They follow the same lifecycle but differ in how they're loaded and what they require.

| Aspect | Plugin | App |
|--------|--------|-----|
| **Location** | `custom/plugins/` or Composer | `custom/apps/` or Composer type `shopware-app` |
| **Definition** | Directory with `plugin.xml` or PHP class | Directory/package with `manifest.xml` |
| **License requirement** | None | **Requires license domain to register** with Shopware |
| **Built-in extensions** | Payment, analytics plugins | Payment apps (official integrations) |
| **Lifecycle** | Installed via `plugin:install` | Installed via `app:install`, requires handshake with Shopware registration server |

If installing apps, you must set a license domain. Plugins work without one.

## Extension state machine

When `extension-management` is enabled (default), each extension's desired state can be controlled via the `overrides` section or `exclude` list (shorthand). The `state` field acts as a state machine:

| State | Behavior | Use Case |
|-------|----------|----------|
| **(default, not set)** | Install if not present, update if installed and outdated, activate if not active | Treat extension as part of the codebase; always keep it deployed |
| `inactive` | Install if not present, update if installed, but **keep inactive** | Extension is deployed but disabled (e.g., a feature branch plugin, beta testing, or toggle-able features) |
| `ignore` | Skip entirely; do not manage this extension | Manual control; use when you manage this extension separately via console commands |
| `remove` | **Uninstall** if installed; do not install | Permanently remove an extension (see [Removing an extension](#removing-an-extension)) |

### Exclude list shorthand

The `exclude` field is a convenience shorthand for marking extensions as ignored:

```yaml
deployment:
  extension-management:
    # These two are equivalent:
    exclude:
      - MyPlugin
    
    overrides:
      MyPlugin:
        state: ignore
```

Use whichever you prefer; internally, `exclude` is converted to `overrides` with `state: ignore`.

## Extension management workflow

When `extension-management` is enabled (default), the Deployment Helper automatically manages all extensions it finds in `custom/plugins`, `custom/apps`, and via Composer. This means it will install, update, activate, or deactivate extensions based on what is present in your codebase.

It is possible to install several plugins at once; the Deployment Helper batches them instead of calling `plugin:install` once per plugin. Fresh plugins are grouped by whether they should be activated, and each group is installed in a single command. This speeds up first-time installs and large deployments.

### Plugin installation batching

Deployment Helper optimizes plugin installation speed by batching multiple plugins into a single `plugin:install` command:

Batching rules:

- Plugins without dependencies on other plugins are batched
- Plugins that need activation are installed individually
- Plugins with dependencies are installed individually (preserves topological order)

**Example**:

If you have plugins `A`, `B`, `C` (none depend on each other) and plugin `D` (marked `state: inactive`):

```yaml
deployment:
  extension-management:
    overrides:
      D:
        state: inactive
```

Execution:

- Batch install `A`, `B`, `C` in one command (activate all)
- Individual install of `D` (keep inactive)

This batching is transparent but improves deployment speed on shops with many plugins. You can verify it in the deployment output, which shows `plugin:install [Plugin1 Plugin2 ...]`.

## Store-installed plugins and conflicts

:::warning
Installing plugins later via the Shopware Store (Admin UI) while `extension-management` is enabled can cause conflicts during deployment. The Deployment Helper does not know about extensions installed at runtime through the Store and may interfere with their state. For example, a Store-installed plugin might be deactivated or behave unexpectedly after the next deployment.
:::

You have two options to handle this.

### Option 1: Manage all extensions through code (recommended)

Install all extensions via Composer and let the Deployment Helper manage them. Disable runtime extension management in the Administration to prevent ad-hoc installations:

```yaml
# config/packages/z-shopware.yaml
shopware:
    deployment:
        runtime_extension_management: false
```

See [Extension Management](../extension-management.md) for details on installing extensions via Composer.

### Option 2: Disable the Deployment Helper's extension management

If you prefer to manage extensions manually through the Store or Administration, disable the extension management in your `.shopware-project.yml`:

```yaml
deployment:
  extension-management:
    enabled: false
```

With this setting, the Deployment Helper will skip extension installation and updates entirely. You are then responsible for managing extension states yourself (e.g., via `bin/console plugin:install`, `plugin:update`, etc.).

## Removing an extension

To find the name (for example `SwagPlatformDemoData`) of the extension you want to remove, use the `./bin/console plugin:list` command.

```shell
./bin/console plugin:list

Shopware Plugin Service
=======================

 ----------------------------- ------------------------------------------ ---------------------------------------------- --------- ----------------- ------------------- ----------- -------- ------------- ----------------------
  Plugin                        Label                                      Composer name                                  Version   Upgrade version   Author              Installed   Active   Upgradeable   Required by composer
 ----------------------------- ------------------------------------------ ---------------------------------------------- --------- ----------------- ------------------- ----------- -------- ------------- ----------------------
  SwagPlatformDemoData          Shopware 6 Demo data                       swag/demo-data                                 2.0.1                       shopware AG         Yes         No       No            No
 ----------------------------- ------------------------------------------ ---------------------------------------------- --------- ----------------- ------------------- ----------- -------- ------------- ----------------------
```

Removing an extension requires you to follow two steps:

First, set the extension to `remove` in the `.shopware-project.yml` file:

```yaml
deployment:
  extension-management:
    enabled: true

    overrides:
      TheExtensionWeWantToGetRidOf:
        # This plugin will be uninstalled if it is installed
        state: remove
        # Keep data of an uninstalled extension
        keepUserData: true

```

and deploy the changes. The extension will be uninstalled and is inactive.

Secondly, remove the extension from source code, remove the entry from the `.shopware-project.yml` file, and deploy the changes again.

## How Deployment Helper adapts to different Shopware versions

Deployment Helper is designed to work across multiple Shopware versions (6.4+) without requiring upgrades. It detects Shopware features at runtime and adapts its behavior:

- **Theme compilation**: Uses `theme:compile --only` (6.5.6+) for parallel compilation, falls back to serial on older versions
- **Async compilation**: Uses `--sync` flag (6.6.1+) to force synchronous compile when async is enabled
- **Command options**: Detects which console commands and flags are available before executing them
- **Database schema**: Reads directly from database to discover installed extensions and configuration, not relying on potentially unstable console command output

This means you can use a single Deployment Helper version across projects running different Shopware versions, and it will work correctly.
