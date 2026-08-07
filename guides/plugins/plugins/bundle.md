---
nav:
  title: Symfony Bundles
  position: 20

---

# Using Symfony Bundles Instead of Plugins

This guide covers some basic concepts of Shopware plugins, which are also covered in the [Plugin base guide](./plugin-base-guide.md). You may want to refresh your knowledge of Symfony's [Bundle system](https://symfony.com/doc/current/bundles.html).

::: info
Check out our [Shopware Toolbox PHPStorm extension](../../development/tooling/shopware-toolbox.md) with useful features such as autocompletion, code generation, and guideline checks.
:::

You might use a Symfony bundle instead of a plugin when:

* You do not need a plugin lifecycle
* You do not want the Administration management
* You are building project-level customization
* You want pure Symfony integration

## How Plugins extend bundles

Shopware plugins extend Symfony bundles and add:

* Plugin lifecycle (install, update, activate, uninstall)
* Automatic migration handling
* Asset building integration
* Administration management

Class hierarchy: `Plugin` → `Shopware\Bundle` → `Symfony\Bundle`

## When to use a bundle

Use a pure Symfony bundle when:

* You are customizing a single project
* You want no plugin lifecycle
* You manage everything via Composer
* You do not distribute the extension

## Project structure

How a typical Shopware 6 project structure looks when bundles are used:

```text
project-root/
├── bin/
│   └── console
├── config/
│   ├── bundles.php
│   ├── packages/
│   └── services.yaml
├── public/
│   ├── index.php
│   └── bundles/
├── src/
│   └── YourBundleName/
│       ├── YourBundleName.php
│       ├── Migration/
│       │   └── Migration1234567890YourMigration.php
│       └── Resources/
│           ├── config/
│           │   ├── services.php
│           │   └── routes.php
│           ├── views/
│           │   └── storefront/
│           │       └── page/
│           └── app/
│               ├── storefront/
│               │   └── src/
│               └── administration/
│                   └── src/
├── var/
├── vendor/
├── composer.json
├── composer.lock
└── .shopware-project.yaml
```

The bundle is typically placed in a project's `src/` folder, which is the standard location for custom code. You will still need to register the bundle in the project's `config/bundles.php` file.

## Choosing the right bundle class

There are two bundle classes you can choose from:

* `Shopware\Core\Framework\Bundle`: the Shopware bundle class, which extends the Symfony bundle class with additional features like acting as a theme, bringing JavaScript/CSS files, and migrations
* `Symfony\Component\HttpKernel\Bundle\Bundle`: the Symfony bundle class, which you can use if you don't need additional features

## Creating a bundle

By default, the `App\` namespace is registered in the `src` folder of any Shopware project for customizations. We recommend using this namespace. To change the project structure, change the `App\` namespace in the project's `composer.json` file.

```php
// <project root>/src/YourBundleName.php
<?php declare(strict_types=1);

namespace App\YourBundleName;

use Shopware\Core\Framework\Bundle;

class YourBundleName extends Bundle
{
}
```

The bundle class must be registered in the project's `config/bundles.php` file.

```php
// <project root>/config/bundles.php
//...
App\YourBundleName\YourBundleName::class => ['all' => true],
//...
```

### Optional bundles

If a bundle is not always installed (for example, a dev-only package or an experimental feature), wrap its registration in a guard. Without a guard, the application will crash with a class-not-found error on any environment where the package is absent.

**Package not always installed** — use `InstalledVersions::isInstalled()`:

```php
use Composer\InstalledVersions;

if (InstalledVersions::isInstalled('vendor/your-bundle-package')) {
    $bundles[App\YourBundleName\YourBundleName::class] = ['all' => true];
}
```

**Experimental feature behind a Shopware feature flag** — combine both checks so the Bundle is only loaded when the flag is active, and the package is present. `Feature::isActive()` reads from environment variables and is safe to call in `bundles.php`:

```php
use Composer\InstalledVersions;
use Shopware\Core\Framework\Feature;

if (Feature::isActive('YOUR_FEATURE_FLAG') && InstalledVersions::isInstalled('vendor/your-bundle-package')) {
    $bundles[App\YourBundleName\YourBundleName::class] = ['all' => true];
}
```

## Adding services, Twig templates, routes, and themes

You can add services, Twig templates, routes, etc., to your bundle just as you would to a plugin. Create `Resources/config/services.php` and `Resources/config/routes.php` files, or `Resources/views` for Twig templates. The bundle will be automatically detected, and the files will be loaded.

To mark your bundle as a theme, you only need to implement the `Shopware\Core\Framework\ThemeInterface` interface in your bundle class.
This will automatically register your bundle as a theme and make it available in the Administration.
You can also add a `theme.json` file to define the [theme configuration](../themes/configuration/theme-configuration.md).

## Adding migrations

Migrations are not automatically detected in bundles. To enable migrations, overwrite the `build` method in the bundle class:

```php
// <project root>/src/YourBundleName.php
<?php declare(strict_types=1);

namespace App\YourBundleName;

use Shopware\Core\Framework\Bundle;

class YourBundleName extends Bundle
{
    public function build(ContainerBuilder $container): void
    {
        parent::build($container);

        $this->registerMigrationPath($container);
    }
}
```

Since bundles don't have a lifecycle, migrations aren't automatically executed. Execute them manually via the console command:

```bash
bin/console database:migrate <BundleName> --all
```

If you use [Deployment Helper](../../hosting/installation-updates/deployments/deployment-helper.md), you can add it to the `.shopware-project.yaml` file:

```yaml
deployment:
    hooks:
        pre-update: |
 bin/console database:migrate <BundleName> --all
```

## Integration into Shopware CLI

The Shopware CLI cannot automatically detect bundles. Therefore, bundle assets are not built automatically. Adjust the project's `composer.json` file to specify the Bundle's path. Do this by adding the `extra` section to the `composer.json` file:

```json
{
    "extra": {
        "shopware-bundles": {
            "src/<BundleName>": {
                "name": "<BundleName>"
            }
        }
    }
}
```

This will tell Shopware CLI where the Bundle is located and its name.

## Next steps

Now that you know about the differences between a Symfony bundle and a Shopware plugin, review the following guides:

* [Dependency Injection](services/dependency-injection.md)
* [Listening to events](framework/event/listening-to-events.md)

Also check out these useful videos:

* [Bundle Methods in a plugin](https://www.youtube.com/watch?v=cUXcDwQwmPk)
* [Symfony services in Shopware 6](https://www.youtube.com/watch?v=l5QJ8EtilaY)
* The free online training ["Shopware 6 Backend Development"](https://hub.shopware.com/learn/path/shopware-backend-development-essentials)
