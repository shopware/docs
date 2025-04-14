---
nav:
  title: Template
  position: 20

---

# Symfony Flex

Symfony Flex is a Composer plugin that helps you to manage and keep your Shopware configuration files up-to-date.

## Set up a new project

To create a new Shopware project, run the following command:

```bash
composer create-project shopware/production <project-name>
```

This creates a new project in the `<project-name>` directory.

The template contains all Shopware bundles like `shopware/administration`, `shopware/storefront` and `shopware/elasticsearch`. If you don't need any, then you can uninstall them with:

```shell
composer remove shopware/<bundle-name>
```

## Installation

### Local installation

After you have created the project via Composer, you should create a `.env.local` file and specify the environment variables you want to override from `.env` and run the following command:

::: info
The `.env` will be overwritten when the Shopware Web Installer is used for Shopware updates, so it's highly recommended to use a `.env.local` file.
:::

```bash
bin/console system:install --basic-setup
```

This installs Shopware and creates a default [sales channel](../../concepts/commerce/catalog/sales-channels) with Shopware's default Administration credentials:

| Username | Password   |
|:---------|:-----------|
| `admin`  | `shopware` |

Change these credentials after finishing the installation.

### Installation with Docker and local PHP using Symfony CLI

The Symfony CLI is a developer tool that helps to build, run, and manage your Symfony applications directly from the terminal. The services will run in Docker containers, while the application will run locally.

**Prerequisites**:

1. Install [Symfony CLI](https://symfony.com/download), if you don't have it yet.

2. As Symfony CLI uses local PHP, ensure to have PHP installed. Below are the commands to install it:

<Tabs>

<Tab title="Ubuntu">

Add a new software repository to your system to have the latest PHP version.

```bash
sudo add-apt-repository ppa:ondrej/php

sudo apt-get install -y php8.2-fpm php8.2-mysql php8.2-curl php8.2-gd php8.2-xml php8.2-zip php8.2-opcache php8.2-mbstring php8.2-intl php8.2-cli
```

</Tab>

<Tab title="Debian">

Add a new software repository to your system to have the latest PHP version:

```bash
sudo apt-get install extrepo
sudo extrepo enable sury

sudo apt-get update
sudo apt-get install -y php8.2-fpm php8.2-mysql php8.2-curl php8.2-gd php8.2-xml php8.2-zip php8.2-opcache php8.2-mbstring php8.2-intl php8.2-cli
```

</Tab>

<Tab title="macOS">

The easiest way is to use [Homebrew](https://brew.sh/):

```bash
brew install php@8.1
```

</Tab>

<Tab title="Nix / NixOS">

```bash
# Nix
nix-env -iA nixpkgs.php81 nixpkgs.symfony-cli

# NixOS
nix-env -iA nixos.php81 nixpkgs.symfony-cli
```

</Tab>

</Tabs>

### Optional packages

The template is small and does not contain any dev-tooling or integrations like PaaS or Fastly. You can easily add them to your project with the following commands:

```bash
# Install profiler and other dev tools, eg Faker for demo data generation
composer require --dev shopware/dev-tools

# Or Install symfony dev tools
composer require --dev symfony/profiler-pack

# Install PaaS integration
composer require paas --ignore-platform-req=ext-amqp

# Install Fastly integration
composer require fastly
```

### Add Shopware packagist

Using Shopware Packagist, you can manage all your Shopware Store plugins directly in the `composer.json`. Refer to ["Using Composer for plugin installation in Shopware"](https://www.shopware.com/en/news/using-composer-for-plugin-installation-in-shopware/) blog post for detailed information.

## How do I migrate from Production Template to Symfony Flex?

### 1. Backup

Start with a clean git state, stash everything or make a backup of your files.

### 2. Adjust root composer.json

First, adjust your root `composer.json`. Add the following lines to your `composer.json`:

```json
"extra": {
    "symfony": {
        "allow-contrib": true,
        "endpoint": [
            "https://raw.githubusercontent.com/shopware/recipes/flex/main/index.json",
            "flex://defaults"
        ]
    }
}
```

Next, replace all the existing scripts with the following:

```json
"scripts": {
    "auto-scripts": [],
    "post-install-cmd": [
        "@auto-scripts"
    ],
    "post-update-cmd": [
        "@auto-scripts"
    ]
}
```

Finally, remove the fixed platform as it will now be determined by the required packages.

```diff
"config": {
    "optimize-autoloader": true,
-    "platform": {
-        "php": "7.4.3"
-    },
    "sort-packages": true,
    "allow-plugins": {
        "composer/package-versions-deprecated": true
    }
},
```

### 3. Cleanup the template

After having installed the new Composer packages, you can clean up the template by removing the following files:

```bash
rm -r .dockerignore \
    .editorconfig \
    .env.dist \
    .github \
    .gitlab-ci \
    .gitlab-ci.yml \
    Dockerfile \
    docker-compose.yml \
    easy-coding-standard.php \
    PLATFORM_COMMIT_SHA \
    artifacts \
    bin/deleted_files_vendor.sh \
    bin/entrypoint.sh \
    bin/package.sh \
    config/etc \
    config/secrets \
    config/services \
    config/services.xml \
    config/services_test.xml \
    license.txt \
    phpstan.neon \
    phpunit.xml.dist \
    psalm.xml

touch .env
```

### 4. Install required Composer packages

To install Symfony Flex, you need to have Composer installed. If you don't have Composer installed, please follow the [official documentation](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-macos).

To install Symfony Flex, you need to run the following commands and allow both new Composer plugins.

```bash
composer require symfony/flex:~2 symfony/runtime:~6.2

composer recipe:install --force --reset
```

### 5. Review changes

Review the changes and commit them to your Git repository. All upcoming config changes can be applied with `composer recipes:update`.

You may need to adjust some environment variables as the names have changed:

| **Old name**      | **New name**   |
|-------------------|----------------|
| MAILER_URL        | MAILER_DSN     |
| SHOPWARE_ES_HOSTS | OPENSEARCH_URL |

### 6. Optional: Install PaaS or Fastly support

If you want to use Shopware PaaS or Fastly, you need to install the following Composer packages:

```bash
# PaaS
composer require paas --ignore-platform-req=ext-amqp

# Fastly
composer require fastly
```

## Update Shopware

There are two ways to update Shopware:

* Initially run `bin/console system:update:prepare` to enable the maintenance mode and then update all Composer packages using `composer update --no-scripts`. The `--no-scripts` flag instructs composer to not run any scripts that may reference Shopware CLI commands. They will only be functional after updating the recipes. To disable the maintenance mode, run `bin/console system:update:finish`.

* To force-update all config files, run `composer recipes:update`.

## Known issues

### `APP_ENV=dev` web_profiler missing extension error

Prior to Shopware 6.4.17.0, you have to install the Profiler bundle to get `APP_ENV=dev` working with:

```bash
composer require --dev profiler
```

### framework:demo-data is missing faker classes

Prior to Shopware 6.4.17.0, you have to install some packages to get `framework:demo-data` command working:

```bash
composer require --dev mbezhanov/faker-provider-collection maltyxx/images-generator
```
