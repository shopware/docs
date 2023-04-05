# Override Existing Route

## Overview

In this guide you will learn how to override existing Store API routes to add additional data to it.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide), but you don't necessarily need that.

Furthermore you should have a look at our guide about [Adding a Store API route](add-store-api-route), since this guide is built upon it.

## Decorating our route

First, we have to create a new class which extends `AbstractExampleRoute`. In this example we will name it `ExampleRouteDecorator`.

```php
// <plugin root>/src/Core/Content/Example/SalesChannel/ExampleRouteDecorator.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use OpenApi\Annotations as OA;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Routing\Annotation\Entity;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route(defaults={"_routeScope"={"store-api"}})
 */
class ExampleRouteDecorator extends AbstractExampleRoute
{
    protected EntityRepository $exampleRepository;

    private AbstractExampleRoute $decorated;

    public function __construct(EntityRepository $exampleRepository, AbstractExampleRoute $exampleRoute)
    {
        $this->exampleRepository = $exampleRepository;
        $this->decorated = $exampleRoute;
    }

    public function getDecorated(): AbstractExampleRoute
    {
        return $this->decorated;
    }

    /**
     * @Entity("swag_example")
     * @Route("/store-api/example", name="store-api.example.search", methods={"GET", "POST"})
     */
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

Last, we have to register the decorated route to the DI-container. The `ExampleRouteDecorator` has to be registered after the `ExampleRoute` with the attribute `decorated` which points to the `ExampleRoute`. For the second argument we have to use the `ExampleRouteDecorator.inner`.

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        ...

        <service id="Swag\BasicExample\Core\Content\Example\SalesChannel\ExampleRouteDecorator" decorates="Swag\BasicExample\Core\Content\Example\SalesChannel\ExampleRoute" public="true">
            <argument type="service" id="swag_example.repository"/>
            <argument type="service" id="Swag\BasicExample\Core\Content\Example\SalesChannel\ExampleRouteDecorator.inner"/>
        </service>
    </services>
</container>
```
