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

## Decoration in a shared codebase

Decoration is powerful because it is unrestricted: your decorator replaces the service for every caller, so you can run code before and after the core logic, change its arguments, modify its return value, or skip the core implementation entirely. The same property makes it the most fragile extension mechanism in Shopware. Keep the following in mind, especially in projects that combine several store extensions with project code.

### Decorators nest, and every link must call the next one

Decoration is not limited to one decorator per service. If plugin A decorates a core service and plugin B decorates the same service, plugin B wraps plugin A, which wraps the core. Each decorator only ever sees the next inner service.

A decorator that does not call the inner service silently discards everything the rest of the chain contributes — including other plugins' behavior and the core logic. Unless you deliberately replace the implementation, always delegate to the inner service and keep working with its result:

```php
public function doSomething(): string
{
    // Delegate first, then add your own behavior
    return $this->decoratedService->doSomething() . ' Did something additionally.';
}
```

There is no runtime warning when a chain is broken. Symptoms show up as another extension "not working", so before debugging elsewhere, check which decorators are registered for the service. In PHPStorm, open the abstract class and use *Navigate → Implementations* (**Ctrl+Alt+B** / **Option+Cmd+B**) to list every class in the chain, or run `bin/console debug:container --show-arguments <service-id>`.

### Signature changes break every decorator

All implementations of an abstract method must share its signature. Adding even an optional parameter to a decorated method in the core or in your own abstract class therefore forces every decorator to be adjusted, and a plugin cannot satisfy the old and the new signature at the same time. In practice this means a new plugin major version per Shopware major version.

This is why Shopware avoids interfaces for decoratable services, and why new methods should be added as [regular public methods first](#adding-new-functions-to-an-existing-service) instead of as abstract methods.

::: warning
Type hint the abstract class, never the concrete implementation, in constructors. Type hinting the concrete class means your service is no longer part of the decoration chain and bypasses other extensions. The [Shopware 6 Toolbox plugin](../../../development/tooling/shopware-toolbox.md#inspections) reports this as an error.
:::

### Prefer designed extension points

Decoration works on any service, whether or not the service was designed to be extended. Where the core offers an [extension point](../framework/extension/index.md), prefer it: extension points are subscribed to as events (`.pre`, `.post`, `.error`), so multiple extensions can participate without forming a chain, and their input objects can gain new data without breaking existing subscribers. See [Extension Points vs Events](../framework/extension/extension-vs-events.md) for the differences and [Listening to events](../framework/event/listening-to-events.md) for plain events.

Use decoration when there is no extension point and you need to change how an existing service behaves.

### Data added to entities is public API

Attaching data to an entity via `addExtension()` inside a decorator is convenient, but the extension is serialized into Store API and Admin API responses. Anything you add there becomes part of the payload that other extensions and storefronts see, so use a vendor-specific key and document it as part of your plugin's public surface.

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
