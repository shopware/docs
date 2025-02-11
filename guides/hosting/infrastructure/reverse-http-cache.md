---
nav:
  title: Reverse HTTP Cache
  position: 40

---

# Reverse HTTP Cache

## Overview

A reverse HTTP cache is a cache server placed before the web shop. If you are not familiar with HTTP caching, please refer to the [HTTP cache](../../../concepts/framework/http_cache) concept. The reverse http cache needs the following capabilities to function with Shopware fully:

* Able to differentiate the request with multiple cookies
* Allow clearing the cache using a web request for a specific site or with `/` for all pages

::: info
In this guide, we will use Varnish as an example for HTTP cache.
:::

### The example Setup with Varnish

::: warning
This setup is compatible with Shopware version 6.4 and higher
:::

![Http cache](../../../assets/hosting-infrastructure-reverseHttpCache.svg)

### Shopware Varnish Docker image

Feel free to check out the [Shopware Varnish Docker image](https://github.com/shopware/varnish-shopware) for a quick start. It contains the Shopware default VCL. The containing VCL is for the usage with xkeys.

### Configure Shopware

:::warning
From version v6.6.x onwards, this method is deprecated and will be removed in v6.7.0. Utilising Varnish with Redis involves LUA scripts to determine URLs for the BAN request. This can cause problems depending on the setup or network. Furthermore, Redis clusters are not supported. Therefore, it is advisable to opt for the [Varnish with XKey](#configure-varnish) integration instead.
:::

First, we need to activate the reverse proxy support in Shopware. To enable it, we need to create a new file in `config/packages/storefront.yaml`:

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

::: info
The configuration key changed from `storefront.reverse_proxy` up to Shopware 6.5.x to `shopware.http_cache.reverse_proxy` starting with Shopware 6.6.0.0.
So you will need to adjust your config while upgrading.
If you look for the old documentation and examples, you can find it [here](https://developer.shopware.com/docs/v6.5/guides/hosting/infrastructure/reverse-http-cache.html)
:::

#### Trusted proxies

::: info
Since Shopware 6.6, the `TRUSTED_PROXIES` environment variable is no longer taken into account out of the box. Make sure to create a Symfony configuration to make it configurable again [like here](https://github.com/shopware/recipes/blob/main/shopware/docker/0.1/config/packages/trusted_env.yaml).
:::

For the most part, using Symfony and Varnish doesn't cause any problem. But, when a request passes through a proxy, certain request information is sent using either the standard Forwarded header or *X-Forwarded* headers. For example, instead of reading the *REMOTE_ADDR* header (which will now be the IP address of your reverse proxy), the user's true IP will be stored in a standard Forwarded: for="..." header or an *X-Forwarded-For* header.

If you don't configure Symfony to look for these headers, you will get incorrect information about the client's IP address. Whether or not the client connects via https, the client's port and the hostname are requested.

Go through [Proxies](https://symfony.com/doc/current/deployment/proxies.html) section for more information.

### Varnish Docker Image

Shopware offers a Varnish Docker image that is pre-configured to work with Shopware. You can find the image [here](https://github.com/shopware/varnish-shopware). The image is based on the official Varnish image and contains the Shopware default VCL with few configurations as environment variables.

### Configure Varnish

Varnish XKey is a cache key module that allows you to use Varnish with surrogate keys. It is a module not included in the default Varnish installation. It is available for Varnish 6.0 or higher.

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

The default configuration Varnish uses Hard purges, so when you update a product, the page will be removed from the cache and the next request takes longer because the cache is empty. To avoid this, you can use Soft purges.
Soft purge keeps the old page in case and serves it still to the clients and refreshes the cache in the background. This way the client gets **always** a cached page and the cache is updated in the background.

To enable soft purge, you need to change the varnish configuration.

```diff
-set req.http.n-gone = xkey.purge(req.http.xkey);
+set req.http.n-gone = xkey.softpurge(req.http.xkey);
```

### Debugging

The default configuration removes all headers except the `Age` header, which is used to determine the cache age. If you see only `0` as the `Age` header, it means that the cache is not working.

This problem is mostly caused as the application didn't set `Cache-Control: public` header. To check this you can use `curl` against the upstream server:

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

## Configure Fastly

Fastly is supported since Shopware 6.4.11.0 is out-of-the-box with some configurations. To enable it, we need to create a new file in `config/packages/storefront.yaml`

```yaml
# Be aware that the configuration key changed from storefront.reverse_proxy to shopware.http_cache.reverse_proxy starting with Shopware 6.6
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

By default, the cache will be immediately purged and the next requesting user will get a slow response as the cache has been deleted. On soft purge, the user still gets the cached response after the purge, but in the configured time interval, the cache will be refreshed. This makes sure that the client gets the fastest response possible.

```yaml
# Be aware that the configuration key changed from storefront.reverse_proxy to shopware.http_cache.reverse_proxy starting with Shopware 6.6
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

<PageRef page="https://github.com/shopware/recipes/blob/main/shopware/fastly-meta/6.6/config/fastly/deliver/default.vcl" title="vcl_deliver" target="_blank" />

<PageRef page="https://github.com/shopware/recipes/blob/main/shopware/fastly-meta/6.6/config/fastly/fetch/default.vcl" title="vcl_fetch" target="_blank" />

<PageRef page="https://github.com/shopware/recipes/blob/main/shopware/fastly-meta/6.6/config/fastly/hash/default.vcl" title="vcl_hash" target="_blank" />

<PageRef page="https://github.com/shopware/recipes/blob/main/shopware/fastly-meta/6.6/config/fastly/hit/default.vcl" title="vcl_hit" target="_blank" />

<PageRef page="https://github.com/shopware/recipes/blob/main/shopware/fastly-meta/6.6/config/fastly/recv/default.vcl" title="vcl_recv" target="_blank" />

### Cache Invalidations

The Reverse Proxy Cache shares the same invalidation mechanism as the Object Cache and has the same tags. So, when a product is invalidated, the object cache and the HTTP cache will also be invalidated.

There are a few different cache clearing commands:

1. `bin/console cache:clear` - Clears and warms up the application cache
2. `bin/console cache:clear:all` - Clears everything, including application cache, cache pools and the HTTP cache
3. `bin/console cache:clear:http` - Clears the reverse proxy cache if enabled, if not it clears the `http` cache pool

If you only want to clear the http cache, use `bin/console cache:clear:http`

<!-- {"WATCHER_URL":"https://raw.githubusercontent.com/shopware/shopware/trunk/src/Storefront/Resources/config/packages/storefront.yaml","WATCHER_HASH":"3ae5bc3363521c72d05f4ecbb89b3505"} -->
