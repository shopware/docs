---
nav:
  title: Create a first theme
  position: 20

---

# Create Your First Theme

## Overview

This guide will show you how to create, install, and activate a custom Shopware 6 theme.

## Prerequisites

All you need:

- Running Shopware 6 instance
- Full file system and CLI access

## Name your plugin theme

Use **UpperCamelCase**, which means that your theme name must begin with a capital letter too. Whenever possible, begin it with a company prefix to avoid duplicate names (e.g., `SwagBasicExampleTheme`). Choose a name that describes your theme appearance as succinctly and clearly as possible.

### Create a plugin-based theme

Now it's time to create your plugin, running this command in your terminal:

```bash
bin/console theme:create SwagBasicExampleTheme
```

You should get an output like this:

```bash
Creating theme structure under .../development/custom/plugins/SwagBasicExampleTheme
```

Shopware needs to know that your new plugin exists. Refresh the plugin list by running:

```bash
bin/console plugin:refresh
```

You should get an output like this, which indicates that Shopware recognises your plugin theme:

[OK] Plugin list refreshed                                                                              

```bash
Shopware Plugin Service
=======================

 ----------------------- ------------------------------------ ------------- ----------------- -------- ----------- -------- ------------- 
  Plugin                  Label                                Version       Upgrade version   Author   Installed   Active   Upgradeable  
 ----------------------- ------------------------------------ ------------- ----------------- -------- ----------- -------- ------------- 
  SwagBasicExampleTheme   Theme SwagBasicExampleTheme plugin   9999999-dev                              No          No       No           
 ----------------------- ------------------------------------ ------------- ----------------- -------- ----------- -------- ------------- 

 1 plugins, 0 installed, 0 active , 0 upgradeable
```

### Activating your plugin

The next command installs and activates your theme:

```bash
bin/console plugin:install --activate SwagBasicExampleTheme
```

You should see output like this, indicating success:

```bash
Shopware Plugin Lifecycle Service
=================================

 Install 1 plugin(s):
 * Theme SwagBasicExampleTheme plugin (vdev-trunk)

 Plugin "SwagBasicExampleTheme" has been installed and activated successfully.

 [OK] Installed 1 plugin(s).
```

### Assign to a sales channel

The final step in this guide is to assign your theme to a sales channel, which changes default Storefront theme. Run:

```bash
$ bin/console theme:change
```

You will see an interactive prompt like this:

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

Theme not visible?

```bash
bin/console plugin:refresh
bin/console plugin:list
```

Theme not applied?

```bash
bin/console theme:change
bin/console theme:compile
```

Errors or no changes?

```bash
bin/console cache:clear
```

Also:

- Check `var/log/`
- Verify file permissions in `custom/plugins/`

## Next steps

Now that you have created your own theme, the next step is to learn how to make settings and adjustments.

* [Theme configuration](theme-configuration)
* [Add SCSS Styling and JavaScript to a theme](add-css-js-to-theme)
* [Add assets to theme](add-assets-to-theme)
