# Building assets of Administration and Storefront without a Database

It is common to prebuild assets in professional deployments to deploy the build artifact assets to the production environment. This task is mostly done by a CI job that doesn't have access to the production database. Shopware needs access to the database to look up the installed extensions/load the configured theme variables. To be able to build the assets without a database, we can use static dumped files.

::: warning
This guide requires Shopware 6.4.4.0 or higher
:::

## Compiling the Administration without database

By default, Shopware builds the Administration without extensions if there is no database connection. To include the extensions without a database, you will need to use the `ComposerPluginLoader`. This determines the used plugins by looking up the installed project dependencies. To get this working, the plugin needs to be required in the system using `composer req [package/name]`.

There is a file `bin/ci` which uses the `ComposerPluginLoader` and can be used instead of `bin/console`.
Using this, you can dump the plugins for the Administration with the new file without a database using the command `bin/ci bundle:dump`. It is recommended to call `bin/ci` instead of `bin/console` in the `bin/*.js` scripts, which can be achieved by setting the environment variable `CI=1`.

## Compiling the Storefront without database

To compile the Storefront theme, you will need the theme variables from the database. To allow compiling it without a database, it is possible to dump the variables to the private file system of Shopware. This file system interacts with the local folder `files` by default, but to compile it, it should be shared such that settings are shared across deployments. This can be achieved, for example, by using a [storage adapter like s3](../../infrastructure/filesystem). The configuration can be dumped using the command `bin/console theme:dump`, or it happens automatically when changing theme settings or assigning a new theme.

By default, Shopware still tries to load configurations from the database. In the next step, you will need to change the loader to `StaticFileConfigLoader`. To change that, you will need to create a new file, `config/packages/storefront.yaml` with the following content:

 ```yaml
storefront:
    theme:
        config_loader_id: Shopware\Storefront\Theme\ConfigLoader\StaticFileConfigLoader
        available_theme_provider: Shopware\Storefront\Theme\ConfigLoader\StaticFileAvailableThemeProvider
 ```

 This will force the theme compiler to use the static dumped file instead of looking into the database.

### Partially compiling the Storefront

You can also build just the Javascript bundle using `CI=1 SHOPWARE_SKIP_THEME_COMPILE=true PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true bin/build-storefront.sh` (without the need for the above loader) in your CI. After that, run `bin/console theme:dump` on your production system when the database is available. This will happen automatically if theme variables are changed via the admin panel.
