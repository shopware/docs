---
nav:
  title: Number Ranges
  position: 60

---

# Number Ranges

Number Ranges provide a consistent way to generate a consecutive number sequence that is used for order numbers, invoice numbers, etc.
The generation of the number ranges is an **atomic** operation. This guarantees that the sequence is consecutive and that no number is generated twice.

By default, the number range states are stored in the database.
In scenarios where high throughput is required (e.g., thousands of orders per minute), the database can become a performance bottleneck because of the requirement for atomicity.
Redis offers better support for atomic increments than the database. Therefore the number ranges should be stored in Redis in such scenarios.

## Using Redis as storage

To use Redis, create a `config/packages/shopware.yml` file with the following content:

<Tabs>
<Tab title="Before v6.6.8.0">

```yaml
shopware:
    number_range:
        increment_storage: "Redis"
        redis_url: 'redis://host:port/dbindex'
```

</Tab>

<Tab title="Since v6.6.8.0">

```yaml
shopware:
    redis:
        connections:
            persistent:
                dsn: 'redis://host:port/dbindex'
    number_range:
        increment_storage: 'redis'
        config:
            connection: 'persistent'
```

</Tab>
</Tabs>

### Redis configuration

As the information stored here is durable and should be persistent, even in the case of a Redis restart, it is recommended to configure the used Redis instance that it will not just keep the data in memory, but also store it on the disk. This can be done by using snapshots (RDB) and Append Only Files (AOF), refer to the [Redis docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) for details.

As key eviction policy you should use `volatile-lru`, which only automatically deletes data that is expired, as otherwise you might risk losing data. For a detailed overview of Redis key eviction policies refer to the [Redis docs](https://redis.io/docs/latest/develop/reference/eviction/).

## Migrating between storages

You can migrate the current state of the number ranges from your current storage to a new one by running the following CLI command:

```shell
bin/console number-range:migrate {fromStorage} {toStorage}
```

For example, if you want to migrate from the default `SQL` storage to the high-performing `Redis` storage, the command is:

```shell
bin/console number-range:migrate SQL Redis
```

::: info
If you want to migrate from or to `Redis`, ensure the `shopware.number_range.redis_url` is correctly configured, regardless if `Redis` is currently configured as the `increment_storage`.
:::

::: warning
The migration of the number ranges between different storages is **not atomic**. This means that if you migrate the number ranges and simultaneously generate new number increments, this may lead to the same number being generated twice.
Therefore, this command should normally not run during normal operations of the shop but rather during part of a deployment or maintenance.
:::
