---
nav:
  title: Increment Storage
  position: 40

---

# Increment Storage

The increment storage is used to store status and display it in the Administration. This can include

* Status of the message queue
* Last used module of Administration users

This storage increments or decrements a given key in a transaction-safe way, which causes locks upon the storage.

Shopware uses the `increment` table to store such information by default. When multiple message consumers are running, this table can be locked very often, decreasing workers' performance. By using different storage, the performance of those updates can be improved.

## Using Redis as storage

To use Redis, create a `config/packages/shopware.yml` file with the following content

<Tabs>
<Tab title="Before v6.6.8.0">

```yaml
shopware:
    increment:
        user_activity:
          type: 'redis'
          config:
            url: 'redis://host:port/dbindex'

        message_queue:
          type: 'redis'
          config:
            url: 'redis://host:port/dbindex'
```

</Tab>

<Tab title="Since v6.6.8.0">

```yaml
shopware:
    redis:
        connections:
            persistent:
                dsn: 'redis://host:port/dbindex'

    increment:
        user_activity:
            type: 'redis'
            config:
                connection: 'persistent'

        message_queue:
            type: 'redis'
            config:
                connection: 'persistent'
```

</Tab>
</Tabs>

### Redis configuration

As the information stored here is durable and should be persistent, even in the case of a Redis restart, it is recommended to configure the used Redis instance that it will not just keep the data in memory, but also store it on the disk. This can be done by using snapshots (RDB) and Append Only Files (AOF), refer to the [Redis docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) for details.

As key eviction policy you should use `volatile-lru`, which only automatically deletes data that is expired, as otherwise you might risk losing data. For a detailed overview of Redis key eviction policies refer to the [Redis docs](https://redis.io/docs/latest/develop/reference/eviction/).

## Disabling the increment storage

The usage of the increment storage is optional and can be disabled. When this feature is disabled, Queue Notification and Module Usage Overview will not work in the Administration.

To disable it, create a `config/packages/shopware.yml` file with the following content:

```yaml
shopware:
    increment:
        user_activity:
            type: 'array'

        message_queue:
            type: 'array'
```
