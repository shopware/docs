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

The HTTP cache configuration takes place completely in the `.env.local` file. The following configurations are available here:

| Name                          | Description                    |
|:------------------------------|:-------------------------------|
| `SHOPWARE_HTTP_CACHE_ENABLED` | Enables the HTTP cache         |
| `SHOPWARE_HTTP_DEFAULT_TTL`   | Defines the default cache time |

The storage used for HTTP Cache is always the [App Cache](#app-cache), see below how to configure it. If you want to move this out of the application cache, you should use an external reverse proxy cache like [Varnish](https://varnish-cache.org/) or [Fastly](https://www.fastly.com/). For more [see here](../infrastructure//reverse-http-cache.md).

## How to change the cache storage

The standard Shopware HTTP cache can be exchanged or reconfigured in several ways. The standard cache comes with an `adapter.filesystem`. This is a file-based cache that stores the cache in the `var/cache` directory. This allows Shopware to work out of the box on a single server without any additional configuration. However, this is maybe not the best solution for a production system, especially if you are using a load balancer or multiple servers. In this case, you should use a shared cache like [Redis](https://redis.io/).

This is a Symfony cache pool configuration and therefore supports all adapters from the [Symfony FrameworkBundle](https://symfony.com/doc/current/cache.html#configuring-cache-with-frameworkbundle).

### Using Redis

Redis is a very fast in-memory key-value store. It is a good choice for caching data that is frequently accessed and does not need to be persisted. Redis can be used as a cache adapter in Shopware. As the cached information is ephemeral and can be recreated, it is not necessary to configure Redis to store the data on disk. For maximum performance you can configure Redis to use no persistence, refer to the [Redis docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) for details.
As key eviction policy you should use `volatile-lru`, which only automatically deletes data that is expired, as the application explicitly manages the TTL for each cache item. For a detailed overview of Redis key eviction policies see the [Redis docs](https://redis.io/docs/latest/develop/reference/eviction/).

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
