# Number Ranges

::: info
The Redis storage and the configuration options for this have been introduced with Shopware version 6.4.11.0.
:::

Number Ranges provide a consistent way to generate a consecutive number sequence that is used for order numbers, invoice numbers, etc.
The generation of the number ranges is an **atomic** operation. This guarantees that the sequence is consecutive and that no number is generated twice.

By default, the number range states are stored in the database.
In scenarios where high throughput is required (e.g., thousands of orders per minute), the database can become a performance bottleneck because of the requirement for atomicity.
Redis offers better support for atomic increments than the database. Therefore the number ranges should be stored in Redis in such scenarios.

## Using Redis as storage

To use Redis, create a `config/packages/shopware.yml` file with the following content:

```yaml
shopware:
  number_range:
    increment_storage: "Redis"
    redis_url: 'redis://host:port/dbindex'
```

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
