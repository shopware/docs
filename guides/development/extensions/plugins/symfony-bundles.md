---
nav:
  title: Symfony Bundles
  position: 20

---

# Using Symfony Bundles Instead of Plugins

This guide handles some basic concepts of Shopware plugins covered in our [Plugin base guide](plugin-base-guide).

::: info
Check out our [Shopware Toolbox PHPStorm extension](../../../resources/tooling/ide/shopware-toolbox) with useful features like autocompletion, code generation or guideline checks.
:::

You might use a Symfony bundle instead of a plugin when:

* You do not need a plugin lifecycle
* You do not want Administration management
* You are building project-level customization
* You want pure Symfony integration

## How Plugins extend bundles

Shopware plugins extend Symfony bundles and add:

* Plugin lifecycle (install, update, activate, uninstall)
* Automatic migration handling
* Asset building integration
* Administration management

Class hierarchy: Plugin → Shopware\Bundle → Symfony\Bundle

## When to use a bundle

Use a pure Symfony bundle when:

* You are customizing a single project
* You want no plugin lifecycle
* You manage everything via Composer
* You do not distribute the extension

## Project structure

Here's how a typical Shopware 6 project structure looks when bundles are used:

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
│           │   ├── services.xml
│           │   └── routes.xml
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

The Bundle is typically placed in the `src/` folder of your project, which is the standard location for custom code in a Shopware project. You still will need to register the bundle in the `config/bundles.php` file of your project.

## Choosing the right bundle class

There are two Bundle classes you can choose from:

* `Shopware\Core\Framework\Bundle`: the Shopware bundle class, which extends the Symfony bundle class with additional features like acting as theme, bringing JavaScript/CSS files, and migrations
* `Symfony\Component\HttpKernel\Bundle\Bundle`: the Symfony bundle class, which you can use if you don't need additional features

## Creating a bundle

By default, The namespace `App\` is registered to the `src` folder in any Shopware project to be used for customizations. We recommend using this namespace, if you like to change the project structure, you can change the `App\` namespace in the `composer.json` file of your project.

```php
// <project root>/src/YourBundleName.php
<?php declare(strict_types=1);

namespace App\YourBundleName;

use Shopware\Core\Framework\Bundle;

class YourBundleName extends Bundle
{
}
```

The bundle class needs to be registered in the `config/bundles.php` file of your project.

```php
// <project root>/config/bundles.php
//...
App\YourBundleName\YourBundleName::class => ['all' => true],
//...
```

## Adding services, Twig templates, routes, and themes

You can add services, twig templates, routes, etc. to your bundle like you would do in a plugin. Just create `Resources/config/services.xml` and `Resources/config/routes.xml` files or `Resources/views` for twig templates. The bundle will be automatically detected and the files will be loaded.

To mark your bundle as a theme, it's enough to implement the `Shopware\Core\Framework\ThemeInterface` interface in your bundle class.
This will automatically register your bundle as a theme and make it available in the Shopware administration.
You can also add a `theme.json` file to define the theme configuration like [described here](../themes/theme-configuration.md).

## Adding migrations

Migrations are not automatically detected in bundles. To enable migrations, overwrite the `build` method in your bundle class:

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

As Bundles don't have a lifecycle, the migrations are not automatically executed.
You need to execute them manually via the console command:

```bash
bin/console database:migrate <BundleName> --all
```

If you use [Deployment Helper](../../hosting/installation-updates/deployments/deployment-helper.md), you can add it to the `.shopware-project.yaml` file like this:

```yaml
deployment:
    hooks:
        pre-update: |
            bin/console database:migrate <BundleName> --all
```

## Integration into Shopware CLI

The Shopware CLI cannot detect bundles automatically, therefore the assets of the bundles are not built automatically. You will need to adjust your project's `composer.json` file to specify the path to the bundle. Do this by adding the `extra` section to the `composer.json` file:

```json
{
    "extra": {
        "shopware-bundles": {
          "src/<BundleName>": {
            "name": "<BundleName>",
          }
        }
    }
}
```

This will tell Shopware CLI where the bundle is located and its name.

## Next steps

Now that you know about the differences between a Symfony bundle and a Shopware plugin, you might also want to have a look into the following Symfony-specific topics and how they are integrated in Shopware 6:

* [Dependency Injection](plugin-fundamentals/dependency-injection)
* [Listening to events](plugin-fundamentals/listening-to-events)

::: info
Here are some useful videos explaining:

* **[Bundle Methods in a plugin](https://www.youtube.com/watch?v=cUXcDwQwmPk)**
* **[Symfony services in Shopware 6](https://www.youtube.com/watch?v=l5QJ8EtilaY)**

Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::
