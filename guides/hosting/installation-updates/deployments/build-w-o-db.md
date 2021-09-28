# Building assets of administration and storefront without a database

It is common to prebuild assets in professional deployments to deploy the build artifacts assets to the production environment. This task is mostly done by a CI job which doesn't have access to the the production database. Shopware needs access to the database to look up the installed extensions / load the configured theme variables. To be able to build the assets without a database, we can use static dumped files.

{% hint style="warning" %}
This guide requires Shopware 6.4.4.0 or higher 
{% endhint %}

## Compiling the Administration without database

By default, Shopware builds the Administration without extensions if there is no database connection. To include the extensions without a database, you will need to use the `ComposerPluginLoader`. This determines the used plugins by looking up the installed project dependencies. To get this working the plugin needs to be required in the system using `composer req [package/name]`.

 To use the `ComposerPluginLoader` you have to create a file like `bin/ci` and set up the CLI application with the loader. There is an example:

```php
#!/usr/bin/env php
<?php declare(strict_types=1);
use Composer\InstalledVersions;
use Shopware\Core\Framework\Plugin\KernelPluginLoader\ComposerPluginLoader;
use Shopware\Production\HttpKernel;
use Shopware\Production\Kernel;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArgvInput;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\ErrorHandler\Debug;

set_time_limit(0);

$classLoader = require __DIR__ . '/../vendor/autoload.php';
$envFile = __DIR__ . '/../.env';

if (class_exists(Dotenv::class) && is_readable($envFile) && !is_dir($envFile)) {
    (new Dotenv())->usePutenv()->load($envFile);
}

if (!isset($_SERVER['PROJECT_ROOT'])) {
    $_SERVER['PROJECT_ROOT'] = dirname(__DIR__);
}

$input = new ArgvInput();
$env = $input->getParameterOption(['--env', '-e'], $_SERVER['APP_ENV'] ?? 'prod', true);
$debug = ($_SERVER['APP_DEBUG'] ?? ($env !== 'prod')) && !$input->hasParameterOption('--no-debug', true);

if ($debug) {
    umask(0000);
    if (class_exists(Debug::class)) {
        Debug::enable();
    }
}

$pluginLoader = new ComposerPluginLoader($classLoader, null);
$kernel = new HttpKernel($env, $debug, $classLoader);
$kernel->setPluginLoader($pluginLoader);
$application = new Application($kernel->getKernel());
$application->run($input);
```

We can now dump the plugins for the Administration with the new file without a database with the command `bin/ci bundle:dump`. It is recommended to call `bin/ci` instead of `bin/console` in the `bin/*.js` scripts, which can be achieved by setting the environment variable `CI=1`.

## Compiling the Storefront without database

To compile the Storefront theme, we will need the theme variables from the database. To allow compiling it without a database, it is possible to dump the variables to the private file system of Shopware. This file system interacts with the local folder `files` by default, but to compile it, it should be shared such that settings are shared across deployments. This can be achieved for example by using a [storage adapter like s3](../../infrastructure/filesystem.md). The configuration can be dumped using the command `bin/console theme:dump`, or it happens automatically when changing theme settings or assigning a new theme.

By default, Shopware still tries to load configurations from the database, in the next step we will need to change the loader to `StaticFileConfigLoader`. To change that we will need to create a new file `config/packages/storefront.yaml` with the following content:

 ```yaml
storefront:
    theme:
        config_loader_id: Shopware\Storefront\Theme\ConfigLoader\StaticFileConfigLoader
        available_theme_provider: Shopware\Storefront\Theme\ConfigLoader\StaticFileAvailableThemeProvider
 ```

 This will force the theme compiler to use the static dumped file instead of looking into the database.
