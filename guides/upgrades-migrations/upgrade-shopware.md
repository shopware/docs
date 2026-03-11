---
nav:
  title: Upgrade Shopware
  position: 10
---

# Upgrade Shopware

This guide explains how to update an existing Shopware installation using Composer.

For maintaining custom plugins or apps, review the [Upgrades and Migrations](../upgrades-migrations/index.md) guide before performing updates.

## Standard update process

Shopware updates can be executed via Composer or with the web-based updater in the Administration panel.

### 1. Enable maintenance mode

```bash
bin/console sales-channel:maintenance:enable --all
```

### 2. Update Composer dependencies

Before running the update, adjust the required Shopware version in `composer.json` to the version to be installed. When using the Commercial plugin, update the `shopware/commercial` requirement to a compatible version as well.

Failure to change these version constraints means that running the update command will resolve to the currently installed Shopware version and no actual upgrade will happen.

After adjusting the version constraints, update all Composer packages without executing scripts:

```bash
composer update --no-scripts
```

The `--no-scripts` flag instructs Composer to avoid running any scripts that may reference Shopware CLI commands. These commands will only work after updated recipes are installed.

### 3. Update Symfony recipes (optional but recommended)

To force-update all configuration files managed by Symfony Flex:

```bash
composer recipes:update
```

Review changes carefully before committing them.

### 4. Finalize the update

Complete the update by running:

```bash
bin/console system:update:finish
```

This command applies all required update routines for the newly installed Shopware version, including running database migrations, and recompiling themes with the latest code.

After the update process has finished successfully, disable maintenance mode separately:

```bash
bin/console sales-channel:maintenance:disable --all
```

## Operational best practices

* Automate pre-upgrade checks (PHP/DB versions, extensions, disk space).
* Always test upgrades on staging with production-like data.
* Keep verified database backups and a recovery plan.
* Review changelogs and UPGRADE files before applying changes.
* Track deprecations early and use official tooling (Rector, Administration codemods referenced in [Performing updates](../hosting/installation-updates/performing-updates.md)) to reduce manual work.
* Avoid skipping major versions.
* Commit the `composer.lock` file.
* Run post-upgrade smoke tests.

## After the update

* Clear caches if necessary
* Rebuild Administration and Storefront assets if required
* Test critical business flows (checkout, login, API integrations)
