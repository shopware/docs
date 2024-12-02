---
nav:
  title: System Checks
  position: 100

---

# Overview

In this guide, you will learn about the system health check in Shopware. System health checks are a way to monitor the health of a system and detect failures early.

You can find the core concepts well-defined in the Concepts section of the documentation [System Checks](../../../../../concepts/framework/system-check.md)

## Triggering System Checks

The system checks can be invoked either through the CLI or via an HTTP API.

* By calling the endpoint `/api/_info/system-health-check`
  * the HTTP response code only indicates the status of the request, not the status of the checks
* By calling the CLI command `system:check`
  * The command returns status `0` if all checks are healthy, `1` if any check is marked as unhealthy, and `2` if the call is invalid. See [Understanding the Check Results](#understanding-the-check-results)

> The CLI command defaults to using the `cli` execution context. You can change the execution context by passing the `--context` option. The available options are `cli`, `pre-rollout`, and `recurrent`.
> When calling the HTTP endpoint, the execution context is always `web`

### Shopware default flow

The default flow of Shopware system checks is done via: `Shopware\Core\Framework\SystemCheck\SystemChecker`

The `SystemChecker` class makes sure the system is working correctly by running all the registered system checks in a series. The following behavior is observed:

* Order of Checks: It runs checks in a specific order, grouped by types.
* Skipping Checks: Some checks are skipped if they aren’t allowed to run or if a major problem is found early on.
* Stopping Early: If a check in the `SYSTEM` type group is marked as `healthy = false`, it stops running more checks.

### Custom flow

All the system checks in Shopware are tagged with `shopware.system_check`, so you can also fetch all the checks using the Symfony service locator. and run them in your custom flow.

```php
class CustomSystemChecker
{
   public function __construct(private readonly iterable $checks)
    {
    }

    public function check(): array
    {
       # ... add your custom logic here
    }
}
```

```xml
<service id="YourNamepace\CustomSystemChecker">
    <argument type="tagged_iterator" tag="shopware.system_check"/>
</service>
```

### Custom triggers

For customized triggers, you can also inject the `Shopware\Core\Framework\SystemCheck\SystemChecker` service into your service and trigger the checks programmatically.

```php
$results = $systemChecker->check(SystemCheckExecutionContext::WEB);
# or also use any custom logic you might have...
$customChecker->check();
```

## Understanding the Check Results

The `Shopware\Core\Framework\SystemCheck\Check\Result` class represents the outcome of a system check in Shopware. Helping further diagnosis.

All the properties in the Result class, are objective in nature, so there usually is one clear interpretation. except the `healthy` flag, which is subjective.

In principle, regardless of the actual status of the check, the `healthy` flag should be set to:

* `true` if the system can still function normally
* `false` if the system cannot function normally
* `null` if it cannot be determined
