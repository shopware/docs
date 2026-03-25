---
nav:
  title: Start Developing
  position: 2

---


# Start Developing

With Shopware installed, familiarize yourself with the core parts of the system as you start your development journey—including the Shopware CLI's use in development, highlighted below.

## Working in the Administration

To begin any development, first access the Administration by opening [http://localhost/admin](http://localhost/admin). The Administration is part of the runtime environment and can be used throughout development for these and other steps:

* Installing and activating extensions
* Configuring the system
* Managing entities such as products and customers
* Verifying extension behavior

## Project structure

Important directories:

* `custom/` → plugins, apps, and themes
* `bin/console` → application CLI (Symfony console) for development tasks

:::info
Inside the container, you only need `bin/console …`. But if you prefer to run commands from your host machine instead, you can use the full Docker prefix: `docker compose exec web bin/console cache:clear`.
:::

## Using the Shopware CLI for development

To run CLI commands, open a shell inside the web container:

```bash
make shell
```

This command drops you into the container’s terminal; you’ll see the prompt change.

From inside the container, retrieve a list of CLI commands with:

```bash
bin/console
```

Tasks handled in the CLI include:

* Installing and activating plugins
* Clearing caches
* Running migrations
* Adjusting system configuration
* Developing plugins and themes

## Local environment overview

With Shopware running, your local setup includes:

* A web service (serves both the Storefront and the Administration).
* Database (MariaDB) runs on port 3306 inside Docker.
  * Internal hostname: `database`.
  * Host access: `localhost:3306`, if you want to inspect the database directly.
* Mailpit local mail testing tool available at [http://localhost:8025](http://localhost:8025). Use this to view emails sent by Shopware (e.g., registration or order confirmations) without needing an external mail server.
* Adminer (database UI), a lightweight web interface for viewing and editing your database available at [http://localhost:8080](http://localhost:8080).

For Docker setups, inspect ports and services with:

```bash
docker compose ps
```

## Environment setup

### Connecting to a remote database

To use a database outside the Docker stack, set `DATABASE_URL` in `.env.local` in the standard form:

```bash
DATABASE_URL="mysql://user:password@<host>:3306/<database>"
```

Containers cannot always reach services bound only to the host's `localhost`. If `localhost` does not work, try `host.docker.internal` or your host machine’s LAN IP, or add an `extra_hosts` entry in `compose.yaml`.

### Environment variables

You can create a `.env` file in the project root to override default environment variables. Most changes take effect automatically without requiring container restarts. Changes to `APP_ENV` require a restart:

```bash
make up
```

### Docker overrides

Use `compose.override.yaml` to:

* Change ports
* Add services
* Enable debugging
* Adjust networking

This keeps your changes local and out of version control.

## Generated project structure

CLI-created projects follow the [project template layout](../installation/project-overview.md): `custom/` (plugins, apps, static-plugins), `config/`, `src/`, `bin/console`, `compose.yaml`, and `Makefile` shortcuts. After `plugin:create`, your plugin lives under `custom/plugins/<Name>/` with `src/`, `composer.json`, and the plugin base class—see the [Plugin base guide](../plugins/plugins/plugin-base-guide.md).

## Shopware account and Composer (private packages)

Shopware operates a private Composer registry for licensed and commercial extensions. To install packages that require Shopware account authentication, configure Composer with your Shopware account credentials (create an access token in your Shopware account area when offered):

```bash
composer config --global http-basic.packages.shopware.com <username> <token>
```

Use the hostname and flow described in your Shopware account or extension download instructions if they differ.

## Next steps

* Build extensions: [Extensions](extensions/index.md).
* Integrate via HTTP: [APIs](integrations-api/index.md).
