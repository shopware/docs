---
nav:
  title: K8s Meta Package
  position: 90
---

# K8s Meta Package

The `shopware/k8s-meta` Composer package prepares your Shopware project for running on Shopware PaaS Native. It is a metapackage that installs the required dependencies and configuration files via a Symfony Flex recipe.

## Version compatibility

Use the version that matches your Shopware installation:

| Shopware version | k8s-meta version |
|------------------|------------------|
| 6.6              | `^1.0`           |
| 6.7              | `^2.0`           |

Install it with:

```sh
composer require shopware/k8s-meta:^2.0 --ignore-platform-reqs
```

:::info
The `--ignore-platform-reqs` flag ensures that all necessary recipes are installed, even if your local PHP version differs from the required platform version.
:::

## What it installs

### Dependencies

The metapackage pulls in the following dependencies:

| Package                              | Purpose                                            |
|--------------------------------------|----------------------------------------------------|
| `league/flysystem-async-aws-s3`      | S3-compatible filesystem for media and assets       |
| `open-telemetry/exporter-otlp`       | OpenTelemetry tracing export                        |
| `open-telemetry/transport-grpc`      | gRPC transport for OpenTelemetry                    |
| `shopware/opentelemetry`             | Shopware OpenTelemetry integration                  |
| `shopware/docker`                    | Docker and deployment helper tooling                |
| `symfony/redis-messenger`            | Redis-based message queue transport                 |

### Configuration files

The Symfony Flex recipe creates the file `config/packages/operator.yaml`. After installation, verify that this file exists in your project.

This file configures Shopware for the PaaS Native infrastructure:

- **S3 object storage** for public, private, theme, and sitemap filesystems
- **Redis** for application cache and session storage
- **Cluster mode** settings (`cluster_setup: true`, `runtime_extension_management: false`)
- **Admin worker** disabled (queues are processed externally)
- **Elasticsearch/OpenSearch** replica and shard settings
- **Monolog** logging to stderr in JSON format

Additionally, files in `config/packages/prod/` configure production-specific behavior:

| File                  | Purpose                                          |
|-----------------------|--------------------------------------------------|
| `fastly.yaml`        | Fastly CDN reverse proxy and cache purging        |
| `monolog.yaml`       | Error-level logging to stderr in JSON format      |
| `opentelemetry.yaml` | OpenTelemetry profiler integration                |

## Overriding configuration

:::warning
The default configuration is tuned for the PaaS Native infrastructure. Changing values can break your application if you are not familiar with the underlying services. Only override settings when you have a clear reason to do so.
:::

You can override any value from `operator.yaml` using the standard Symfony configuration override mechanism. Place a YAML file in `config/packages/prod/` with the same configuration keys, and its values will take precedence.

For example, to enable soft purge with stale cache serving, create or edit a file in `config/packages/prod/`:

```yaml
# config/packages/prod/shopware.yaml
shopware:
    http_cache:
        stale_while_revalidate: 300
        stale_if_error: 3600
```

For more details on how Symfony merges configuration files, refer to the [Symfony configuration documentation](https://symfony.com/doc/current/configuration.html#configuration-environments).
