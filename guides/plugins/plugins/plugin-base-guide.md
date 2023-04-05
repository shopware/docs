# Plugin Base Guide

## Overview

Plugins in Shopware are essentially an extension of [Symfony bundles](plugins-for-symfony-developers). Such bundles and plugins can provide their own resources like assets, controllers, services or tests, which you'll learn in the next guides.  
A plugin is the main way to extend your Shopware 6 instance programmatically.

This section guides you through the basics of creating a plugin from scratch, which can then be installed on your Shopware 6 instance. Refer to the Guide section to know how to [Install Shopware 6](../../installation/).

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files, as well as the command line.  
Of course you'll have to understand PHP, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Create your first plugin

Let's get started with creating your plugin by finding a proper name for it.

### Name your plugin

First, you need to find a name for your plugin. We're talking about a technical name here, so it needs to describe your plugins functionality as short as possible, written in UpperCamelCase. To prevent issues with duplicated plugin names, you should add a shorthand prefix for your company.  
Shopware uses "Swag" as a prefix for that case.  
For this example guide we'll use the plugin name **SwagBasicExample.**

::: info
Using a prefix for your plugin name is not just a convention we'd recommend, but a hard requirement if you want to publish your plugin in the [Shopware Community Store](https://store.shopware.com/en).
:::

### **Create the plugin**

Now that you've found your name, it's time to actually create your plugin.

Shopware provides a handy command that you can use to generate the plugin structure. Go to your shopware project's root directory and run the following command:  

```bash
bin/console plugin:create SwagBasicExample
```

You can pass an addition flag `-c` or `--create-config` in the above command which would also create a demo configuration file in the `Resources` directory. The command will generate all the basic required files that are needed for an extension to be installed on a Shopware instance. Make sure to adjust the namespace in the files as per your need.

If you want to create the structure manually please follow the instructions below:

For this, please navigate to the directory `custom/plugins`, that you should find in your Shopware 6 installation. Inside the `plugins` directory, create a new directory named after your plugin, so it should look like this: `custom/plugins/SwagBasicExample`

By convention, you'll have another directory in there, which is called `src`. This is not required, but recommended. And that's it for the directory structure for now.

Inside your `src` directory, create a PHP class named after your plugin, `SwagBasicExample.php`.  
This new class `SwagBasicExample` has to extend from Shopware's abstract Plugin class, which is `Shopware\Core\Framework\Plugin`.

Apart from this, only the namespace is missing. You can freely define it, but we'd recommend using a combination of your manufacturer prefix and the technical name, so in this `guide` this would be: `Swag\BasicExample`

```php
// <plugin root>/src/SwagBasicExample.php
<?php declare(strict_types=1);

namespace Swag\BasicExample;

use Shopware\Core\Framework\Plugin;

class SwagBasicExample extends Plugin
{
}
```

Basically that's it for the PHP part, your basic plugin class is already done.

::: info
Refer to this video on **[Creating a plugin](https://www.youtube.com/watch?v=_Tkoq5W7woI)** that shows how to bootstrap a plugin. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

#### The composer.json file

You've created the necessary plugin structure and the plugin base class. The only thing missing for your plugin to be fully functional, is a `composer.json` file inside your plugin's root directory.  
`custom/plugins/SwagBasicExample/composer.json`

This file consists of basic information, that Shopware needs to know about your plugin, such as:

* The technical name
* The description
* The author
* The used license
* The current plugin version
* The required dependencies
* ... and a few more

This file can also be read by [Composer](https://getcomposer.org/), but that's not part of this guide.  
Further information you'll have to add in there: The `type` has to be `shopware-platform-plugin`, so Shopware can safely recognize your plugin as such
and the `require` field must include at least `shopware/core`, to check for compatibility.

Here's an example `composer.json` for this guide, which will do the trick:

```js
// <plugin root>/composer.jsonon
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
        "shopware/core": "6.5.*"
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

There's another two things that you need to know:

1. The `shopware-plugin-class` information. This has to point to the plugin's base PHP class. The one, that you've previously created.
1. The whole `autoload` part. This has to mention your [PSR-4](https://www.php-fig.org/psr/psr-4/) namespace. So if you'd like to have another namespace for your plugin, this is the place to go.

::: warning
The path you've configured in the configuration `autoload.psr-4`, `src/` in this case, will be referred to as `<plugin root>/src` in almost all code examples. If you're using a custom path here, e.g. just a slash `/`, then the examples would be `<plugin root>/` here instead.
:::

And that's it. The basic structure and all necessary files for your plugin to be installable are done.

::: info
Refer to this video on **[The composer.json plugin file](https://www.youtube.com/watch?v=CY3SlfwkTm8)** that explains the basic structure of the `composer.json` plugin file. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Install your plugin

You can safely install your plugin now and Shopware should easily recognize it like this.

Open up your command line terminal and navigate to your Shopware 6 directory, the one which also contains the `custom` directory.

Once inside there, you need to refresh the list of plugins, that Shopware knows yet. This is done with the following command:

```bash
php bin/console plugin:refresh
```

There might be a warning appearing regarding the `version` of the `composer.json` file, but you can safely ignore that.  
You should end up with a list like the following:

```bash
Shopware Plugin Service
=======================

 ------------------------------ -------------------------------------------- ----------- ----------------- ---------------------------- ----------- -------- -------------
  Plugin                         Label                                        Version     Upgrade version   Author                       Installed   Active   Upgradeable
 ------------------------------ -------------------------------------------- ----------- ----------------- ---------------------------- ----------- -------- -------------
  SwagBasicExample               The displayed readable name for the plugin   1.0.0                         Shopware                     No          No       No
 ------------------------------ -------------------------------------------- ----------- ----------------- ---------------------------- ----------- -------- -------------
```

This output is a **good sign**, because this means Shopware recognized your plugin successfully. But it's not installed yet, so let's do that.

```bash
php bin/console plugin:install --activate SwagBasicExample
```

This should print the following output:

```bash
Shopware Plugin Lifecycle Service
=================================

 Install 1 plugin(s):
 * The displayed readable name for the plugin (v1.0.0)

 Plugin "SwagBasicExample" has been installed and activated successfully.
```

And that's basically it.  
**You've just successfully created your Shopware 6 plugin!**

## Next steps

There's many more things to discover when creating your first plugin. Hence, here's a list of important articles, that may be of interest for you.

* [Installing data with your plugin](plugin-fundamentals/database-migrations)
* [Learn more about the plugin lifecycle methods](plugin-fundamentals/plugin-lifecycle)
* [Adding a configuration to your plugin](plugin-fundamentals/add-plugin-configuration)
* [Learning about the service container](plugin-fundamentals/dependency-injection)
* [Adding a custom service](plugin-fundamentals/add-custom-service)
* [Start listening to events](plugin-fundamentals/listening-to-events)

Furthermore, you should definitely have a look into these sections:

<PageRef page="storefront/" />

<PageRef page="administration/" />

<PageRef page="framework/data-handling/" />

<PageRef page="testing/" />
