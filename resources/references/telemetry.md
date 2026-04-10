# Shopware Tools Telemetry

Shopware gathers limited telemetry about usage of its open-source developer tools to improve product quality and user experience. This telemetry is designed not to include personal data, secrets, file contents, or credentials.

You can [opt out of sharing telemetry data](#how-can-i-configure-telemetry) at any time.

## Why are we collecting telemetry data?

Telemetry allows us to better identify bugs and gain visibility on usage of features across all users. It also helps us to make data-informed decisions like adding, improving, or removing features. We monitor and analyze this data to ensure consistent growth, stability, usability, and developer experience. For instance, if certain errors are hit more frequently, those bug fixes will be prioritized in future releases.

## Which tools collect telemetry data?

The following Shopware tools collect limited usage data:

- [Shopware CLI](#shopware-cli)
- [Deployment Helper](#deployment-helper)
- [Web Installer](#web-installer)

All tools use the same telemetry infrastructure and respect the same opt-out mechanisms.

## Shopware CLI

### What data is collected?

- Which command is being run (e.g. `shopware-cli project create`)
- Version of the Shopware CLI client that is sending the event
- Project configuration details such as:
  - Shopware version being used
  - Deployment type selected
  - CI platform selected (e.g. GitHub Actions, GitLab CI/CD)
  - Whether Docker is being used
- An anonymized user identifier (randomly generated, not linked to personal information)
- General machine information such as OS and OS version
- Whether the command is running in a CI environment

### How is data transmitted?

Data is sent via UDP to `udp.usage.shopware.io:9000`, which is operated in Frankfurt, Germany (EU). The telemetry logic runs in the background and will not delay command execution. When transmission fails (e.g. no internet connection), it fails quickly and silently.

## Deployment Helper

### What data is collected?

- Which lifecycle event occurred (e.g. installation, upgrade, theme compilation)
- Shopware version being installed or upgraded
- Previous Shopware version (during upgrades)
- PHP version
- MySQL/MariaDB version
- Duration of operations (in seconds)
- An anonymized user identifier (persisted in the Shopware database under `core.telemetry.id`)

### Tracked events

| Event                              | Description                                           |
|------------------------------------|-------------------------------------------------------|
| `deployment_helper.php_version`    | PHP version at the time of a deployment run           |
| `deployment_helper.mysql_version`  | MySQL/MariaDB version at the time of a deployment run |
| `deployment_helper.installed`      | A fresh Shopware installation completed               |
| `deployment_helper.upgrade`        | A Shopware upgrade completed                          |
| `deployment_helper.theme_compiled` | Theme compilation completed after an upgrade          |

### How is data transmitted?

Data is sent via UDP to `udp.usage.shopware.io:9000`. The anonymized user identifier is persisted in the Shopware `system_config` database table.

## Web Installer

### What data is collected?

- Which lifecycle event occurred (e.g. visit, install, update)
- Source of access (direct or via admin panel)
- User locale/language
- PHP version
- Operating system family (e.g. Linux, Darwin, Windows)
- Shopware version being installed or updated (including version range for updates)
- Whether the project uses Shopware Flex
- An anonymized session-based identifier (randomly generated per session)

### Tracked events

| Event                             | Description                    |
|-----------------------------------|--------------------------------|
| `web_installer.visit`             | First visit to the installer   |
| `web_installer.install.started`   | Installation process initiated |
| `web_installer.install.completed` | Installation succeeded         |
| `web_installer.install.failed`    | Installation failed            |
| `web_installer.update.started`    | Update process initiated       |
| `web_installer.update.completed`  | Update succeeded               |
| `web_installer.update.failed`     | Update failed                  |

### How is data transmitted?

Data is sent via UDP to `udp.usage.shopware.io:9000`. The session-based identifier is stored in the PHP session and regenerated on each new session.

## What happens with sensitive data?

Shopware takes your privacy seriously and has designed telemetry to avoid directly identifying users or collecting sensitive information including:

- Usernames or email addresses
- File paths or file contents
- Database credentials or connection strings
- Environment variables
- Stack traces or raw error logs
- Secret values or API keys
- Personally identifiable information (PII) of any kind

## How can I configure telemetry?

All Shopware CLI tools respect the same configuration mechanisms.

### Disable telemetry via environment variable

Set the `DO_NOT_TRACK` environment variable to any value to disable telemetry across all tools:

```bash
export DO_NOT_TRACK=1
```

Or for a single command:

```bash
DO_NOT_TRACK=1 shopware-cli project create
```

This follows the `Console Do Not Track` convention used by many CLI tools.

## Data flow summary

| Aspect                  | Detail                                                     |
|-------------------------|------------------------------------------------------------|
| **Protocol**            | UDP (fire-and-forget)                                      |
| **Endpoint**            | `udp.usage.shopware.io:9000`                               |
| **Encryption**          | UDP is unencrypted by nature                               |
| **Delay**               | None — telemetry runs in the background                    |
| **Failure handling**    | Silently fails if transmission is not possible             |
| **User identification** | Anonymized random identifiers, not linked to personal data |
