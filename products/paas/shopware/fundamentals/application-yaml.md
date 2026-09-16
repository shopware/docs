---
nav:
  title: Application YAML
  position: 80
---

# Application YAML Configuration

The `application.yaml` file is the central configuration file for your Shopware PaaS Native application. It defines the PHP version, environment variables, and services for your application.

By default, it is placed at the root of your project repository. It can also live in a sub-directory, which lets several applications share one repository. In that case, pass its path when you create the application:

```sh
sw-paas application create --application-yaml-path apps/shopware/application.yaml
```

The directory containing the `application.yaml` is the application root. Every path in the file is resolved relative to it. See [Deploy from a monorepo](../guides/monorepo.md) for the full details.

When you update the `application.yaml` and push the changes to your repository, apply them by running:

```sh
sw-paas application update
```

## Structure

The file consists of two main sections:

| Section    | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| `app`      | Application settings such as PHP version and environment variables |
| `services` | Infrastructure services like MySQL and OpenSearch                  |

## Minimal example

```yaml
app:
  php:
    version: "8.3"
    extensions: []
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
    extensions:
      - imagick
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

#### PHP supported versions

- `8.2`
- `8.3`
- `8.4`
- `8.5`

### `app.php.extensions`

The PHP extensions to install during build time. We use [this](https://github.com/mlocati/docker-php-extension-installer) installer to install extensions.

```yaml
app:
  php:
    extensions:
      - extension1
      - extension2
```

### `app.environment_variables`

A list of environment variables is passed to the application. Each entry requires:

| Field   | Description                    | Values         |
| ------- | ------------------------------ | -------------- |
| `name`  | The variable name              | Any string     |
| `scope` | When the variable is available | `RUN`, `BUILD` |
| `value` | The variable value             | Any string     |

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

### `app.build.context`

The directory the container image is built from, relative to the directory containing the `application.yaml`. When unset, the application root itself is used.

```yaml
app:
  build:
    context: ".."
```

Set this when your application needs files that live outside its own directory, for example in a monorepo where the shop shares a workspace with other packages. The path must stay inside the repository and is validated when the application is created or updated.

Two things move with the context: the generated Dockerfile copies the root of the context, and `composer.lock` is read from the context rather than from the application root.

See [Deploy from a monorepo](../guides/monorepo.md) for the complete path resolution rules.

### `services.mysql`

Configures the managed MySQL database.

```yaml
services:
  mysql:
    version: "8.4"
```

#### MySQL supported versions

- `8.0`
- `8.4`

::: warning
Once MySQL `8.4` has been configured, downgrading to MySQL `8.0` is not possible.
:::

### `services.opensearch`

Enables or disables the managed OpenSearch service.

```yaml
services:
  opensearch:
    enabled: true
```

After enabling OpenSearch, update your application and reindex your data. See [How to set up OpenSearch](../guides/opensearch.md) for the full steps.

### `services.blackfire`

Enables or disables Blackfire profiling.

```yaml
services:
  blackfire:
    enabled: true
```

Requires the `BLACKFIRE_SERVER_ID` and `BLACKFIRE_SERVER_TOKEN` secrets to be set. See [Blackfire](../monitoring/blackfire.md) for the full steps.

### `services.tideways`

Enables or disables Tideways monitoring.

```yaml
services:
  tideways:
    enabled: true
```

Requires the `TIDEWAYS_API_KEY` secret to be set. See [Tideways](../monitoring/tideways.md) for the full steps.

Blackfire and Tideways cannot be enabled at the same time.

### `services.fastly`

Configures the Fastly CDN integration.

```yaml
services:
  fastly:
    disable_default_snippets: false
    snippets_path: config/fastly
```

| Option                     | Default | Description                                                                                                                                                       |
| -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `snippets_path`            | unset   | Directory (relative to the application root) containing your custom VCL snippets. When unset, no custom snippets are deployed - the default snippets stay enabled |
| `disable_default_snippets` | `false` | Set to `true` to disable the default snippets that Shopware PaaS Native deploys to the Fastly services                                                            |

The directory must contain one sub-directory per Fastly VCL subroutine type. See [Fastly snippets](../cdn/fastly-snippets.md) for the required folder layout and naming rules.
