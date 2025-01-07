---
nav:
  title: Add store API route
  position: 10

---

# Add Store API route

## Overview

In this guide you will learn how to add a custom store API route. In this example, we will create a new route called `ExampleRoute` that searches entities of type `swag_example`. The route will be accessible under `/store-api/example`.

## Prerequisites

In order to add your own Store API route for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../../plugin-base-guide).

You also should have a look at our [Adding custom complex data](../data-handling/add-custom-complex-data) guide, since this guide is built upon it.

## Add Store API route

As you may already know from the [Adjusting a service](../../plugin-fundamentals/adjusting-service) guide, we use abstract classes to make our routes more decoratable.

::: warning
All fields that should be available through the API require the flag `ApiAware` in the definition.
:::

### Create abstract route class

First of all, we create an abstract class called `AbstractExampleRoute`. This class has to contain a method `getDecorated` and a method `load` with a `Criteria` and `SalesChannelContext` as parameter. The `load` method has to return an instance of `ExampleRouteResponse`, which we will create later on.

```php
// <plugin root>/src/Core/Content/Example/SalesChannel/AbstractExampleRoute.php
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

### Create route class

Now we can create a new class `ExampleRoute` which uses our previously created `AbstractExampleRoute`.

```php
// <plugin root>/src/Core/Content/Example/SalesChannel/ExampleRoute.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Plugin\Exception\DecorationPatternException;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['store-api']])]
class ExampleRoute extends AbstractExampleRoute
{
    protected EntityRepository $exampleRepository;

    public function __construct(EntityRepository $exampleRepository)
    {
        $this->exampleRepository = $exampleRepository;
    }

    public function getDecorated(): AbstractExampleRoute
    {
        throw new DecorationPatternException(self::class);
    }

    #[Route(path: '/store-api/example', name: 'store-api.example.search', methods: ['GET','POST'], defaults: ['_entity' => 'swag_example'])]
    public function load(Criteria $criteria, SalesChannelContext $context): ExampleRouteResponse
    {
        return new ExampleRouteResponse($this->exampleRepository->search($criteria, $context->getContext()));
    }
}
```

As you can see, our class has the attribute `Route` and the defined _routeScope `store-api`.

In our class constructor we've injected our `swag_example.repository`. The method `getDecorated()` must throw a `DecorationPatternException` because it has no decoration yet and the method `load`, which fetches the data, returns a new `ExampleRouteResponse` with the respective repository search result as argument.

The `_entity` in the defaults of the `Route` attribute just marks the entity that the api will return.

### Register route class

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Core\Content\Example\SalesChannel\ExampleRoute" >
            <argument type="service" id="swag_example.repository"/>
        </service>
    </services>
</container>
```

### Route response

After we have created our route, we need to create the mentioned `ExampleRouteResponse`. This class should extend from `Shopware\Core\System\SalesChannel\StoreApiResponse`, consequently inheriting a property `$object` of type `Shopware\Core\Framework\DataAbstractionLayer\Search\EntitySearchResult`. The `StoreApiResponse` parent constructor takes accepts one argument `$object` in order to set the value for the `$object` property (currently we provide this parameter our `ExampleRoute`). Finally, we add a method `getExamples` in which we return our entity collection that we got from the object.

```php
// <plugin root>/src/Core/Content/Example/SalesChannel/ExampleRouteResponse.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\SalesChannel;

use Shopware\Core\Framework\DataAbstractionLayer\Search\EntitySearchResult;
use Shopware\Core\System\SalesChannel\StoreApiResponse;
use Swag\BasicExample\Core\Content\Example\ExampleCollection;

/**
 * Class ExampleRouteResponse
 * @property EntitySearchResult<ExampleCollection> $object
 */
class ExampleRouteResponse extends StoreApiResponse
{
    public function getExamples(): ExampleCollection
    {
        return $this->object->getEntities();
    }
}
```

## Register route

