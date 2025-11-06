---
nav:
  title: Requirements
  position: 1

---

# Requirements

Before setting up your Shopware 6 development environment, make sure your system is ready. Shopware 6 officially supports Unix-based systems (macOS or Linux). On Windows, use **WSL 2** or **Docker** for full compatibility.

Check these basics before installation:

- You’re using a Unix-based system (macOS or Linux) or Windows with WSL 2
- You have admin/root privileges
- Git is installed and available in your `PATH`
- You have at least 8 GB RAM (16 GB recommended) and 10 GB free disk space
- Docker Desktop, PHP, or Nix are not already bound to conflicting ports
- You have a reliable Internet connection for dependency downloads

## Docker setup (Recommended)

If you use the [Docker setup](./setups/docker.md), most dependencies are handled inside containers. You only need to install a few tools on your host system:

**Required on your host:**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine + Docker Compose v2 (Linux)
- Git
- A text editor or IDE (e.g. [PhpStorm](https://www.jetbrains.com/phpstorm/), VS Code)
- Optional: [Make](https://www.gnu.org/software/make/) (for using Makefile helpers in some examples)

The Docker setup automatically provides all backend services (PHP, MySQL, Elasticsearch, Redis, Mailhog, etc.) so you don’t need to install anything else manually.

To verify installation, run this command:

```bash
docker compose ps
```

## Symfony CLI setup

If you prefer a lightweight, host-native setup, ensure these tools are available locally.

**Required on your host:**

- PHP 8.2 or higher (with the following extensions):
  - `ext-ctype`, `ext-curl`, `ext-dom`, `ext-fileinfo`, `ext-gd`, `ext-intl`, `ext-json`,  
    `ext-mbstring`, `ext-openssl`, `ext-pdo_mysql`, `ext-xml`, `ext-zip`
- [Composer 2.x](https://getcomposer.org/)
- [Node.js 18 or higher](https://nodejs.org/) and [npm](https://www.npmjs.com/)
- [Symfony CLI](https://symfony.com/download)
- A running MySQL 8 database (local or remote)
- Optional: [Elasticsearch 8](https://www.elastic.co/elasticsearch/) for product search and indexing

You’ll also need a working web server. The Symfony CLI can provide one automatically for development.

## Devenv setup

The [Devenv setup](./setups/devenv.md) is based on [Nix](https://nixos.org/) and provides a reproducible environment across macOS, Linux, and CI systems.

**Required on your host:**

- [Nix package manager](https://nixos.org/download.html)
- Git
- Optional: Docker Engine (if you plan to use containerized services alongside Devenv)

Devenv automatically provides the correct PHP, Node.js, Composer, and other dependencies. No manual version management needed.

## Hardware recommendations

These recommendations ensure smooth local development regardless of setup:

| Component | Recommended |
|:-----------|:-------------|
| **CPU** | Quad-core or higher |
| **Memory (RAM)** | 8 GB minimum, 16 GB recommended (especially for Docker) |
| **Disk space** | ~10 GB free for Shopware + services |
| **Operating system** | macOS 13+, Windows 10/11 (Pro with WSL 2), or Linux (64-bit) |

## 🔒 Permissions and Network

- Ensure Docker or Symfony CLI has permission to bind to local ports (typically :80 or :8080).  
- Allow your system’s firewall to let containers or local web servers communicate internally.  
- On Linux, you may need to add your user to the `docker` group:

```bash
  sudo usermod -aG docker $USER
```

## Versions

Use the following commands to verify your local environment:

::: info
On many systems or hosting environments, multiple PHP versions may be installed.
Make sure to use the correct PHP binary, as CLI and FPM often have different `php.ini` files.
Ask your hosting provider for the correct PHP binary and how to adjust `php.ini`.
:::

- `php -v`: Show CLI PHP version
- `php -m`: List CLI PHP modules
- `php -i | grep memory_limit`: Show your CLI PHP memory limit
- `composer -V`: Show composer version
- `node -v`: Show Node version
- `npm -v`: Show NPM version

### PHP

- Compatible versions: 8.2, 8.3, 8.4
- `memory_limit`: 512MB minimum
- `max_execution_time`: 30 seconds minimum
- Extensions:
  - `ext-amqp` (optional; required for message queue, which is the default on PaaS)
  - `ext-curl`
  - `ext-dom`
  - `ext-fileinfo`
  - `ext-gd`
  - `ext-iconv`
  - `ext-intl`
  - `ext-mbstring`
  - `ext-openssl`
  - `ext-pcre`
  - `ext-pdo`
  - `ext-pdo_mysql`
  - `ext-phar`
  - `ext-simplexml`
  - `ext-xml`
  - `ext-zip`
  - `ext-zlib`
- Composer recommended version: 2.2 or higher

**Install PHP and Composer**:

<Tabs>

<Tab title="Ubuntu">

Add a new software repository to your system to have the latest PHP version.

```bash
sudo add-apt-repository ppa:ondrej/php

sudo apt-get install -y php8.4-fpm php8.4-mysql php8.4-curl php8.4-gd php8.4-xml php8.4-zip php8.4-opcache php8.4-mbstring php8.4-intl php8.4-cli

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
sudo apt-get install -y php8.4-fpm php8.4-mysql php8.4-curl php8.4-gd php8.4-xml php8.4-zip php8.4-opcache php8.4-mbstring php8.4-intl php8.4-cli

sudo wget https://getcomposer.org/download/latest-stable/composer.phar -O /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

</Tab>

<Tab title="macOS">

```bash
brew install php@8.4 composer
```

</Tab>

</Tabs>

### SQL

**MySQL**

- Recommended: 8.4
- Minimum: 8.0.22

**MariaDB**

- Recommended: 11.4
- Minimum: 10.11.6 or 11.0.4

Set `max_allowed_packet` to at least 32MB for optimal MySQL performance.

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

**Node.js**

- Recommended: 24.0.0 or higher
- Minimum: 20.0.0

**Install Node.js**:

<Tabs>

<Tab title="Ubuntu / Debian">

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x -o nodesource_setup.sh
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

Shopware uses the Redis Protocol and therefore supports the following key/value stores:

- [Valkey (recommended)](https://valkey.io/)
- [Redis v7 or higher](https://redis.io)
- [Redict](https://redict.io)
- [KeyDB](https://docs.keydb.dev)
- [Dragonfly](https://www.dragonflydb.io)

- Recommended configuration: `maxmemory-policy`: `volatile-lfu`

## Web server

For local development, the [Symfony CLI](https://symfony.com/doc/current/setup/symfony_server.html) provides a simple built-in web server. Alternatively, you can use one of the following configurations:

<PageRef page="../../resources/references/config-reference/server/apache" />
<PageRef page="../../resources/references/config-reference/server/caddy" />
<PageRef page="../../resources/references/config-reference/server/nginx" />

## Recommended stack

We recommend the following stack for optimal development performance:

- Web server: Caddy
- PHP: 8.4
- SQL: MariaDB 11.4
- Node: 24
- Search: OpenSearch 2.17.1
- Queue: RabbitMQ
- Cache: Valkey 8.0

Recommended PHP ini:

<PageRef page="../hosting/performance/performance-tweaks#php-config-tweaks" />

## Setup next steps

Once the requirements are fulfilled, return to the [Installation overview](./index.md) to choose your preferred setup (Docker, Symfony CLI, or Devenv).
