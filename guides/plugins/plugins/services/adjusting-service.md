---
nav:
  title: Adjusting a Service
  position: 70

---

# Adjusting a Service

Service decoration is one of the main ways to extend Shopware behavior from a plugin, alongside reacting to events. Prefer events when you need to react to something Shopware does. Prefer service decoration when you need to change how an existing service behaves.

Shopware services that are designed for decoration often expose an abstract class as their contract instead of a PHP interface. The abstract class provides the `getDecorated()` chain and allows new non-abstract methods to be added without immediately breaking existing decorators.

This guide explains how to adjust a service using decoration. For more details, see the [Symfony documentation](https://symfony.com/doc/current/service_container/service_decoration.html).

## Prerequisites

This guide builds on the [Plugin Base Guide](../plugin-base-guide.md).

::: info
Refer to this video on **[Decorating services](https://www.youtube.com/watch?v=Rgf4c9rd1kw)** explaining service decorations with an easy example. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Decorating the service

Register both the original service and the decorator in `services.php`. Use the `decorate` method to point to the service being decorated. The `.inner` reference keeps the original service available inside the decorator.

Here's our example `services.php`:

```php
// <plugin root>/src/Resources/config/services.php
<?php declare(strict_types=1);

use Swag\BasicExample\Service\ExampleService;
use Swag\BasicExample\Service\ExampleServiceDecorator;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(ExampleService::class);

    $services->set(ExampleServiceDecorator::class)
        ->decorate(ExampleService::class)
        ->args([service('.inner')]);
};
```

Define an abstract class for the service contract. Unlike interfaces, abstract classes allow adding new methods without breaking existing decorators — see [Adding new functions](#adding-new-functions-to-an-existing-service) below. The abstract class must include a `getDecorated()` method returning its own type.

::: info
To avoid misunderstandings: The abstract service class and the implementation of it is not part of the decoration process itself and most of the times comes either from the Shopware core or from a plugin you want to extend. They are added here to have an example to decorate.
:::

Example abstract class:

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

`ExampleService` extends `AbstractExampleService`. Its `getDecorated()` throws `DecorationPatternException` because it has no decorator yet:

Example service:

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

`ExampleServiceDecorator` extends `AbstractExampleService`, accepts the original service in its constructor, and returns it from `getDecorated()`:

Example decorator:

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

Implement the new method in the concrete service as well:

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
