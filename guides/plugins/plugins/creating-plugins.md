---
nav:
  title: Creating Plugins
  position: 20

---

# Creating Plugins

This guide walks you through creating and scaffolding a basic Shopware plugin so it can be installed locally on your Shopware 6 instance.

## Prerequisites

You'll need:

* PHP knowledge
* A running Shopware 6 instance; refer to our [Install Shopware 6](../../installation/index.md) guide
* full file system and command line access

## 1. Choose a name

Use **UpperCamelCase**, which means that your plugin name must begin with a capital letter too. Whenever possible, begin it with a company prefix to avoid duplicate names (e.g., `SwagBasicExample`). Choose a name that describes your plugin as succinctly and clearly as possible.

::: info
A vendor prefix is required if you plan to publish your plugin in the [Shopware Community Store](https://store.shopware.com/en).
:::

## 2. Generate the plugin structure

Plugins are located in `<shopware project root>/custom/plugins` and managed via the Shopware Administration.

From your Shopware project's root directory, run:

```bash
bin/console plugin:create SwagBasicExample
```

### Skipping optional scaffold files

Pass the `--no-scaffold` flag to skip all optional scaffold files and generate only the required plugin skeleton:

```bash
bin/console plugin:create SwagBasicExample Swag\BasicExample --no-scaffold
```

When running the command interactively without the flag, you will be asked _"Would you like to scaffold optional plugin files?"_ — answering "no" has the same effect.

### Structure for long-term maintainability

When building multiple custom features, consider grouping related functionality inside a single plugin or repository instead of creating many isolated plugins.

Keeping extensions in one repository with shared CI, shared static analysis rules, and unified coding standards makes future upgrades significantly easier to manage.

## 3. Plugin structure

Generated location:

```bash
custom/plugins/SwagBasicExample
```

Minimal structure:

```text
SwagBasicExample/
├── composer.json
└── src/
    └── SwagBasicExample.php
```

Basic plugin class:

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample;

use Shopware\Core\Framework\Plugin;

class SwagBasicExample extends Plugin
{
}
```

## 4. composer.json essentials

To be installable, your plugin requires a `composer.json` file in its root directory: `custom/plugins/SwagBasicExample/composer.json`. Shopware uses this file to identify and register your plugin.

This file contains basic metadata that Shopware needs to know about your plugin, such as:

* The technical name
* The description
* The author
* The license
* The current plugin version
* The required dependencies
* and other configuration details.

At a minimum, it must define:

* `"type": "shopware-platform-plugin"`, so that Shopware can safely recognize your plugin
* `require` field must include `shopware/core`, to check for compatibility
* `"extra.shopware-plugin-class"` pointing to your plugin base class
* [PSR-4](https://www.php-fig.org/psr/psr-4/) autoload configuration

The `extra.shopware-plugin-class` value must reference your plugin’s base PHP class (e.g. `Swag\\BasicExample\\SwagBasicExample`).

The `autoload.psr-4` namespace must match your directory structure. If you change the path (for example, not using `src/`), your folders must reflect that configuration.

This file can also be read by [Composer](https://getcomposer.org/).

Here's an example `composer.json` you can refer to:

<details>
<summary>Example composer.json</summary>

```json
// <plugin root>/composer.json
{
    "name": "swag/basic-example",
    "description": "Description for the plugin SwagBasicExample",
    "version": "1.0.0",
    "type": "shopware-platform-plugin",
    "license": "MIT",
    "authors": [
        {
            "name": "Shopware"
        }
    ],
    "require": {
        "shopware/core": "~6.6.0"
    },
    "extra": {
        "shopware-plugin-class": "Swag\\BasicExample\\SwagBasicExample",
        "label": {
            "de-DE": "Der angezeigte lesbare Name für das Plugin",
            "en-GB": "The displayed readable name for the plugin"
        },
        "description": {
            "de-DE": "Beschreibung in der Administration für das Plugin",
            "en-GB": "Description in the Administration for this plugin"
        }
    },
    "autoload": {
        "psr-4": {
            "Swag\\BasicExample\\": "src/"
        }
    }
}
```

</details>

::: warning
If you change the `autoload.psr-4` path (for example, not using `src/`), adjust your directory structure accordingly.
:::

::: info
Set up [CI](../../development/testing/ci.md) early. Run static analysis, tests, and `shopware-cli extension build` in CI so your plugin ZIP is reproducible and safe to promote across environments.
:::

## Add Shopware Packagist (optional)

Shopware's Packagist instance enables management of Shopware Store plugins directly in the `composer.json`. To add the repository to your project, run:

```bash
composer config repositories.shopware composer https://packages.shopware.com
```

Authentication via API token is required. Refer to ["Using Composer for plugin installation in Shopware"](https://www.shopware.com/en/news/using-composer-for-plugin-installation-in-shopware/) for detailed information.

## Manual creation (optional)

In most cases, you should use `bin/console plugin:create`. Manual creation is only useful if you need full control over the structure or are working in a custom setup.

Navigate to `custom/plugins` to create a new directory named after your plugin, so that it looks like this:

```bash
custom/plugins/SwagBasicExample
```

Minimal structure:

```text
SwagBasicExample/
├── composer.json
└── src/
    └── SwagBasicExample.php
```

* **Namespace**: here, it's `Swag\BasicExample`. We recommend using a combination of your manufacturer prefix and the technical name to name it.
* **`src/` directory**: recommended but not strictly required.
* **PHP class**: `SwagBasicExample.php`, which you name after your plugin.

The new class `SwagBasicExample` must extend Shopware's abstract plugin class, `Shopware\Core\Framework\Plugin`:

```php
// <plugin root>/src/SwagBasicExample.php
<?php declare(strict_types=1);

namespace Swag\BasicExample;

use Shopware\Core\Framework\Plugin;

class SwagBasicExample extends Plugin
{
}
```

## Next steps

[Install and activate](./install-activate-plugin.md) your plugin.
