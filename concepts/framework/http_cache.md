---
nav:
  title: HTTP Cache
  position: 50

---

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

![Http cache concept](../../assets/concepts-framework-httpCache.svg)

The reverse proxy is located between the user and the web application and takes care of any requests to the web application. If a user requests a page that has been requested before, chances are that the reverse proxy can just hand out the same result as before, so the web application will not even be asked.

So a reverse proxy is basically a thin layer between the user and the web application that will try to avoid load on the web application by caching the results. Whenever the web application generates a response for a request, the reverse proxy will save the request and the response to cache storage. Next time the same request comes in, the response will most probably be the same.

## How does it work?

Caching is always about questions like:

* Did I return the same page before?
* Did the content of the page change meanwhile?
* Is this page the same for all customers or will the current customer get another result \(e.g. price\)?

The Shopware HTTP cache has a variety of mechanisms to answer these questions.

## When will the page be cached?

Set the defaults value of the `_httpCache` key to `true`. Examples for this can be found in the [ProductController](https://github.com/shopware/shopware/blob/trunk/src/Storefront/Controller/ProductController.php#L62).

```php
#[Route(path: '/detail/{productId}', name: 'frontend.detail.page', methods: ['GET'], defaults: ['_httpCache' => true])]
public function index(SalesChannelContext $context, Request $request): Response
```

### Determining the cache key

Determining the cache key is one of the most important tasks of the HTTP cache. The cache key is used to identify a request and its corresponding response. If the same request comes in again, the cache key will be used to look up the corresponding response in the cache storage.
For a dynamic system like Shopware, the cache key needs to take the application state into account, as the response to the same request might differ e.g., based on the tax state of the currently logged-in customer.
At the same time, it needs to be possible to generate the cache key directly from the request to support reverse proxy caches, where the caching is handled by a standalone application that has no access to Shopware's internal application state.
Shopware generates a `cache-hash` that encodes the application state and this hash is passed alongside every request and response, the caching component will then generate the exact cache key based on the `cache-hash`.

Concretely Shopware uses Cookies to store the `cache-hash` as part of the request/response structure. The `cache-hash` describes the current state of the customer "session", every parameter that leads to different responses being generated (e.g. tax-states, matched rules) should be taken into account for the `cache-hash` to ensure that every user sees the correct page.
However, it is equally important to keep the number of different cache entries/permutations as low as possible to maximize the cache hits.
The reason the `cache-hash` is stored as a cookie is that it needs to be sent with every request and can change on any response sent from shopware.
The client needs to send the latest value back to shopware on every request to ensure the correct cache entry is used. This is needed as the cache is resolved before the request is handled by shopware itself.
To allow reverse proxies to cache based on the application state, the information needs to be present on every request. The reverse proxies (e.g. Fastly or Varnish) or the symfony cache component use the provided `cache-hash` as part of the cache key they generate for every request, thus they can differentiate the cache entries for the same request based on the application state.

#### sw-cache-hash

This cookie contains the hash of all cache-relevant information (e.g. is the user logged-in, what tax state and what currency do they use, which cache-relevant rules have matched).
This is the cookie that stores the `cache-hash`mentioned above.
This cookie will be set as soon as the application state differs from the default, which is: no logged in customer, the default currency and an empty cart.

If you want to know how to manipulate and control the `cache-hash`, you can refer to the [Plugin caching guide](../../guides/plugins/plugins/framework/caching/index.md#http-cache).

#### sw-currency

**Note:** The currency cookie is deprecated and will be removed in v6.8.0.0, as the currency information is already part of the `sw-cache-hash` cookie.
This cookie will be set when the non-logged-in customer with an empty cart changes the current currency. Why does Shopware need a separate cookie for currency? It allows us to maximize the cache hits for non-logged-in customers as we separate the cache as less as possible.

#### sw-states

**Note:** The states cookie is deprecated and will be removed in v6.8.0.0, as the state information is already part of the `sw-cache-hash` cookie and different caches are used for the different states.
If you want to disable the cache in certain circumstances, you can do so via the `sw-cache-hash` cookie as well.
This cookie describes the current session in simple tags like `cart-filled` and `logged-in`. When the client tags fit the response `sw-invalidation-states` header, the cache will be skipped.

An example of usage for this feature is to save the cache for logged-in customers only.

## Cache invalidation

As soon as a response has been defined as cacheable and the response is written to the cache, it is tagged accordingly. For this purpose, the core uses all cache tags generated during the request or loaded from existing cache entries. The cache invalidation of a Storefront controller route is controlled by the cache invalidation of the Store API routes.

For more information about Store API cache invalidation, you can refer to the [Caching Guide](../../guides/plugins/plugins/framework/caching/index.md).

This is because all data loaded in a Storefront controller, is loaded in the core via the corresponding Store API routes and provided with corresponding cache tags. So the tags of the HTTP cache entries we have in the core consist of the sum of all Store API tags generated or loaded during the request. Therefore, the invalidation of a controller route is controlled over the Store API cache invalidation.
