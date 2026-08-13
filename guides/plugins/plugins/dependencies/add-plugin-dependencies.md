---
nav:
  title: Add Plugin Dependencies
  position: 80

---

# Add Plugin Dependencies

## Overview

Declare a dependency when your plugin cannot work without another plugin. Shopware uses Composer's `require` section for these dependencies. See the [Composer package links documentation](https://getcomposer.org/doc/04-schema.md#package-links) for the underlying Composer behavior.

Keep required plugin dependencies intentional and few. Every dependency adds another version relationship that you need to test when Shopware, the shared plugin, or the dependent plugin changes.

## Setup

Every Shopware plugin has a `composer.json` file. If you have not created a plugin yet, start with the [Plugin base guide](../plugin-base-guide.md).

Composer dependencies use the package name from the other plugin's `composer.json`, not its human-readable Store label or PHP class name.

For example, a shared plugin can contain:

```json
{
    "name": "swag/basic-example",
    "description": "Shared functionality for related extensions",
    "version": "1.0.0",
    "type": "shopware-platform-plugin",
    "require": {
        "shopware/core": "~6.7.0"
    }
}
```

Require that package from another plugin with a compatible version constraint:

```json
{
    "name": "swag/plugin-dependency",
    "description": "Plugin requiring shared functionality",
    "version": "1.0.0",
    "type": "shopware-platform-plugin",
    "license": "MIT",
    "authors": [
        {
            "name": "shopware AG",
            "role": "Manufacturer"
        }
    ],
    "require": {
        "shopware/core": "~6.7.0",
        "swag/basic-example": "^1.0"
    },
    "extra": {
        "shopware-plugin-class": "Swag\\PluginDependency\\PluginDependency",
        "label": {
            "de-DE": "Plugin mit Plugin-Abhängigkeiten",
            "en-GB": "Plugin with plugin dependencies"
        },
        "description": {
            "de-DE": "Plugin mit Plugin-Abhängigkeiten",
            "en-GB": "Plugin with plugin dependencies"
        }
    },
    "autoload": {
        "psr-4": {
            "Swag\\PluginDependency\\": "src/"
        }
    }
}
```

The `require` section now constrains both the supported Shopware version and the required plugin version. Use normal Composer version constraints so the dependency accepts the range you actually support. Avoid pinning an exact patch version unless the dependent plugin truly requires it.

Shopware cannot install the dependent plugin until its Composer requirements are fulfilled.

## Shared foundations and extension families

A shared foundation plugin can be useful when several related extensions intentionally reuse maintenance-heavy domain logic, integrations, or services. Keep the dependent plugins or themes thin and make the dependency explicit when they cannot work without the foundation.

The trade-off is coordinated maintenance. A change to the foundation can require compatibility testing and releases across every dependent extension, and Shopware upgrades add another dimension to that compatibility matrix.

Before adding a dependency, consider whether one of these structures fits better:

- Consolidate tightly related functionality into one plugin when the features always ship and change together.
- Use a Composer library or project bundle for reusable code that does not need to be a separately installed Shopware plugin.
- Use [theme inheritance](../../themes/inheritance/add-theme-inheritance.md) when the shared layer is presentation-specific.

See [Code structure](../../../development/extensions/code-structure.md) for broader guidance on organizing related extensions and minimizing upgrade friction.

## More interesting topics

- [Using Composer dependencies](using-composer-dependencies.md)
- [Using NPM dependencies](using-npm-dependencies.md)
