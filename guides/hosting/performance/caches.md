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

The HTTP cache configuration takes place completely in the `.env file.` The following configurations are available here:

| Name                          | Description                    |
|:------------------------------|:-------------------------------|
| `SHOPWARE_HTTP_CACHE_ENABLED` | Enables the HTTP cache         |
| `SHOPWARE_HTTP_DEFAULT_TTL`   | Defines the default cache time |

### How to trigger the HTTP cache warmer

To warm up the HTTP cache, you can simply use the console command `http:cache:warm:up`. This command sends a message to the message queue for each sales channel domain to warm it up as fast as possible. It is important that queue workers are started according to our [message queue](../infrastructure/message-queue).

### How to change the cache storage

The standard Shopware HTTP cache can be exchanged or reconfigured in several ways. The standard cache comes with an `adapter.filesystem`. The configuration can be found in the `platform/src/Core/Framework/Resources/config/packages/framework.yaml` file.

```yaml
framework:
    cache:
        pools:
            cache.http:
                adapter: cache.adapter.filesystem
```

This is a Symfony cache pool configuration and therefore supports all adapters from the [Symfony FrameworkBundle](https://symfony.com/doc/current/cache.html#configuring-cache-with-frameworkbundle).

## App cache

The app cache defines the default cache adapter for Shopware. As you can see in this default configuration, every cache-pool in Shopware uses the adapter defined in the `app` cache as default:

```yaml
framework:
    cache:
        prefix_seed: "%kernel.cache.hash%"
        app: cache.adapter.filesystem
        pools:
            cache.object:
                default_lifetime: 3600
                adapter: cache.app
                tags: cache.tags
            cache.http:
                default_lifetime: 3600
                adapter: cache.app
                tags: cache.tags
            cache.tags:
                adapter: cache.app
```

This is also a Symfony cache configuration and supports all adapters from the [Symfony FrameworkBundle](https://symfony.com/doc/current/cache.html#configuring-cache-with-frameworkbundle).

## Object Cache

The object cache pool is used for caching the data abstraction layer in Shopware and can be configured like any other pool.

## Example: replace some cache with Redis

"[Redis](https://redis.io/) is an open source \(BSD licensed\), in-memory data structure store, used as a database, cache, and message broker." In this example, we change the default HTTP cache adapter to Redis. It is possible to change every adapter as in this example. A running Redis instance is required for this to work. The configuration can be overridden by creating or editing the file `framework.yaml`

```yaml
# config/packages/framework.yaml
framework:
    cache:
        default_redis_provider: 'redis://host:port'
        pools:
            cache.http:
                adapter: cache.adapter.redis
                tags: cache.tags
```

Replace the `host` and `port` with your Redis instance. It is also possible to change the cache adapter for `app`, which would affect every pool since they inherit from `app` by default.

```yaml
framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: 'redis://host:port'
```

## Twig cache

Twig caches all compiled template files by default. With the `cache` option, a directory can be defined, where twig saves the compiled templates. This path can be overridden by creating or editing a `twig.yaml`:

```yaml
# config/packages/twig.yaml
twig:
    cache: '%kernel.cache_dir%/twig'
```

To know more about caching in twig, look at the [Twig for Developers](https://twig.symfony.com/doc/3.x/api.html#) documentation.
