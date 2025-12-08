---
nav:
  title: Cache
  position: 10

---

# Cache

There are several caches in Shopware that can be used to optimize performance. This page gives a brief overview and shows how to configure them.

## Overview

The HTTP Cache is a *must-have* for every production system. With an enabled cache, the performance of the shop can be greatly increased.

### How to configure the HTTP cache

Basic HTTP cache configuration takes place in the `.env.local` file.

| Name                          | Description                    |
|:------------------------------|:-------------------------------|
| `SHOPWARE_HTTP_CACHE_ENABLED` | Enables the HTTP cache         |
| `SHOPWARE_HTTP_DEFAULT_TTL`   | Defines the default cache time |

`SHOPWARE_HTTP_DEFAULT_TTL` is deprecated and will be removed in Shopware v6.8.0.0. Use [HTTP Caching Policies](#http-caching-policies) instead to define default cache times.

To provide more detailed control over the HTTP cache behavior, use the [HTTP Caching Policies](#http-caching-policies) feature.

The storage used for HTTP Cache is always the [App Cache](#app-cache), see below how to configure it. If you want to move this out of the application cache, you should use an external reverse proxy cache like [Varnish](https://varnish-cache.org/) or [Fastly](https://www.fastly.com/). For more [see here](../infrastructure/reverse-http-cache.md).

### HTTP Caching Policies

> **Note:** This feature is experimental and subject to change. It will be the default behavior in Shopware v6.8.0.0.
> To use it now, enable the `CACHE_REWORK` feature flag.

Caching policies allow you to define HTTP cache behavior per area (storefront, store_api) and per route via configuration. Shopware comes with reasonable defaults, but you can customize them.

#### Configuration

##### Defining a policy

By default, Shopware ships with `storefront.cacheable`, `store_api.cacheable` and `no_cache_private` policies.
You can define your own policies:

```yaml
# config/packages/shopware.yaml
shopware:
  http_cache:
    policies:
      custom_policy:
        headers:
          cache_control:
            public: true
            max_age: 600  # browser ttl
            s_maxage: 3600  # reverse proxy ttl
```

Supported `cache_control` directives: `public`, `private`, `no_cache`, `no_store`, `no_transform`, `must_revalidate`, `proxy_revalidate`, `immutable`, `max_age`, `s_maxage`, `stale_while_revalidate`, `stale_if_error`.

You can redefine existing policies. Note that policy definitions are not merged; redefining an existing policy overrides it completely.

Currently, you can only configure the `cache_control` header.

##### Setting default policies

You can change default `cacheable` and `uncacheable` policies per area (`storefront`, `store_api`):

```yaml
shopware:
  http_cache:
    default_policies:
      store_api: # the area name
        cacheable: custom_policy # policy to use for cacheable responses
```

##### Fine-tuning per route or app hook

You can override default policies per route:

```yaml
shopware:
  http_cache:
    route_policies:
      store-api.product.search: custom_policy
```

App developers can override TTLs from the default policies via script configuration. See [custom endpoints](../../plugins/apps/app-scripts/custom-endpoints.md#set-the-max-age-of-the-cache-item) for details.
You can override this by configuring hook-specific policies using the `route#hook` pattern:

```yaml
shopware:
  http_cache:
    route_policies:
      frontend.script_endpoint#storefront-acme-feature: storefront.my_custom_policy # storefront-acme-feature is the normalized hook name
```

##### Policy precedence

Shopware resolves policies in the following order (highest to lowest priority):

1. `route_policies[route#hook]` - most specific, for script endpoints with hooks (e.g., `frontend.script_endpoint#acme-app-hook`).
2. `route_policies[route]` - route-level override.
3. `default_policies[area].{cacheable|uncacheable}` - area defaults; TTLs (max-age, s-maxage) can be overridden by values from the request attribute or script configuration.

## How to change the cache storage

The standard Shopware HTTP cache can be exchanged or reconfigured in several ways. The standard cache comes with an `adapter.filesystem`. This is a file-based cache that stores the cache in the `var/cache` directory. This allows Shopware to work out of the box on a single server without any additional configuration. However, this may not be the best solution for a production system, especially if you are using a load balancer or multiple servers. In this case, you should use a shared cache like [Redis](https://redis.io/).

This is a Symfony cache pool configuration and therefore supports all adapters from the [Symfony FrameworkBundle](https://symfony.com/doc/current/cache.html#configuring-cache-with-frameworkbundle).

### Using Redis

Redis is a very fast in-memory key-value store. It is a good choice for caching data that is frequently accessed and does not need to be persisted. Redis can be used as a cache adapter in Shopware. As the cached information is ephemeral and can be recreated, it is not necessary to configure Redis to store the data on disk. For maximum performance, you can configure Redis to use no persistence. Refer to the [Redis docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) for details.
As key eviction policy, you should use `volatile-lru`. This policy only automatically deletes expired data, as the application explicitly manages the TTL for each cache item. For a detailed overview of Redis key eviction policies, see the [Redis docs](https://redis.io/docs/latest/develop/reference/eviction/).

For `cache.adapter.redis_tag_aware` minimum Shopware 6.5.8.3 is required. Otherwise use `cache.adapter.redis`.

```yaml
# config/packages/cache.yaml
framework:
  cache:
    app: cache.adapter.redis_tag_aware
    system: cache.adapter.redis_tag_aware
    default_redis_provider: redis://localhost
```

Make sure that you have installed the PHP Redis extension before applying this configuration.

The Redis URL can have various formats. The following are all valid:

```text
# With explicit port
redis://localhost:6379

# With authentication
redis://auth@localhost:6379

# With database
redis://localhost:6379/1

# With options
redis://localhost:6379?timeout=1

# With unix socket

redis:///var/run/redis.sock

# With unix socket and authentication
redis://auth@/var/run/redis.sock
```

For more information or other adapters checkout [Symfony FrameworkBundle](https://symfony.com/doc/current/cache.html#configuring-cache-with-frameworkbundle) documentation.
