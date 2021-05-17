# Override existing route

## Overview

In this guide you'll learn how to override existing Store API routes to add additional data to it.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../../plugin-base-guide.md), but you don't necessarily need that.

Furthermore you should have a look at our guide about [Adding a Store API route](add-store-api-route.md), since this guide is built upon it.

## Decorating our route

First, we have to create a new class which extends `AbstractExampleRoute`. In this example we will name it `ExampleRouteDecorator`.

{% code title="<plugin root>/src/Core/Content/Example/SalesChannel/ExampleRouteDecorator.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use OpenApi\Annotations as OA;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Routing\Annotation\Entity;
use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @RouteScope(scopes={"store-api"})
 */
class ExampleRouteDecorator extends AbstractExampleRoute
{
    /**
     * @var EntityRepositoryInterface
     */
    protected $exampleRepository;

    /**
     * @var AbstractExampleRoute
     */
    private $decorated;

    public function __construct(EntityRepositoryInterface $exampleRepository, AbstractExampleRoute $exampleRoute)
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
     * @OA\Post(
     *      path="/example",
     *      summary="This route can be used to load the swag_example by specific filters",
     *      operationId="readExample",
     *      tags={"Store API", "Example"},
     *      @OA\Parameter(name="Api-Basic-Parameters"),
     *      @OA\Response(
     *          response="200",
     *          description="",
     *          @OA\JsonContent(type="object",
     *              @OA\Property(
     *                  property="total",
     *                  type="integer",
     *                  description="Total amount"
     *              ),
     *              @OA\Property(
     *                  property="aggregations",
     *                  type="object",
     *                  description="aggregation result"
     *              ),
     *              @OA\Property(
     *                  property="elements",
     *                  type="array",
     *                  @OA\Items(ref="#/components/schemas/swag_example_flat")
     *              )
     *          )
     *     )
     * )
     * @Route("/store-api/example", name="store-api.example.search", methods={"GET", "POST"})
     */
    public function load(Criteria $criteria, SalesChannelContext $context): ExampleRouteResponse
    {
        // do some custom stuff here

        return new ExampleRouteResponse($this->exampleRepository->search($criteria, $context->getContext()));
    }
}
```
{% endcode %}

As you can see, our decorated route has to extend from the `AbstractExampleService` and the constructor has to accept an instance of `AbstractExampleService`. Furthermore, the `getDecorated()` function has to return the decorated route passed into the constructor. Now we can add some additional data in the `load` method, which we can retrieve with the criteria.

## Registering route

Last, we have to register the decorated route to the DI-container. The `ExampleRouteDecorator` has to be registered after the `ExampleRoute` with the attribute `decorated` which points to the `ExampleRoute`. For the second argument we have to use the `ExampleRouteDecorator.inner`.

{% code title="<plugin root>/src/Resources/config/services.xml" %}
```markup
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
{% endcode %}

