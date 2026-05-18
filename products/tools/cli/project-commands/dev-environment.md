---
nav:
  title: Development Environment
  position: 1

---

# Development Environment

Starting with compatibility date `2026-03-01`, Shopware CLI provides a fully integrated development environment powered by Docker. It replaces manual `docker compose` workflows with a single command and an interactive terminal dashboard.

## Quick Start

From your Shopware project root, run:

```bash
shopware-cli project dev
```

This launches the interactive **DevTUI** dashboard, which manages your environment lifecycle, displays service information, streams logs, and lets you configure PHP and profiling settings — all through a terminal interface.

### For projects without a dev environment

If your project doesn't yet have a development environment configured (compatibility date before `2026-03-01`), running `shopware-cli project dev` automatically starts the **setup wizard**. The wizard:

- Collects your Shop URL, admin credentials, PHP version, and profiler preference
- Adds `shopware/deployment-helper` to your `composer.json` if missing
- Updates `.shopware-project.yml` with environment and Docker configuration
- Generates `compose.yaml` and starts the Docker environment

## Background Usage

If you're running in CI or prefer not to use the interactive dashboard, you can start and stop the environment in the background:

```bash
# Start the environment (non-interactive)
shopware-cli project dev start

# Stop the environment
shopware-cli project dev stop
```

The `start` command prints the Shop and Admin URLs, any auxiliary services, and hints for stopping and viewing logs.

## DevTUI Dashboard

The interactive dashboard has three tabs:

### General Tab

Displays an overview of your running environment:

- **Environment type** (docker, local, symfony-cli)
- **Shop URL** and **Admin URL** with admin credentials
- **Watchers** — start Admin and Storefront watchers directly from the dashboard
- **Services** — auto-discovered auxiliary services (Adminer, Mailpit, queue, etc.)

### Logs Tab

Real-time log streaming from your Shopware application. The tab shows:

- **Log files from `var/log/`** — the most recently modified file is selected by default
- **Watcher output** — live output from running Admin and Storefront watchers
- **Docker container logs** — `docker compose logs` output from the web container

Use the sidebar to switch between log sources. Press `f` to toggle follow mode.

### Config Tab

Adjust your Docker development environment without manually editing YAML files:

| Setting | Options |
|---------|---------|
| **PHP Version** | `8.2`, `8.3`, `8.4`, `8.5` |
| **Profiler** | `none`, `xdebug`, `blackfire`, `tideways`, `pcov`, `spx` |

When selecting `blackfire` or `tideways`, additional credential fields appear (Server ID/Token or API Key). Sensitive credentials are stored in `.shopware-project.local.yml`, which is excluded from version control.

After changing settings, select **Save & Regenerate** to update `compose.yaml` with the new configuration. Restart Docker for changes to take effect.

## Viewing Application Logs

The `shopware-cli project logs` command lets you inspect Shopware application logs without opening the dashboard:

```bash
# Show last 100 lines of the most recently modified log file
shopware-cli project logs

# Show a specific log file
shopware-cli project logs dev-2026-05-18.log

# Follow the log (like tail -f)
shopware-cli project logs -f

# List available log files
shopware-cli project logs -l

# Show a custom number of lines
shopware-cli project logs --lines 50
```

## Docker Services

The development environment automatically generates a `compose.yaml` file with the following services:

| Service | Description | URL (default) |
|---------|-------------|---------------|
| **web** | PHP + Node.js application server (Caddy) | `http://127.0.0.1:8000` |
| **database** | MariaDB 11.8 database | internal only |
| **adminer** | Web-based database management | `http://127.0.0.1:9080` |
| **mailer** | Mailpit email testing tool | `http://127.0.0.1:8025` |
| **lavinmq** | Message queue (auto-detected from `composer.lock`) | `http://127.0.0.1:15672` |
| **opensearch** | Search engine (auto-detected from `composer.lock`) | `http://127.0.0.1:9200` |
| **blackfire** | Blackfire profiler agent (when profiler is configured) | internal only |
| **tideways-daemon** | Tideways profiler agent (when profiler is configured) | internal only |

The `compose.yaml` file is **managed by shopware-cli** and regenerated when you change configuration. Never edit this file directly — your changes will be overwritten the next time the CLI regenerates it (for example, after changing PHP version or profiler settings in the Config tab, or after running `shopware-cli project dev`).

### Customizing with compose.override.yaml

To extend or override any service, create a `compose.override.yaml` file in your project root. Docker Compose [merges multiple compose files](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/), so your overrides are applied on top of the managed `compose.yaml`. This file is yours to own and should be committed to version control.

**Common use cases:**

