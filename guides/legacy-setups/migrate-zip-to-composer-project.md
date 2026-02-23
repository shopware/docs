---
nav:
  title: Migrate Zip Installation to Composer Project
  position: 100
---

# Migrate from Zip Installation to Composer Project Template

:::info
This guide only applies to legacy Shopware installations created before version 6.5 using the deprecated zip distribution. For new projects, use the recommended [Docker setup](../../installation/docker-setup.md).
:::

## Background

Before Shopware 6.5, Shopware was distributed for installation as a zip archive containing all required dependencies. This approach has been replaced by a Composer-based project template using Symfony Flex.

The modern setup provides:

* Proper dependency management
* Cleaner configuration handling
* Symfony Flex integration
* Easier CI/CD workflows
* Better extension management

## Automatic migration (Recommended)

With Shopware CLI, automatic migration is possible:

```bash
shopware-cli project autofix flex
```

This converts the installation to a Symfony Flex-based project structure.

## Manual migration

If automatic migration is not possible, follow these steps.

### 1. Create a Backup

Before making any changes:

* Ensure a clean Git state
* Either stash everything, or create a full backup of files and database

### 2. Adjust Root `composer.json`

Add the Symfony Flex configuration:

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

Next, replace all the existing scripts:

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

Finally, remove any fixed PHP platform configuration as it will now be determined by the required packages:

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

### 3. Clean up legacy template files

After installing the new Composer packages, remove obsolete files:

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
```

Create a fresh environment file:

```bash
touch .env
```

### 4. Install required Composer packages

Ensure Composer is installed before proceeding. Follow the [official documentation](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-macos) for instructions.

To install Symfony Flex, run the following commands and allow both new Composer plugins:

```bash
composer require "symfony/flex:*" "symfony/runtime:*"

composer recipe:install --force --reset
```

### 5. Update environment variables

Adjusting environment variables may be necessary as the names have changed:

| **Old name**      | **New name**   |
|-------------------|----------------|
| MAILER_URL        | MAILER_DSN     |
| SHOPWARE_ES_HOSTS | OPENSEARCH_URL |

After reviewing the changes, commit them to the Git repository. All upcoming config changes can be applied with `composer recipes:update`.
