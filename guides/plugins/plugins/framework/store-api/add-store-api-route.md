# Add store API route

## Overview

In this guide you'll learn how to add a custom store API route. In this example, we will create a new route called `ExampleRoute` that searches entities of type `swag_example`. The route will be accessible under `/store-api/example`.

## Prerequisites

In order to add your own Store API route for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../../plugin-base-guide.md).

You also should have a look at our [Adding custom complex data](../data-handling/add-custom-complex-data.md) guide, since this guide is built upon it.

## Add Store API route

As you may already know from the [adjusting service](../../plugin-fundamentals/adjusting-service.md) guide, we use abstract classes to make our routes more decoratable.

{% hint style="warning" %}
All fields that should be available through the API require the flag `ApiAware` in the definition.
{% endhint %}

### Create abstract route class

First of all, we create an abstract class called `AbstractExampleRoute`. This class has to contain a method `getDecorated` and a method `load` with a `Criteria` and `SalesChannelContext` as parameter. The `load` method has to return an instance of `ExampleRouteResponse`, which we will create later on.

{% code title="<plugin root>/src/Core/Content/Example/SalesChannel/AbstractExampleRoute.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

abstract class AbstractExampleRoute
{
    abstract public function getDecorated(): AbstractExampleRoute;

    abstract public function load(Criteria $criteria, SalesChannelContext $context): ExampleRouteResponse;
}
```
{% endcode %}

### Create route class

Now we can create a new class `ExampleRoute` which uses our previously created `AbstractExampleRoute`.

{% code title="<plugin root>/src/Core/Content/Example/SalesChannel/ExampleRoute.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use OpenApi\Annotations as OA;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Plugin\Exception\DecorationPatternException;
use Shopware\Core\Framework\Routing\Annotation\Entity;
use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @RouteScope(scopes={"store-api"})
 */
class ExampleRoute extends AbstractExampleRoute
{
    protected EntityRepositoryInterface $exampleRepository;

    public function __construct(EntityRepositoryInterface $exampleRepository)
    {
        $this->exampleRepository = $exampleRepository;
    }

    public function getDecorated(): AbstractExampleRoute
    {
        throw new DecorationPatternException(self::class);
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
        return new ExampleRouteResponse($this->exampleRepository->search($criteria, $context->getContext()));
    }
}
```
{% endcode %}

As you can see, our class is annotated with `@RouteScope` and the defined scope `store-api`.

In our class constructor we've injected our `swag_example.repository`. The method `getDecorated()` must throw a `DecorationPatternException` because it has no decoration yet and the method `load`, which fetches the data, returns a new `ExampleRouteResponse` with the respective repository search result as argument.

Now let's take a look at the annotation of our `load` method which is required for the automatic OpenAPI generation using [Swagger UI](https://zircote.github.io/swagger-php/).

* `@Entity`: The entity we are representing.
* `@OA\Post`:
  * `path`: The route, where we can access this action.
  * `summary`: A description for this route.
  * `operationId`: An **unique** name for this action.
  * `tags`: First argument is the API we're using e.g. 'Store API' or 'API', the second is the name of the group where this action is grouped.
* `@OA\Parameter`: Parameter for our route. 'Api-Basic-Parameters' is used for the abstraction of a criteria which adds parameters like sort, post-filters, ...
* `@OA\Response`:
  * `response`: HTTP status code of the response.
  * `description`: A description for the response, e.g. Successfully saved.

The last part of our response is the content, using an `@OA\JsonContent` annotation with type `Object`, since we are returning a JSON object. Within the JSON content, we have three properties annotated with `@OA\Property`. The first property is the amount of entities we retrieved. The next property contains the aggregations of our criteria.

Finally, we have our retrieved entities, using an `@OA\Items` annotation which references to `#/components/schemas/` and the technical name of our entity, so in our case `#/components/schemas/swag_example`. This is used to generate the schema according to our definition.

### Route response

After we have created our route, we need to create the mentioned `ExampleRouteResponse`. This class should extend from `Shopware\Core\System\SalesChannel\StoreApiResponse`. In this class we have a property `$object` of type `Shopware\Core\Framework\DataAbstractionLayer\Search\EntitySearchResult`. The class constructor has one argument `EntitySearchResult`, which was passed to it by our `ExampleRoute`. The constructor calls the parent constructor with the parameter `$object` which sets the value for our object property. Finally, we add a method `getExamples` in which we return our entity collection that we got from the object.

{% code title="<plugin root>/src/Core/Content/Example/SalesChannel/ExampleRouteResponse.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use Shopware\Core\Framework\DataAbstractionLayer\Search\EntitySearchResult;
use Shopware\Core\System\SalesChannel\StoreApiResponse;
use Swag\BasicExample\Core\Content\Example\ExampleCollection;

class ExampleRouteResponse extends StoreApiResponse
{
    protected EntitySearchResult $object;

    public function __construct(EntitySearchResult $object)
    {
        parent::__construct($object);
    }

    public function getExamples(): ExampleCollection
    {
        /** @var ExampleCollection $collection */
        $collection = $this->object->getEntities();

        return $collection;
    }
}
```
{% endcode %}

## Register route

The last thing we need to do now is to tell Shopware how to look for new routes in our plugin. This is done with a `routes.xml` file at `<plugin root>/src/Resources/config/` location. Have a look at the official [Symfony documentation](https://symfony.com/doc/current/routing.html) about routes and how they are registered.

{% code title="<plugin root>/src/Resources/config/routes.xml" %}
```markup
<?xml version="1.0" encoding="UTF-8" ?>
<routes xmlns="http://symfony.com/schema/routing"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://symfony.com/schema/routing
        https://symfony.com/schema/routing/routing-1.0.xsd">

    <import resource="../../Core/**/*Route.php" type="annotation" />
</routes>
```
{% endcode %}

## Check route via Symfony debugger

To check, if your route was registered correctly, you can use the [Symfony route debugger](https://symfony.com/doc/current/routing.html#debugging-routes).

{% code title="" %}
```bash
$ ./bin/console debug:router store-api.example.search
```
{% endcode %}

## Check route in Swagger

To check, if your OpenApi Annotations are correct, you'll have to check Swagger. To do this, go to the following route: `/store-api/_info/swagger.html`.

Your generated request and response could look like this:

### Request

```javascript
{
  "page": 0,
  "limit": 0,
  "term": "string",
  "filter": [
    {
      "type": "string",
      "field": "string",
      "value": "string"
    }
  ],
  "sort": [
    {
      "field": "string",
      "order": "string",
      "naturalSorting": true
    }
  ],
  "post-filter": [
    {
      "type": "string",
      "field": "string",
      "value": "string"
    }
  ],
  "associations": {},
  "aggregations": [
    {
      "name": "string",
      "type": "string",
      "field": "string"
    }
  ],
  "query": [
    {
      "score": 0,
      "query": {
        "type": "string",
        "field": "string",
        "value": "string"
      }
    }
  ],
  "grouping": [
    "string"
  ]
}
```

### Response

```javascript
{
  "total": 0,
  "aggregations": {},
  "elements": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "active": true,
      "createdAt": "2021-03-24T13:18:46.503Z",
      "updatedAt": "2021-03-24T13:18:46.503Z"
    }
  ]
}
```

