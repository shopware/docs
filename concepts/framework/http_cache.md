# HTTP Cache

The HTTP cache allows you to cache responses of the shop system. This means that the next time the same page is requested, the answer can be returned much faster. While the general concept of a cache is quite simple, there are many details to think of in a complex system like a shopping cart. For that reason, the following overview might come in handy for you.

## HTTP cache setup

If you think about a simple web page, you will usually have a setup like this:

* A user that requests a page
* The web application generates a result

So whenever a user requests a page, Shopware will create a result page individually. If you have many users requesting the same pages, it makes sense to have an additional instance in between:

* A user that requests a page
* A reverse proxy cache
* The web application generates a result

![](../../.gitbook/assets/reverse-proxy.svg)

The reverse proxy is located between the user and the web application and takes care of any requests to the web application. If a user requests a page that has been requested before, chances are that the reverse proxy can just hand out the same result as before, so the web application will not even be asked.

So a reverse proxy is basically a thin layer between the user and the web application that will try to avoid load on the web application by caching the results. Whenever the web application generates a response for a request, the reverse proxy will save the request and the response to cache storage. Next time the same request comes in, the response will most probably be the same.

## How does it work?

Caching is always about questions like:

* Did I return the same page before?
* Did the content of the page change meanwhile?
* Is this page the same for all customers or will the current customer get another result \(e.g. price\)?

The Shopware HTTP cache has a variety of mechanisms to answer these questions.

## When will the page be cached?

The called route needs an `@HttpCache` annotation. Examples for this can be found in the [ProductController](https://github.com/shopware/platform/blob/v6.3.4.1/src/Storefront/Controller/ProductController.php#L86).

```php
/**
 * @Since("6.3.3.0")
 * @HttpCache()
 * @Route("/detail/{productId}", name="frontend.detail.page", methods={"GET"})
 */
public function index(SalesChannelContext $context, Request $request): Response
```

### Cache Cookies

Shopware uses several client cookies to differentiate the requests. This allows us to save the cache differentiated between clients, e.g., different customer groups or different active rules.

#### sw-currency

This cookie will be set when the non-logged-in customer with an empty cart changes the current currency. Why does Shopware need a separate cookie for currency? It allows us to maximize the cache hits for non-logged-in customers as we separate the cache as less as possible.

#### sw-cache-hash

This cookie replaces the `sw-currency` cookie and contains the active rules and active currency. This cookie will be set when the active rules do not match the default anymore \(e.g., customer login/items in cart\).

#### sw-states

This cookie describes the current session in simple tags like `cart-filled` and `logged-in`. When the client tags fit the response `sw-invalidation-states` header, the cache will be skipped.

An example of usage for this feature is to save the cache for logged-in customers only.

## Cache invalidation

As soon as a response has been defined as cacheable and the response is written to the cache, it is tagged accordingly. For this purpose, the core uses all cache tags generated during the request or loaded from existing cache entries. The cache invalidation of a Storefront controller route is controlled by the cache invalidation of the Store API routes.

For more information about Store API cache invalidation, you can refer to the [Add Cache for Store API Route Guide](../../guides/plugins/plugins/framework/store-api/add-caching-for-store-api-route).

This is because all data loaded in a Storefront controller, is loaded in the core via the corresponding Store API routes and provided with corresponding cache tags. So the tags of the HTTP cache entries we have in the core consist of the sum of all Store API tags generated or loaded during the request. Therefore, the invalidation of a controller route is controlled over the Store API cache invalidation.
