---
nav:
  title: Development Environment
  position: 1

---

# Development Environment (CLI Reference)

This page is a quick reference for the `shopware-cli project dev` and `shopware-cli project logs` commands. For the full development workflow and setup guide, see [Development Environment](../../../../guides/development/dev-environment.md).

## Commands

### Start the Environment

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

The interactive dashboard has three tabs:

- **Overview** — shop info, access credentials, setup health checks, and watcher toggles
- **Instance** — containers, watcher processes, and log files with live-streaming
- **Config** — PHP version, profiler

### View Application Logs

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

## Further Reading

- [Development Environment guide](../../../../guides/development/dev-environment.md) — full workflow, setup wizard, service overview, troubleshooting
- [Start Developing](../../../../guides/development/start-developing.md) — next steps after your environment is running
