# Installation Overview

There are a couple of ways to get Shopware running on your system. Depending on what best suits your development environment, you have the following choices:

* [Flex](flex.md): Installation using Symfony Flex template.
* [devenv](devenv.md): Installation using devenv, built on top of Nix.
* [Docker](docker.md): The Docker installation is the easiest way to get Shopware 6 up and running.
* [MAMP](mamp.md): For quick and easy installation, you can also use MAMP tool on macOS.
* [Valet+](valet.md): You can install Shopware with the epl of Valet+, which is a fork of laravel/valet.
* [Dockware](dockware.md): This is a managed docker setup for Shopware 6 by Shopware agency [dasistweb](https://www.dasistweb.de/).
* [Installation from scratch](from-scratch.md): You can install Shopware 6 locally. However, be aware that this will be a more complex solution since additional or changed system requirements need to be managed by you.

Did you know that there is a video available on this topic? Please take a look:

<PageRef page="https://www.youtube.com/watch?v=ML1QyUr0wsk" title="" target="_blank" />

## Prerequisites

### IDE/Editors

You can technically use any text editor you wish to develop. However, many developers prefer IDEs (Integrated Development Environments) because of the features they offer.

For JavaScript development, many developers go with [Visual Studio Code](https://code.visualstudio.com/) (VSCode). For PHP development, many developers go with [PHPStorm](https://www.jetbrains.com/phpstorm/). Both tools offer a marketplace with plugins or extensions. To learn more, check out the [IDE](../../resources/tooling/ide) section.

If you are going to write Shopware extensions based on the [App System](../../concepts/extensions/apps-concept.md), you can choose whatever programming language or runtime you want, so choose whatever Editor or IDE suits you best.

### System requirements

Before installing Shopware 6, you should take a quick look at the requirements to check if your local environment is capable of running it.

You can use these commands to check your actual environment:

* `php -v`: Show CLI PHP version
* `php -m`: Show CLI PHP modules
* `php -i | grep memory_limit`: Show your actual CLI PHP memory limit
* `composer -v`: Show your actual composer version
* `node -v`: Show you actual Node version
* `npm -v`: Show you actual NPM version

To get more information about your server PHP setup, you can create a `phpinfo.php` file with this content:

```php
<?php phpinfo(); ?>
```

When you now open your browser and go to the `phpinfo.php` page, you can see all the information about your actual PHP setup. Check if they also match the requirements.

#### Operating system

Although Shopware 6 supports most UNIX-like environments, we recommend using **Ubuntu 18.04 LTS** or  
**macOS Mojave 10.14** to get the best experience.

#### Environment

**PHP**

* Tested on 7.4.3, 8.0 and 8.1
* `memory_limit` 512M minimum
* `max_execution_time` 30 seconds minimum
* Extensions:
  * ext-curl
  * ext-dom  
  * ext-fileinfo  
  * ext-gd  
  * ext-iconv  
  * ext-intl  
  * ext-json  
  * ext-libxml  
  * ext-mbstring  
  * ext-openssl  
  * ext-pcre  
  * ext-pdo  
  * ext-pdo\_mysql  
  * ext-phar  
  * ext-simplexml
  * ext-sodium
  * ext-xml  
  * ext-zip  
  * ext-zlib
* Composer 2.0 or higher

**SQL**

* Tested on MySQL 5.7.21, and 8.0
  * Only MySQL 8.0.20 in specific, is not compatible
* Tested on MariaDB 10.3.22, 10.4 and 10.5
  * MariaDB 10.3.29, 10.4.19, 10.5.10 are not compatible at the moment

**JavaScript**

* Node.js 12.21.0 or higher
* NPM 6.5.0 or higher

**Various**

* Apache 2.4 or higher with mod-rewrite enabled
* Tested on Elasticsearch 7.8.0
* Bash
* Git

::: info
Please note that we always want to support the latest versions. If you find an issue with a newer version, please let us know about it in our [issue tracker](https://issues.shopware.com)
:::

### Recommendations

* Zend Opcache \(256M or more\)
* Webserver with HTTP2 support

::: info

Adminer \([https://www.adminer.org/](https://www.adminer.org/)\) is our recommended database Administration tool since it has better support for binary data types.
:::

### Requirements for docker setup

If you are working on Linux, a curated docker setup takes care of setting up the environment for you.

In this case, you need:

* PHP 7.4+ CLI
* docker
* docker-compose
* bash

### Setup templates

Depending on your goal, you can choose from the below two templates for your local Shopware setup.

* Shopware Production Template
* Shopware Development Template

Let's discuss their differences, so you can make an informed decision.

| Task | shopware/production | shopware/development |
| :--- | :--- | :--- |
| Contribute to the Shopware core | ❌ | ✅ |
| Develop an extension for the store | ✅ | ✅ \(preferred\) |
| Build a custom project/deployment | ✅ | ❌ |
| Manage dependencies / bundles | ✅ | ❌ |

<PageRef page="https://www.youtube.com/watch?v=ML1QyUr0wsk" title="" target="_blank" />

::: info
This video is part of the online training ["Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma) available on Shopware Academy for **free**.
:::

## Preparatory steps

Either installation method requires you to check out the sources first. Shopware 6 is split into two repositories the [development template](https://github.com/shopware/development) and the [platform](https://github.com/shopware/platform) itself.

Let's start by cloning the development template:

```bash
git clone https://github.com/shopware/development.git
```

You have the application template for Shopware 6 in the directory `development`. Now navigate into it:

```bash
cd development
```

By default, the development template has `shopware/platform` in the version `dev-trunk` as a requirement in its `composer.json` file. This always corresponds to the latest commit on the master branch of GitHub. You can also change to a specific version — for example, `dev-trunk` to `6.1`. Now Shopware 6.1 will be installed instead of the latest master state.

Only if you want to work with the Shopware platform code itself, e.g., in order to create a pull request for it, you should clone the `platform` code manually. Before doing so, remove the existing platform directory.

```bash
rm -rf platform
git clone https://github.com/shopware/platform.git
```

Otherwise, the Shopware platform code would be placed into a `vendor/shopware/platform` directory, where you don't want to change any code. There is a good reason why many IDEs try to prevent you from changing code in the `vendor` directory.

## Next steps

As already mentioned, there are several ways to install Shopware. So we got you covered, no matter which operating system or environment you like to use. Head over to whatever way you like:

* [Docker](docker.md)
* [Dockware](dockware.md)
* [Valet+](valet.md)
* [MAMP](mamp.md)
