---
nav:
  title: External HTTP Cache
  position: 40

---

# External HTTP Cache

## Overview

An external HTTP cache is a cache server placed before the web shop.
If you are not familiar with HTTP caching, please refer to the [HTTP cache](../../../concepts/framework/http_cache) concept.
The external HTTP cache needs the following capabilities to function fully with Shopware:

* Able to differentiate the request with multiple cookies
* Allow tagging the cache items with surrogate keys
* Allow invalidating the cache items by surrogate keys

::: info
In this guide, we will use Varnish as an example for HTTP cache.
:::

## Varnish

### The example Setup with Varnish

![Http cache](../../../../assets/hosting-infrastructure-reverseHttpCache.svg)

### Shopware Varnish Docker image

Feel free to check out the [Shopware Varnish Docker image](https://github.com/shopware/varnish-shopware) for a quick start.
It contains the Shopware default VCL (Varnish Configuration Language). The containing VCL is for the usage with `xkeys`.

### Configure Shopware

First, we need to activate the reverse proxy support in Shopware.
To enable it, we need to create a new file in `config/packages/storefront.yaml`:

```yaml
# Be aware that the configuration key changed from storefront.reverse_proxy to shopware.http_cache.reverse_proxy starting with Shopware 6.6
shopware:
    http_cache:
        reverse_proxy:
            enabled: true
            ban_method: "BAN"
            # This needs to point to your varnish hosts
            hosts: [ "http://varnish" ]
            # Max parallel invalidations at the same time for a single worker
            max_parallel_invalidations: 3
            use_varnish_xkey: true
```

Also set `SHOPWARE_HTTP_CACHE_ENABLED=1` in your `.env` file.


#### Trusted proxies

For the most part, using Symfony and Varnish doesn't cause any problem.
But, when a request passes through a proxy, certain request information is sent using either the *standard Forwarded* header or *X-Forwarded* headers.
For example, instead of reading the `REMOTE_ADDR` header (which will now be the IP address of your reverse proxy), the user's true IP will be stored in a standard Forwarded: for="..." header or an *X-Forwarded-For* header.

If you don't configure Symfony to look for these headers, you will get incorrect information about the client's IP address.
Whether or not the client connects via HTTPS, the client's port and the hostname are requested.

Go through [Proxies](https://symfony.com/doc/current/deployment/proxies.html) section for more information.

### Configure Varnish

Varnish `XKey` is a cache key module that allows you to use Varnish with surrogate keys.
It is a module not included in the default Varnish installation.
It is available for Varnish 6.0 or higher.

Checkout the official Varnish installation guide [here](https://github.com/varnish/varnish-modules#installation).

And also needs to be enabled in the `config/packages/shopware.yml` file:

```yaml
# Be aware that the configuration key changed from storefront.reverse_proxy to shopware.http_cache.reverse_proxy starting with Shopware 6.6
shopware:
  http_cache:
      reverse_proxy:
        enabled: true
        use_varnish_xkey: true
        hosts:
          - 'varnish-host'
```

<PageRef page="https://github.com/shopware/varnish-shopware/blob/main/rootfs/etc/varnish/default.vcl" title="Varnish Configuration" target="_blank" />

Make sure to replace the `__XXX__` placeholders with your actual values.

### Soft Purge vs Hard Purge

The default configuration Varnish uses hard purges, so when you update a product, the page will be removed from the cache and the next request takes longer because the cache is empty.
To avoid this, you can use soft purges.
Soft purge keeps the old page in case and serves it still to the clients and refreshes the cache in the background.
This way the client gets **always** a cached page and the cache is updated in the background.

To enable soft purge, you need to change the varnish configuration.

```diff
-set req.http.n-gone = xkey.purge(req.http.xkey);
+set req.http.n-gone = xkey.softpurge(req.http.xkey);
```

### Debugging

The default configuration removes all headers except the `Age` header, which is used to determine the cache age.
If you see only `0` as the `Age` header, it means that the cache is not working.

This problem is mostly caused as the application didn't set `Cache-Control: public` header.
To check this you can use `curl` against the upstream server:

```bash
curl -vvv -H 'Host: <sales-channel-domain>' <app-server-ip> 1> /dev/null
```

and you should get a response like:

```text
< HTTP/1.1 200 OK
< Cache-Control: public, s-maxage=7200
< Content-Type: text/html; charset=UTF-8
< Xkey: theme.sw-logo-desktop, ...
```

If you don't see the `Cache-Control: public` header or the `Xkey` header, you need to check the application configuration that you really have enabled the reverse proxy mode.

For more details, please refer to the [Varnish documentation](https://www.varnish-software.com/developers/tutorials/logging-cache-hits-misses-varnish/) on logging cache hits and misses.

## Fastly

Fastly is supported since Shopware 6.4.11.0 is out-of-the-box with some configurations.
To enable it, we need to create a new file in `config/packages/storefront.yaml`

```yaml
# Be aware that the configuration key changed from `storefront.reverse_proxy` to `shopware.http_cache.reverse_proxy` starting with Shopware 6.6
shopware:
  http_cache:
    reverse_proxy:
        enabled: true
        fastly:
          enabled: true
          api_key: '<personal-token-from-fastly>'
          service_id: '<service-id>'
```

### Fastly soft-purge

::: warning
This feature has been introduced with Shopware version 6.4.15.0
:::

By default, the cache will be immediately purged and the next requesting user will get a slow response as the cache has been deleted.
On soft purge, the user still gets the cached response after the purge, but in the configured time interval, the cache will be refreshed.
This makes sure that the client gets the fastest response possible.

```yaml
# Be aware that the configuration key changed from `storefront.reverse_proxy` to `shopware.http_cache.reverse_proxy` starting with Shopware 6.6
shopware:
  http_cache:
    # Allow to serve the out-dated cache for 300 seconds
    stale_while_revalidate: 300
    # Allow to serve the out-dated cache for an hour if the origin server is offline
    stale_if_error: 3600
    reverse_proxy:
        enabled: true
        fastly:
          enabled: true
          api_key: '<personal-token-from-fastly>'
          service_id: '<service-id>'
          soft_purge: '1'
```

### Fastly VCL Snippets

You can use the [Deployment Helper to automatically deploy Fastly VCL Snippets and keep them up to date](../installation-updates//deployments/deployment-helper.md).

For manual deployment, you can find the VCL Snippets here:

<PageRef page="https://github.com/shopware/recipes/blob/main/shopware/fastly-meta/6.7/config/fastly/deliver/default.vcl"/>

<PageRef page="https://github.com/shopware/recipes/blob/main/shopware/fastly-meta/6.7/config/fastly/fetch/default.vcl"/>

<PageRef page="https://github.com/shopware/recipes/blob/main/shopware/fastly-meta/6.7/config/fastly/hash/default.vcl"/>

<PageRef page="https://github.com/shopware/recipes/blob/main/shopware/fastly-meta/6.7/config/fastly/hit/default.vcl"/>

<PageRef page="https://github.com/shopware/recipes/blob/main/shopware/fastly-meta/6.7/config/fastly/recv/default.vcl"/>

## Cache Invalidations

The Reverse Proxy Cache shares the same invalidation mechanism as the Object Cache and has the same tags.
So, when a product is invalidated, the object cache and the HTTP cache will also be invalidated.

There are a few different cache clearing commands:

1. `bin/console cache:clear` - Clears and warms up the application cache (In versions before 6.7 this command also cleared the HTTP cache)
2. `bin/console cache:clear:all` - Clears everything, including application cache, cache pools and the HTTP cache (Since version 6.6.8)
3. `bin/console cache:clear:http` - Clears the reverse proxy cache if enabled, if not it clears the `http` cache pool (Since version 6.6.10)
4. `bin/console cache:pool:clear --all` - Clears only the object cache (Useful for when you don't want to clear the http cache, pre version 6.6.10)

If you only want to clear the http cache, use `bin/console cache:clear:http`

::: warning
`bin/console cache:clear` will also clear the HTTP cache.
If this is not intended, you should manually delete the `var/cache` folder.
The object cache can be cleared with `bin/console cache:pool:clear --all` explicitly.
:::
