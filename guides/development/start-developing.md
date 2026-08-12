---
nav:
  title: Start Developing
  position: 2

---

# Start Developing

This guide covers what to do once your [development environment](./dev-environment.md) is running.

## Your environment

Once the containers are up, you have:

- **Storefront**: `http://127.0.0.1:8000`
- **Administration**: `http://127.0.0.1:8000/admin` *(default credentials: `admin` / `shopware`)*

The development terminal user interface (TUI) (`shopware-cli project dev`) shows these URLs and your credentials at a glance.

Common development areas:

- `custom/` - your plugins and themes
- `bin/console` - application CLI (Symfony console), runnable from your host via `shopware-cli project console`
- The Administration UI

## Running commands

Use `shopware-cli project console` to run `bin/console` commands from your host — Shopware CLI routes them into the web container for Docker projects:

```bash
# Clear caches
shopware-cli project console cache:clear

# Install and activate a plugin
shopware-cli project console plugin:install --activate MyPlugin

# Run database migrations
shopware-cli project console database:migrate --all
```

For the shorter `swx` alias, see [Running Shopware commands](./dev-environment.md#running-shopware-commands).

### Composer, PHP, and npm

There is no Shopware CLI wrapper for arbitrary Composer commands yet. For Docker projects, run them **inside** the `web` container so you use the container PHP (`memory_limit ≥ 512M`) and can reach the database and other services:

```bash
# Interactive shell
docker compose exec web bash

# One-off Composer commands
docker compose exec web composer require some/package
docker compose exec web composer install
```

Do not run `composer` on the host against a Docker project unless your host PHP meets Shopware's requirements (`memory_limit ≥ 512M` and the needed extensions). The TUI **Setup health** memory check reflects the container runtime, not host PHP. Details: [Running Composer, PHP, and npm](./dev-environment.md#running-composer-php-and-npm).

:::info Older make-based setups
If your project still uses the older `make`-based workflow:

```bash
make shell
# or
docker compose exec web bash
```

Prefer `shopware-cli project console` and the development TUI for console and day-to-day environment tasks.
:::

## Frontend development

When developing the Administration or Storefront, use watchers for Hot Module Replacement. Start them directly from the DevTUI Overview tab (key `1`), or from the command line:

```bash
# Administration (Vite HMR on port 5173)
shopware-cli project admin-watch

# Storefront (webpack HMR on port 9998)
shopware-cli project storefront-watch
```

To only watch specific extensions:

```bash
shopware-cli project admin-watch --only-extensions MyPlugin,OtherPlugin
shopware-cli project storefront-watch --only-extensions MyPlugin,OtherPlugin
```

To exclude specific extensions:

```bash
shopware-cli project admin-watch --skip-extensions SomePlugin
```

For the Storefront Watcher, the CLI prompts you to select a sales channel if one isn't configured.

When working with many third-party extensions, building only custom extensions speeds things up:

```bash
shopware-cli project storefront-build --only-custom-static-extensions
shopware-cli project admin-build --only-custom-static-extensions
```

For more details, see [Using Watchers](./tooling/using-watchers.md).

## Administration setup

When accessing the Administration for the first time:

- Sign in or create a Shopware account (required to install Store extensions)
- Connect to the Shopware Store
- Install plugins or themes from the Store
- Configure payment methods if needed

Basic shop settings (name, language, currency) can be changed later under **Settings > Shop > Basic information**.

## Environment customization

### compose.override.yaml

The `compose.yaml` file is managed by shopware-cli and regenerated automatically. Place all customizations in `compose.override.yaml`:

```yaml
# compose.override.yaml
services:
  web:
    environment:
      APP_ENV: dev
    ports:
      - "9003:9003"   # Xdebug

  database:
    ports:
      - "3306:3306"   # Expose MySQL to host
```

### Connecting to a remote database

To use an external database, set `DATABASE_URL` in `.env.local`:

```bash
DATABASE_URL="mysql://user:password@<host>:3306/<database>"
```

If the container can't reach `localhost`, try `host.docker.internal` or your host's LAN IP.

### Environment variables

Create a `.env` file in the project root to override defaults. Most changes apply immediately. Changes to `APP_ENV` require a restart (`shopware-cli project dev stop && shopware-cli project dev start`).

## Shopware account and private Composer packages

To install licensed extensions from Shopware's private Composer registry, configure Composer authentication. Prefer a project-level `auth.json` in the project root so both host tooling and the bind-mounted web container can use it:

```bash
# Writes auth.json in the project root (bind-mounted into the web container)
composer config --auth http-basic.packages.shopware.com <username> <token>
```

Then install packages with Composer **inside** the container:

```bash
docker compose exec web composer require <package>
```

Create an access token in your Shopware account under **Shops > Licenses**. Do not commit `auth.json`.

## Next steps

- [Build Extensions](./extensions/index.md) - Create plugins, apps, and themes
- [Work with APIs](./integrations-api/index.md) - Integrate external systems
- [Set up CI/CD](../../products/tools/cli/project-commands/build.md) - Automate builds and deployments
