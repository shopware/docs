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
1. Ephemeral data: This data is not critical and can be easily recreated when lost, e.g. caches.
2. Durable, but "aging" data: This data is important and cannot easily be recreated, but the relevance of the data decreases over time, e.g. sessions.
3. Durable and critical data: This data is important and cannot easily be recreated, e.g. carts, number ranges.

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

<PageRef page="../performance/cart-storage" />

<PageRef page="../performance/number-ranges" />

<PageRef page="../performance/lock-store" />

<PageRef page="../performance/increment" />
