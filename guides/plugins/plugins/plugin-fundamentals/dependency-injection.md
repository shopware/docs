---
nav:
  title: Dependency injection
  position: 40

---

# Dependency Injection

## Overview

In this guide you'll learn how to inject services into other services.
You can read more about injecting services in the [Symfony documentation](https://symfony.com/doc/current/service_container.html#injecting-services-config-into-a-service).

## Prerequisites

To add your own custom service for your plugin, you first need a plugin as a base.
Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide).

Furthermore, you need a working service.
Therefore, you can refer to [Adding a custom service](add-custom-service) guide.

::: info
Refer to this video on **[Injecting services into a command](https://www.youtube.com/watch?v=Z4kyx9J1xaQ)** explaining DI based on the example of a custom CLI command.
It is also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Injecting another service

This example will be about injecting the `SystemConfigService` into our `ExampleService`.

With autowire enabled in your `services.php`, constructor injection works automatically. Simply add the service as a parameter to your constructor — Symfony will resolve and inject it for you.

::: code-group

```php [PLUGIN_ROOT/src/Service/ExampleService.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\System\SystemConfig\SystemConfigService;

class ExampleService
{
    public function __construct(
        private SystemConfigService $systemConfigService
    ) {
    }

    public function getShopname(SalesChannelContext $context): string
    {
        return $this->systemConfigService->getString('core.basicInformation.shopName', $context->getSalesChannel()->getId());
    }
}
```

:::

No additional configuration in `services.php` is required — autowire handles the injection automatically.
