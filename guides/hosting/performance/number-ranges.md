# Number Ranges

{% hint style="info" %}
The Redis storage and the configuration options for this have been introduced with Shopware version 6.4.11.0
{% endhint %}

Number Ranges provide a consistent way to generate a consecutive number sequence that is used for order numbers, invoice numbers, etc. 
The generation of the number ranges is an **atomic** operation, this guarantees that the generated sequence is consecutive and no number is generated twice.

By default, the number range states are stored in the database.
In scenarios where a high throughput is required (e.g. thousands of orders per minute), the database can become a performance bottleneck, because of the requirement for atomicity.
Redis offers better support for atomic increments than the database, therefore the number ranges should be stored in Redis in such scenarios.

## Using Redis as storage

To use Redis, create a `config/packages/shopware.yml` file with the following content:
```yaml
shopware:
  number_ranges:
    increment_storage: "Redis"
    redis_url: 'redis://host:port/dbindex'
```

## Migrating between storages

You can migrate the current state of the number ranges from your current storage to a new one by running the following CLI command:
```shell
bin/console number-range:migrate {fromStorage} {toStorage}
```
For example if ou want to migrate from the default `SQL` storage, to the high-performing `Redis` storage the command is:
```shell
bin/console number-range:migrate SQL Redis
```

{% hint style="info" %}
If you want to migrate from or to `Redis`, please ensure that the `shopware.number_range.redis_url` is correctly configured, regardless if `Redis` is currently configured as the `increment_storage`.
{% endhint %}

{% hint style="warning" %}
Note that the migration of the number ranges between different storages is **not atomic**, this means that if you migrate the number ranges, and simultaneously new number increments are being generated this may lead to the same number being generated twice.
Therefore, this command should normaly not run during normal operations of the shop, but rather during part of a deployment or maintenance.
{% endhint %}