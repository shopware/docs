---
nav:
  title: Performing Shopware Updates
  position: 20
---

# Performing Shopware Updates

## When to update

Shopware releases updates every month. It's not necessary to update every month, but you should always install the latest security patches through the [Security Plugin](https://store.shopware.com/en/swag136939272659f/shopware-6-security-plugin.html) or update Shopware itself to the latest version. To check if your Shopware version still gets security updates, you can check the [Shopware Release Cycle](https://developer.shopware.com/release-notes/).

Generally speaking, the maintenance effort is the same whether you wait a long period or update more regularly. Our recommendation is to update from every major version to the next major version, and stay on a minor version for a longer period of time if you don't need any new features or encounter issues with the used version.

## Update types

There are two Shopware update types:

- **Minor/Patch updates**: These updates contain new features, bug fixes and security patches. They are released every month for the active supported versions. They don't require special attention if your extensions are not using internal/experimental APIs. You can find more details in the [Backwards Compatibility Promise](../../../resources/guidelines/code/backward-compatibility.md).
- **Major updates**: These updates clean up the codebase and introduce breaking changes. They are released once a year. They require special attention, as extensions, themes or system configurations might not be compatible with the new version.

## Preparations

### Check project and extension compatibility

The recommended preflight is the Shopware CLI upgrade wizard in dry-run mode. It checks project readiness, Composer-managed extension compatibility, and whether Composer can resolve the selected target version without modifying project files:

```bash
shopware-cli project upgrade \
  --no-interaction \
  --target latest-patch \
  --dry-run
```

If you're following older guides that mention `shopware-cli project upgrade-check`, use the dry-run command above instead.

For an interactive target picker and guided workflow, run:

```bash
shopware-cli project upgrade
```

See [Upgrade a Shopware Project](../../../products/tools/cli/project-commands/upgrade.md) for the full workflow. If you don't have Shopware CLI installed, see the [installation guide](../../../products/tools/cli/index.md).

Managing extensions through Composer is required by the upgrade wizard and gives Composer the information it needs to resolve extension versions together with Shopware. If the readiness check finds locally managed plugins, the CLI points you to `shopware-cli project autofix composer-plugins` where migration is possible.

### Create backups

Before doing the actual update, create a backup of your database and files. This ensures you can restore your Shopware installation if something goes wrong during the update process.

::: info
If blue-green deployment is enabled, you can rollback to the previous version without restoring the database backup. This is only recommended when you **only updated** Shopware and not any extensions together with it.
:::

### Enable maintenance mode

Before you update a running production environment, set the Sales Channels into maintenance mode. This can be done using the Administration or with the terminal:

```bash
bin/console sales-channel:maintenance:enable --all
```

Do not enable maintenance mode merely to prepare and test the upgrade locally. Apply it according to your deployment procedure when the upgraded code is ready to move to the running environment.

### Additional steps for major updates

For major updates, consider the following additional preparations:

