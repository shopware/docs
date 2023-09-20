# Add Caching to Custom Controller

## Overview

In this guide you will learn how to define a controller route as cacheable for the HTTP cache.

## Prerequisites

In order to add a cache to an own controller route, you first need a plugin with a controller. Therefore, you can refer to the [Add custom controller guide](./add-custom-controller.md).

## Define the controller as cacheable

To define a controller route as cacheable, it must be annotated with `@HttpCache()`. Once this annotation is set, the core takes care of everything else. If the route is called several times in the same state, a response is generated only for the first request and the second request gets the same response as the first one. It is also possible to exclude certain states from the cache. Shopware sets two different user states to which the HTTP cache reacts:

* state: `logged-in` - means that the user is logged in.
  
* state: `cart-filled` - means that there are products in the shopping cart.

If the controller route is not to be cached for one or both of these states, the annotation can be defined as follows: `@HttpCache(states={"cart-filled", "logged-in"})`

```php
// <plugin root>/src/Storefront/Controller/ExampleController.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Storefront\Controller;

use Shopware\Storefront\Framework\Cache\Annotation\HttpCache;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route(defaults={"_routeScope"={"storefront"}})
 */
class ExampleController extends StorefrontController
{
   /**
    * @HttpCache()
    * @Route("/example", name="frontend.example.example", methods={"GET"})
    */
    public function showExample(): Response
    {
        return $this->renderStorefront('@SwagBasicExample/storefront/page/example/index.html.twig', [
            'example' => 'Hello world'
        ]);
    }
}
```

## Cache invalidation

As soon as a controller route has been defined as cacheable, and the corresponding response is written to the cache, it is tagged accordingly. For this purpose, the core uses all cache tags generated during the request or loaded from existing cache entries. The cache invalidation of the Storefront controller routes is controlled by the cache invalidation of the store API routes.

For more information about Store API cache invalidation, you can refer to the [Add Cache for Store Api Route Guide](../framework/store-api/add-caching-for-store-api-route.md).

This is because all data loaded in a controller route, is loaded in the core via the corresponding Store API routes and provided with corresponding cache tags. So the tags of the HTTP cache entries we have in the core consists of the sum of all store api tags generated or loaded during the request. Therefore the invalidation of a controller route that loads all data via the store API, no additional invalidation needs to be written.