The last thing we need to do now is to tell Shopware how to look for new routes in our plugin. This is done with a `routes.xml` file at `<plugin root>/src/Resources/config/` location. Have a look at the official [Symfony documentation](https://symfony.com/doc/current/routing.html) about routes and how they are registered.

```xml
// <plugin root>/src/Resources/config/routes.xml
<?xml version="1.0" encoding="UTF-8" ?>
<routes xmlns="http://symfony.com/schema/routing"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://symfony.com/schema/routing
        https://symfony.com/schema/routing/routing-1.0.xsd">

    <import resource="../../Core/**/*Route.php" type="attribute" />
</routes>
```

## Check route via Symfony debugger

To check, if your route was registered correctly, you can use the [Symfony route debugger](https://symfony.com/doc/current/routing.html#debugging-routes).

```bash
// 
$ ./bin/console debug:router store-api.example.search
```

## Add route to Swagger

To add the route to the Swagger page, a JSON file is needed in a specific [format](https://swagger.io/specification/#paths-object). It contains information about the paths, methods, parameters, and more. You must place the JSON file in `<plugin root>/src/Resources/Schema/StoreApi/` so the shopware internal OpenApi3Generator can find it (for Admin API endpoints, use `AdminApi`).

```javascript
// <plugin root>/src/Resources/Schema/StoreApi/example.json
{
  "openapi": "3.0.0",
  "info": [],
  "paths": {
    "/example": {
      "post": {
        "tags": [
          "Example",
          "Endpoints supporting Criteria "
        ],
        "summary": "Example entity endpoint",
        "description": "Returns a list of example entities.",
        "operationId": "example",
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "allOf": [
                  {
                    "$ref": "#/components/schemas/Criteria"
                  }
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Returns a list of example entities.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Example"
                }
              }
            }
          }
        },
        "security": [
          {
            "ApiKey": []
          }
        ]
      }
    }
  }
}
```

### Check route in Swagger

To check, if your file has the correct format, you'll have to check Swagger. To do this, go to the following route: `/store-api/_info/swagger.html`.

Your generated request and response could look like this:

#### Request

```json
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

#### Response

```json
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

## Make the route available for the Storefront

If you want to access the functionality of your route also from the Storefront you need to make it available there by adding a custom [Storefront controller](../../storefront/add-custom-controller) that will wrap your just created route.

```php
// <plugin root>/src/Storefront/Controller/ExampleController.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Swag\BasicExample\Core\Content\Example\SalesChannel\AbstractExampleRoute;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['storefront']])]
class ExampleController extends StorefrontController
{
    private AbstractExampleRoute $route;

    public function __construct(AbstractExampleRoute $route)
    {
        $this->route = $route;
    }

    #[Route(path: '/example', name: 'frontend.example.search', methods: ['GET', 'POST'], defaults: ['XmlHttpRequest' => 'true', '_entity' => 'swag_example'])]
    public function load(Criteria $criteria, SalesChannelContext $context): Response
    {
        return $this->route->load($criteria, $context);
    }
}
```

This looks very similar then what we did in the `ExampleRoute` itself. The main difference is that this route is registered for the `storefront` route scope.
Additionally, we also use the `'XmlHttpRequest' => true` config option on the route, this will enable us to request that route via AJAX-calls from the Storefronts javascript.

### Register the Controller

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Core\Content\Example\SalesChannel\ExampleRoute" >
            <argument type="service" id="swag_example.repository"/>
        </service>
    
        <service id="Swag\BasicExample\Storefront\Controller\ExampleController" >
            <argument type="service" id="Swag\BasicExample\Core\Content\Example\SalesChannel\ExampleRoute"/>
            <call method="setContainer">
                <argument type="service" id="service_container"/>
            </call>
        </service>
    </services>
</container>
```

### Register Storefront api-route

We need to tell Shopware that there is a new API-route for the `storefront` scope by extending the `routes.xml` to also include all Storefront controllers.

```xml
// <plugin root>/src/Resources/config/routes.xml
<?xml version="1.0" encoding="UTF-8" ?>
<routes xmlns="http://symfony.com/schema/routing"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://symfony.com/schema/routing
        https://symfony.com/schema/routing/routing-1.0.xsd">

    <import resource="../../Core/**/*Route.php" type="attribute" />
    <import resource="../../Storefront/**/*Controller.php" type="attribute" />
</routes>
```

### Requesting your route from the Storefront

You can request your new route from the Storefront from inside a [custom javascript plugin](../../storefront/add-custom-javascript).
We expect that you have followed that guide and know how to register your custom javascript plugin in the Storefront.

When you want to request your custom route you can use the existing `http-client` service for that.

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
const { PluginBaseClass } = window;

export default class ExamplePlugin extends PluginBaseClass {
    async requestCustomRoute() {
        const response = await fetch('/example', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                limit: 10,
                offset: 0,
            }),
        });
        
        if (!response.ok) {
            throw new Error('Request failed');
        }

        const data = await response.json();

        console.log(data);
    }
}
```
