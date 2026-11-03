---
nav:
  title: Override Existing Route
  position: 30

---

# Override Existing Route

## Overview

In this guide you will learn how to extend existing Store API routes to add additional data to it.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide.md), but you don't necessarily need that.

Furthermore, you should have a look at our guide about [Adding a Store API route](add-store-api-route.md), since this guide is built upon it.

## Extending a route with extension events

Use extension events to change a Store API route's inputs, modify its response, or replace its operation.

::: info
Store API route extension events are available from Shopware 6.7.16.0.
Existing abstract route classes and `getDecorated()` remain supported, so you can still use service decoration when supporting older Shopware versions.
:::

Subscribe to the route's extension event using an `EventSubscriberInterface` implementation.
The extension class provides the route inputs as public readonly properties and carries the response in `$extension->result`.

- Use `.pre` to change inputs before the route body runs.
- Use `.post` to inspect or modify the result after the route body runs.
- Use `.error` to inspect `$extension->exception` and provide a fallback result.

Without a fallback result, the original exception is rethrown.
See [Extension points](../extension/index.md) for more details.

### Modifying inputs and responses

This subscriber limits the example search to ten results and changes the response's cache header:

::: code-group

```php [{plugin root}/src/Subscriber/ExampleRouteSubscriber.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Swag\BasicExample\Core\Content\Example\Extension\ExampleRouteExtension;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class ExampleRouteSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ExampleRouteExtension::onPre() => 'onPre',
            ExampleRouteExtension::onPost() => 'onPost',
        ];
    }

    public function onPre(ExampleRouteExtension $extension): void
    {
        $extension->criteria->setLimit(10);
    }

    public function onPost(ExampleRouteExtension $extension): void
    {
        $extension->result->headers->set('cache-control', 'max-age=10000');
    }
}
```

:::

Register the subscriber in your plugin's `services.php`:

::: code-group

```php [{plugin root}/src/Resources/config/services.php]
<?php declare(strict_types=1);

use Swag\BasicExample\Subscriber\ExampleRouteSubscriber;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(ExampleRouteSubscriber::class)
        ->tag('kernel.event_subscriber');
};
```

:::

### Replacing the route operation

To replace the route body, assign a response of the route's declared response type to `$extension->result` in a `.pre` listener, then call `$extension->stopPropagation()`.
For the example route, the result must be an `ExampleRouteResponse`.
This skips the route body and stops later listeners for the `.pre` event.

Use subscriber priorities to control listener order when several plugins subscribe to the same event.
Higher priorities run first.
Avoid stopping propagation when you only need to adjust inputs or modify the response.

## Decorating a route for older Shopware versions

For plugins that support Shopware versions before 6.7.16.0, you can extend an existing route's abstract class and register a service decorator.
This remains supported for routes that retain their abstract contract.
The example below decorates the core product search route, whose abstract class is still available.

::: code-group

```php [{plugin root}/src/Core/Content/Product/SalesChannel/ProductSearchRouteDecorator.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Product\SalesChannel;

use Shopware\Core\Content\Product\SalesChannel\Search\AbstractProductSearchRoute;
use Shopware\Core\Content\Product\SalesChannel\Search\ProductSearchRouteResponse;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\HttpFoundation\Request;

final class ProductSearchRouteDecorator extends AbstractProductSearchRoute
{
    public function __construct(private readonly AbstractProductSearchRoute $decorated)
    {
    }

    public function getDecorated(): AbstractProductSearchRoute
    {
        return $this->decorated;
    }

    public function load(Request $request, SalesChannelContext $context, Criteria $criteria): ProductSearchRouteResponse
    {
        $criteria->setLimit(10);

        $response = $this->decorated->load($request, $context, $criteria);
        $response->headers->set('cache-control', 'max-age=10000');

        return $response;
    }
}
```

:::

Return the inner route from `getDecorated()` and delegate to it in `load()` to preserve the rest of the decoration chain.
Do not copy `#[Route]` attributes into the decorator, as they can change route resolution and bypass other decorators.

### Registering the decorator

::: code-group

```php [{plugin root}/src/Resources/config/services.php]
<?php declare(strict_types=1);

use Shopware\Core\Content\Product\SalesChannel\Search\ProductSearchRoute;
use Swag\BasicExample\Core\Content\Product\SalesChannel\ProductSearchRouteDecorator;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(ProductSearchRouteDecorator::class)
        ->decorate(ProductSearchRoute::class)
        ->args([service('.inner')]);
};
```

:::

When migrating a decorator to a subscriber, remove its service decoration registration to avoid applying the change twice.
See [Adjusting a service](../../services/adjusting-service.md) for more on decoration.
