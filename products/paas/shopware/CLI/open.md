---
nav:
  title: Accessing Services
  position: 70
---

# Open

The `open` command lets you access critical service interfaces and internal tools within Shopware PaaS. This command is essential for quickly navigating to application endpoints such as the Admin, Storefront, Grafana dashboard, or opening service tunnels for debugging and direct access.

## Usage

```sh
sw-paas open [command]
```

:::info
To avoid repeatedly specifying `organization-id` and `application-id`, either use the `context` command to set them persistently, or run the CLI in interactive mode for guided input.
:::

## Commands

### Admin Panel Access

Use this command to retrieve the Admin URL and credentials required for logging into the Shopware Admin interface.

**Usage:**

```sh
sw-paas open admin [flags]
```

**Flags:**

- `--organization-id`: ID of the organization
- `--application-id`: ID of the application

**Example:**

```sh
sw-paas open admin --organization-id abc123 --application-id abc123
```

### Storefront URL Access

Use this command to retrieve the URL of the Shopware Storefront application.

**Usage:**

```sh
sw-paas open storefront [flags]
```

**Flags:**

- `--organization-id`: ID of the organization
- `--application-id`: ID of the application

**Example:**

```sh
sw-paas open storefront --organization-id abc123 --application-id abc123
```

### Monitoring Dashboard

Access the Grafana dashboard with this command to visualize and monitor application metrics.

**Usage:**

```sh
sw-paas open grafana [flags]
```

**Flags:**

- `--organization-id`: ID of the organization
- `--application-id`: ID of the application

**Example:**

```sh
sw-paas open grafana --organization-id abc123 --application-id abc123
```

### Open a Tunnel to a Service

This command establishes a local port tunnel to one of the internal services. It is useful for debugging or interacting directly with backend components. The current supported services are: `database`, `valkey-app`, `valkey-worker`.

**Usage:**

```sh
sw-paas open service [flags]
```

**Flags:**

- `--service`: Name of the service to connect to.
- `--organization-id`: ID of the organization
- `--application-id`: ID of the application

**Example:**

```sh
sw-paas open service --service database --organization-id abc123 --application-id abc123
```
