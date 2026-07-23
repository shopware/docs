---
nav:
  title: Autofixer
  position: 7

---

# Autofixer

Shopware-CLI comes with some builtin auto fixers for project migrations.

## Migrate a project to Symfony Flex

Shopware 6.4 and earlier used a different project structure without Symfony Flex. When upgrading to Shopware 6.5 or later, the `shopware-cli project autofix flex` command will migrate your project from the legacy structure to Symfony Flex, moving all configuration files to the correct locations.

::: warning
Ensure that you have a backup of your project before running this command.
:::

```bash
shopware-cli project autofix flex
```

The command will delete all unnecessary configuration files. It will also update the `composer.json` file and the `bin/console` file to use the new configuration files.

## Migrate custom/plugins extensions to Composer

Instead of manually cloning extensions into `custom/plugins`, it's best practice to manage store extensions via Composer. [For more details, see this guide](../../../../guides/hosting/installation-updates/extension-management.md).

Migrate locally cloned plugins to Composer-managed extensions:

```bash
shopware-cli project autofix composer-plugins
```

Benefits of using Composer:

- Composer knows which extension versions exist and are compatible
- Automatic dependency resolution: Composer handles version compatibility for you
- Automatic updates: easily update extensions to new versions
- Less manual work: no need to manually clone and manage extensions in custom directories

You need a Shopware Packages Token. Get it from your Shopware Account: "Shops" > "Licenses" > "..." of one extension > "Install via Composer".
