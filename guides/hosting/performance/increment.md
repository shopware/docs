# Increment Storage

{% hint style="info" %}
This feature has been introduced with Shopware version 6.4.7.0
{% endhint %}

The increment storage is used in Shopware to show the current status of the message queue in the Administration or store the last used modules of the Administration users. This storage increments/decrements transaction safe the given key in the storage, leading to locks.

Shopware uses the `increment` table to store such information by default. When multiple message consumers are running, this table can be locked very often and decrease the workers' performance. By using a different storage, the performance of those updates can be improved.


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

## Disabling the Increment Storage

The usage of the increment storage is optional and can be disabled. When this feature is disabled, the Queue Notification and Module usage will not work in the Administration

To disable it, create a `config/packages/shopware.yml` file with the following content

```yaml
shopware:
    increment:
        user_activity:
          type: 'array'

        message_queue:
          type: 'array'
```