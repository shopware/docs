---
nav:
  title: Database Cluster
  position: 20

---

# Database Cluster

::: info
This functionality is available starting with Shopware 6.4.12.0.
:::

To scale Shopware even further, we recommend using a database cluster. A database cluster consists of multiple read-only servers managed by a single primary instance.

Shopware already splits read and write SQL queries by default. When a write  [`INSERT`/`UPDATE`/`DELETE`/...](https://github.com/shopware/platform/blob/v6.4.11.1/src/Core/Profiling/Doctrine/DebugStack.php#L48) query is executed, the query is delegated to the primary server, and the current connection uses only the primary node for subsequent calls. This is ensured by the `executeStatement` method in the [DebugStack decoration](https://github.com/shopware/platform/blob/v6.4.11.1/src/Core/Profiling/Doctrine/DebugStack.php#L48).
That way, Shopware can ensure read-write consistency for records within the same request. However, it doesn't take into account that read-only child nodes might not be in sync with the primary node. This is left to the database replication process.

## Preparing Shopware

We suggest following the steps below to make the splitting the most effective.

### Using the optimal MySQL configuration

By default, Shopware does not set specific MySQL configurations that make sure the database is optimized for Shopware usage.
These variables are set in cluster mode only on the read-only server. To make sure that Shopware works flawlessly, these configurations must be configured directly on the MySQL server so these variables are set on any server.

The following options should be set:

- Make sure that `group_concat_max_len` is by default higher or equal to `320000`
- Make sure that `sql_mode` doesn't contain `ONLY_FULL_GROUP_BY`

After this change, you can set also `SQL_SET_DEFAULT_SESSION_VARIABLES=0` in the `.env` file so Shopware does not check for those variables at runtime.

### Cart in Redis

As we learned in the beginning, Shopware queries a read-only MySQL server until the first write attempt. To maximize this behavior, it is highly recommended to outsource as many write operations as possible from the database. One of the easiest solutions is to use the Redis as storage for store carts.
To use Redis, add the following snippet to `config/packages/cart.yml`

```yaml
shopware:
    cart:
        redis_url: 'redis://localhost:6379/0?persistent=1'
```

It is recommended to use a persistent Redis connection to avoid connection issues in high-load scenarios. There is also a `cart:migrate` command to migrate the existing carts between MySQL and Redis, so the migration does not influence end-user experience.

## Configure the database cluster

To use the MySQL cluster, you have to configure the following in the `.env` file:

- `DATABASE_URL` is the connection string for the MySQL primary.
- `DATABASE_REPLICA_x_URL` (e.g `DATABASE_REPLICA_0_URL`, `DATABASE_REPLICA_1_URL`) - is the connection string for the MySQL read-only server.
