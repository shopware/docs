# Create a First Theme

## Overview

This guide will show you how to create a theme fom the scratch. You will also learn how to install and activate your theme.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files, as well as the command line.

## Create your first plugin theme

Let's get started with creating your plugin by finding a proper name for it.

### Name your plugin theme

First, you need to find a name for your theme. We're talking about a technical name here, so it needs to describe your theme appearance as short as possible, written in UpperCamelCase. To prevent issues with duplicated theme names, you should add a shorthand prefix for your company.  
Shopware uses "Swag" as a prefix for that case.  
For this example guide we'll use the theme name **SwagBasicExampleTheme.**

::: info
Notice: The name of a theme must begin with a capital letter too!
:::

### Create a plugin-based theme

Now that you've found your name, it's time to actually create your plugin.

Open your terminal and run the following command to create a new theme

```bash
bin/console theme:create SwagBasicExampleTheme

# you should get an output like this:

Creating theme structure under .../development/custom/plugins/SwagBasicExampleTheme
```

After your theme was created successfully Shopware has to know that it now exists. You have to refresh the plugin list by running the following command.

```bash
bin/console plugin:refresh

# you should get an output like this

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

Now Shopware recognises your plugin theme. The next step is the installation and activation of your theme. Run the following command in terminal.

```bash
# run this command to install and activate your plugin
bin/console plugin:install --activate SwagBasicExampleTheme

Shopware Plugin Lifecycle Service
=================================

 Install 1 plugin(s):
 * Theme SwagBasicExampleTheme plugin (vdev-trunk)

 Plugin "SwagBasicExampleTheme" has been installed and activated successfully.

 [OK] Installed 1 plugin(s).
```

Your theme was successfully installed and activated.

The last thing we need to do to work with the theme is to assign it to a sales channel. You can do that by running the `theme:change` command in the terminal and follow the instructions.

```bash
# run this to change the current Storefront theme
$ bin/console theme:change

# you will get an interactive prompt to change the 
# current theme of the Storefront like this

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

At first, we have to select a sales channel. The obvious choice here is the 'Storefront'. Afterwards enter the number for our theme.

Now your theme is fully installed, and you can start your customization.

### Directory structure of a theme

```bash
# structure of a plugin-based theme
├── composer.json
└── src
    ├── Resources
    │   ├── app
    │   │   └── storefront
    │   │       ├── dist
    │   │       │   └── storefront
    │   │       │       └── js
    │   │       │           └── swag-basic-example-theme.js
    │   │       └── src
    │   │           ├── assets
    │   │           ├── main.js
    │   │           └── scss
    │   │               ├── base.scss
    │   │               └── overrides.scss
    │   └── theme.json
    └── SwagBasicExampleTheme.php
```

## Next steps

Now that you have created your own theme, the next step is to learn how to make settings and adjustments.

* [Theme configuration](theme-configuration)
* [Add SCSS Styling and JavaScript to a theme](add-css-js-to-theme)
* [Add assets to theme](add-assets-to-theme)
