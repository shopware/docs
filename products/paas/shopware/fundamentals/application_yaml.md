---
nav:
  title: Application YAML
  position: 80
---

# Application YAML Configuration

The `application.yaml` file is the central configuration file for your Shopware PaaS Native application. It is placed at the root of your project repository and defines the PHP version, environment variables, and services for your application.

When you update the `application.yaml` and push the changes to your repository, apply them by running:

```sh
sw-paas application update
```

## Structure

The file consists of two main sections:

| Section    | Description                                                  |
|------------|--------------------------------------------------------------|
| `app`      | Application settings such as PHP version and environment variables |
| `services` | Infrastructure services like MySQL and OpenSearch             |

## Minimal example

```yaml
app:
  php:
    version: "8.3"
  environment_variables: []
services:
  mysql:
    version: "8.0"
  opensearch:
    enabled: false
```

## Full example

```yaml
app:
  php:
    version: "8.3"
  environment_variables:
    - name: INSTALL_LOCALE
      value: fr-FR
      scope: RUN
    - name: MY_BUILDTIME_VARIABLE
      value: bar
      scope: BUILD
services:
  mysql:
    version: "8.0"
  opensearch:
    enabled: true
```

## Reference

### `app.php.version`

The PHP version used by the application.

```yaml
app:
  php:
    version: "8.3"
```

### `app.environment_variables`

A list of environment variables passed to the application. Each entry requires:

| Field   | Description                          | Values         |
|---------|--------------------------------------|----------------|
| `name`  | The variable name                    | Any string     |
| `scope` | When the variable is available       | `RUN`, `BUILD` |
| `value` | The variable value                   | Any string     |

- **`RUN`** -- available at runtime (passed to the Shopware application).
- **`BUILD`** -- available during the build step.

You can define the same variable name with different scopes to use different values at build-time and runtime.

```yaml
app:
  environment_variables:
    - name: MY_VARIABLE
      value: runtime-value
      scope: RUN
    - name: MY_VARIABLE
      value: build-value
      scope: BUILD
```

For sensitive values, use [secrets](./secrets.md) instead of environment variables.

For more details, see the [Environment variables](./environment-variables.md) page.

### `services.mysql`

Configures the managed MySQL database.

```yaml
services:
  mysql:
    version: "8.0"
```

### `services.opensearch`

Enables or disables the managed OpenSearch service.

```yaml
services:
  opensearch:
    enabled: true
```

After enabling OpenSearch, update your application and reindex your data. See [How to set up OpenSearch](../guides/opensearch.md) for the full steps.
