---
nav:
  title: Database
  position: 20

---

# Database

This guide explains how to operate Shopware with a reliable database setup.
It covers cluster-based scaling for read traffic and connection handling for long-running PHP worker environments.

## Cluster Setup

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

### Preparing Shopware

We suggest following the steps below to make the splitting the most effective.

#### Using the optimal MySQL configuration

By default, Shopware does not set specific MySQL configurations that make sure the database is optimized for Shopware usage.
These variables are set in cluster mode only on the read-only server.
To make sure that Shopware works flawlessly, these configurations must be configured directly on the MySQL server so these variables are set on any server.

The following options should be set:

- Make sure that `group_concat_max_len` is by default higher or equal to `320000`
- Make sure that `sql_mode` doesn't contain `ONLY_FULL_GROUP_BY`

After this change, you can set also `SQL_SET_DEFAULT_SESSION_VARIABLES=0` in the `.env` file so Shopware does not check for those variables at runtime.

### Configure the database cluster

To use the MySQL cluster, you have to configure the following in the `.env` file:

- `DATABASE_URL` is the connection string for the MySQL primary.
- `DATABASE_REPLICA_x_URL` (e.g `DATABASE_REPLICA_0_URL`, `DATABASE_REPLICA_1_URL`) - is the connection string for the MySQL read-only server.

## SSL/TLS Connection

Many cloud database providers and production environments require encrypted connections.
Shopware supports TLS for MySQL/MariaDB connections through the `DATABASE_SSL_*` environment
variables.

### Using DATABASE_SSL_* environment variables

Shopware's `MySQLFactory` automatically reads these environment variables and applies them
to the Doctrine database connection. No additional configuration is needed — just set the
variables in your `.env.local` file:

```dotenv
DATABASE_URL="mysql://username:password@host:3306/dbname"
DATABASE_SSL_CA="/etc/ssl/certs/db-ca.pem"
DATABASE_SSL_CERT="/etc/ssl/certs/db-client-cert.pem"
DATABASE_SSL_KEY="/etc/ssl/certs/db-client-key.pem"
# DATABASE_SSL_DONT_VERIFY_SERVER_CERT=1  # Uncomment to skip verification (non-production only)
```
The following table describes the available `DATABASE_SSL_*` variables.

| Variable                               | Description                                                                                |
|----------------------------------------|--------------------------------------------------------------------------------------------|
| `DATABASE_SSL_CA`                      | Path to the Certificate Authority file (PEM) used for server certificate verification      |
| `DATABASE_SSL_CERT`                    | Path to the client certificate file (PEM) for mutual TLS                                  |
| `DATABASE_SSL_KEY`                     | Path to the client private key file (PEM) for mutual TLS                                  |
| `DATABASE_SSL_DONT_VERIFY_SERVER_CERT` | Set to `1` to skip server certificate verification (non-production only); requires PHP 8.2+ |

> [!NOTE]
> `DATABASE_SSL_DONT_VERIFY_SERVER_CERT` requires PHP 8.2 or later and the `PDO\MySQL`
> class available in `ext-pdo_mysql`. For a full list of available environment variables,
> see the [Environment Variables reference](../../configurations/shopware/environment-variables.md).


### Additional database connection options

Shopware also supports these environment variables for advanced database connections:

```dotenv
# Keep the database connection open across requests (useful for worker processes)
DATABASE_PERSISTENT_CONNECTION=1

# Enable MySQL protocol compression for reduced network traffic
DATABASE_PROTOCOL_COMPRESSION=1
```

### Amazon RDS / Aurora

AWS RDS and Aurora enforce TLS by default. Download the [AWS RDS CA bundle](https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem)
and reference it in your connection:

```dotenv
DATABASE_URL="mysql://username:password@your-cluster.rds.amazonaws.com:3306/dbname"
DATABASE_SSL_CA="/etc/ssl/certs/rds-ca-bundle.pem"
```

### Verify the TLS connection

To confirm that TLS is active, run this SQL query via the Shopware CLI or your MySQL client:

```sql
SHOW STATUS LIKE 'Ssl_cipher';
```

A non-empty value (for example, `TLS_AES_256_GCM_SHA384`) confirms the connection is encrypted.

## Setup for long-running environments

When running Shopware in long-lived PHP worker environments such as FrankenPHP worker mode, database connections can stay open long enough to exceed MySQL's `wait_timeout`.
This can lead to `MySQL server has gone away` errors on later requests.

Shopware does not install a reconnect package by default, but you can enable this behavior yourself with [`facile-it/doctrine-mysql-come-back`](https://github.com/facile-it/doctrine-mysql-come-back):

```bash
composer require facile-it/doctrine-mysql-come-back
```

Configure the wrapper class on `DATABASE_URL` with `Facile\DoctrineMySQLComeBack\Doctrine\DBAL\Connection`:

```dotenv
DATABASE_URL="mysql://username:password@localhost:3306/dbname?wrapperClass=?wrapperClass=Facile\DoctrineMySQLComeBack\Doctrine\DBAL\Connection&driverOptions[x_reconnect_attempts]=3"
```

If you are using Shopware with read replicas, use `Facile\DoctrineMySQLComeBack\Doctrine\DBAL\Connections\PrimaryReadReplicaConnection` instead:

```dotenv
DATABASE_URL="mysql://username:password@localhost:3306/dbname?wrapperClass=Facile\DoctrineMySQLComeBack\Doctrine\DBAL\Connections\PrimaryReadReplicaConnection&driverOptions[x_reconnect_attempts]=3"
DATABASE_REPLICA_0_URL="mysql://username:password@replica:3306/dbname"
```
