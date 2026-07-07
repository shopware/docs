---
nav:
  title: Start Developing
  position: 4

---

# Start Developing

This guide covers what to do once your [development environment](./dev-environment.md) is running.

## Your Environment

Once the containers are up, you have:

- **Storefront**: `http://127.0.0.1:8000`
- **Administration**: `http://127.0.0.1:8000/admin` *(default credentials: `admin` / `shopware`)*

The DevTUI dashboard (`shopware-cli project dev`) shows these URLs and your credentials at a glance.

Common development areas:

- `custom/` — your plugins and themes
- `bin/console` — application CLI (Symfony console), runnable from your host via `shopware-cli project console`
- The Administration UI

## Running Commands

Use `shopware-cli project console` to run `bin/console` commands from your host — no need to enter the container:

```bash
# Clear caches
shopware-cli project console cache:clear

# Install and activate a plugin
shopware-cli project console plugin:install --activate MyPlugin

# Run database migrations
shopware-cli project console database:migrate --all
```

:::info Legacy workflow
If your project uses the older `make`-based setup and you need to shell into the container manually:

```bash
make shell
docker compose exec web bash
```

Most tasks are now easier with `shopware-cli project console` and the DevTUI dashboard.
:::

## Frontend Development

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

## Administration Setup

When accessing the Administration for the first time:

- Sign in or create a Shopware account (required to install Store extensions)
- Connect to the **Shopware Store**
- Install plugins or themes from the Store
- Configure payment methods if needed

Basic shop settings (name, language, currency) can be changed later under **Settings > Shop > Basic information**.

## Environment Customization

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

### Connecting to a Remote Database

To use an external database, set `DATABASE_URL` in `.env.local`:

```bash
DATABASE_URL="mysql://user:password@<host>:3306/<database>"
```

If the container can't reach `localhost`, try `host.docker.internal` or your host's LAN IP.

### Environment Variables

Create a `.env` file in the project root to override defaults. Most changes apply immediately. Changes to `APP_ENV` require a restart (`shopware-cli project dev stop && shopware-cli project dev start`).

## Shopware Account and Private Composer Packages

To install licensed extensions from Shopware's private Composer registry:

```bash
composer config --global http-basic.packages.shopware.com <username> <token>
```

Create an access token in your Shopware account under **Shops > Licenses**.

## Next Steps

- [Build Extensions](./extensions/index.md) — Create plugins, apps, and themes
- [Work with APIs](./integrations-api/index.md) — Integrate external systems
- [Set up CI/CD](../../products/tools/cli/project-commands/build.md) — Automate builds and deployments
