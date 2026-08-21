---
nav:
  title: Blackfire
  position: 50
---

# Blackfire

[Blackfire](https://www.blackfire.io/) is a PHP profiler that shows where time and memory are spent in a request. Shopware PaaS Native can run a Blackfire agent alongside your application, so profiles collected from your shop are sent to your own Blackfire account.

You need an existing Blackfire account. The platform does not provide one.

## Store your Blackfire credentials

Blackfire identifies your agent with a **Server ID** and a **Server Token**. You find both in your Blackfire account under the settings of the environment you want to profile into.

Create one secret for each, using the type `env`:

```sh
sw-paas vault create
```

The keys must be named exactly:

| Key | Value |
|-----|-------|
| `BLACKFIRE_SERVER_ID` | Your Blackfire Server ID |
| `BLACKFIRE_SERVER_TOKEN` | Your Blackfire Server Token |

See [Secrets](../fundamentals/secrets.md) for more details on managing secrets.

::: warning
Do not use your Client ID and Client Token here. Those are personal credentials used by the browser extension and the Blackfire CLI, and they are not configured in Shopware PaaS Native.
:::

## Enable Blackfire

Set `services.blackfire.enabled` to `true` in your [`application.yaml`](../fundamentals/application-yaml.md):

```yaml
services:
  blackfire:
    enabled: true
```

Commit this change, push it to your git repository, and [update your application](../fundamentals/applications.md#update-your-application).

::: warning
Both secrets must exist before you enable Blackfire. If either one is missing, the deployment fails.
:::

Enabling Blackfire does three things for you:

- The Blackfire probe is added to your application image during the build. You do not need to list it under `app.php.extensions`.
- A Blackfire agent is deployed next to your application.
- Your application containers are configured to send profiles to that agent.

## Collect a profile

Install the [Blackfire browser extension](https://blackfire.io/docs/integrations/browsers/index) or the [Blackfire CLI](https://blackfire.io/docs/up-and-running/installation) and sign in with your personal Client ID and Client Token. Open your storefront and start a profile from the extension. The resulting profiles appear in your Blackfire account.

::: info
Pages served from the CDN cache never reach PHP, so they cannot be profiled. If a profile does not appear, request the page in a way that bypasses the cache, for example by profiling a page that is not cacheable.
:::

## Blackfire and tracing

Blackfire and OpenTelemetry tracing cannot be used at the same time. While Blackfire is enabled, your application does not send traces, and the Tempo data source in Grafana stays empty for the affected time range. See [Traces](./traces.md) for details on tracing.

To go back to tracing, set `services.blackfire.enabled` to `false` and update your application again.
