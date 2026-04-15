---
nav:
  title: Troubleshooting Common Issues
  position: 90
---

# Troubleshooting Common Issues

This guide collects practical troubleshooting workflows for Shopware PaaS Native. It focuses on checks you can perform with the CLI, Grafana, and an application shell session.

## Prepare your CLI context

If you regularly work with the same organization, project, or environment, set a default context first:

```sh
sw-paas account context set
```

You can also preselect the default environment for the current shell session:

```sh
export SW_PAAS_ENVIRONMENT=staging
```

This avoids repeated prompts while you troubleshoot. For more details, see the [account guide](../fundamentals/account.md).

## Check timing and trace headers

If a page is slow, intermittently returns an error, or seems to be cached, inspect the current response timings first:

```sh
sw-paas app timing --query "foo=bar"
```

Adding a query parameter helps bypass cached responses so you can inspect a fresh request.

The following response headers are especially useful:

| Header | Meaning |
| ------ | ------- |
| `x-envoy-upstream-service-time` | Time spent inside the Shopware PaaS Native infrastructure for the upstream request |
| `x-trace-id` | Trace identifier that you can search for in Grafana Tempo |
| `x-timer` | Fastly timing information. The `VE` value helps estimate the time between Fastly and the origin infrastructure |

You can also inspect the same headers in your browser's network tab.

## Check logs and traces in Grafana

Once you have confirmed the failing request, continue with logs and traces:

```sh
sw-paas open grafana
```

Use [logs](../monitoring/logs.md) to inspect application output and [traces](../monitoring/traces.md) to follow the request path through the system.

If you already captured an `x-trace-id`, search for that value directly in Tempo to jump to the affected request.

## My deployment finished, but the changes are not live

If an update appears to have completed but the application still serves the old state, inspect the application first:

```sh
sw-paas application get --application-id <application-id>
```

The `updated` timestamp is a useful indicator. If it does not change after you triggered the update, inspect the build logs:

```sh
sw-paas application build logs --application-id <application-id>
```

For the general deployment workflow, see the [applications guide](../fundamentals/applications.md).

## Scheduled tasks or queue workers are stuck

If scheduled tasks remain in `queued` state for too long, start with the worker logs in Grafana. If the logs do not explain the issue, open an application shell:

```sh
sw-paas exec --new
```

From there, run the consumers manually to surface runtime errors:

```sh
bin/console messenger:consume async low_priority failed scheduler_shopware
```

If scheduled tasks are missing after a deployment or update, register them again:

```sh
bin/console scheduled-task:register
```

If you need to inspect the database state directly, open a database tunnel as described in the [database guide](../resources/databases.md).

## What to collect before opening support

If the issue is still unresolved, collect the following information before opening a support request:

- The affected application ID
- The failing URL
- The approximate timestamp of the failing request
- The `x-trace-id`, if available
- Relevant build or deployment log excerpts
