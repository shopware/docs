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

### What the migration does

For each extension in `custom/`, `project autofix composer-plugins` prefers a repository-backed installation that matches the locally installed version:

- **Shopware Store plugins** are required from `packages.shopware.com` when a valid `SHOPWARE_PACKAGIST_TOKEN` is available and the installed version exists there. Their local copy is removed after the require succeeds.
- **Extensions available from Packagist or another configured Composer repository** at the exact installed version are required from that repository and their local copy is removed.
- **Other extensions with a Composer package name** are registered as Composer path repositories, so their files stay in place but Composer manages them locally. These path repositories do not provide repository-driven updates.
- Extensions without a Composer package name are skipped because they cannot be migrated automatically.

The command does not take a path argument. It operates on the closest Shopware project found from the current directory.

### Interactive and headless modes

In a terminal, the command runs as an interactive wizard that walks you through the plan.

With `--no-interaction`, or when no terminal is attached (typically CI), it runs headless. In headless mode, set `SHOPWARE_PACKAGIST_TOKEN` so Store plugins can be resolved from `packages.shopware.com`:

```bash
export SHOPWARE_PACKAGIST_TOKEN=your-token-here
shopware-cli project autofix composer-plugins --no-interaction
```

::: warning
Without `SHOPWARE_PACKAGIST_TOKEN`, the headless run skips the Shopware Store lookup. Packagist and other configured Composer repositories are still checked, and extensions that cannot be resolved there fall back to path repositories when possible. Set the token in CI if you want Store plugins to remain repository-backed and continue to receive updates from `packages.shopware.com`.
:::

Get the token from your Shopware Account under "Shops" > "Licenses" > "..." on any extension > "Install via Composer".

### Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Print the migration plan without modifying the project (headless mode only) |

```bash
shopware-cli project autofix composer-plugins --no-interaction --dry-run
```
