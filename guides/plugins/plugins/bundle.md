---
nav:
  title: Bundle
  position: 20

---

# Bundle

Plugins are based on the Symfony bundle concept, but offer additional features like lifecycle events and the ability to be managed in the Shopware administration.
This is maybe unwanted in some cases, like project critical customizations which should not be managed via the Shopware administration.
In this case, you can use a Symfony bundle instead of a plugin.

The Bundle can be put into the `src/` folder of your project and needs to be registered in the `config/bundles.php` file of your project.

## Choosing the right Bundle class

There are two Bundle classes you can choose from:

- `Shopware\Core\Framework\Bundle`
- `Symfony\Component\HttpKernel\Bundle\Bundle`

The first one is the Shopware bundle class and the second one is the Symfony bundle class.
The Shopware bundle class extends the Symfony bundle class, but offers additional features like acting as theme, bringing JavaScript/CSS files, Migrations, etc.
If you don't need these features, you can use the Symfony bundle class instead.

## Creating a Bundle

In the Shopware project template it is intended to put the bundle into the `src/` folder of your project and use the namespace `App\`.

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

## Adding services, twig templates, routes, theme, etc

You can add services, twig templates, routes, etc. to your bundle like you would do in a plugin.
Just create `Resources/config/services.xml` and `Resources/config/routes.xml` files or `Resources/views` for twig templates.
The bundle will be automatically detected and the files will be loaded.

To mark your bundle as a theme, it's enough to implement the `Shopware\Core\Framework\ThemeInterface` interface in your bundle class.
This will automatically register your bundle as a theme and make it available in the Shopware administration.
You can also add a `theme.json` file to define the theme configuration like [described here](../themes/theme-configuration.md).

## Adding migrations

Migrations are not automatically detected in bundles.
To enable migrations, you need to overwrite the `build` method in your bundle class like this:

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

## Integration into Shopware-CLI

Shopware-CLI cannot detect bundles automatically, therefore the assets of the bundles are not built automatically.
You will need to adjust the `composer.json` file of your project to specify the path to the bundle.
This is done by adding the `extra` section to the `composer.json` file:

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

This will tell Shopware-CLI where the bundle is located and what the name of the bundle is.
