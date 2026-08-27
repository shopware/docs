---
nav:
  title: Upgrade Shopware
  position: 10
product: shopware
lifecycle: maintenance
---

# Upgrade Shopware

This guide explains how to update an existing Shopware installation. For local project preparation, the recommended workflow is the [Shopware CLI upgrade wizard](../../products/tools/cli/project-commands/upgrade.md), which combines readiness checks, extension compatibility analysis, Composer resolution, the local upgrade, and a shareable report.

For maintaining custom plugins or apps, review the [Upgrades and Migrations](../upgrades-migrations/index.md) guide before performing updates.

## Recommended: prepare the upgrade with Shopware CLI

From a clean Git working tree in your local Shopware project, run:

```bash
shopware-cli project upgrade
```

The wizard checks project readiness, lets you choose the target Shopware version, checks Composer-managed extensions, and verifies the target dependency set with Composer before changing project files. You review the plan before the CLI applies the upgrade locally.

After the local upgrade succeeds, test the shop and extensions, review the generated report and changed files, commit the project changes, and deploy them through your normal process. The wizard does not deploy to production for you.

For CI or a read-only preflight, use the non-interactive mode with `--dry-run`:

```bash
shopware-cli project upgrade \
  --no-interaction \
  --target latest-patch \
  --dry-run
```

See [Upgrade a Shopware Project](../../products/tools/cli/project-commands/upgrade.md) for prerequisites, extension handling, rollback behavior, reports, and all command options.

## Manual Composer update

If you cannot use the Shopware CLI upgrade wizard, you can prepare the project manually with Composer.

### 1. Enable maintenance mode when updating a running environment

```bash
bin/console sales-channel:maintenance:enable --all
```

For the recommended local-first workflow, enable maintenance mode as part of your normal deployment procedure rather than while preparing the project locally.

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

This command applies all required update routines for the newly installed Shopware version, including running database migrations and recompiling themes with the latest code.

After the update process has finished successfully, disable maintenance mode separately:

```bash
bin/console sales-channel:maintenance:disable --all
```

## Operational best practices

* Start from a clean Git working tree and a recoverable database backup.
* Test upgrades locally or on staging with production-like data before production rollout.
* Review release notes, changelogs, and UPGRADE files for the target version.
* Check extension compatibility and investigate items that need vendor or manual review.
* Track deprecations early and use official tooling (Rector, Administration codemods referenced in [Performing Shopware Updates](../hosting/installation-updates/performing-updates.md)) to reduce manual work.
* Avoid skipping major versions unless you have explicitly tested the full upgrade path.
* Commit `composer.json`, `composer.lock`, and review recipe/configuration changes.
* Run post-upgrade smoke tests and your automated test suite.

## After the update

* Review the Shopware CLI upgrade report when you used the wizard.
* Clear caches if necessary.
* Rebuild Administration and Storefront assets if required.
* Test critical business flows such as checkout, login, and API integrations.
* Test installed extensions and custom project code.
* Review logs for new errors or deprecations.

For production-oriented preparation, maintenance mode, deployment, and verification guidance, see [Performing Shopware Updates](../hosting/installation-updates/performing-updates.md).
