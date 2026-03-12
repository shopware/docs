---
nav:
  title: Database
  position: 20

---

# Database Cluster

::: info
We recommend the usage of [ProxySQL](https://proxysql.com/) as a proxy for the database cluster instead of configuring the application to connect to different database servers directly.
ProxySQL allows you to manage the database cluster more efficiently and provides additional features like query caching, connection pooling, load balancing, and failover.
:::

To scale Shopware even further, we recommend using a database cluster.
A database cluster consists of multiple read-only servers managed by a single primary instance.

Shopware already splits read and write SQL queries by default.
When a write  [`INSERT`/`UPDATE`/`DELETE`/...](https://github.com/shopware/shopware/blob/v6.4.11.1/src/Core/Profiling/Doctrine/DebugStack.php#L48) query is executed, the query is delegated to the primary server, and the current connection uses only the primary node for subsequent calls.
This is ensured by the `executeStatement` method in the [DebugStack decoration](https://github.com/shopware/shopware/blob/v6.4.11.1/src/Core/Profiling/Doctrine/DebugStack.php#L48).
That way, Shopware can ensure read-write consistency for records within the same request.
However, it doesn't take into account that read-only child nodes might not be in sync with the primary node.
This is left to the database replication process.

## Preparing Shopware

We suggest following the steps below to make the splitting the most effective.

### Using the optimal MySQL configuration

By default, Shopware does not set specific MySQL configurations that make sure the database is optimized for Shopware usage.
These variables are set in cluster mode only on the read-only server.
To make sure that Shopware works flawlessly, these configurations must be configured directly on the MySQL server so these variables are set on any server.

The following options should be set:

- Make sure that `group_concat_max_len` is by default higher or equal to `320000`
- Make sure that `sql_mode` doesn't contain `ONLY_FULL_GROUP_BY`

After this change, you can set also `SQL_SET_DEFAULT_SESSION_VARIABLES=0` in the `.env` file so Shopware does not check for those variables at runtime.

## Configure the database cluster

To use the MySQL cluster, you have to configure the following in the `.env` file:

- `DATABASE_URL` is the connection string for the MySQL primary.
- `DATABASE_REPLICA_x_URL` (e.g `DATABASE_REPLICA_0_URL`, `DATABASE_REPLICA_1_URL`) - is the connection string for the MySQL read-only server.
