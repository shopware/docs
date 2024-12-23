---
nav:
  title: Redis
  position:  7

---

# Redis

[Redis](https://redis.io/docs/latest/get-started/) is an in-memory data storage, that offers high performance and can be used as a cache, message broker, and database. It is a key-value store that supports various data structures like strings, hashes, lists, sets, and sorted sets.
Especially in high-performance and high-throughput scenarios it can give better results, than relying on a traditional relational database.
Therefore, multiple adapter exists in shopware, to offload some tasks from the DB to Redis.

However, as the data that is stored in Redis differs and also the access patterns to this data differ, it makes sense to use different Redis instances with different configurations for different tasks.

The data stored in Redis can be roughly classified into those three categories:

1. Ephemeral data: This data is not critical and can be easily recreated when lost, e.g., caches.
2. Durable, but "aging" data: This data is important and cannot easily be recreated, but the relevance of the data decreases over time, e.g. sessions.
3. Durable and critical data: This data is important and cannot easily be recreated, e.g. carts, number ranges.

Please note that in current Redis versions, it is not possible to use different eviction policies for different databases in the same Redis instance. Therefore, it is recommended to use separate Redis instances for different types of data.

## Ephemeral data

As ephemeral data can easily be restored and is most often used in cases where high performance matters, this data can be stored with no durable persistence.
This means the data is only stored in memory and is lost when the Redis instance is restarted.

For key eviction policy you should use `volatile-lru`, which only automatically deletes data that is expired, as the application explicitly manages the TTL for each cache item.

The caching data (HTTP-Cache & Object cache) is what should be stored in this instance.

<PageRef page="../performance/caches" />

## Durable, but "aging" data

As the data stored here is durable and should be persistent, even in the case of a Redis restart, it is recommended to configure the used Redis instance that it will not just keep the data in memory, but also store it on the disk. This can be done by using snapshots (RDB) and Append Only Files (AOF), refer to the [Redis docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) for details.

`allkeys-lru` should be used as key eviction policy here, as by default more recent data is more important than older data, therefore the oldest values should be discarded, when Redis reach the max memory.

The session data is what should be stored in this instance.

<PageRef page="../performance/session" />

## Durable and critical data

Again this is durable data, that can not easily be recreated, therefore it should be persisted as well.

As the data is critical, it is important to use a key eviction policy that will not delete data that is not expired, therefore `volatile-lru` should be used.

The cart, number range, lock store and increment data is what should be stored in this instance.

## Configuration

Starting with v6.6.8.0 Shopware supports configuring different reusable Redis connections in the`config/packages/shopware.yaml` file under the `shopware` section:

```yaml
shopware:
    # ...
    redis:
        connections:
            ephemeral:
                dsn: 'redis://host1:port/dbindex'
            persistent:
                dsn: 'redis://host2:port/dbindex'
```

Connection names should reflect the actual connection purpose/type and be unique. Also, the names are used as part of the service names in the container, so they should follow the service naming conventions. After defining connections, you can reference them by name in the configuration of different subsystems.

It's possible to use environment variables in the DSN string, e.g. if `REDIS_EPHEMERAL` is set to `redis://host1:port`, the configuration could look like this:

```yaml
shopware:
    # ...
    redis:
        connections:
            ephemeral_1:
                dsn: '%env(REDIS_EPHEMERAL)%/1' # using database 1
            ephemeral_2:
                dsn: '%env(REDIS_EPHEMERAL)%/2' # using database 2
```

### Connection pooling

In high-load scenarios, it is recommended to use persistent connections to avoid the overhead of establishing a new connection for each request. This can be achieved by setting the `persistent` flag in DSN to `1`:

```yaml
shopware:
    redis:
        connections:
            ephemeral:
                dsn: 'redis://host:port/dbindex?persistent=1'
```

Please note that the persistent flag influences connection pooling, not persistent storage of data.

<PageRef page="../performance/cart-storage" />

<PageRef page="../performance/number-ranges" />

<PageRef page="../performance/lock-store" />

<PageRef page="../performance/increment" />

<PageRef page="../performance/performance-tweaks#delayed-invalidation" />
