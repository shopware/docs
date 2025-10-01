---
nav:
  title: Composable-Frontends Performance
  position: 10

---

# Composable-Frontends Performance

## Shopware Backend caching

The current versions of Shopware rely heavily on `POST` requests for `/store-api/`.  
`POST` requests are by design not cacheable, so Fastly simply passes them to the backend cluster without even trying to cache them.

A temporary [plugin](https://github.com/shopwareLabs/SwagStoreApiCache) has been developed.  With this workaround, Fastly can cache some of the `/store-api/` `POST` requests.

This plugin includes new Fastly snippets that must be used instead of the usual ones.

The plugin includes [a few routes](https://github.com/shopwareLabs/SwagStoreApiCache/blob/trunk/src/Listener/StoreAPIResponseListener.php#L57) which will become automatically cacheable.

If you need to cache additional routes, it can be done via the admin config: `SwagStoreAPICache.config.additionalCacheableRoutes`.

As usual, ensure [soft-purges](https://developer.shopware.com/docs/guides/hosting/infrastructure/reverse-http-cache.html#fastly-soft-purge) are enabled.

Please note that we're actively working on moving the `store-api` requests from `POST` to `GET` to make them cacheable, so the use of this plugin would no longer be required.  
More details in the [Epic](https://github.com/shopware/shopware/issues/7783).

## Composable Frontend caching

To get the best performance, Frontend caching must be enabled.

There are a few steps to get there:

1. Configure a Fastly service on top of each Frontend. It can be one Fastly service per Frontend, or it can be a single Fastly service with multiple domains and hosts configured.

2. Update `nuxt.config.ts` so `routesRules`, using Incremental Static Regeneration (`ISR`), have the required cache headers.
Example:

```ts
'/': {
      		isr: 60 * 60 * 24,
      		headers: {
        		'cache-control': 'public, s-maxage=3600, stale-while-revalidate=1800'
      		}
    	},
'/**': {
      		isr: 60 * 60 * 24,
      		headers: {
        		'cache-control': 'public, s-maxage=3600, stale-while-revalidate=1800'
      		}
    	},
```

`s-maxage` and `stale-while-revalidate` can be adjusted.  
`s-maxage` represents how long in seconds the content will be cached on Fastly.  
`stale-while-revalidate` represents how long a stale page (aka an expired page) can be kept and served, so when a client requests this page, the stale object is served while a request to update it is done in the background, so the next client will have an updated version of the page.

::: Note

The cache invalidation process is only on the Fastly Backend service.
The Shopware instance is not "aware" of the Frontend instance. It cannot trigger cache invalidation. Items will remain in cache for the `s-maxage` duration.

:::

## Get rid of the OPTIONS requests (CORS)

When using a different domain for backend requests, browsers are forced to send `OPTIONS` requests. Those requests, also named `preflight` requests, are due to `CORS` checks. Every time the browser needs to send a request to the backend, it must first confirm it's authorized to do so.

`OPTIONS` requests are by default not cacheable as the responses may vary depending on the request's headers.
There is a possibility to include an `Access-Control-Max-Age` header in the `OPTIONS` responses, so it forces the browser to cache the answer for a longer period than the default 5 seconds.

But the recommended action is to remove those `CORS` checks completely.
To do so, all the requests to the Shopware backend must be sent on the same domain as the Frontend, so the browser only sees one single domain.

For this, the Frontend Fastly service can be configured to serve both the Frontend and the Backend requests.

The config is pretty simple. With the additional host, the logic is only four lines of code:

```vcl
if (req.url.path ~ "^/store-api/") { 
  set req.http.host = "backend.mydomain.com"; 
  set req.backend = F_Backend__Shopware_instance_; 
  return (pass);
}
```

The `return (pass)` is very important. We must not add a cache layer on the Frontend Fastly service to avoid invalidation issues. The Backend Fastly service remains the one responsible for caching.

## Optimize the Fastly Backend hit-ratio

Once an item has been set into the cart, a new cookie named `sw-cache-hash` is sent.
The default VCL hash snippet includes the content of this cookie in the hash (aka the cache key).
It means that the first backend request that was cached will no longer be cached when requested once an item has been added to the cart.

If rules based pricing is not used in the Shopware instance, the following section can be commented out in the VCL hash snippet:

```vcl
# Consider Shopware http cache cookies
#if (req.http.cookie:sw-cache-hash) {
#	set req.hash += req.http.cookie:sw-cache-hash;
#} elseif (req.http.cookie:sw-currency) {
#	set req.hash += req.http.cookie:sw-currency;
#}
```

## Checks the results using the Developer Tools

Once everything is configured, check for the `Age` header to confirm the responses are cached.
