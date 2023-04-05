# Dependency Injection

## Overview

In this guide you'll learn how to inject services into other services. You can read more about injecting services in the [Symfony documentation](https://symfony.com/doc/current/service_container.html#injecting-services-config-into-a-service).

## Prerequisites

In order to add your own custom service for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide.md).

Furthermore, you need a working service. Therefore, you can refer to [Adding a custom service](add-custom-service.md) guide.

::: info
Refer to this video on **[Injecting services into a command](https://www.youtube.com/watch?v=Z4kyx9J1xaQ)** explaining DI based on the example of a custom CLI command. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Injecting another service

Let's get started with an example how to inject a service. This example will be about injecting the `SystemConfigService` into our `ExampleService`.

Here's our example `services.xml`:

```xml
// <plugin root>/src/Resources/config/services.xml
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

Now we have to add the injected service as argument to our service constructor.

In the following you can find our `ExampleService` where we injected the `SystemConfigService` with an example function `getShopname()` where we use it.

```php
// <plugin root>/src/Service/ExampleService.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\System\SystemConfig\SystemConfigService;

class ExampleService
{
    private SystemConfigService $systemConfigService;

    public function __construct(SystemConfigService $systemConfigService)
    {
        $this->systemConfigService = $systemConfigService;
    }

    public function getShopname(SalesChannelContext $context): string
    {
        return $this->systemConfigService->getString('core.basicInformation.shopName', $context->getSalesChannel()->getId());
    }
}
```
