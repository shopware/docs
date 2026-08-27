---
nav:
  title: Dependency Injection
  position: 40

product: shopware
lifecycle: onboarding
---

# Dependency Injection

This guide explains how to inject services into other services. For more details, see the [Symfony documentation](https://symfony.com/doc/current/service_container.html#injecting-services-config-into-a-service).

## Prerequisites

This guide builds on the [Plugin Base Guide](../plugin-base-guide.md) and requires a working service — see [Add Custom Service](add-custom-service.md).

::: info
For Academy learning content on dependency injection, service registration, constructor injection, and service decoration, refer to this free course **[Dependency Injection and Services](https://hub.shopware.com/learn/unit/dependency-injection-and-services)** from **Shopware Backend Development Intermediate** learning path.
:::

## Injecting another service

The following example injects `SystemConfigService` into `ExampleService`. Add it as a constructor parameter:

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

### Using autowire and autoconfigure

If you previously declared `autowire` and `autoconfigure` in your `services.php` file, you do not need to do anything else.
The `SystemConfigService` will be injected into the `ExampleService` automatically.

### Explicit declaration

If you declared the service explicitly, you need to add the `SystemConfigService` as argument to the service.

::: code-group

```php [PLUGIN_ROOT/src/Resources/config/services.php]
<?php declare(strict_types=1);

use Shopware\Core\System\SystemConfig\SystemConfigService;
use Swag\BasicExample\Service\ExampleService;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(ExampleService::class)
        ->args([service(SystemConfigService::class)]);
};
```

:::
