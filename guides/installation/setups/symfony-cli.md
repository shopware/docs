---
nav:
  title: Symfony CLI
  position: 10

---

# Symfony CLI

Symfony CLI is a popular tool in the Symfony ecosystem that lets you run a local development environment without Docker. It is a lightweight alternative for running Shopware on your host system.

Shopware recommends [Docker](./docker.md) as the default setup for most users because it mirrors production and includes all services out of the box. However, if you already have PHP and a database locally, or want a faster, low-overhead workflow, Symfony CLI is a solid alternative.

## Prerequisites

- Install Symfony CLI locally, following the official [Symfony CLI installation guide](https://symfony.com/download).
- PHP, Composer, and Node installed locally. See [Requirements](../requirements.md) for guidance.
- A database server such as MySQL or MariaDB. Install this locally, using your system package manager. Or, if Docker is available, you can optionally run the database in a container while keeping PHP and Shopware local.

## Create a new project

This command downloads the latest Shopware Production template and installs all dependencies automatically. It’s the recommended way to start a new project because it ensures your setup matches the official Shopware structure:

```bash
composer create-project shopware/production <project-name>

# or install a specific version
composer create-project shopware/production:6.6.10.0 <project-name>
```

During project creation, Symfony Flex asks whether you want to use Docker. Choose **Yes** if you want to run the database in a container, or **No** to use a local MySQL/MariaDB server.

## Configure the database connection

Once the project is created, you’ll need to configure the database connection.

After creating the project, update the `DATABASE_URL` in a `.env.local` file to match your local database settings. In the project root, create `.env.local` and add:

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

**Tip**: Use the `-v` flag only if you want to completely reset the database.

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

Shopware creates a default administration user during installation:

| Username | Password   |
|:---------|:-----------|
| `admin`  | `shopware` |

**Tip**: Change these credentials after installation for security.

## Start the web server

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

### Stopping the web server

To stop the server and all running processes, run:

```bash
symfony server:stop
```

**Tip**: If port 8000 is already in use, start the server on a different port: `symfony server:start --port=8080`

## Change the PHP version (optional, recommended)

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

## Adjust PHP configuration (optional)

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

Symfony CLI uses PHP’s built-in web server by default. For better performance, you can configure it to use Nginx or Caddy: see the [web server reference](../../resources/references/config-reference/server/nginx.md).

## Build and watch the Administration and Storefront (optional)

You only need to run this step if you’re developing or customizing the frontend (Administration or Storefront). It compiles JavaScript and CSS assets so your changes are visible immediately.

<PageRef page="../template#building-watching-administration-and-storefront" />
