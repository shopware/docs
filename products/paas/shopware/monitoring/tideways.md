---
nav:
  title: Tideways
  position: 60
---

# Tideways

[Tideways](https://tideways.com/) is a PHP monitoring and profiling tool that continuously collects performance data from your application. Shopware PaaS Native can run a Tideways daemon alongside your application, so the traces and profiles collected from your shop are sent to your own Tideways organization.

You need an existing Tideways account. The platform does not provide one.

## Store your Tideways API key

Tideways authenticates the daemon with the API key of the project you want to monitor. You find it in your Tideways account under the settings of that project.

Create a secret with the type `env` and the key `TIDEWAYS_API_KEY`, holding your Tideways API key as the value:

```sh
sw-paas vault create
```

See [Secrets](../fundamentals/secrets.md) for more details on managing secrets.

## Enable Tideways

Set `services.tideways.enabled` to `true` in your [`application.yaml`](../fundamentals/application-yaml.md):

```yaml
services:
  tideways:
    enabled: true
```

Commit this change, push it to your git repository, and [update your application](../fundamentals/applications.md#update-your-application).

::: warning
The secret must exist before you enable Tideways. If it is missing, the deployment fails.
:::

Enabling Tideways does three things for you:

- The Tideways PHP extension is added to your application image during the build. You do not need to list it under `app.php.extensions`.
- A Tideways daemon is deployed next to your application.
- Your application containers are configured to send data to that daemon.

Tideways is only available for shop applications. Enabling it on a custom or Composable Frontends application is rejected when the configuration is validated.

## View your data

Open your Tideways account and select the project that belongs to the API key you stored. Your shop reports under the service name `shopware`, and the environment matches the environment your application is deployed to.

Monitoring data arrives continuously once the deployment is finished. No browser extension or CLI is needed.

::: info
Pages served from the CDN cache never reach PHP, so they do not show up in Tideways. If a request is missing, request the page in a way that bypasses the cache, for example, by looking at a page that is not cacheable.
:::

## Tideways, Blackfire, and tracing

Only one profiler can be active at a time:

- Tideways and [Blackfire](./blackfire.md) cannot be enabled together. If both are set to `true`, the configuration is rejected with the error `blackfire and tideways cannot be enabled at the same time`.
- Tideways and OpenTelemetry tracing cannot be used at the same time. While Tideways is enabled, your application does not send traces, and the Tempo data source in Grafana stays empty for the affected time range. See [Traces](./traces.md) for details on tracing.

To go back to tracing, set `services.tideways.enabled` to `false` and update your application again.
