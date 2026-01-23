---
nav:
  title: Project Template
  position: 2

---

# Project Template

The Shopware project template is a Composer project that can be used as a starting point for new Shopware Projects, or if you want to develop extensions or themes for Shopware.

Each official setup option—[Docker](./setups/docker.md), [Symfony CLI](./setups/symfony-cli.md), and [Devenv](./setups/devenv.md)—builds upon this project template, either directly or via a pre-configured environment. See [Installation Overview](./index.md) for a comparison of setup options.

## Alternative: Using the installer package

If you have downloaded the [shopware-installer.phar package](https://www.shopware.com/en/download/) instead of using Composer, skip the `composer create-project` step and follow the remaining instructions from the [Project Template](https://developer.shopware.com/docs/guides/installation/template.html) guide.

This method is equivalent to creating a project using Composer but is suited for environments where Composer is not available (for example, shared hosting or limited enterprise servers).

## Set up a new project

To create a new Shopware project, run the following command:

```bash
composer create-project shopware/production <project-name>

# or install a specific version
composer create-project shopware/production:6.6.10.5 <project-name>
```

::: info
Composer `create-project` clones the latest tag from the [Template repository](https://github.com/shopware/template) and installs the dependencies. If you don't have Composer installed, you could also clone the repository itself and run `composer install` in Docker to proceed with the installation.
:::

This creates a new project in the `<project-name>` directory.

The template contains all Shopware bundles like `shopware/administration`, `shopware/storefront` and `shopware/elasticsearch`. If you don't need any, then you can uninstall them with:

```bash
composer remove shopware/<bundle-name>
```

## Installation

After you have created the project, you have automatically a `.env` file in your project root. This file contains all the environment variables you need to run Shopware.

If you want to adjust a variable, you should put the variable in a `.env.local` file. This file will override the variables in the `.env` file.

::: info
The `.env` will be overwritten when the Shopware Web Installer is used for Shopware updates, so it's highly recommended to use a `.env.local` file.
:::

After you have adjusted the `.env` file, you can run the following command to install Shopware:

```bash
bin/console system:install --basic-setup
```

The flag `--basic-setup` will automatically create an admin user and a default sales channel for the given `APP_URL`. If you haven't created a MySQL Database yet, you can pass the `--create-database` flag to create a new database.

The Shopware's default Administration credentials are:

| Username | Password   |
|:---------|:-----------|
| `admin`  | `shopware` |

Change these credentials after finishing the installation.

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

## Building/watching Administration and Storefront

The created project contains Bash scripts in `bin/` folder to build and watch the Administration and Storefront. You can run the following commands:

```bash
./bin/build-administration.sh
./bin/build-storefront.sh
./bin/watch-administration.sh
./bin/watch-storefront.sh
```

Use these scripts to build the Administration and Storefront. The `watch` commands will watch for changes in the Administration and Storefront and rebuild them automatically.

## Update Shopware

For detailed instructions on performing Shopware updates, including preparation steps, the update process, and post-update verification, refer to the dedicated guide:

<PageRef page="../hosting/installation-updates/performing-updates" title="Performing Shopware Updates" />

## Migrate from the old zip installation to a new project template

Before Shopware 6.5, we provided a zip file for installation. The zip file contained all dependencies required to run Shopware. This method has been deprecated and replaced with a Composer project template. The Composer project template is way more flexible and allows you to manage extensions together with Shopware itself using Composer.

To migrate from the old zip installation to the new Composer project template, you can use `shopware-cli project autofix flex` command to migrate it automatically, or you can do it manually by following the steps below.

### 1. Backup

Start with a clean git state, stash everything, or make a backup of your files.

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
    src \
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
composer require "symfony/flex:*" "symfony/runtime:*"

composer recipe:install --force --reset
```

### 5. Review changes

Review the changes and commit them to your Git repository. All upcoming config changes can be applied with `composer recipes:update`.

You may need to adjust some environment variables as the names have changed:

| **Old name**      | **New name**   |
|-------------------|----------------|
| MAILER_URL        | MAILER_DSN     |
| SHOPWARE_ES_HOSTS | OPENSEARCH_URL |

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
