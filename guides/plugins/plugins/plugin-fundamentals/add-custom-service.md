---
nav:
  title: Add custom service
  position: 60

---

# Add Custom Service

## Overview

In this guide you'll learn how to create a custom service using the Symfony [DI Container](https://symfony.com/doc/current/service_container.html).

## Prerequisites

To add your own custom service for your plugin, you first need a plugin as a base.
Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide).

## Adding service

To register services in your plugin, create a `services.php` file in the `src/Resources/config/` directory. Using `autowire` and `autoconfigure`, Symfony will automatically register and configure your services.

Read more about it in the [Symfony docs](https://symfony.com/doc/current/service_container.html#creating-configuring-services-in-the-container).

::: code-group

```php [PLUGIN_ROOT/src/Resources/config/services.php]
<?php declare(strict_types=1);

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services()
        ->defaults()
            ->autowire()
            ->autoconfigure();

    $services->load('Swag\\BasicExample\\', '../../../')
        ->exclude('../../../{Resources,Migration}');
};
```

:::

Now every PHP class in the `src` directory of your plugin will be registered as a service.
The directories `Resources` and `Migration` are excluded, as they usually should not contain services.

### Actual service class

Then this is what your service could look like:

::: code-group

```php [PLUGIN_ROOT/src/Service/ExampleService.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

class ExampleService
{
    public function doSomething(): void
    {
        ...
    }
}
```

:::

::: info
By default, all services in Shopware 6 are marked as _private_.
Read more about [private and public services](https://symfony.com/doc/current/service_container.html#public-versus-private-services).
:::

## Next steps

You have now created your own custom service.
In the same manner, you can create other important plugin classes, such as [commands](add-custom-commands), [scheduled tasks](add-scheduled-task) or a [subscriber to listen to events](listening-to-events).

Furthermore, we also have a guide explaining how to [customize an existing service](adjusting-service) instead.
