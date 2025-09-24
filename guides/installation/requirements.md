---
nav:
  title: Requirements
  position: -30001

---

# Requirements

::: tip Recommended Approach
Want to skip manual setup? Use our [Docker setup](./setup) which includes all requirements pre-configured.
:::

These are the requirements for running Shopware 6. If you're using our recommended Docker setup, all of these are already included.

## Operating System

Shopware 6 is currently only supported on any Unix operating system. Windows is only supported inside WSL 2 or Docker.

## Versions

You can use these commands to check your actual environment:

::: info
On many shared hosting environments, you have multiple PHP versions installed. Make sure that you use the correct PHP binary and often CLI and FPM have different `php.ini` files. Ask your hosting provider for the correct PHP binary to use and how to change the `php.ini` file.
:::

* `php -v`: Shows CLI PHP version
* `php -m`: Shows CLI PHP modules
* `php -i | grep memory_limit`: Shows your actual CLI PHP memory limit
* `composer -V`: Shows your actual composer version
* `node -v`: Shows your actual Node version
* `npm -v`: Shows your actual NPM version

### PHP

* Compatible version: 8.2, 8.3 and 8.4
* `memory_limit` : 512M minimum
* `max_execution_time` : 30 seconds minimum
* Extensions:
  * `ext-amqp` (only required if you plan to use a message queue, which is the default on PaaS)
  * `ext-curl`
  * `ext-dom`
  * `ext-fileinfo`
  * `ext-gd`
  * `ext-iconv`
  * `ext-intl`
  * `ext-mbstring`
  * `ext-openssl`
  * `ext-pcre`
  * `ext-pdo`
  * `ext-pdo_mysql`
  * `ext-phar`
  * `ext-simplexml`
  * `ext-xml`
  * `ext-zip`
  * `ext-zlib`
* Composer version: 2.2 or higher

### SQL

* MySQL

  * Recommended version: 8.4
  * Minimum version: 8.0.22

* MariaDB

  * Recommended version: 11.4
  * Minimum version : 10.11.6 or 11.0.4

For optimal MySQL performance, see [Performance Tweaks](../hosting/performance/performance-tweaks#mysql-configuration).

### JavaScript

::: info
Node.js is only required for building custom extensions and themes, not for operating the store itself. It does not need to be available in the **production environment**.
:::

* Node.js 22.0.0 or higher

## Redis or key/value stores

Shopware uses the Redis Protocol and, therefore, supports the following key/value stores:

* [Valkey (recommended)](https://valkey.io/)
* [Redis v7 or higher](https://redis.io)

* Recommended configuration `maxmemory-policy`: `volatile-lfu`

## Webserver

Any webserver that can serve PHP will work. Here are example configurations for common webservers:

<PageRef page="../../resources/references/config-reference/server/apache" />
<PageRef page="../../resources/references/config-reference/server/caddy" />
<PageRef page="../../resources/references/config-reference/server/nginx" />

## Recommended stack

We recommend the following stack:

* Webserver: Caddy
* PHP: 8.4
* SQL: MariaDB 11.8
* Node: 24
* Search: OpenSearch 2.17.1
* Queue: RabbitMQ
* Cache: Valkey 8.0

Recommended PHP ini:
<PageRef page="../hosting/performance/performance-tweaks#php-config-tweaks" />

## Next Steps

### Recommended: Docker Setup

Skip the manual installation and use our pre-configured Docker environment:

<PageRef page="./setup" title="Shopware Development Setup" />

### Alternative: Manual Setup

If you must install everything manually, you'll need to set up all the services listed above and then follow the Composer installation process described in our [setup guide](./setup#project-structure).
