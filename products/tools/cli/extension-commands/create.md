---
nav:
  title: Creating Extensions and Adding Features
  position: 1

---

# Creating Extensions and Adding Features

Shopware CLI can scaffold a new plugin or theme inside a Shopware project and add example implementations of single features to an existing plugin.

## Creating an extension

Run the following command anywhere inside your Shopware project:

```bash
shopware-cli extension create
```

The command asks for the extension type, whether you plan to publish the extension in the Shopware Community Store, a vendor prefix (Store extensions only), and the extension name. With `--no-interaction` (`-n`), pass all values as flags:

```bash
shopware-cli extension create -n --type plugin --vendor Swag --name BasicExample
```

| Flag           | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| `--type`, `-t` | `plugin` or `theme`                                                          |
| `--name`       | Extension name in UpperCamelCase                                             |
| `--vendor`     | Vendor prefix in UpperCamelCase. Required with `--store`, optional otherwise |
| `--store`      | Set if you plan to publish the extension in the Shopware Community Store     |

Without `--store`, the extension is created in `custom/static-plugins/<TechnicalName>`; with `--store`, it is created in `custom/plugins/<TechnicalName>`. The technical name combines the vendor prefix and the name, for example `SwagBasicExample`.

A plugin contains `composer.json`, the plugin base class, `.gitignore`, `phpunit.xml`, and `tests/TestBootstrap.php`. A theme contains `composer.json`, the theme base class, `theme.json`, and the Storefront `scss`, `assets`, and `main.js` sources.

For the next steps, see [Creating Plugins](../../../../guides/plugins/plugins/creating-plugins.md) and [Create a Theme](../../../../guides/plugins/themes/create-a-theme.md).

## Adding features to a plugin

Inside a plugin directory, `shopware-cli extension add` adds an example implementation of one Shopware feature:

```bash
shopware-cli extension add <generator>
```

Available generators: `admin-module`, `command`, `custom-fieldset`, `entity`, `event-subscriber`, `javascript-plugin`, `plugin-config`, `scheduled-task`, `store-api-route`, and `storefront-controller`. Run `shopware-cli extension add --help` for the list in your CLI version.

Generators don't replace existing files: files that already exist are skipped. New service and route definitions are added to `src/Resources/config/services.php` and `routes.php` unless they are already present. The generators support plugins only and require Shopware 6.7.13.0 or newer in the surrounding project.

For what each generator creates and where, see [Add features with `shopware-cli extension add`](../../../../guides/plugins/plugins/creating-plugins.md#add-features-with-shopware-cli-extension-add).
