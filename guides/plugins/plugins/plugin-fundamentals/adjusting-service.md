# Adjusting a Service

## Overview

In this guide you'll learn how to adjust a service. You can read more about service decoration in the [Symfony documentation](https://symfony.com/doc/current/service_container/service_decoration.html).

## Prerequisites

In order to add your own custom service for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide).

::: info
Refer to this video on **[Decorating services](https://www.youtube.com/watch?v=Rgf4c9rd1kw)** explaining service decorations with an easy example. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Decorating the service

First of all we have to create a new service for this example which gets decorated in the next step. Then we have to add a new service to our `services.xml` with the attribute `decorates` pointing to our service we want to decorate. Next we have to add our service decorator as argument, but we append an `.inner` to the end of the service to keep the old one as reference.

Here's our example `services.xml`:

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\ExampleService" />

        <service id="Swag\BasicExample\Service\ExampleServiceDecorator" decorates="Swag\BasicExample\Service\ExampleService">
            <argument type="service" id="Swag\BasicExample\Service\ExampleServiceDecorator.inner" />
        </service>
    </services>
</container>
```

Now we have to define an abstract class because it's more beautiful and not so strict like interfaces. With an abstract class we can add new functions easier, you can read more about this at the end of this article. The abstract class has to include an abstract function called `getDecorated()` which has the return type of our instance.

::: info
To avoid misunderstandings: The abstract service class and the implementation of it is not part of the decoration process itself and most of the times comes either from the Shopware core or from a plugin you want to extend. They are added here to have an example to decorate.
:::

Therefore, this is how your abstract class could then look like:

```php
// <plugin root>/src/Service/AbstractExampleService.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

abstract class AbstractExampleService
{
    abstract public function getDecorated(): AbstractExampleService; 

    abstract public function doSomething(): string;
}
```

Now we have our abstract class, but no service which uses it. So we create our `ExampleService` which extends from our `AbstractExampleService`. In our service the `getDecorated()` function has to throw an `DecorationPatternException` because it has no decoration yet.

Therefore, your service could then look like this:

```php
// <plugin root>/src/Service/ExampleService.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Framework\Plugin\Exception\DecorationPatternException;

class ExampleService extends AbstractExampleService
{
    public function getDecorated(): AbstractExampleService
    {
        throw new DecorationPatternException(self::class);
    }

    public function doSomething(): string
    {
        return 'Did something.';
    }
}
```

The last step is creating our decorated service called `ExampleServiceDecorator` in this example. Our decorated service has to extend from the `AbstractExampleService` and the constructor has to accept an instance of `AbstractExampleService`. Furthermore, the `getDecorated()` function has to return the decorated service passed into the constructor.

Your service could then look like below:

```php
// <plugin root>/src/Service/ExampleServiceDecorator.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

class ExampleServiceDecorator extends AbstractExampleService
{
    private AbstractExampleService $decoratedService;

    public function __construct(AbstractExampleService $exampleService)
    {
        $this->decoratedService = $exampleService;
    }

    public function getDecorated(): AbstractExampleService
    {
        return $this->decoratedService;
    }

    public function doSomething(): string
    {
        $originalResult = $this->decoratedService->doSomething();

        return $originalResult . ' Did something additionally.';
    }
}
```

## Adding new functions to an existing service

If you plan to add new functions to your service, it is recommended to add them as normal public functions due to backwards compatibility, if you decorate the service at several places. In this example we add a new function called `doSomethingNew()` which first calls the `getDecorated()` and then our new function `doSomethingNew()` because if our decorator does not implement it yet, it will call it from the parent. The advantage of adding it as normal public function is that you can implement it step by step into your other services without any issues. After you have implemented the function in every service decorator, you can make it abstract for the next release. If you add it directly as an abstract function, you will get errors because the function is required for every service decorator.

Here's our example abstract class:

```php
// <plugin root>/src/Service/AbstractExampleService.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

abstract class AbstractExampleService
{
    abstract public function getDecorated(): AbstractExampleService; 

    abstract public function doSomething(): string;

    public function doSomethingNew(): string
    {
        return $this->getDecorated()->doSomethingNew();
    }
}
```

After we have implemented our new function in the abstract class, we implement it in our service too.

```php
// <plugin root>/src/Service/ExampleService.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Framework\Plugin\Exception\DecorationPatternException;

class ExampleService extends AbstractExampleService
{
    public function getDecorated(): AbstractExampleService
    {
        throw new DecorationPatternException(self::class);
    }

    public function doSomething(): string
    {
        return 'Did something.';
    }

    public function doSomethingNew(): string
    {
        return 'Did something new.';
    }
}
```
