---
nav:
  title: Upgrade Shopware
  position: 10
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

### 2. Verify the target runtime before updating dependencies

Before changing Composer dependencies, confirm that the environment you will deploy to matches the target Shopware major version requirements.

For a major upgrade, verify at least:

* PHP version used by CLI, FPM, and workers
* Database engine and version used in production and staging
* Container images, CI jobs, and deployment manifests
* Compatibility of Composer-managed extensions with the target PHP, Symfony, and Twig stack

When your project uses Docker or separate build and runtime images, verify both the image used for `composer update` and the image used in production. A successful dependency resolution in one image does not guarantee that the deployed runtime matches it.

### 3. Update Composer dependencies

Before running the update, adjust the required Shopware version in `composer.json` to the version to be installed. When using the Commercial plugin, update the `shopware/commercial` requirement to a compatible version as well.

Failure to change these version constraints means that running the update command will resolve to the currently installed Shopware version and no actual upgrade will happen.

After adjusting the version constraints, update all Composer packages without executing scripts:

```bash
composer update --no-scripts
```

The `--no-scripts` flag instructs Composer to avoid running any scripts that may reference Shopware CLI commands. These commands will only work after updated recipes are installed.

### 4. Update Symfony recipes (optional but recommended)

To force-update all configuration files managed by Symfony Flex:

```bash
composer recipes:update
```

Review changes carefully before committing them.

### 5. Finalize the update

Complete the update by running:

```bash
bin/console system:update:finish
```

This command applies all required update routines for the newly installed Shopware version, including running database migrations and recompiling themes with the latest code.

After the update process has finished successfully, disable maintenance mode separately:

```bash
bin/console sales-channel:maintenance:disable --all
```

## Major-upgrade review for custom code and extensions

Before deploying a major upgrade, review project code, plugins, and apps for areas that commonly require manual adaptation.

### Review request parameter access

When custom controllers, event subscribers, or services read request input, access the correct request bag explicitly instead of relying on mixed lookup behavior.

Use the Symfony request bags directly:

```php
use Symfony\Component\HttpFoundation\Request;

public function example(Request $request): void
{
    $queryValue = $request->query->get('page');
    $formValue = $request->request->get('email');
    $attributeValue = $request->attributes->get('productId');
}
```

Use:

* `$request->query` for query string parameters such as `?page=2`
* `$request->request` for submitted form data or request body fields
* `$request->attributes` for route attributes and values set by the framework

If your code uses helper-based request resolution, verify the expected source of each parameter explicitly. In upgrade testing, check flows where the same key may exist in both query parameters and submitted form data.

### Validate locale-sensitive behavior

If your project uses translated formatting, locale-specific number handling, imported locale values, or custom locale mappings, test those flows on staging before production rollout.

Validate at least:

* storefront price and date formatting
* document generation
* import/export jobs
* custom validation or parsing logic for locale-formatted values
* extension code that assumes fallback behavior for unsupported or incomplete locales

### Verify XML and configuration compatibility

If your plugins, apps, or deployment setup include XML-based configuration or metadata, validate those files against the requirements documented for the target version and test installation/update routines in a clean environment.

## Operational best practices

* Start from a clean Git working tree and a recoverable database backup.
* Test upgrades locally or on staging with production-like data before production rollout.
* Review release notes, changelogs, and UPGRADE files for the target version.
* Check extension compatibility and investigate items that need vendor or manual review.
* For major upgrades, audit extension and custom-code compatibility against the target runtime stack, including PHP, database engine, Symfony, and Twig requirements.
* Review custom request handling and replace ambiguous parameter lookup with explicit use of `query`, `request`, and `attributes` where needed.
* Validate locale-sensitive business flows before rollout when your project depends on translated formatting or locale-based parsing.
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