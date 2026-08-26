---
nav:
  title: Development Environment
  position: 3

---

# Development Environment

Shopware CLI provides a fully integrated Docker-based development environment. A single command launches your entire stack, streams logs, manages watchers, and lets you configure PHP and profiling - all without manually editing Docker files.

:::info
The development environment requires a compatibility date of `2026-03-01` or later in your `.shopware-project.yml`. Projects created with `shopware-cli project create` have this set automatically.
:::

## Starting the environment

From your Shopware project root, run:

```bash
shopware-cli project dev
```

This launches the development terminal user interface (TUI). If your containers aren't running yet, the dashboard starts them. If Shopware hasn't been installed, it guides you through the installation wizard.

To start without the interactive dashboard (for CI or scripting):

```bash
shopware-cli project dev start
```

To check whether the environment is running:

```bash
shopware-cli project dev status
```

To stop everything:

```bash
shopware-cli project dev stop
```

## Development terminal user interface (TUI)

The dashboard has three tabs, which can be switched to with the corresponding number key or by using the Tab button.

### 1. Overview Tab

Your environment at a glance:

**Left panel:**

- **Shop** - Shopware version, environment type (`docker`, `local`, or `symfony-cli`), shop and admin URLs, and security update expiry date
- **Access** - URLs, usernames, and passwords for Shop Admin, Adminer, and Mailpit
- **Setup health** - runtime checks (PHP version and memory limit of the project executor — the web container for Docker projects), local behavior warnings, and debug settings, each showing the current value against the recommended one. Runtime memory is not the same as host PHP used by a local `composer` binary

**Right panel:**

- **Watchers** - toggle Admin and Storefront watchers on or off

### 2. Instance Tab

Browse and stream logs from your running environment:

- **Containers** - all Docker containers with a live status indicator for the active one
- **Processes** - watcher processes (Admin Watcher, Storefront Watcher) when running
- **Log files** - application log files (e.g., `dev.log`)

Use the sidebar to switch sources. Toggle follow mode with `Enter`.

### 3. Config Tab

The following table lists the settings you can change in the Config tab:
| Setting | Options |
|---------|---------|
| **PHP Version** | `8.2`, `8.3`, `8.4`, `8.5` |
| **Profiler** | `none`, `xdebug`, `blackfire`, `tideways`, `pcov`, `spx` |

When selecting `blackfire` or `tideways`, additional credential fields appear. Sensitive credentials are stored in `.shopware-project.local.yml` (excluded from version control).

:::info
The profiler is now configured via the Config tab.
:::

After changing settings, select **Save & Regenerate** to update `compose.yaml`. Restart the environment for changes to take effect.

## Migrating from legacy setups

If your project was created before March 2026 and uses the older `make up`/`make setup` workflow with a hand-written `compose.yaml`, running `shopware-cli project dev` automatically detects this and launches a setup wizard instead of the dashboard.

### What triggers the wizard

The wizard appears when your project's `compatibility_date` in `.shopware-project.yml` is before `2026-03-01` (or missing entirely). This signals that the project hasn't been configured for the new development environment yet.

### What the wizard does

Walking through the setup wizard takes about a minute. Here's what happens at each step:

1. **Welcome** - explains what the wizard will do and asks you to proceed
2. **Admin user** - pre-fills `admin` (you can change it) for the Shopware admin account
3. **Admin password** - pre-fills `shopware` (you can change it); stored as credentials in `.shopware-project.yml`
4. **PHP version** - reads your `composer.lock` to determine compatible PHP versions and offers the highest supported one as the default (e.g., `8.5`)

After you confirm, the wizard:

- Sets `compatibility_date` to `2026-03-01` in `.shopware-project.yml`
- Adds a `local` environment with type `docker` and your chosen URL/credentials
- Configures the Docker PHP version
- Generates a new `compose.yaml` tailored to your project's dependencies
- Starts the Docker containers and runs the Shopware installer

