# Add custom Twig Functions

## Overview

Imagine you want to call a PHP script from the Twig template during the theme development to retrieve data from the database or to check whether a category is within the current path. For these cases we can create our own twig functions.

In our example we will pass a category ID to the Twig Function and return the category object.

## Prerequisites

In order to create your own Twig Function for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide.md).

## Creating Twig Function

In the following sections we will create and expand all necessary files for the Twig function to work. These are actually exactly 2 files. First the PHP file with the Twig Functions itself and the services.xml.

### Creating the Twig Function

For the sake of clarity, we will create a folder named Twig within the src folder. Within this we create a new php file. You can name this file whatever you want.

Let's have a look at the created file.

{% code title="<plugin root>/src/Twig/getCategoryById.php" %}
```php
<?php declare(strict_types=1);

namespace SwagBasicExample\Twig;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SwagGetCategoryById extends AbstractExtension
{

    /**
     * @var EntityRepositoryInterface
     */
    private $categoryRepository;

    public function __construct(EntityRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }



    public function getFunctions()
    {
        return [
            new TwigFunction('getCategoryById', [$this, 'getCategoryById']),
        ];
    }

    public function getCategoryById(string $categoryId)
    {
        return $this->categoryRepository->search(new Criteria([$categoryId]), Context::createDefaultContext())->first();
    }
}
```
{% endcode %}

In case you are not familiar with the Data Abstraction Layer refer to its documentation.

Of course you can do everything in the getCategoryById function that PHP can do.

What is still missing is the registration of the service in the DI container.

{% code title="<plugin root>/src/Resources/config/services.xml" %}
```markup
...
    <services>
        <service id="SwagBasicExample\Twig\SwagGetCategoryById" public="true">
            <argument type="service" id="category.repository"/> <!--Optional-->
            <tag name="twig.extension"/> <!--Required-->
        </service>
    </services>
...
```
{% endcode %}

After all that is done, you can access this Twig function within your plugin.
