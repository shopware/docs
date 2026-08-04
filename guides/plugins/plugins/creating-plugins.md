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

The command asks for a plugin name and namespace (both PascalCase) if you do not pass them as arguments, then asks whether it should scaffold optional files. It always generates the files an extension needs to be installable: `composer.json`, the plugin base class, `config.xml`, `.gitignore`, and the PHPUnit setup.

Use `--static` to create the plugin in `custom/static-plugins` instead of `custom/plugins`:

```bash
bin/console plugin:create SwagBasicExample --static
```

### Skip the optional scaffolding

Answering *no* to the scaffolding question, or passing `--no-scaffold`, creates only the required files:

```bash
bin/console plugin:create SwagBasicExample --no-scaffold
```

This is the recommended starting point when you already know what your plugin needs. The optional scaffolding generates example code across several directories, which is useful as a reference but leaves files behind that you have to read and delete.

To generate a specific example instead of all of them, pass its option. Each option can also be answered interactively:

| Option | Generates |
| --- | --- |
| `--create-storefront-controller` | Example Storefront controller, its template, and a `routes.php` entry |
| `--create-store-api-route` | Example Store API route with abstract class and response class |
| `--create-event-subscriber` | Example event subscriber |
| `--create-command` | Example console command |
| `--create-scheduled-task` | Example scheduled task |
| `--create-admin-module` | Example Administration module with snippets |
| `--create-javascript-plugin` | Example Storefront JavaScript plugin |
| `--create-custom-fieldset` | Example custom fieldset (`custom-fields.xml`) |
| `--entities=Example,Foo` | Entity definition, entity, collection, and migration per entity (PascalCase, comma-separated) |

Every generator that needs a service definition also appends it to the plugin's service configuration in `src/Resources/config`.

::: info
Generated files are tied to the Shopware version you run the command on. When your plugin supports several Shopware versions, treat the output as a starting point and verify it against the version you target.
:::

Make sure to adjust the namespace in the generated files as per your need.

### Generate from your IDE instead

The [Shopware 6 Toolbox plugin](../../development/tooling/shopware-toolbox.md) for PHPStorm creates plugins and single files (scheduled task, migration, Administration module, CMS block, event subscriber) from the editor. Its generators are based on JetBrains file templates, so you can adapt the generated files to your own conventions, which is not possible with the core scaffolding.

::: info
After adding or changing service configuration, routes, or Twig templates, clear the cache with `bin/console cache:clear`. Stale caches are the most common reason a newly generated file appears to have no effect.
:::

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

`shopware-platform-plugin` is the only Composer type Shopware treats as a plugin. A package with any other type — `library`, `project`, or the `shopware-app` type used for apps — is not picked up as a plugin and never appears in the Administration, even if everything else is set up correctly. Shopware also rejects a plugin whose `extra.shopware-plugin-class` or `extra.label` is missing.

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
        "shopware/core": "~6.7.0"
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

### Depending on other plugins

If your plugin requires another plugin to be installed, declare it in the `require` section of your `composer.json` using the other plugin's Composer name and version (here, an example plugin named `swag/other-plugin`):

```json
"require": {
    "shopware/core": "~6.7.0",
    "swag/other-plugin": "^1.0"
}
```

Shopware will then enforce that the required plugin is installed and activated first. For version constraints, dev setups, and store considerations, see [Add Plugin Dependencies](./dependencies/add-plugin-dependencies.md).

## Add Shopware Packagist (optional)

Shopware's Packagist instance enables management of Shopware Store plugins directly in the `composer.json`. To add the repository to your project, run:

```bash
composer config repositories.shopware composer https://packages.shopware.com
```

Authentication via API token is required. Refer to [Extension Management](../../hosting/installation-updates/extension-management.md) for how to obtain the token and set up `auth.json`.

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
