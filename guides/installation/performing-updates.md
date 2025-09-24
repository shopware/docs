---
nav:
  title: Performing Updates
  position: 20

---

# Performing Updates

## When to update

Shopware releases updates every month. It's not necessary to update every month, but you should always install the latest security patches through the [Security Plugin](https://store.shopware.com/en/swag136939272659f/shopware-6-security-plugin.html) or update Shopware itself to the latest version. To check if your Shopware version still gets security updates, you can check the [Shopware Release Cycle](https://developer.shopware.com/release-notes/). But generally speaking, the maintenance effort is the same when you wait a long period or update more regularly. So our recommendation would be to update from every major version to the next major version, and stay on a minor version for a longer period of time, if you don't need any new features or encounter issues with the used version.

## Preparations

Before any update, check if the installed extensions are compatible with the new version. The easiest way to check this is to open the Update Manager in the Administration. It lists all installed extensions and their compatibility with the new version. If an extension is not compatible, you should check with the extension developer if an update is available.

::: info
If you can't see the info in the admin, please check if [auto_update](../installation-updates/cluster-setup#disable-auto-update) is set to false.
:::

The next step is to check when the update should be performed. You should always perform updates in a maintenance window to avoid any issues with customers. If you are using a staging environment, you can perform the update there first and then apply it to the production environment.

Before doing the actual update, you should create a backup of your database and files. This is important to ensure that you can restore your Shopware installation in case something goes wrong during the update process.

::: info
If blue-green deployment is enabled, you can rollback to the previous version without restoring the database backup. This is only recommended when you **only updated** Shopware and not any extensions together with it.
:::

Before you start the update process, you should also make sure that you have set the Sales Channels into maintenance mode. This can be done using the Administration or with `bin/console sales-channel:maintenance:enable --all` in the terminal.

### Use Composer to manage all extensions

Managing all extensions through Composer is the best way to ensure that they are compatible with the new version. It simplifies the update process as Composer automatically resolves the correct versions of the extensions.

### Use Twig Block Versioning

Twig Block Versioning is a [PHPStorm Plugin](https://plugins.jetbrains.com/plugin/17632-shopware-6-toolbox) only feature. Twig Block Versioning is a feature that allows versioning of the overwritten blocks in your theme. This helps you to show which blocks after a Shopware Update maybe have to be changed. It's recommended to enable "Shopware versioning block comment is missing" in the inspection settings. This will show you a warning if a block is missing the versioning comment. For more information, check the [Twig Block Versioning blog post](https://www.shopware.com/en/news/twig-block-versioning-in-shopware-phpstorm-plugin/).

### Use existing tools to automatically upgrade your extensions

There are tools like [Rector](https://github.com/FriendsOfShopware/shopware-rector) for PHP and [Codemods](https://github.com/shopware/shopware/blob/trunk/src/Administration/Resources/app/administration/code-mods.js) for Administration JavaScript which can help you to automatically upgrade your extensions. Both tools do the most repeating tasks for you, but you still have to check the results and adapt your code if necessary. It's recommended to use these tools, as they save you a lot of time. Make sure that your code-base is versioned with Git, so you can easily rollback the changes if necessary.

## Update types

There are two Shopware update types:

- **Minor/Patch updates**: These are updates that only contain new features, bug fixes and security patches. They are released every month for the active supported versions.
- **Major updates**: These updates are intended to clean up the codebase and introduce breaking changes. They are released once a year.

### Minor/Patch updates

Minor and patch updates are non-breaking updates. They don't require special attention if your extensions are not using internal/experimental APIs. You can find the Backwards Compatibility Promise [here](../../../resources/guidelines/code/backward-compatibility.md). Of course, there can be unexpected issues, so we recommend to test the update in a staging environment before applying it to your production environment and [reporting](https://github.com/shopware/shopware/issues) any issues you encounter.

### Major updates

Major updates are breaking updates. They require special attention, as extensions, themes or system configurations might not be compatible with the new version.

First, you should check that all extensions obtained from Shopware Store are compatible with the next version. You can find the compatibility information in the Update Manager in the Administration. Generally speaking, it's recommended to update all extensions before updating Shopware itself to their latest versions, to ensure a smooth transition. After updating Shopware, you should update all extensions again to ensure that you are using the latest versions to the new Shopware version.

For the Hosting environment, it makes sense to update the PHP version to the minimum required version for the new Shopware version before updating Shopware itself. Shopware versions always support an overlapping PHP version, so you can update the PHP version before updating Shopware itself. You can find the minimum required PHP version in the [System Requirements](../../installation/requirements.md).

For customizations, you should check the [UPGRADE.md](https://github.com/search?q=repo%3Ashopware%2Fshopware+UPGRADE-6+language%3AMarkdown+NOT+path%3A%2F%5Eadr%5C%2F%2F+NOT+path%3A%2F%5Echangelog%5C%2F%2F&type=code&l=Markdown), it contains all breaking changes and migration instructions. Most of the time, it's easier to update to the latest version in a local environment and take a look at what is not working anymore.

## Updating from Composer Project

If you're using the Composer-based setup (as described in our [development setup guide](../../installation/setup)), follow these steps:

```bash
# Enable maintenance mode
bin/console system:update:prepare

# Update packages
composer update

# Update configuration files
composer recipes:update

# Apply database migrations and finish update
bin/console system:update:finish
```

For Docker environments:

```bash
# Enter container first
make shell

# Then run the update commands above
```

## Final Steps

Before you remove the maintenance mode, it is recommended to check the following:

- **Check the Administration**: Make sure the administration is working correctly.
- **Check the Storefront / Sales Channels**: Make sure your main processes are working correctly (e.g., adding products to the cart, checkout, etc.).
- **Check the Extensions**: Make sure that all extensions are working correctly.
- **Check the Performance**: Make sure that there is no major performance degradation.
- **Check the Logs**: Check your error logs for any issues.

After you have checked everything, you can disable the maintenance mode with `bin/console sales-channel:maintenance:disable --all`.
