# REST API

You can download a plugin showcasing the topic [here](../example-plugins/B2bRestApi.zip).

We use swagger.io for the documentation of our B2B-Suite endpoints. The created [swagger.json](https://gitlab.com/shopware/shopware/enterprise/b2b/-/blob/minor/swagger.json) file can be displayed with [swagger ui](http://swagger.io/swagger-ui/).

## Table of contents

* [Description](#description)
* [A Simple Example](#a-simple-example)
* [Adding the route](#adding-the-route)
* [Complex routes](#complex-routes)

## Description

The B2B-Suite comes with its own extension to the REST-API. Contrary to Shopware own implementation that makes heavy use 
of the Doctrine ORM the B2B-Suite reuses the same services defined for the Storefront.

## A Simple Example

A REST-API Controller is just a plain old PHP-Class, registered to the DIC. 
An action is a public method suffixed with `Action`. 
It always gets called with the request implementation derived from Shopware default `Shopware\B2B\Common\MvcExtension\Request` as a parameter.

```php
<?php declare(strict_types=1);

namespace My\Namespace;

use Shopware\B2B\Common\MvcExtension\Request;

class MyApiController
{
    public function helloAction(Request $request): array
    {
        return ['message' => 'hello']; // will automatically be converted to JSON
    }
}
```

## Adding the route

Contrary to the default Shopware API, the B2B API provides deeply nested routes. All routes can be found in `http://my-shop.de/api/b2b`. 
If you want to register your own routes you have to add a `RouteProvider` to the routing service.

First we create the routing provider containing all routing information. Routes themselves are defined as simple arrays, just like this:

```php
<?php declare(strict_types=1);

namespace My\Namespace\DependencyInjection;

use Shopware\B2B\Common\Routing\RouteProvider;

class MyApiRouteProvider implements RouteProvider
{
    public function getRoutes(): array
    {
        return [
            [
                'GET', // the HTTP method
                '/my/hello', // the sub-route will be concatenated to http://my-shop.de/api/b2b/my/hello
                'my.api_controller', // DIC controller id
                'hello' // action method name
            ],
        ];
    }
}
```

Now the route provider and the controller are registered to the DIC.

```xml
<service id="my.controller" class="My\Namespace\MyApiController"/>

<service id="my.api_route_provider" class="My\Namespace\DependencyInjection\MyApiRouteProvider">
    <tag name="b2b_common.rest_route_provider"/>
</service>
```

Notice that the route provider is tagged as a `b2b_common.rest_route_provider`, this tag triggers that the route is registered.

## Complex routes

The used route parser is [FastRoute](https://github.com/nikic/FastRoute#defining-routes) which supports more powerful features that can also be used by the B2B API. 
Please take a look at the linked documentation to learn more about placeholders and placeholder parsing.

If you want to use parameters, you have to define an order in which the parameters should be passed to the action:

```php
[
    'GET', // the HTTP method
    '/my/hello/{name}', // the sub-route will be concatenated to http://my-shop.de/api/b2b/my/hello/world
    'my.api_controller', // DIC controller id
    'hello' // action method name,
    ['name'] // define name as first argument
]
```

And now you can use the placeholders value as a parameter:

```php
<?php declare(strict_types=1);

public function helloAction(string $name, Request $request)
{
    return ['message' => 'hello ' . $name]; // will automatically be converted to JSON
}
```