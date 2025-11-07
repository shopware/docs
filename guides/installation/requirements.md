---
nav:
  title: Requirements
  position: 1

---

# Requirements

This page lists the system requirements and supported software versions for developing Shopware 6. Find installation steps for each setup method on their respective pages:

- [Docker setup](./setups/docker.md); recommended for most users
- [Devenv setup](./setups/devenv.md)
- [Symfony CLI](./setups/symfony.md)

## Requirements for all setups

Before setting up your Shopware 6 development environment, make sure your system is ready. Check these basics before installation:

- You’re using a Unix-based system (macOS or Linux), or Windows with WSL 2 or Docker for full compatibility
- You have admin/root privileges (if required in your organization)
- [Git](https://git-scm.com/) installed and available in your `PATH`
- You have at least 8 GB RAM (16 GB recommended) and 10 GB free disk space
- Docker Desktop, PHP, or Nix are not already bound to conflicting ports
- You have a reliable Internet connection for dependency downloads

## Hardware recommendations

These recommendations ensure smooth local development regardless of setup:

| Component | Recommended |
|:-----------|:-------------|
| **CPU** | Quad-core or higher |
| **Memory (RAM)** | 8 GB minimum, 16 GB recommended (especially for Docker) |
| **Disk space** | ~10 GB free for Shopware + services |
| **Operating system** | macOS 13+, Windows 10/11 (Pro with WSL 2), or Linux (64-bit) |

## Permissions and networking

- Ensure Docker or Symfony CLI has permission to bind to local ports (typically :80 or :8080).
- Allow your system’s firewall to let containers or local web servers communicate internally.
- On Linux, you may need to add your user to the `docker` group:

```bash
sudo usermod -aG docker $USER
```

## Recommended stack and supported versions

The following versions and configurations are officially supported for Shopware 6 development:

| Component | Install | Recommended | Required / Notes |
|:-----------|:---------|:-------------|:----------------|
| **PHP** | [PHP installation guide](https://www.php.net/manual/en/install.php)<br>[Composer installation guide](https://getcomposer.org/download/) | 8.4 | **Required.** 8.2+ supported.<br>`memory_limit ≥ 512M`, `max_execution_time ≥ 30s`.<br>Required extensions: `ctype`, `curl`, `dom`, `fileinfo`, `gd`, `iconv`, `intl`, `mbstring`, `openssl`, `pcre`, `pdo_mysql`, `phar`, `simplexml`, `xml`, `zip`, `zlib`.<br>Optional: `amqp` (for message queues).<br>Composer 2.2+ recommended.<br>**macOS note:** If you install PHP with Homebrew, the `intl` extension may not be included by default. Install it separately:<br>`brew install php-intl` then verify with `php -m | grep intl`. |
| **SQL** | [MariaDB installation guide](https://mariadb.com/kb/en/getting-installing-and-upgrading-mariadb/)<br>[MySQL installation guide](https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/) | MariaDB 11.4 / MySQL 8.4 | **Required.** MariaDB ≥ 10.11.6 or MySQL ≥ 8.0.22.<br>`max_allowed_packet ≥ 32M` for optimal performance. |
| **Node.js / npm** | [Node.js downloads](https://nodejs.org/en/download) | Node 24 / npm 10 | **Required.** Node 20+ supported. |
| **Search** | [OpenSearch installation guide](https://opensearch.org/docs/latest/install-and-configure/install-opensearch/index/) | OpenSearch 2.17.1 | **Optional.** Used for product search and indexing. |
| **Cache / KV store** | [Valkey](https://valkey.io/)<br>[Redis](https://redis.io) / [Redict](https://redict.io) / [KeyDB](https://docs.keydb.dev) / [Dragonfly](https://www.dragonflydb.io) | Valkey 8.0 | **Optional.** Used for caching and session storage.<br>Redis-protocol compatible alternatives supported.<br>`maxmemory-policy: volatile-lfu`. |
| **Web server** | [Caddy setup guide](https://developer.shopware.com/docs/resources/references/config-reference/server/caddy.html)<br>[Apache](https://developer.shopware.com/docs/resources/references/config-reference/server/apache.html)<br>[Nginx](https://developer.shopware.com/docs/resources/references/config-reference/server/nginx.html) | Caddy | **Required.** For local development, the [Symfony CLI server](https://symfony.com/doc/current/setup/symfony_server.html) works out of the box. |
| **Queue** | [RabbitMQ downloads](https://www.rabbitmq.com/download.html) | RabbitMQ | **Optional.** Only required if you plan to use a message queue, which is the default on PaaS. |

See also: [PHP performance tweaks guide](https://developer.shopware.com/docs/guides/hosting/performance/performance-tweaks.html#php-config-tweaks)

## Verifying your local environment

Use the following commands to verify your local environment:

::: info
On many systems or hosting environments, multiple PHP versions may be installed.
Make sure to use the correct PHP binary, as CLI and FPM often have different `php.ini` files.
Ask your hosting provider for the correct PHP binary and how to adjust `php.ini`.
:::

- `php -v`: Show CLI PHP version
- `php -m`: List CLI PHP modules
- `php -i | grep memory_limit`: Show your CLI PHP memory limit
- `composer -V`: Show Composer version
- `node -v`: Show Node version
- `npm -v`: Show npm version

## Next steps

Once your environment meets these requirements, proceed to your preferred installation method:

- [Docker setup](./setups/docker.md)
- [Symfony CLI setup](./setups/symfony.md)
- [Devenv setup](./setups/devenv.md)
