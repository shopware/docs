# Symfony Flex

Symfony Flex is a composer plugin that helps to manage and stay up to date with your Shopware Configuration files.

## Set up a new project

To create a new Shopware project, run the following command:

```sh
composer create-project shopware/production:dev-flex <project-name>
```

This creates a new project in the `<project-name>` directory. The `dev-flex` version constraint installs the latest version of the Shopware. This constraint `dev-flex` is removed when the template is generally available.

The template contains all Shopware bundles like `shopware/administration`, `shopware/storefront`, `shopware/elasticsearch`. If you don't need one of them, you can uninstall it with:
`composer remove shopware/<bundle-name>`.

## Installation

### Local installation

You have to adjust the generated `.env` file and run the following command:

```sh
bin/console system:install --basic-setup
```

This installs Shopware and creates a default sales channel with default admin credentials (user name, `admin` and password, `shopware`). Change these credentials after the installation.

### Installation with Docker and local PHP using Symfony CLI

The Symfony CLI is a developer tool that helps to build, run, and manage your Symfony applications directly from the terminal. The services will run in Docker containers and the application will run locally.

* Requisites:

1. Install [Symfony CLI](https://symfony.com/download), if you don't have one.

1. As Symfony CLI uses local PHP, ensure to have PHP installed. Below are the commands to install it:

<Tabs>

<Tab title="Ubuntu based Linux">

You need to add a new Software Repository to your system to have the latest PHP version.

```sh
sudo add-apt-repository ppa:ondrej/php

sudo apt-get install -y php8.1-fpm php8.1-mysql php8.1-curl php8.1-gd php8.1-xml php8.1-zip php8.1-opcache php8.1-mbstring php8.1-intl php8.1-cli
```

</Tab>

<Tab title="Debian based Linux">

Add a new Software Repository to your system to have the latest PHP version

```bash
curl https://packages.sury.org/php/README.txt | bash

sudo apt-get install -y php8.1-fpm php8.1-mysql php8.1-curl php8.1-gd php8.1-xml php8.1-zip php8.1-opcache php8.1-mbstring php8.1-intl php8.1-cli
```

</Tab>

<Tab title="macOS Homebrew">

```bash
brew install php@8.1
```

</Tab>

<Tab title="Nix / NixOs">

```bash
# Nix
nix-env -iA nixpkgs.php81 nixpkgs.symfony-cli

# NixOs
nix-env -iA nixos.php81 nixpkgs.symfony-cli
```

</Tab>

</Tabs>

### Optional packages

The template is small and does not contain any dev-tooling or integrations like PaaS or Fastly. You can easily add them to your project with the following commands:

```sh
# Install Symfony Default Profiler
composer req --dev profiler

# Install PaaS integration
composer req paas

# Install Fastly integration
composer req fastly
```

### Add Shopware Packagist

Using Shopware Packagist you can manage all your Shopware Store plugins directly in the composer.json. Refer to ["Using composer for plugin installation in Shopware"](https://www.shopware.com/en/news/using-composer-for-plugin-installation-in-shopware/) blog post for detailed information.

## How to migrate from Production Template to Symfony Flex?

### 1. Backup

Start with a clean git state or make a backup of your files.

### 2. Adjust root composer.json

* Firstly, adjust your root `composer.json`. Add the following lines to your `composer.json`:

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

* Next, replace all the existing scripts with the following:

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

* Finally, remove the fixed platform as it will now be determined by the required packages.

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

After the installation of the new composer packages, you can clean up the template by removing the following files:

```sh
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

### 4. Install required composer packages

To install Symfony Flex, you need to have composer installed. If you don't have composer installed, please follow the [official documentation](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-macos).

To install Symfony Flex, you need to run the following commands and allow both new composer plugins.

```sh
composer require symfony/flex:~2 symfony/runtime:~5.4

composer recipe:install --force --reset
```

### 5. Review changes

Review the changes and commit them to your git repository. All upcoming config changes can be applied with `composer recipe:update`.

You may need to adjust some environment variables as the names are changed:

| **Old name**      | **New name**   |
|-------------------|----------------|
| MAILER_URL        | MAILER_DSN     |
| SHOPWARE_ES_HOSTS | OPENSEARCH_URL |

### 6. Optional: Install PaaS or Fastly support

If you want to use the Shopware PaaS or Fastly, you need to install the following composer packages:

```sh
# PaaS
composer req paas

# Fastly
composer req fastly
```

## Update Shopware

Below are the two ways to update Shopware:

* Initially run `bin/console system:update:prepare` to enable the maintenance mode and then update all composer packages using `composer update`.  However, to disable the maintenance mode, run `bin/console system:update:finish`.

* To force update all config files, run `composer recipe:update`.

## Known issues

### `APP_ENV=dev` web_profiler missing extension error

Prior to Shopware 6.4.17.0 you have to install the Profiler bundle to get `APP_ENV=dev` working with:

```sh
composer req --dev profiler
```

### framework:demo-data is missing faker classes

Prior to Shopware 6.4.17.0 you have to install some packages to get `framework:demo-data` command working:

```sh
composer req --dev mbezhanov/faker-provider-collection maltyxx/images-generator
```