### What happens to existing files

| File | What changes |
|------|-------------|
| `.shopware-project.yml` | Updated with `compatibility_date`, `environments`, and `docker` config |
| `.shopware-project.local.yml` | Created if you chose a profiler with credentials (Blackfire, Tideways) |
| `compose.yaml` | **Replaced** with the CLI-managed version - your old file is overwritten, so back it up first and move any customizations to `compose.override.yaml` |
| `Makefile` | **Not touched** - you can delete it once you've migrated, or keep it around |
| `composer.json` | If `shopware/deployment-helper` isn't already present, it's added to `require` |

### After the wizard completes

If `shopware/deployment-helper` was added to `composer.json`, you'll be prompted to install dependencies. With the Docker environment type, run Composer **inside** the web container so PHP uses the container memory limit and database connection:

```bash
docker compose exec web composer install
```

This pulls in the helper package, which the dashboard uses to run the Shopware installer. After that, the environment starts automatically.

Once migrated, the legacy `make up`/`make down`/`make setup` workflow is no longer needed; use `shopware-cli project dev` to manage your environment instead. If you had customizations in your old `compose.yaml`, move them to `compose.override.yaml` before running the wizard (or recover them from git afterwards).

## Viewing application logs

Inspect Shopware logs without opening the dashboard:

```bash
# Last 100 lines of the most recently modified log
shopware-cli project logs

# A specific log file
shopware-cli project logs dev-2026-05-18.log

# Follow the log (like tail -f)
shopware-cli project logs -f

# List available log files
shopware-cli project logs -l

# Set number of lines
shopware-cli project logs --lines 50
```

## Running Shopware commands

Use `shopware-cli project console` to run `bin/console` commands from your host - no need to shell into the container:

```bash
shopware-cli project console cache:clear
shopware-cli project console plugin:refresh
shopware-cli project console dal:refresh:index
```

When using the Docker executor, commands automatically run inside the web container via `docker compose exec`.

To type a little less, you can also use the `swx` alias as a shortcut for `shopware-cli project console`:

```bash
swx cache:clear
swx plugin:refresh
swx dal:refresh:index
```

## Running Composer, PHP, and npm

The project directory is bind-mounted into the `web` container (`.:/var/www/html`), so you can edit files on the host. That mount does **not** mean host PHP and Composer share the container environment.

With the Docker-based development environment (`environments.local.type: docker`), run Composer, PHP, and npm **inside** the `web` container. The container has the correct PHP version, `memory_limit`, extensions, and network access to services such as the database.

```bash
# Open an interactive shell in the web container
docker compose exec web bash

# Or run a single command without an interactive shell
docker compose exec web composer require shopware/docker
docker compose exec web composer install
docker compose exec web php -i | grep memory_limit
```

Prefer a higher-level Shopware CLI command when one exists. For example, use `shopware-cli project console` instead of calling `bin/console` yourself, and use `shopware-cli project admin-watch` / `storefront-watch` instead of npm watch scripts.

::: warning
Running `composer` on the host with a typical local PHP install often fails. Host PHP commonly defaults to `memory_limit=128M`, while Shopware needs **at least 512M**. Composer scripts may also try to boot Shopware and connect to the database, which is only available inside the Docker network.

The **Setup health → Runtime → Memory limit** check in the development TUI reports the PHP used by the project executor (the container for Docker projects), not your host PHP. A green runtime check does not mean host-side Composer is safe.
:::

### PHP memory limit (when you run PHP on the host)

If you use a local or Symfony CLI environment instead of Docker, or you intentionally run Composer on the host, configure CLI PHP with:

```ini
memory_limit = 512M
```

Verify with:

```bash
php -i | grep memory_limit
```

