---
nav:
  title: Development Environment
  position: 3

---

# Development Environment

Shopware CLI provides a fully integrated Docker-based development environment. A single command launches your entire stack, streams logs, manages watchers, and lets you configure PHP and profiling — all without manually editing Docker files.

:::info
The development environment requires a compatibility date of `2026-03-01` or later in your `.shopware-project.yml`. Projects created with `shopware-cli project create` have this set automatically.
:::

## Starting the Environment

From your Shopware project root, run:

```bash
shopware-cli project dev
```

This launches the interactive **DevTUI** dashboard. If your containers aren't running yet, the dashboard starts them. If Shopware hasn't been installed, it guides you through the installation wizard.

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

## Development TUI Dashboard

The development terminal user interface (TUI) dashboard has three tabs, switched with the number keys or by pressing "Enter":

### Overview tab (1)

Your environment at a glance:

**Left panel:**

- **Shop** — Shopware version, environment type (`docker`, `local`, or `symfony-cli`), shop and admin URLs, and security update expiry date
- **Access** — URLs, usernames, and passwords for Shop Admin, Adminer, and Mailpit
- **Setup health** — runtime checks (PHP version, memory limit), local behavior warnings, and debug settings, each showing the current value against the recommended one

**Right panel:**

- **Watchers** — toggle Admin and Storefront watchers on or off

### Instance tab (2)

Browse and stream logs from your running environment:

- **Containers** — all Docker containers with a live status indicator for the active one
- **Processes** — watcher processes (Admin Watcher, Storefront Watcher) when running
- **Log files** — application log files (e.g., `dev.log`)

Use `↑`/`↓` to navigate sources and `enter` to select one. Scroll with `pgup`/`pgdn`.

### Config Tab (3)

Adjust your Docker environment without touching YAML:

| Setting | Options |
|---------|---------|
| **PHP Version** | `8.2`, `8.3`, `8.4`, `8.5` |
| **Profiler** | `none`, `xdebug`, `blackfire`, `tideways`, `pcov`, `spx` |

When selecting `blackfire` or `tideways`, additional credential fields appear. Sensitive credentials are stored in `.shopware-project.local.yml` (excluded from version control).

After changing settings, select **Save & Regenerate** to update `compose.yaml`. Restart the environment for changes to take effect.

## Migrating from Legacy Setups

If your project was created before March 2026 and uses the older `make up`/`make setup` workflow with a hand-written `compose.yaml`, running `shopware-cli project dev` automatically detects this and launches a **setup wizard** instead of the dashboard.

### What Triggers the Wizard

The wizard appears when your project's `compatibility_date` in `.shopware-project.yml` is before `2026-03-01` (or missing entirely). This signals that the project hasn't been configured for the new development environment yet.

### What the Wizard Does

Walking through the setup wizard takes about a minute. Here's what happens at each step:

1. **Welcome** — explains what the wizard will do and asks you to proceed
2. **Admin user** — pre-fills `admin` (you can change it) for the Shopware admin account
3. **Admin password** — pre-fills `shopware` (you can change it); stored as credentials in `.shopware-project.yml`
4. **PHP version** — reads your `composer.lock` to determine compatible PHP versions and offers the highest supported one as the default (e.g., `8.5`)
5. **Review** — shows a summary of all your choices before applying changes

After you confirm, the wizard:

- Sets `compatibility_date` to `2026-03-01` in `.shopware-project.yml`
- Adds a `local` environment with type `docker` and your chosen URL/credentials
- Configures the Docker PHP version
- Generates a new `compose.yaml` tailored to your project's dependencies
- Starts the Docker containers and runs the Shopware installer

### What Happens to Existing Files

| File | What changes |
|------|-------------|
| `.shopware-project.yml` | Updated with `compatibility_date`, `environments`, and `docker` config |
| `.shopware-project.local.yml` | Created if you chose a profiler with credentials (Blackfire, Tideways) |
| `compose.yaml` | **Replaced** with the CLI-managed version. Your old file is overwritten — back it up first. Move any customizations to `compose.override.yaml`. |
| `Makefile` | **Not touched**. You can delete it once you've migrated, or keep it around |
| `composer.json` | If `shopware/deployment-helper` isn't already present, it's added to `require` |

### After the Wizard Completes

If `shopware/deployment-helper` was added to `composer.json`, you'll be prompted to run:

```bash
composer install
```

This pulls in the helper package, which the dashboard uses to run the Shopware installer. After that, the environment starts automatically.

Once migrated, the legacy `make up`/`make down`/`make setup` workflow is no longer needed — use `shopware-cli project dev` to manage your environment instead. If you had customizations in your old `compose.yaml`, move them to `compose.override.yaml` before running the wizard (or recover them from git afterwards).

## Viewing Application Logs

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

## Running Shopware Commands

Use `shopware-cli project console` to run `bin/console` commands from your host — no need to shell into the container:

```bash
shopware-cli project console cache:clear
shopware-cli project console plugin:refresh
shopware-cli project console dal:refresh:index
```

When using the Docker executor, commands automatically run inside the web container via `docker compose exec`.

## Docker Services

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
`compose.yaml` is fully managed by shopware-cli and regenerated whenever you change configuration. Never edit it directly — your changes will be overwritten.
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

- `symfony/amqp-messenger` → adds **LavinMQ** and sets `MESSENGER_TRANSPORT_DSN`
- `shopware/elasticsearch` → adds **OpenSearch** with environment variables
- PHP version defaults to `8.3`, overridable in the Config tab

## Environment Executors

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

## Configuration Reference

### .shopware-project.yml

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

### .shopware-project.local.yml

Sensitive credentials are stored in `.shopware-project.local.yml` (add to `.gitignore`):

```yaml
docker:
  php:
    blackfire_server_id: "your-server-id"
    blackfire_server_token: "your-server-token"
```

## Troubleshooting

### compose.yaml keeps getting reset

This is by design. `compose.yaml` is fully managed and regenerated on config changes. Use `compose.override.yaml` for all customizations. See [Customizing with compose.override.yaml](#customizing-with-composeoverrideyaml).

### Containers won't start

Check logs with `shopware-cli project logs -f` or from the Instance tab in the dashboard.

### Shopware isn't installed

The DevTUI prompts you to run the installer. It uses `shopware/deployment-helper` to install Shopware with your chosen locale, currency, and admin credentials.

### Compatibility date error

Set `compatibility_date: '2026-03-01'` in `.shopware-project.yml`. For more context, see the [build command docs](../../products/tools/cli/project-commands/build.md#compatibility-date).

## Next Steps

- [Start Developing](./start-developing.md) — What to do once your environment is running
- [Build Extensions](./extensions/index.md) — Create plugins, apps, and themes
- [Using Watchers](./tooling/using-watchers.md) — Hot Module Replacement for Admin and Storefront
