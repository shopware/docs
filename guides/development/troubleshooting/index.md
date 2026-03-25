---
nav:
  title: Troubleshooting
  position: 10
---

# Troubleshooting

Fix common issues when running Shopware locally.

## Database and API issues

- **Missing DB tables** (e.g. `system_config`, `plugin` not found): the instance may not be installed. Run `bin/console system:install --create-database --basic-setup` inside the web container, or see [Authentication and API requests](../integrations-api/auth-api-requests.md) for recovery steps.
- **HTTP 401 on `/api/*`**: invalid or expired OAuth token; recreate integration credentials and request a new token ([Authentication and API requests](../integrations-api/auth-api-requests.md)).
- **HTTP 500 on API or OpenAPI**: often uninitialized DB or plugin errors; check `var/log/` and container logs, verify `APP_ENV=dev` for stack traces.

Sections:

- [DAL Reference](dal-reference): documents fields, flags, filters, and aggregations for effective data management and querying within the platform.
  - [Fields Reference](dal-reference/fields-reference/index.md): field types, flags, enum fields.
- [Rules Reference](rules-reference.md)
- [Flow Reference](flow-reference.md)

## Debugging

### Inspecting and debugging locally

To connect to the database from your host machine (for example, via Adminer or a local MySQL client), use:

- Host: `127.0.0.1` or `localhost`
- And the exposed port shown here:

```bash
docker compose ps
```

### Enable profiler/debugging for PHP

Once your Shopware environment is running, you may want to enable PHP debugging or profiling to inspect code execution, set breakpoints, or measure performance. The default setup doesn’t include these tools, but you can enable them using Docker overrides.

As an example, enable [Xdebug](https://xdebug.org/) inside the web container by creating a `compose.override.yaml` in your project root with the following configuration:

```yaml
services:
    web:
        environment:
            XDEBUG_MODE: debug
            XDEBUG_CONFIG: client_host=host.docker.internal
            PHP_PROFILER: xdebug
```

Save the file and apply the changes:

```bash
docker compose up -d
```

This restarts the containers with `Xdebug` enabled. You can now attach your IDE (for example, PHPStorm or VS Code) to the remote debugger on the default Xdebug port `9003`.

### Xdebug on Linux

To enable Xdebug connectivity on Linux, you must manually map the host.docker.internal hostname to the Docker host gateway. Add the following configuration to your `compose.override.yaml`:

```yaml
services:
    web:
        extra_hosts:
            - "host.docker.internal:host-gateway"
```

Shopware’s Docker setup also supports other profilers, like [Blackfire](https://www.blackfire.io/), [Tideways](https://tideways.com/), and [PCOV](https://github.com/krakjoe/pcov). For Tideways and Blackfire, you'll need to run an additional container. For example:

```yaml
services:
    web:
        environment:
            - PHP_PROFILER=blackfire
    blackfire:
        image: blackfire/blackfire:2
        environment:
            BLACKFIRE_SERVER_ID: XXXX
            BLACKFIRE_SERVER_TOKEN: XXXX
```

### Linux file permissions and known issues

On Linux hosts, your user ID must be 1000 for file permissions to work correctly inside the containers. Check your user ID with:

```bash
id -u
```

Other IDs may cause permission errors when running `make up` or writing to project files.
