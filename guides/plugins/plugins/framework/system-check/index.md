# Overview

In this guide, you will learn about the system health check in Shopware. System health checks are a way to monitor the health of a system and detect failures early. 

You can find the core concepts well-defined in the Concepts section of the documentation [System Checks](../../../../../concepts/framework/system-check.md)

## Triggering System Checks

The system checks can be invoked either through the CLI or via an HTTP API.

* By calling the endpoint `/api/_info/system-health-check`
* By calling the CLI command `system:check`

> The CLI command defaults to using the `cli` execution context. You can change the execution context by passing the `--context` option. The available options are `cli`, `pre-rollout`, and `recurrent`.
> When calling the HTTP endpoint, the execution context is always `web`

### Custom flow

For customized flows, you can also inject the `Shopware\Core\Framework\SystemCheck\SystemChecker` service into your service and trigger the checks programmatically.

```php
$results = $systemChecker->check(SystemCheckExecutionContext::WEB);
```

> All the system checks in Shopware are tagged with `shopware.system_check`, so you can also fetch all the checks using the Symfony service locator.