- **Update PHP version**: Update the PHP version to the minimum required version for the new Shopware version *before* updating Shopware. Shopware versions always support an overlapping PHP version, so this is safe to do beforehand. You can find the minimum required PHP version in the [System Requirements guide](../../installation/system-requirements.md).
- **Check upgrade changes**: Review the [UPGRADE.md](https://github.com/search?q=repo%3Ashopware%2Fshopware+UPGRADE-6+language%3AMarkdown+NOT+path%3A%2F%5Eadr%5C%2F%2F+NOT+path%3A%2F%5Echangelog%5C%2F%2F&type=code&l=Markdown) for all breaking changes and migration instructions.
- **Review extension updates**: Use the upgrade wizard's extension queue and report to identify compatible releases, updates, blockers, and items that still need manual or vendor review.

## Prepare the update locally with Shopware CLI (recommended)

The recommended workflow is to apply the upgrade to your local project first:

```bash
shopware-cli project upgrade
```

The wizard performs read-only readiness and compatibility checks first, lets you review the planned project changes, then runs the Composer update, refreshes Symfony Flex recipes, runs Shopware Deployment Helper, and writes `.shopware-cli/upgrade/report.md`.

If an essential execution step fails or the run is canceled, Shopware CLI restores `composer.json` and `composer.lock` and writes a failure report. Always start from a clean Git state, so you can review or restore any other changed files as well.

After a successful local run:

1. Review `.shopware-cli/upgrade/report.md` and the Git diff.
2. Test the Administration, Storefront, integrations, and installed extensions.
3. Run your automated test suite.
4. Commit `composer.json`, `composer.lock`, and any reviewed configuration changes.
5. Deploy through your normal process.

The upgrade wizard does not deploy the project to production.

## Manual local preparation

If you cannot use the Shopware CLI upgrade wizard, prepare the Composer changes manually.

### 1. Update the Shopware version constraint

Edit your `composer.json` and update the `shopware/core` version constraint to the target version:

```json
{
    "require": {
        "shopware/core": "6.7.0.0"
    }
}
```

### 2. Run Composer update

Run the update command with `--no-scripts` to prevent the automatic execution of scripts during the update:

```bash
composer update --no-scripts
```

### 3. Update Symfony Flex recipes

Update the Symfony Flex recipes to apply any configuration changes:

```bash
composer recipes:update
```

Review the changes carefully before applying them.

### 4. Commit and deploy

Commit the changes to your Git repository:

```bash
git add composer.json composer.lock
git commit -m "Update Shopware to 6.7.0"
```

Review any other changed files (e.g., from recipe updates) and commit them as well. Then deploy the changes to your server using your deployment process.

## Production server

After deploying the updated code to your server, run the following commands according to your deployment process.

### 1. Enable maintenance mode

```bash
bin/console sales-channel:maintenance:enable --all
```

### 2. Prepare the update

```bash
bin/console system:update:prepare
```

This command triggers events that allow extensions to prepare for the update.

### 3. Finish the update

Run the Shopware update scripts to execute database migrations and other necessary update tasks:

```bash
bin/console system:update:finish
```

### 4. Disable maintenance mode

```bash
bin/console sales-channel:maintenance:disable --all
```

:::warning
Only run these commands on the production server after the updated code has been deployed. The migrations must match the deployed code version.
:::

## Performing the update via Administration

Shopware also provides a web-based updater in the Administration panel. This method handles the entire update process through the browser.

:::warning
The web updater is only recommended for small instances. Since the update runs in the browser, you may encounter timeout problems, memory limits, or other resource issues on larger shops. For production environments, use the local preparation and deployment workflow described above.
:::

To use the web updater:

1. Log in to the Administration.
2. Navigate to **Settings** > **System** > **Shopware Update**.
3. Follow the on-screen instructions to complete the update.

The web updater will automatically enable maintenance mode, download the update, run migrations, and disable maintenance mode when complete.

## Final steps

Before you remove the maintenance mode, verify the update was successful:

- **Check the Administration**: Make sure the Administration is working correctly.
- **Check the Storefront**: Make sure your main processes are working correctly (e.g., adding products to the cart, checkout, etc.).
- **Check the Extensions**: Make sure that all extensions are working correctly.
- **Check the Performance**: Make sure there is no major performance degradation.
- **Check the Logs**: Check your error logs for any issues.
- **Review the upgrade report**: If you used Shopware CLI, keep the report with the upgrade context or attach a redacted copy when asking another developer, extension vendor, hosting provider, or Shopware support for help.

## Tools for extension developers

If you maintain custom extensions, these tools can help with upgrades:

- **[Shopware CLI upgrade wizard](../../../products/tools/cli/project-commands/upgrade.md)**: Check a Composer-managed extension set against a target Shopware version and produce a shareable compatibility/Composer report from a representative test project.
- **[Rector for Shopware](https://github.com/FriendsOfShopware/shopware-rector)**: Automatically upgrades PHP code for Shopware compatibility.
- **[Codemods](https://github.com/shopware/shopware/blob/trunk/src/Administration/Resources/app/administration/code-mods.js)**: Helps upgrade Administration JavaScript code.
- **[Twig Block Versioning](https://www.shopware.com/en/news/twig-block-versioning-in-shopware-phpstorm-plugin/)**: A [PHPStorm Plugin](https://plugins.jetbrains.com/plugin/17632-shopware-6-toolbox) feature that tracks which Twig blocks you've overwritten and alerts you when they may need updates.

These tools handle repetitive tasks but always review the results. Make sure your code is versioned with Git so you can rollback changes if necessary.
