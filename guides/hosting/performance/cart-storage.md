---
nav:
  title: Cart Storage
  position: 65

---

# Cart Storage

By default, shopware stores the cart in the database. This can be a performance bottleneck in scenarios where high throughput is required (e.g., thousands of orders per minute), especially if a DB cluster with a read/write-split is used.
Additionally, as the content in that table can change quite quickly, it can lead to an explosion of the databases `binlog` file.

Redis is better suited in high-throughput scenarios, therefore you should use Redis as storage for the cart in such scenarios.

## Using Redis as storage

To use Redis, create a `config/packages/shopware.yml` file with the following content:

<Tabs>
<Tab title="Before v6.6.8.0">

```yaml
shopware:
  cart:
    redis_url: 'redis://host:port/dbindex?persistent=1'
```

</Tab>

<Tab title="Since v6.6.8.0">

```yaml
shopware:
    redis:
        connections:
            persistent:
                dsn: 'redis://host:port/dbindex?persistent=1'
    cart:
        storage:
            type: 'redis'
            config:
                 connection: 'persistent'
```

</Tab>
</Tabs>
Note that the `?persistent=1` parameter here refers to the connection pooling, not the persistent storage of data. Please refer to the [Redis configuration guide](../infrastructure/redis) for more information.*

## Migrating between storages

You can migrate the current carts from the DB to Redis by running the following CLI command:

```shell
bin/console cart:migrate {fromStorage} {redisUrl?}
```

::: info
Providing the redis URL is optional. If not provided, the value from the configuration will be used. If it is not configured in the yaml file, you need to provide the URL.
:::

For example, if you want to migrate from the default `SQL` storage to the high-performing `Redis` storage, the command is:

```shell
bin/console cart:migrate sql
```

## Redis configuration

As the information stored here is durable and should be persistent, even in the case of a Redis restart, it is recommended to configure the used Redis instance that it will not just keep the data in memory, but also store it on the disk. This can be done by using snapshots (RDB) and Append Only Files (AOF), refer to the [Redis docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) for details.

As key eviction policy you should use `volatile-lru`, which only automatically deletes carts that are expired, as otherwise you might risk of losing data. For a detailed overview of Redis key eviction policies see the [Redis docs](https://redis.io/docs/latest/develop/reference/eviction/).
