---
nav:
  title: Override Existing Route
  position: 30

---

# Override Existing Route

## Overview

Use extension events to change Store API routes that expose them.
Existing abstract route contracts and their decorators remain supported, even if an event is later added.
Check the route for an `ExtensionDispatcher::publish()` call and a matching `Extension` class.

## Subscribe to a route extension

The [Add Store API Route](add-store-api-route.md) guide defines `ExampleRouteExtension` with a mutable `Criteria` object.
This subscriber adds a filter before the route body runs:

```php
// <plugin root>/src/Subscriber/ExampleRouteSubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Swag\BasicExample\Core\Content\Example\Extension\ExampleRouteExtension;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class ExampleRouteSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [ExampleRouteExtension::onPre() => 'filterExamples'];
    }

    public function filterExamples(ExampleRouteExtension $extension): void
    {
        $extension->criteria->addFilter(new EqualsFilter('active', true));
    }
}
```

Register the subscriber as a service:

```php
// <plugin root>/src/Resources/config/services.php
<?php declare(strict_types=1);

use Swag\BasicExample\Subscriber\ExampleRouteSubscriber;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $configurator): void {
    $configurator->services()
        ->set(ExampleRouteSubscriber::class)
        ->tag('kernel.event_subscriber');
};
```

A `.pre` listener can change mutable inputs or replace the operation by setting `$extension->result` and calling `stopPropagation()`.
Use `.post` to inspect or change the result, and `.error` to provide a fallback result after an exception.
Without a fallback result, the original exception is rethrown.
Use listener priorities to control ordering when migrating from a decorator chain.
See [Finding Extension Points](../extension/finding-extensions.md) for more detail.

## Decorate an existing route

For an existing route with a supported abstract route class, you can still extend that class and delegate to the decorated route.
Adding an event does not itself deprecate the abstract class; decoration remains valid until its contract is formally deprecated and removed.

```php
<?php declare(strict_types=1);

namespace Acme\FreeShipping;

use Shopware\Core\Content\Product\SalesChannel\Search\AbstractProductSearchRoute;
use Shopware\Core\Content\Product\SalesChannel\Search\ProductSearchRouteResponse;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\HttpFoundation\Request;

final class FreeShippingSearchRoute extends AbstractProductSearchRoute
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
        $criteria->addFilter(new EqualsFilter('product.shippingFree', true));

        return $this->decorated->load($request, $context, $criteria);
    }
}
```

Register the decorator against the concrete route service:

```php
<?php declare(strict_types=1);

use Acme\FreeShipping\FreeShippingSearchRoute;
use Shopware\Core\Content\Product\SalesChannel\Search\ProductSearchRoute;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $configurator->services()
        ->set(FreeShippingSearchRoute::class)
        ->decorate(ProductSearchRoute::class)
        ->args([service('.inner')]);
};
```

Keep the `#[Route]` attribute on the original route because copying it to a decorator can alter route defaults or controller resolution.
