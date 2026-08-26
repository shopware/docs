---
nav:
  title: Development Environment
  position: 1

---

# Development Environment (CLI Reference)

This page is a quick reference for the `shopware-cli project dev` and `shopware-cli project logs` commands. For the full development workflow and setup guide, see [Development Environment](../../../../guides/development/dev-environment.md).

## Commands

### Start the environment

```bash
# Interactive dashboard (default when run in a terminal)
shopware-cli project dev

# Start in the background (for CI or scripting)
shopware-cli project dev start

# Check whether the environment is running
shopware-cli project dev status

# Stop the environment
shopware-cli project dev stop
```

### Install Shopware non-interactively

```bash
shopware-cli project dev install \
  --locale de-DE --currency EUR \
  --admin-username admin --admin-password mysecret123
```

Starts the development environment (if not already running), runs the deployment helper to install Shopware, and saves the admin credentials to `.shopware-project.yml`. Intended for CI, scripts, and agents as a non-interactive counterpart to the TUI's install wizard. If the shop is already installed, the command prints a notice and exits successfully.

Available flags:

| Flag                | Default    | Description                                          |
| ------------------- | ---------- | ----------------------------------------------------- |
| `--locale`           | `en-GB`    | Default storefront language, e.g. `en-GB`, `de-DE`     |
| `--currency`         | `EUR`      | Default currency, e.g. `EUR`, `USD`                    |
| `--admin-username`   | `admin`    | Admin account username                                 |
| `--admin-password`   | `shopware` | Admin account password (at least 8 characters)         |

The interactive dashboard has three tabs:

- **Overview** — shop info, access credentials, setup health checks, and watcher toggles
- **Instance** — containers, watcher processes, and log files with live-streaming
- **Config** — PHP version, profiler

### View application logs

```bash
# Last 100 lines of the most recently modified log file
shopware-cli project logs

# A specific log file
shopware-cli project logs dev-2026-05-18.log

# Follow the log in real time
shopware-cli project logs -f

# List available log files
shopware-cli project logs -l

# Set number of lines to show (default: 100)
shopware-cli project logs --lines 50
```

## Configuration

The environment is configured in `.shopware-project.yml`. See the [full configuration reference](../../../../guides/development/dev-environment.md#configuration-reference) for all options.

```yaml
# .shopware-project.yml
compatibility_date: '2026-03-01'

docker:
  php:
    version: "8.3"
    profiler: xdebug

environments:
  local:
    type: docker
    url: http://127.0.0.1:8000
    admin_api:
      username: admin
      password: shopware
```

## Further reading

- [Local Proxy](./local-proxy.md) — run several shops at once, each on its own stable HTTPS hostname
- [Development Environment guide](../../../../guides/development/dev-environment.md) — full workflow, setup wizard, service overview, troubleshooting
- [Running Composer, PHP, and npm](../../../../guides/development/dev-environment.md#running-composer-php-and-npm) — run tools inside the web container; PHP `memory_limit ≥ 512M`
- [Start Developing](../../../../guides/development/start-developing.md) — next steps after your environment is running
