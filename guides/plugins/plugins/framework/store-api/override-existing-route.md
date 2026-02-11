---
nav:
  title: Override existing route
  position: 30

---

# Override Existing Route

## Overview

In this guide you will learn how to override existing Store API routes to add additional data to it.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide), but you don't necessarily need that.

Furthermore, you should have a look at our guide about [Adding a Store API route](add-store-api-route), since this guide is built upon it.

## Decorating our route

First, we have to create a new class which extends `AbstractExampleRoute`. In this example we will name it `ExampleRouteDecorator`.

```php
// <plugin root>/src/Core/Content/Example/SalesChannel/ExampleRouteDecorator.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use Shopware\Core\PlatformRequest;
use Shopware\Core\Framework\Routing\StoreApiRouteScope;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\DependencyInjection\Attribute\AutowireDecorated;
use Symfony\Component\Routing\Attribute\Route;

#[AsDecorator(decorates: ExampleRoute::class)]
#[Route(defaults: [PlatformRequest::ATTRIBUTE_ROUTE_SCOPE => [StoreApiRouteScope::ID]])]
class ExampleRouteDecorator extends AbstractExampleRoute
{
    protected EntityRepository $exampleRepository;

    private AbstractExampleRoute $decorated;

    public function __construct(EntityRepository $exampleRepository, #[AutowireDecorated] AbstractExampleRoute $exampleRoute)
    {
        $this->exampleRepository = $exampleRepository;
        $this->decorated = $exampleRoute;
    }

    public function getDecorated(): AbstractExampleRoute
    {
        return $this->decorated;
    }
    
    #[Route(path: '/store-api/example', name: 'store-api.example.search', methods: ['GET', 'POST'], defaults: ['_entity' => 'category'])]
    public function load(Criteria $criteria, SalesChannelContext $context): ExampleRouteResponse
    {
        // We must call this function when using the decorator approach
        $exampleResponse = $this->decorated->load();
        
        // do some custom stuff
        $exampleResponse->headers->add([ 'cache-control' => "max-age=10000" ])

        return $exampleResponse;›
    }
}
```

As you can see, our decorated route has to extend from the `AbstractExampleRoute` and the constructor has to accept an instance of `AbstractExampleRoute`. Furthermore, the `getDecorated()` function has to return the decorated route passed into the constructor. Now we can add some additional data in the `load` method, which we can retrieve with the criteria.

## Registering route

With autowiring enabled, the `#[AsDecorator]` attribute on the class is sufficient to register the decorator. No explicit service configuration is needed. The `#[AsDecorator(decorates: ExampleRoute::class)]` attribute tells Symfony to automatically decorate the `ExampleRoute` service with `ExampleRouteDecorator`.
