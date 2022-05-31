# Database Cluster

To scale Shopware even further, we recommend to use a database cluster. A database cluster consists of multiple read-only servers that are managed by a single primary instance. Shopware comes in default with an read write splitting of SQL queries. When an [`INSERT`/`UPDATE`/`DELETE`/...](https://github.com/shopware/platform/blob/v6.4.11.1/src/Core/Profiling/Doctrine/DebugStack.php#L48) query is executed, the query is distributed to the primary server and the connection uses only the primary node until the end of the connection. This will be ensured by the `executeStatement` in the [DebugStack decoration](https://github.com/shopware/platform/blob/v6.4.11.1/src/Core/Profiling/Doctrine/DebugStack.php#L48).
This makes it possible to write or read a record, without taking the possibility into account that the read-only child nodes might not be in sync with the primary node.

## Preparing Shopware

To make the Splitting most effective, we recommend to configure the following steps:

### Using the optimal MySQL configuration

Shopware does set by default some specific MySQL configuration to make sure that the database is optimized for the Shopware usage. 
This variables are set in the cluster mode only on the read-only server. To make sure that Shopware works flawlessly these configuration must be configured directly on the MySQL server so these variables are set on any server.

The following options should be set:

- Make sure that `group_concat_max_len` is by default higher or equal to `320000`
- Make sure that `sql_mode` doesn't contain `ONLY_FULL_GROUP_BY`

After this change, you can set also `SQL_SET_DEFAULT_SESSION_VARIABLES=0` in the `.env` file so Shopware does not check for those variables in runtime.

### Cart in Redis

As we learned in the beginning, Shopware uses read-only MySQL server until the first write attempt. To maximaze this behaviour it is hightly recommanded to outsource much as you can the writes on the Database. One of the easiest solutions is to use the Redis as storage for the Cart.
To use Redis add following snippet to `config/packages/cart.yml`

```yml
shopware:
    cart:
        redis_url: 'redis://localhost:6379/0?persistent=1'
```

It is recommanded to use a persistent Redis connection to avoid connection issues in high load scenarios. There is also an `cart:migrate` command to Migrate the cart between MySQL and Redis so the users can continue to use the existing carts.

## Configure the Database Cluster

To use the MySQL Cluster, you have to configure the following in the `.env` file:

- `DATABASE_URL` is the connection string for the MySQL primary.
- `DATABASE_REPLICA_x_URL` (e.g `DATABASE_REPLICA_0_URL`, `DATABASE_REPLICA_1_URL`) - is the connection string for the MySQL read-only server.

