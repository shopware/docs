---
nav:
  title: Creating plugins
  position: 2

---

## Creating and installing plugins

This guide walks you through creating a basic Shopware plugin and installing it locally on your Shopware 6 instance.

::: info
Refer to this video on **[Creating a plugin](https://www.youtube.com/watch?v=_Tkoq5W7woI)** that shows how to bootstrap a plugin. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Prerequisites

You'll need:

* PHP knowledge
* A running Shopware 6 instance; refer to our [Install Shopware 6](../../installation/) guide if needed
* full file system and command line access

`<shopware project root>/custom/plugins` contains all plugins from the Shopware store. You install and manage these plugins via the Shopware Administration.

## 1. Choose a name

Use **UpperCamelCase**, which means that your plugin name must begin with a capital letter too. Whenever possible, begin it with a company prefix to avoid duplicate names (e.g., `SwagBasicExample`). Choose a name that describes your plugin as succinctly and clearly as possible.

::: info
A vendor prefix is required if you plan to publish your plugin in the [Shopware Community Store](https://store.shopware.com/en).
:::

## 2. Generate the plugin structure

From your Shopware project's root directory, run:

```bash
bin/console plugin:create SwagBasicExample
```

Optionally, you can run this command to create a demo configuration file in the `Resources` directory:

```bash
bin/console plugin:create SwagBasicExample --create-config
```

The command will generate all the basic required files that are needed for an extension to be installed on a Shopware instance. Make sure to adjust the namespace in the files as per your need.

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
* The used license
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

::: info
[This video](https://www.youtube.com/watch?v=CY3SlfwkTm8) explains the `composer.json` structure in more detail. Our free ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma) training is another useful resource.
:::

This file can also be read by [Composer](https://getcomposer.org/).

Here's an example `composer.json` you can refer to:

<details>
<summary>Example composer.json</summary>

```javascript
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

::: Info
Set up [CI](../../testing/ci.md) early. Run static analysis, tests, and `shopware-cli extension build` in CI so your plugin ZIP is reproducible and safe to promote across environments.
:::

## Add Shopware Packagist (optional)

Shopware's Packagist instance enables management of Shopware Store plugins directly in the `composer.json`. To add the repository to your project, run:

```bash
composer config repositories.shopware composer https://packages.shopware.com
```

Authentication via API token is required. Refer to ["Using Composer for plugin installation in Shopware"](https://www.shopware.com/en/news/using-composer-for-plugin-installation-in-shopware/) for detailed information.

### Manual creation (optional)

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

- **namespace**: here, it's `Swag\BasicExample`. We recommend using a combination of your manufacturer prefix and the technical name to name it.
- **`src/` directory**: recommended but not strictly required.
- **PHP class**: `SwagBasicExample.php`, which you name after your plugin.

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

::: warning
If you change the `autoload.psr-4` path (for example, not using `src/`), your directory structure must match that configuration.
:::

And that's it. The basic structure and all necessary files for your plugin to be installable are done.

## Next steps

[Install and activate](install-activate) your plugin.
