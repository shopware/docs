---
nav:
  title: Increment Storage
  position: 30

---

# Increment Storage

::: info
This feature has been introduced with Shopware version 6.4.7.0
:::

The increment storage is used to store status and display it in the Administration. This can include

* Status of the message queue
* Last used module of Administration users

This storage increments or decrements a given key in a transaction-safe way, which causes locks upon the storage.

Shopware uses the `increment` table to store such information by default. When multiple message consumers are running, this table can be locked very often, decreasing workers' performance. By using different storage, the performance of those updates can be improved.

## Using Redis as storage

To use Redis, create a `config/packages/shopware.yml` file with the following content

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
