# Symfony Flex

Symfony Flex is a composer plugin which helps you to manage and stay up to date with your Shopware Configuration files.

## Setup a new project

To create a new Shopware project just run the following command:

```bash
composer create-project shopware/production:dev-flex <project-name>
```

This will create a new project in the `<project-name>` directory. The `dev-flex` version constraint will install the latest version of the shopware. This constraint `dev-flex` will be removed when the template is generally available.

The template contains all Shopware bundles like `shopware/administration`, `shopware/storefront`, `shopware/elasticsearch`. If you don't need one of them, you can just uninstall it with: 
`composer remove shopware/<bundle-name>`.

As next you have to adjust the generated `.env` file and run following command: 

```bash
bin/console system:install --basic-setup
```

This will install Shopware and create a default sales channel with an default admin user named `admin` with password `shopware`. Change these credentials after the installation.

### Optional packages

The template is very small and does not contain any dev-tooling or integrations like PaaS or Fastly. You can easily add them to your project with the following commands:

```bash
# Install Symfony Default Profiler
composer req --dev profiler

# Install PaaS integration
composer req paas

# Install Fastly integration
composer req fastly
```

## How to migrate to Symfony Flex?

### 1. Backup

Start with an clean git state or make an backup of your files

### 2. Adjusting root composer.json

First of all, you need to adjust your root composer.json. You need to add the following lines to your composer.json:

```json
"extra": {
    "symfony": {
        "allow-contrib": true,
        "endpoint": [
            "https://api.github.com/repos/shopware/recipes/contents/index.json?ref=flex/main",
            "flex://defaults"
        ]
    }
}
```

and replace all existing scripts with following

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

and remove the fixed platform as it will be now determined by the required packages

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

After the installation of the new composer packages, you can cleanup the template. You can remove the following files:

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
```

### 4. Install required composer packages

To install Symfony Flex, you need to have composer installed. If you don't have composer installed, please follow the [official documentation](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-macos).

To install Symfony Flex, you need to run the following command and allow both new composer plugins:

```bash
composer require symfony/flex:~2 symfony/runtime:~5.4

composer recipe:install --force --reset
```

### 5. Review changes

Review the changes and commit them to your git repository. All upcomming config changes can be applied with `composer recipe:update`

### 6. Optional: Install PaaS or Fastly

If you want to use the PaaS or Fastly, you need to install the following composer packages:

```bash
# PaaS
composer req paas

# Fastly
composer req fastly
```
