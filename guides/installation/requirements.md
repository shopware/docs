---
nav:
  title: Requirements
  position: 1

---

# Requirements

Before installing Shopware 6, take a quick look at the requirements below to check if your local environment is capable of running it.

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
* Composer recommended version: 2.2 or higher

This is how you install PHP and Composer:

<Tabs>

<Tab title="Ubuntu">

Add a new software repository to your system to have the latest PHP version.

```bash
sudo add-apt-repository ppa:ondrej/php

sudo apt-get install -y php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd php8.3-xml php8.3-zip php8.3-opcache php8.3-mbstring php8.3-intl php8.3-cli

sudo wget https://getcomposer.org/download/latest-stable/composer.phar -O /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

</Tab>

<Tab title="Debian">

Add a new software repository to your system to have the latest PHP version:

```bash
sudo apt-get install extrepo
sudo extrepo enable sury

sudo apt-get update
sudo apt-get install -y php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd php8.3-xml php8.3-zip php8.3-opcache php8.3-mbstring php8.3-intl php8.3-cli

sudo wget https://getcomposer.org/download/latest-stable/composer.phar -O /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

</Tab>

<Tab title="macOS">

```bash
brew install php@8.3 composer
```

</Tab>

</Tabs>

### SQL

* MySQL

  * Recommended version: 8.4
  * Minimum version: 8.0.22

* MariaDB

  * Recommended version: 11.4
  * Minimum version : 10.11.6 or 11.0.4

For optimal MySQL performance, it is advisable to set `max_allowed_packet` to a minimum of 32 MB.

This is how you install MariaDB:

<Tabs>

<Tab title="Ubuntu / Debian">

```bash
sudo apt install -y mariadb-server
```

</Tab>

<Tab title="macOS">

The easiest way is to use [Homebrew](https://brew.sh/):

```bash
brew install mariadb
```

</Tab>

</Tabs>

### JavaScript

* Node.js 22.0.0 or higher

This is how you install Node.js:

<Tabs>

<Tab title="Ubuntu / Debian">

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh

sudo apt-get install -y nodejs
```

</Tab>

<Tab title="macOS">

```bash
brew install node@22
```

</Tab>

</Tabs>

## Redis or key/value stores

Shopware uses the Redis Protocol and, therefore, supports the following key/value stores:

* [Valkey (recommended)](https://valkey.io/)
* [Redis v7 or higher](https://redis.io)
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

* Webserver: Caddy
* PHP: 8.4
* SQL: MariaDB 11.4
* Node: 22
* Search: OpenSearch 2.17.1
* Queue: RabbitMQ
* Cache: Valkey 8.0

Recommended PHP ini:
<PageRef page="../hosting/performance/performance-tweaks#php-config-tweaks" />

## Setup

Once the requirements are fulfilled, follow up with the [Template](template) guide to set up Shopware.
