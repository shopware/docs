---
nav:
  title: Add Custom Twig Functions
  position: 280

---

# Add Custom Twig Functions

Create your own Twig function to call a PHP script from the Twig template during theme development. Pass a string to the `TwigFunction` and return a `MD5-Hash`.

::: info
It is not recommended to use Twig functions in order to retrieve data from the database. In such a case, `DataResolver` could come in handy.
:::

## Prerequisites

In order to create your own Twig function for your plugin, you first need a plugin as base.
Refer to the [Plugin Base Guide](../../plugin-base-guide.md).

In the following sections, we will create and expand all necessary files for the Twig function to work. There are two such files:

* PHP file with the twig functions itself and
* Services.xml

## Creating the Twig function

For clarity, create a folder named `Twig` within the `src` folder.
Then create a new php file with desired file name within the `Twig` folder.
Refer to the below example :

::: code-group

```php [PLUGIN_ROOT/src/Twig/SwagCreateMd5Hash.php]
<?php declare(strict_types=1);

namespace SwagBasicExample\Twig;

use Shopware\Core\Framework\Context;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SwagCreateMd5Hash extends AbstractExtension
{
    public function getFunctions()
    {
        return [
            new TwigFunction('createMd5Hash', [$this, 'createMd5Hash']),
        ];
    }

    public function createMd5Hash(string $str)
    {
        return md5($str);
    }
}
```

:::

Of course, you can do everything in the `createMd5Hash` function that PHP can do, but the `services.php` handles registration of the service in the DI container.

::: code-group

```php [PLUGIN_ROOT/src/Resources/config/services.php]
$services->set(SwagCreateMd5Hash::class)
        ->public()
        ->tag('twig.extension'); // Required
```

Once done, you can access this `TwigFunction` within your plugin.

## Use Twig function in template

The created function is now available in all your templates. Call it like each other function.

```twig
{% sw_extends '@Storefront/storefront/page/content/product-detail.html.twig' %}

{% set md5Hash = createMd5Hash('Shopware is awesome') %}

{% block page_content %}
    {{ parent() }}

    {{ md5Hash }}
{% endblock %}
```
