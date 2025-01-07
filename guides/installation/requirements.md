---
nav:
  title: Requirements
  position: 10

---

# Requirements

Before installing Shopware 6, take a quick look at the requirements below to check if your local environment is capable of running it.

## Operating System

Shopware 6 is currently only supported on linux and macOS setups.
Windows is only supported inside WSL 2.

## Versions

You can use these commands to check your actual environment:

* `php -v`: Shows CLI PHP version
* `php -m`: Shows CLI PHP modules
* `php -i | grep memory_limit`: Shows your actual CLI PHP memory limit
* `composer -v`: Shows your actual composer version
* `node -v`: Shows your actual Node version
* `npm -v`: Shows your actual NPM version

### PHP

* Compatible version: 8.2 and 8.3
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
  * `ext-json`
  * `ext-libxml`
  * `ext-mbstring`
  * `ext-openssl` (there is an [issue](https://github.com/shopware/shopware/issues/3543) with OpenSSL 3.0.7)
  * `ext-pcre`
  * `ext-pdo`
  * `ext-pdo_mysql`
  * `ext-phar`
  * `ext-simplexml`
  * `ext-xml`
  * `ext-zip`
  * `ext-zlib`
* Composer recommended version: 2.0 or higher

### SQL

* MySQL

  * Recommended version: 8.0
  * Minimum version: 8.0.17
  * Problematic versions: 8.0.20, 8.0.21

* MariaDB

  * Compatible version : at least 10.11

  * Problematic versions: [10.11.5, 11.0.3](https://jira.mariadb.org/browse/MDEV-31931)

For optimal MySQL performance, it is advisable to set `max_allowed_packet` to a minimum of 32 MB.

### JavaScript

* Node.js 20.0.0 or higher
* NPM 8.0.0 or higher

## Redis or key/value stores

Shopware uses the Redis Protocol and, therefore, supports the following key/value stores:

* [Redis v7 or higher](https://redis.io)
* [Valkey](https://valkey.io/)
* [Redict](https://redict.io)
* [KeyDB](https://docs.keydb.dev)
* [Dragonfly](https://www.dragonflydb.io)

* Recommended configuration `maxmemory-policy`: `volatile-lfu`

## Webserver

To run Shopware in a development context, the [Symfony CLI](https://symfony.com/doc/current/setup/symfony_server.html) will work nicely.

<PageRef page="../../resources/references/config-reference/server/apache" />
<PageRef page="../../resources/references/config-reference/server/caddy" />
<PageRef page="../../resources/references/config-reference/server/nginx" />

## Recommended stack

We recommend the following stack:

* Webserver: Nginx
* PHP: 8.3
* SQL: MySQL 8.4 or Percona MySQL 8.4
* Node: 20
* Search: OpenSearch 2.17.1
* Queue: RabbitMQ
* Cache: Valkey 8.0

Recommended PHP ini:
<PageRef page="../hosting/performance/performance-tweaks#php-config-tweaks" />

## Setup

Once the requirements are fulfilled, follow up with the [Template](template) guide to set up Shopware.