See the [recommended stack and supported versions](../hosting/index.md#recommended-stack-and-supported-versions) for the full PHP requirements (`memory_limit ≥ 512M`, extensions, and related settings).

## Docker services

The CLI generates a `compose.yaml` tailored to your project:

| Service | Description | URL |
|---------|-------------|-----|
| **web** | PHP + Node.js with Caddy | `http://127.0.0.1:8000` |
| **database** | MariaDB 11.8 | internal |
| **adminer** | Database management UI | `http://127.0.0.1:9080` |
| **mailer** | Mailpit (email testing) | `http://127.0.0.1:8025` |
| **lavinmq** | Message queue * | `http://127.0.0.1:15672` |
| **opensearch** | Search engine * | `http://127.0.0.1:9200` |
| **blackfire** | Blackfire agent * | internal |
| **tideways-daemon** | Tideways agent * | internal |

\* *Auto-detected from `composer.lock` or enabled via configuration.*

::: warning
The `compose.yaml` file is fully managed by the Shopware CLI and regenerated whenever you change configuration. **Never edit it directly.**
:::

### Customizing with `compose.override.yaml`

Place all customizations in `compose.override.yaml`. Docker Compose [merges multiple files](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/), so your overrides are applied on top of the managed file:

```yaml
# compose.override.yaml
services:
  web:
    environment:
      APP_ENV: dev
      COMPOSER_HOME: /tmp/composer
    ports:
      - "9003:9003"   # Xdebug

  # Add your own services
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

The CLI-generated `compose.yaml` includes this header for clarity:

```yaml
# This file is managed by shopware-cli. Do not edit manually.
# Create a compose.override.yaml to customize services.
```

### Auto-Detection

The compose file inspects your `composer.lock` at generation time:

- `symfony/amqp-messenger` - adds **LavinMQ** and sets `MESSENGER_TRANSPORT_DSN`
- `shopware/elasticsearch` - adds **OpenSearch** with environment variables
- PHP version defaults to `8.3`, overridable in the Config tab

## Environment executors

The CLI abstracts command execution across environment types, configured per environment in `.shopware-project.yml`:

| Type | Behavior |
|------|----------|
| `docker` | Executes commands inside the web container via `docker compose exec` |
| `local` | Executes commands directly on the host |
| `symfony-cli` | Uses the Symfony CLI binary (auto-detected) |

```yaml
environments:
  local:
    type: docker
    url: http://127.0.0.1:8000
    admin_api:
      username: admin
      password: shopware
```

## Ports

The web container exposes these ports by default:

| Port | Purpose |
|------|---------|
| `8000` | Storefront |
| `8080` | HTTP (alternative) |
| `5173` | Admin Watcher (Vite) |
| `9998` | Storefront Watcher |
| `9999` | Storefront Proxy |
| `5773` | IDE debugging |

## Configuration reference

### `.shopware-project.yml`

```yaml
compatibility_date: '2026-03-01'

url: http://127.0.0.1:8000

docker:
  php:
    version: "8.3"              # 8.2, 8.3, 8.4, 8.5
    profiler: xdebug             # none (empty), xdebug, blackfire, tideways, pcov, spx
    blackfire_server_id: ""     # required when profiler is blackfire
    blackfire_server_token: ""  # required when profiler is blackfire
    tideways_api_key: ""        # required when profiler is tideways

environments:
  local:
    type: docker
    url: http://127.0.0.1:8000
    admin_api:
      username: admin
      password: shopware
```

### `.shopware-project.local.yml`

Sensitive credentials are stored in `.shopware-project.local.yml` (add to `.gitignore`):

```yaml
docker:
  php:
    blackfire_server_id: "your-server-id"
    blackfire_server_token: "your-server-token"
```

## Testing multiple Shopware versions in parallel

Verifying a plugin, theme, or app against several Shopware versions - for example, before a release, or to confirm whether a bug is version-specific - normally means stopping one environment, switching branches or dependencies, and starting again for every version you check. Running one project per version at the same time removes that back-and-forth: each version stays up, installed, and ready to compare.

By default, this is blocked by fixed host ports - a second `project dev` collides with the first on `8000`, `9080`, and the rest. The [local proxy](../../products/tools/cli/project-commands/local-proxy.md) removes that limit by giving every shop its own stable HTTPS hostname instead of a host port, so any number of versions can run side by side.

### 1. Create one project per version

Pass the Shopware version as the second argument to `project create`, and opt each project into a local domain so it gets a conflict-free hostname. Include `--docker` - the local proxy only works with the Docker executor:

```bash
shopware-cli project create my-shop-6-6 6.6.7.0 --docker --local-domain --no-interaction
shopware-cli project create my-shop-6-7 6.7.0.0 --docker --local-domain --no-interaction
```

The first local-domain project on a machine triggers the [one-time proxy setup](../../products/tools/cli/project-commands/local-proxy.md#one-time-setup) (DNS routing and HTTPS trust); later projects reuse it.

### 2. Start every version

```bash
(cd my-shop-6-6 && shopware-cli project dev start)
(cd my-shop-6-7 && shopware-cli project dev start)
```

Both come up at once, each at its own hostname - `https://my-shop-6-6.shopware.local` and `https://my-shop-6-7.shopware.local` - with no port conflict and nothing to stop in between.

### 3. Install the extension under test into each version

Each project is an independent Composer-managed installation, so add and activate the extension the same way in every one:

```bash
cd my-shop-6-6
docker compose exec web composer require my-vendor/my-plugin
shopware-cli project console plugin:refresh
shopware-cli project console plugin:install --activate MyPlugin
```

Repeat for `my-shop-6-7` (and any other version you added).

### 4. Compare behavior side by side

With every environment running, open each hostname in its own browser tab and reproduce the same steps in each - no editing `.env`, `APP_URL`, or ports to switch versions. `shopware-cli project proxy list` shows every registered shop and its running state at a glance:

```bash
shopware-cli project proxy list
```

### 5. Tear down what you no longer need

If you are just done with **one** version but still need the others, stop that project on its own - the rest keep running:

```bash
(cd my-shop-6-6 && shopware-cli project dev stop)
```

If you are done testing **entirely**, remove every registered project and the shared proxy in one step:

```bash
shopware-cli project proxy teardown
```

## Troubleshooting

### `compose.yaml` keeps getting reset

This is by design. `compose.yaml` is fully managed and regenerated on config changes. Use `compose.override.yaml` for all customizations. See [Customizing with compose.override.yaml](#customizing-with-composeoverrideyaml).

### Containers won't start

Check logs with `shopware-cli project logs -f` or from the Instance tab in the TUI.

### Shopware isn't installed

The development TUI's initialization wizard, which mirrors steps in Shopware's in-browser First Run Wizard, prompts you to run the installer. It uses `shopware/deployment-helper` to install Shopware with your chosen locale, currency, and Admin credentials.

### Composer fails with "Allowed memory size of 134217728 bytes exhausted"

`134217728` bytes is **128M** — the default host PHP memory limit. You almost certainly ran Composer on the host instead of in the web container.

Use:

```bash
docker compose exec web composer <your-command>
```

If you must run Composer on the host, raise CLI `memory_limit` to at least `512M`. See [Running Composer, PHP, and npm](#running-composer-php-and-npm).

### Compatibility date error

Set `compatibility_date: '2026-03-01'` in `.shopware-project.yml`. For more context, see the [build command docs](../../products/tools/cli/project-commands/build.md#compatibility-date).

## Next steps

- [Start Developing](./start-developing.md) - What to do once your environment is running
- [Build Extensions](./extensions/index.md) - Create plugins, apps, and themes
- [Using Watchers](./tooling/using-watchers.md) - Hot Module Replacement for Admin and Storefront
- [Local Proxy](../../products/tools/cli/project-commands/local-proxy.md) - CLI reference for running shops on stable hostnames instead of ports
