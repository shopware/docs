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
Also, available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Injecting another service

This example will be about injecting the `SystemConfigService` into our `ExampleService`.
First we are preparing the `ExampleService` PHP class.
Add the `SystemConfigService` as parameter to the constructor of the service class.

::: code-group

```php [<plugin root>/src/Service/ExampleService.php]
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

### Using autowire and autoconfigure

If you previously declared `autowire` and `autoconfigure` in your `services.xml` file, you do not need to do anything else.
The `SystemConfigService` will be injected into the `ExampleService` automatically.

### Explicit declaration

If you declared the service explicitly, you need to add the `SystemConfigService` as argument to the service.

::: code-group

```xml [<plugin root>/src/Resources/config/services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\ExampleService">
            <argument type="service" id="Shopware\Core\System\SystemConfig\SystemConfigService"/>
        </service>
    </services>
</container>
```

:::
