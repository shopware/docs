---
nav:
  title: Profiling / Tracing
  position: 20

---

# Profiling

Shopware provides a built-in profiler abstraction to measure the performance of code parts and publish this data to a profiler backend.

## Enabling the profiler backends

By default, only the Stopwatch profiler (Symfony Profiler Bar) is enabled. To enable the other profiler backends, you have to add the following configuration to your `config/packages/shopware.yaml` file:

```yaml
shopware:
    profiler:
        integrations:
            - Symfony
            # Requires the dd-trace PHP extension
            - Datadog
            # Requires the tideways PHP extension
            - Tideways
            # Requires the opentelemetry PHP extension
            - OpenTelemetry
```

::: info
The OpenTelemetry profiler is not installed by default. Checkout the [OpenTelemetry Integration](./opentelemetry.md) to learn how to install it.
:::

## Adding custom spans

To add custom spans to the profiler, you can use the `Shopware\Core\Profiling\Profiler::trace` method:

```php
use Shopware\Core\Profiling\Profiler;

$value = Profiler::trace('my-example-trace', function () {
    return $myFunction();
});
```

And then you can see the trace in the configured profiler backends.

## Adding a custom profiler backend

To add a custom profiler backend, you need to implement the `Shopware\Core\Profiling\Integration\ProfilerInterface` interface and register it as a service with the tag `shopware.profiler`.

The following example shows a custom profiler backend that logs the traces to the console:

```php

namespace App\Profiler;

use Shopware\Core\Profiling\Integration\ProfilerInterface;

class ConsoleProfiler implements ProfilerInterface
{
    public function start(string $title, string $category, array $tags): void
    {
        echo "Start $name\n";
    }

    public function stop(string $title): void
    {
        echo "Stop $name\n";
    }
}
```

```XML
<service id="App\Profiler">
    <tag name="shopware.profiler" integration="Console"/>
</service>
```

The attribute `integration` is used to identify the profiler backend in the configuration.
