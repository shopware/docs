---
nav:
  title: Update Shopware
  position: 10
---

# Update Shopware

This guide explains how to update an existing Shopware installation using Composer.

For maintaining custom plugins or apps, review the [Upgrades and Migrations](../upgrades-and-migrations/index.md) guide before performing updates.

## Standard update process

Shopware updates must be executed via Composer.

### 1. Enable maintenance mode

Prepare the system for update:

```bash
bin/console system:update:prepare
```

This enables maintenance mode and prepares the update process.

### 2. Update Composer dependencies

Update all Composer packages without executing scripts:

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

Disable maintenance mode and complete the update:

```bash
bin/console system:update:finish
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
