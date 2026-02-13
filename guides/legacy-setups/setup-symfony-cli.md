---
nav:
  title: Setting up Shopware with Symfony CLI
  position: 30

---

# Setting up Shopware with Symfony CLI

Symfony CLI lets you run Shopware 6 locally without Docker. It's a lightweight option that uses your system’s PHP, Composer, and Node.js installations.

Shopware recommends [Docker](./docker.md) as the default setup for most users because it mirrors production and includes all services out of the box. However, if you already have PHP and a database installed locally, or want a faster, low-overhead workflow, Symfony CLI is a solid alternative.

## Prerequisites

Before you begin, make sure your system meets the [Shopware 6 requirements](../requirements.md). You’ll need the following tools installed on your host machine:

- [Symfony CLI](https://symfony.com/download)
- PHP 8.2 or higher with the required extensions; see the [Requirements page](../requirements.md) for the complete list
- [Composer 2.x](https://getcomposer.org/)
- [Node.js 20+](https://nodejs.org/en/download) and npm
- A running MySQL 8 or MariaDB 11 database (local or remote)

You’ll also need a working web server. The Symfony CLI can provide one automatically for development.

> **macOS note:** If you installed PHP via Homebrew, make sure the `intl` extension is enabled: `brew install php-intl` then verify with `php -m | grep intl`.

Optional tools:

- [Elasticsearch 8](https://www.elastic.co/elasticsearch/) for product search and indexing
- Docker (for running only the database while keeping PHP local)

## Create a New Project

Run this command to create a new Shopware production project:

```bash
composer create-project shopware/production <project-name>

# or specify a version
composer create-project shopware/production:6.6.10.0 <project-name>
```

During project creation, Symfony Flex asks whether you want to use Docker. Choose **Yes** if you want to run the database in a container, or **No** to use a local MySQL/MariaDB server.

For more details, see the [Shopware Production template documentation](../template).

## Configure database connection

After creating the project, define your database settings in a `.env.local` file in the project root:

```dotenv
DATABASE_URL=mysql://username:password@localhost:3306/dbname
```

You can define other environment settings (like `APP_URL`, `MAILER_DSN`, or `SHOPWARE_ES_HOSTS`) in `.env.local` as needed.

Git ignores `.env.local`, so you can safely define machine-specific settings here without affecting your team’s shared configuration.

### Using Docker for the database (optional)

Running the database in a Docker container helps keep your local system clean and ensures version consistency with production environments. If you prefer this instead of installing MySQL or MariaDB locally, start Docker with:

```bash
docker compose up -d
```

This command starts the database container in the background.

To stop and remove the containers, while preserving the database data, run:

```bash
docker compose down
```

Run `docker compose down -v` to remove the containers and delete all stored data volumes.

::: info
Tip - Use the `-v` flag only if you want to completely reset the database.
:::

## Install Shopware

::: info
Always prefix commands with `symfony` to ensure the correct PHP version and configuration are used. Skipping this can cause issues such as using the wrong PHP binary or failing to connect to the Docker-based MySQL database.
:::

Run the following command to install Shopware:

```bash
symfony console system:install --basic-setup
```

The `--basic-setup` flag initializes Shopware with sensible defaults. It automatically creates a database schema, an admin user, and a default sales channel for the specified `APP_URL` so you can start testing immediately without manual configuration. Optional: Add the `--create-database` flag if your database doesn’t already exist.

If you encounter file-permission issues when installing or rebuilding caches, run `symfony console cache:clear` or check directory ownership.

### Default Administration credentials

Shopware creates a default Administration user during installation:

| Username | Password   |
|:---------|:-----------|
| `admin`  | `shopware` |

**Tip**: Change these credentials after installation for security.

## Start the webserver

The Symfony local web server automatically uses the correct PHP version, reads your `.env` configuration, and exposes HTTPS by default. This makes it more reliable than the built-in PHP server for local development.

Start the local web server with:

```bash
symfony server:start
```

By default, this starts the server on port `8000`. Access the Shopware Administration at [http://localhost:8000/admin](http://localhost:8000/admin) and the Storefront at [http://localhost:8000](http://localhost:8000).

To run the server in the background, add the `-d` flag:

```bash
symfony server:start -d
```

This frees up your terminal for other commands.

### Stopping the Web Server

To stop the server and all running processes, run:

```bash
symfony server:stop
```

**Tip**: If port 8000 is already in use, start the server on a different port: `symfony server:start --port=8080`

## Set the PHP version (optional, recommended)

Specify a PHP version to ensure consistent environments across team members.

To change the PHP version used by Symfony CLI, create a `.php-version` file in the project root and specify the desired version. For example, to use PHP 8.3, create `.php-version` and add:

```dotenv
8.3
```

Symfony CLI will now use PHP 8.3 for all commands in this project. Commit this file to your version control system so everyone on your team uses the same PHP version.

To verify which PHP version is active, run:

```bash
symfony php -v
```

## Adjust PHP configuration (Optional)

Adjusting PHP settings like `memory_limit` or `max_execution_time` can prevent build or cache warm-up processes from failing, especially during large Administration builds or when working on plugins.

You can override PHP settings for this project by adding a `php.ini` file in the project root. For example, to increase the `memory_limit` to 512 MB, add:

```ini
memory_limit = 512M
```

To confirm your configuration, run:

```bash
symfony php -i
```

By keeping your `php.ini` in version control, you ensure consistent behavior across development environments and CI pipelines.

Symfony CLI uses PHP’s built-in web server by default. For better performance, you can configure it to use Nginx or Caddy: see the [web server reference](../../../resources/references/config-reference/server/nginx.md).
