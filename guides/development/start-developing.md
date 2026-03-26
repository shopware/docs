---
nav:
  title: Start Developing
  position: 2

---

# Start Developing

This section outlines the typical next steps for development in your running Shopware instance.

## Access Administration and Storefront

- Storefront: [http://localhost:8000](http://localhost:8000)
- Administration: [http://localhost:8000/admin](http://localhost:8000/admin) *(default credentials: `admin` / `shopware`)*

Common development areas:

- `custom/`: your plugins and themes
- `bin/console`: application CLI (Symfony console)
- the Administration UI

Projects follow the [project template layout](../installation/project-overview.md).

## Using `bin/console` for development

To run commands, open a shell inside the web container:

```bash
make shell
```

This command drops you into the container’s terminal; you’ll see the prompt change.

From inside the container, retrieve a list of commands with:

```bash
bin/console
```

Tasks handled in `bin/console` include:

- Installing and activating plugins
- Clearing caches
- Running migrations
- Adjusting system configuration
- Running plugin-related development tasks

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

## Frontend development

Use these commands when developing or customizing the UI, including Storefront, Administration, or extensions that affect either one:

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

### Alternative: run build and watch scripts directly

If you prefer not to use `make`, the created project also provides bash scripts in the `bin/` directory to build and watch the Administration and Storefront. Run the following commands:

```bash
./bin/build-administration.sh
./bin/build-storefront.sh
./bin/watch-administration.sh
./bin/watch-storefront.sh
```

The `watch` commands monitor changes to the Administration and Storefront and automatically rebuild them.

## Local environment overview

With Shopware running, your local setup includes:

- A web service (serves both the Storefront and the Administration).
- Database (MariaDB) runs on port 3306 inside Docker.
  - Internal hostname: `database`.
  - Host access: `localhost:3306`, if you want to inspect the database directly.
- Mailpit local mail testing tool available at [http://localhost:8025](http://localhost:8025). Use this to view emails sent by Shopware (e.g., registration or order confirmations) without needing an external mail server.
- Adminer (database UI), a lightweight web interface for viewing and editing your database available at [http://localhost:8080](http://localhost:8080).

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

- Change ports
- Add services
- Enable debugging
- Adjust networking

This keeps your changes local and out of version control.

## Shopware account and Composer (private packages)

Shopware operates a private Composer registry for licensed and commercial extensions. To install packages that require Shopware account authentication, configure Composer with your Shopware account credentials (create an access token in your Shopware account area when offered):

```bash
composer config --global http-basic.packages.shopware.com <username> <token>
```

Use the hostname and flow described in your Shopware account or extension download instructions if they differ.

## Next steps

- Build extensions: [Extensions](extensions/index.md).
- Integrate via HTTP: [APIs](integrations-api/index.md).
