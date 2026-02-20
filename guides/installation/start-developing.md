---
nav:
  title: Start Development
  position: 5

---

# After Installation - Start Development

This section outlines the typical next steps for development in your running Shopware instance.

## Access Administration and Storefront

- Storefront: [http://localhost:8000](http://localhost:8000)
- Administration: [http://localhost:8000/admin](http://localhost:8000/admin) *(default credentials: `admin` / `shopware`)*

Common development areas:

- `custom/`: your plugins and themes
- `bin/console`: application CLI (Symfony console)
- the Administration UI

## Using the Shopware CLI

To run CLI commands, open a shell inside the web container:

```bash
make shell
```

This command drops you into the container’s terminal (you’ll see the prompt change).

From inside the container, use:

```bash
bin/console
```

Development and automation tasks are handled in the CLI, including:

- Installing and activating plugins
- Clearing caches
- Running migrations
- Adjusting system configuration
- Developing plugins and themes

:::info
Inside the container, you only need `bin/console …`. But if you prefer to run commands from your host machine instead, you can use the full Docker prefix: `docker compose exec web bin/console cache:clear`.
:::

## Administration setup tasks

- Open the **Admin** at `http://localhost:8000/admin`
- Sign in or create a Shopware account; this is necessary when you want to install Store extensions.
- Connect to the **Shopware Store**
- Install plugins or themes from the Store
- Configure payment methods; not necessary for local development

Basic shop settings such as shop name, default language, and currency can be changed later in the Admin under **`Settings > Shop > Basic information`**.

## Frontend and Administration development

When modifying Storefront or Administration code, or developing plugins that affect the UI, use the following Makefile commands:

```bash
# Build the administration (admin panel)
make build-administration

# Build the storefront (shop frontend)
make build-storefront

# Start a watcher to rebuild the Administration automatically when files change
make watch-admin

# Start a watcher for Storefront
make watch-storefront
```

These commands become part of the everyday development workflow. Watchers are typically used during active UI development.

## Inspecting and debugging locally

To connect to the database from your host machine (for example, via Adminer or a local MySQL client), use:

- Host: `127.0.0.1` or `localhost`
- And the exposed port is shown in :

```bash
docker compose ps
```

## Local services overview

With Shopware running, your local setup includes:

- A web service (serves both the storefront and the administration)
- Database (MariaDB) runs on port 3306 inside Docker.
  - Internal hostname: `database`
  - Host access: `localhost:3306`, if you want to inspect the database directly.
- Mailpit local mail testing tool available at [http://localhost:8025](http://localhost:8025). Use this to view emails sent by Shopware (e.g., registration or order confirmations) without needing an external mail server.
- Adminer (database UI), a lightweight web interface for viewing and editing your database available at [http://localhost:8080](http://localhost:8080).

Inspect ports and services with:

```bash
docker compose ps
```

## Enable profiler/debugging for PHP

Once your Shopware environment is running, you may want to enable PHP debugging or profiling to inspect code execution, set breakpoints, or measure performance. The default setup doesn’t include these tools, but you can enable them using Docker overrides.

As an example, enable [Xdebug](https://xdebug.org/) inside the web container by creating a `compose.override.yaml` in your project root with the following configuration:

```yaml
services:
    web:
        environment:
            XDEBUG_MODE: debug
            XDEBUG_CONFIG: client_host=host.docker.internal
            PHP_PROFILER: xdebug
```

Save the file and apply the changes:

```bash
docker compose up -d
```

This restarts the containers with `Xdebug` enabled. You can now attach your IDE (for example, PHPStorm or VS Code) to the remote debugger on the default Xdebug port `9003`.

Shopware’s Docker setup also supports other profilers, like [Blackfire](https://www.blackfire.io/), [Tideways](https://tideways.com/), and [PCOV](https://github.com/krakjoe/pcov). For Tideways and Blackfire, you'll need to run an additional container. For example:

```yaml
services:
    web:
        environment:
 - PHP_PROFILER=blackfire
    blackfire:
        image: blackfire/blackfire:2
        environment:
            BLACKFIRE_SERVER_ID: XXXX
            BLACKFIRE_SERVER_TOKEN: XXXX
```

## Adjusting your local environment

### Environment variables

You can create a `.env` file in the project root to override default environment variables. Most changes take effect automatically without requiring container restarts. Changes to `APP_ENV` require a restart:

```bash
make up
```

### Docker overrides

Use `compose.override.yaml` to:

- Change ports
- Add services
- Enable debugging
- Adjust networking

This keeps your changes local and out of version control.

## Working with data and external systems

### Store API access key

During setup, an access key is automatically generated for your default Sales Channel, which is usually the Storefront. You’ll see an output similar to this:

```bash
Access tokens:
+------------+----------------------------+
| Key | Value |
+------------+----------------------------+
| Access key | `string of capital letters` |
```

The access key for authenticating requests to the [Store API](../../concepts/api/store-api.md) - for example, when fetching product or category data from an external app, headless storefront, or API client. Example usage:

```bash
curl -H "sw-access-key: YOUR_ACCESS_KEY" \
 http://localhost:8000/store-api/product
```

You can view or regenerate this key in the Admin under **`Sales Channels > [Your Channel] > API Access`**.

## Environment configuration

### Connecting to a remote database

If you want to use a database outside the Docker stack, set `DATABASE_URL` in `.env.local` in the standard form:

```bash
DATABASE_URL="mysql://user:password@<host>:3306/<database>"
```

Containers cannot always reach services bound only to the host's `localhost`. If `localhost` does not work, try `host.docker.internal` or your host machine’s LAN IP, or add an `extra_hosts` entry in `compose.yaml`.

## Running and maintaining the environment

### Linux file permissions and known issues

On Linux hosts, your user ID must be 1000 for file permissions to work correctly inside the containers. Check your user ID with:

```bash
id -u
```

Other IDs may cause permission errors when running `make up` or writing to project files.

## Preparing for production

If you're preparing to run Shopware in production using Docker, refer to [Docker](../hosting/installation-updates/docker.md) guide for details on production images, environment configuration, and deployment workflows.

## Build and watch the Administration and Storefront

You only need to run this step if you’re developing or customizing the frontend (Administration or Storefront). It compiles JavaScript and CSS assets so your changes are visible immediately.

The created project contains bash scripts in the `bin/` folder to build and watch the Administration and Storefront. Run the following commands:

```bash
./bin/build-administration.sh
./bin/build-storefront.sh
./bin/watch-administration.sh
./bin/watch-storefront.sh
```

Use these scripts to build the Administration and Storefront. The `watch` commands monitor changes to the Administration and Storefront and automatically rebuild them.

For the advanced Docker configurations below, see [Advanced Docker Config](./advanced-options.md) section.

- Image variants
- Minio (S3)
- OrbStack routing
- Production image proxy configuration
- Service internals
