---
nav:
  title: Add custom twig functions
  position: 280

---

# Add Custom Twig Functions

## Overview

Let us consider, for instance, you want to call a PHP script from the twig template during the theme development to create a `MD5-hash`.
In such a case, you can create your own twig functions.
For this example, pass a string to the `TwigFunction` and return a `MD5-Hash`.

::: info
It is not recommended to use twig functions in order to retrieve data from the database. In such a case, DataResolver could come in handy.
:::

## Prerequisites

In order to create your own twig function for your plugin, you first need a plugin as base.
Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide).

## Creating twig function

In the following sections, we will create and expand all necessary files for the twig function to work.
There are two such files:

* PHP file with the twig functions itself and
* Services.xml

### Creating the twig function

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

Of course, you can do everything in the `createMd5Hash` function that PHP can do, but the `service.xml` handles registration of the service in the DI container.

::: code-group

```xml [PLUGIN_ROOT/src/Resources/config/services.xml]
    <services>
        <service id="SwagBasicExample\Twig\SwagCreateMd5Hash" public="true">
            <tag name="twig.extension"/> <!--Required-->
        </service>
    </services>
```

Once done, you can access this `TwigFunction` within your plugin.

### Use twig function in template

The created function is now available in all your templates.
You can call it like each other function.

```twig
{% sw_extends '@Storefront/storefront/page/content/product-detail.html.twig' %}

{% set md5Hash = createMd5Hash('Shopware is awesome') %}

{% block page_content %}
    {{ parent() }}

    {{ md5Hash }}
{% endblock %}
```
