---
nav:
  title: Access Services
  position: 30
---

# Open

This is the root command for opening various interfaces or service connections in Shopware PaaS. It provides quick access to essential application components like the storefront, admin, grafana and service tunnels.

## Usage

```sh
sw-paas open [command]
```

## Commands

- `admin`: Provides the admin URL and credentials to login to the application.
- `storefront`: Provides the store front URL for the application
- `grafana`: Provides the grafana URL and credentials to login.
- `service`: Open a local port tunnel to a specified service.

### `open admin`

- **Usage**

```sh
sw-paas open admin [flags]
```

- **Flags**

  - `--organization-id`: ID of the organization
  - `--application-id`: ID of the application

- **Example**

```sh
sw-paas open admin --organization-id abc123 --application-id abc123
```

### `open storefront`

- **Usage**

```sh
sw-paas open storefront [flags]
```

- **Flags**

  - `--organization-id`: ID of the organization
  - `--application-id`: ID of the application

- **Example**

```sh
sw-paas open storefront --organization-id abc123 --application-id abc123
```

### `open grafana`

- **Usage**

```sh
sw-paas open grafana [flags]
```

- **Flags**

  - `--organization-id`: ID of the organization
  - `--application-id`: ID of the application

- **Example**

```sh
sw-paas open grafana --organization-id abc123 --application-id abc123
```

### `open service`

- **Usage**

```sh
sw-paas open service [flags]
```

- **Flags**

  - `--service`: Name of the service to connect to. Supported services include; `database`, `valkey-app`, `valkey-worker`, `valkey-session`
  - `--organization-id`: ID of the organization
  - `--application-id`: ID of the application

- **Example**

```sh
sw-paas open service --service database --organization-id abc123 --application-id abc123
```