```yaml
# compose.override.yaml — customize without modifying the managed file

services:
  web:
    # Add extra environment variables
    environment:
      APP_ENV: dev
      COMPOSER_HOME: /tmp/composer

    # Expose additional ports (e.g., for debugging)
    ports:
      - "9003:9003"   # Xdebug

    # Mount additional volumes (e.g., custom extensions)
    volumes:
      - ./custom/extensions:/var/www/html/custom/extensions

  database:
    # Persist database data to a named volume
    volumes:
      - db-data:/var/lib/mysql

  # Add your own services
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  db-data:
```

The CLI-generated `compose.yaml` includes this header for clarity:

```yaml
# This file is managed by shopware-cli. Do not edit manually.
# Create a compose.override.yaml to customize services.
# See https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/
```

### Auto-Detection

The compose file is generated based on your project's `composer.lock`:

- If `symfony/amqp-messenger` is installed, a **LavinMQ** queue service is added and `MESSENGER_TRANSPORT_DSN` is configured
- If `shopware/elasticsearch` is installed, an **OpenSearch** service is added with corresponding environment variables
- The **PHP version** defaults to `8.3` unless overridden in the Config tab

## Environment Executors

Shopware CLI abstracts command execution across different environment types:

| Type | Description |
|------|-------------|
| `docker` | Executes commands inside the web container via `docker compose exec` |
| `local` | Executes commands directly on the host machine |
| `symfony-cli` | Uses the Symfony CLI binary for command execution (auto-detected) |

The executor type is configured per environment in `.shopware-project.yml`:

```yaml
environments:
  local:
    type: docker
    url: http://127.0.0.1:8000
    admin_api:
      username: admin
      password: shopware
```

When no environment is specified, Shopware CLI looks for a `local` environment first, then falls back to a local executor using the top-level `url` and `admin_api` configuration.

## Configuration Reference

### .shopware-project.yml

```yaml
# Required to enable the development environment
compatibility_date: '2026-03-01'

# Top-level URL (used as fallback when no environment is specified)
url: http://127.0.0.1:8000

# Docker development environment configuration
docker:
  php:
    version: "8.3"             # PHP version: 8.2, 8.3, 8.4, 8.5
    profiler: xdebug            # Profiler: none (empty), xdebug, blackfire, tideways, pcov, spx
    blackfire_server_id: ""    # Required when profiler is blackfire
    blackfire_server_token: "" # Required when profiler is blackfire
    tideways_api_key: ""       # Required when profiler is tideways

# Named environments
environments:
  local:
    type: docker                # docker, local, or symfony-cli
    url: http://127.0.0.1:8000
    admin_api:
      username: admin
      password: shopware
```

### .shopware-project.local.yml

Sensitive credentials (Blackfire server ID/token, Tideways API key) are stored in `.shopware-project.local.yml`. This file is intended to be added to `.gitignore`:

```yaml
docker:
  php:
    blackfire_server_id: "your-server-id"
    blackfire_server_token: "your-server-token"
```

### compose.yaml (managed)

The generated `compose.yaml` is owned and regenerated by shopware-cli. **Do not edit it manually** — your changes will be overwritten. Use `compose.override.yaml` for all customizations.

```yaml
# compose.override.yaml
services:
  web:
    ports:
      - "8080:8080"   # Add additional ports
    environment:
      APP_ENV: dev
```

## Ports

The web container exposes these ports by default:

| Port | Purpose |
|------|---------|
| `8000` | Shopware Storefront |
| `8080` | HTTP (alternative) |
| `5173` | Admin Watcher (Vite) |
| `9998` | Storefront Watcher (webpack/Node) |
| `9999` | Storefront Proxy |
| `5773` | IDE debugging |

## Troubleshooting

### The compose.yaml file keeps getting reset

This is by design. The `compose.yaml` file is **fully managed** by shopware-cli and is regenerated whenever configuration changes (PHP version, profiler) or when the dev environment starts. **Never edit `compose.yaml` directly.** Instead, place all customizations in `compose.override.yaml` — Docker Compose merges it with the managed file automatically. See the [Customizing with compose.override.yaml](#customizing-with-composeoverrideyaml) section for examples.

### Container won't start

Check the application logs with `shopware-cli project logs -f` or from within the DevTUI Logs tab.

### Shopware isn't installed yet

When the environment starts and Shopware is not installed, the DevTUI prompts you to run the installer. Provide your preferred locale, currency, and admin credentials. The installer uses `shopware/deployment-helper` under the hood.

### Compatibility date is not set

If you see an error about the compatibility date, set it in `.shopware-project.yml`:

```yaml
compatibility_date: '2026-03-01'
```

For more context on compatibility dates, see the [Build command documentation](./build.md#compatibility-date).
