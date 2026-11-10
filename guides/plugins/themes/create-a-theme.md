---
nav:
  title: Create a Theme
  position: 20

---

# Create a Theme

## Overview

This guide covers how to create, install, and activate a custom Shopware 6 theme.

## Prerequisites

All you need:

* A running Shopware 6 instance
* Full file system and command line access
* Recommended: [Shopware CLI](../../../products/tools/cli/index.md) (see [Installation](../../../products/tools/cli/installation.md)). If you can't use Shopware CLI, use `bin/console theme:create` instead.

## Name your plugin theme

Use **UpperCamelCase**, e.g., `SwagBasicExampleTheme`, beginning with a capital letter and ideally with a company prefix to avoid duplication. Choose a name that describes your theme appearance as succinctly and clearly as possible.

### Create a plugin-based theme

We recommend creating themes with the [Shopware CLI](../../../products/tools/cli/index.md). Run the following command anywhere inside your Shopware project:

```bash
shopware-cli extension create --type theme
```

The command asks whether you plan to publish the theme in the Shopware Community Store, then for a vendor prefix (Store themes only) and the theme name. To run it without prompts, pass all values as flags:

```bash
shopware-cli extension create --type theme --vendor Swag --name BasicExampleTheme
```

The vendor prefix and name are combined into the technical name, here `SwagBasicExampleTheme`. Without `--store`, the theme is created in `custom/static-plugins/SwagBasicExampleTheme`; with `--store`, it is created in `custom/plugins/SwagBasicExampleTheme`. For all flags, see [Creating Extensions](../../../products/tools/cli/extension-commands/create.md).

A static theme must be required through Composer before Shopware can install it, using the package name from the theme's `composer.json`:

```bash
composer require swag/basic-example-theme
```

#### Alternative: `bin/console theme:create`

If you can't use Shopware CLI, run the following command from your Shopware project root:

```bash
bin/console theme:create SwagBasicExampleTheme
```

You should get an output like this:

```bash
Creating theme structure under .../development/custom/plugins/SwagBasicExampleTheme
```

### Refresh the plugin list

Shopware needs to know that your new theme exists. Refresh the plugin list by running:

```bash
bin/console plugin:refresh
```

You should get an output like this:

```bash
[OK] Plugin list refreshed                                                                              

Shopware Plugin Service
=======================

 ----------------------- ------------------------------------ ------------- ----------------- -------- ----------- -------- ------------- 
  Plugin                  Label                                Version       Upgrade version   Author   Installed   Active   Upgradeable  
 ----------------------- ------------------------------------ ------------- ----------------- -------- ----------- -------- ------------- 
  SwagBasicExampleTheme   Theme SwagBasicExampleTheme plugin   9999999-dev                              No          No       No           
 ----------------------- ------------------------------------ ------------- ----------------- -------- ----------- -------- ------------- 

 1 plugins, 0 installed, 0 active , 0 upgradeable
```

### Activating the theme

The next command installs and activates the theme:

```bash
bin/console plugin:install --activate SwagBasicExampleTheme
```

The output should look like this, indicating success:

```bash
Shopware Plugin Lifecycle Service
=================================

 Install 1 plugin(s):
 * Theme SwagBasicExampleTheme plugin (vdev-trunk)

 Plugin "SwagBasicExampleTheme" has been installed and activated successfully.

 [OK] Installed 1 plugin(s).
```

### Assign to a sales channel

The final step in this guide involves assigning the theme to a sales channel and changing the default Storefront theme. Run this command:

```bash
# run this to change the current Storefront theme
$ bin/console theme:change
```

You should see an interactive prompt like this:

```bash
Please select a sales channel:
[0] Storefront | 64bbbe810d824c339a6c191779b2c205
[1] Headless | 98432def39fc4624b33213a56b8c944d
> 0

Please select a theme:
[0] Storefront
[1] SwagBasicExampleTheme
> 1

Set "SwagBasicExampleTheme" as new theme for sales channel "Storefront"
Compiling theme 13e0a4a46af547479b1347617926995b for sales channel SwagBasicExampleTheme
```

First, select `Storefront` as the sales channel. Then enter your theme's number. This fully installs your theme, and you can start your customization.

### Directory structure of a theme

The structure of a plugin-based theme is shown below. `shopware-cli extension create` does not create the `dist` directory; it is created when you build the theme's Storefront assets, for example with `shopware-cli extension build`:

```bash
├── composer.json
└── src
    ├── Resources
    │   ├── app
    │   │   └── storefront
    │   │       ├── dist
    │   │       │   └── storefront
    │   │       │       └── js
    |   |       |           └── swag-basic-example-theme  
    │   │       │               └── swag-basic-example-theme.js
    │   │       └── src
    │   │           ├── assets
    │   │           ├── main.js
    │   │           └── scss
    │   │               ├── base.scss
    │   │               └── overrides.scss
    │   └── theme.json
    └── SwagBasicExampleTheme.php
```

## Troubleshooting

When the theme is not visible, run the command:

```bash
bin/console plugin:refresh
bin/console plugin:list
```

When the theme is not applied, run the command:

```bash
bin/console theme:change
bin/console theme:compile
```

When there are errors no changes, run the command:

```bash
bin/console cache:clear
```

Also helpful:

* Check `var/log/`
* Verify file permissions in `custom/plugins/`

## Next steps

Now that you have created a theme, learn how to configure settings and styling:

* [Theme configuration](../themes/configuration/theme-configuration.md)
* [Add SCSS Styling and JavaScript to a theme](../themes/styling/add-css-js-to-theme.md)
* [Add assets to theme](../themes/assets/add-assets-to-theme.md)
