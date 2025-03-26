---
nav:
  title: Autofixer
  position: 7

---

# Autofixer

Shopware-CLI comes with some builtin auto fixers for project migrations.

## Migrate a Project to Symfony Flex

Prior to Shopware 6.5, Shopware didn't use Symfony Flex. This means that the project structure was different, and some configuration files were located in different places. The `shopware-cli project autofix flex` command will migrate your project to Symfony Flex and move all configuration files to the correct locations.

::: warning
Ensure that you have a backup of your project before running this command.
:::

```bash
shopware-cli project autofix flex
```

The command will delete all unnecessary configuration files. It will also update the `composer.json` file and the `bin/console` file to use the new configuration files.

## Migrate custom/plugins extensions to Composer

It's best practice to manage the store and your custom plugins via Composer. [If you want to learn more about this check out this guide](../../../guides/hosting/installation-updates/extension-managment.md). Shopware-CLI has a helper for migrating locally installed plugins to Composer through Shopware Packagist for the Shopware Store. Make sure you have a Shopware Packages Token, which can be gathered in the Shopware Account. You can find the token in the Shopware Account under "Shops" > "Licenses" > "..." of one extension and "Install via Composer.

```bash
shopware-cli project autofix composer-plugins
```
