---
nav:
  title: Add Custom Service
  position: 60

---

# Add Custom Service

In this guide you'll learn how to create a custom service using the Symfony [DI Container](https://symfony.com/doc/current/service_container.html).

## Prerequisites

To add your own custom service for your plugin, you first need a plugin as a base.
Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide.md).

## Adding service

For adding a custom service, you need to provide a `services.php` file in your plugin.
Place a file with name `services.php` into a directory called `src/Resources/config/`.

::: code-group

```php [PLUGIN_ROOT/src/Resources/config/services.php]
<?php declare(strict_types=1);

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();
};
```

:::

Now you have two possibilities to add a service to your plugin.

### Using autowire and autoconfigure

Set `autowire` and `autoconfigure` to `true` in your `services.php` file.
Symfony will then automatically register your service.
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

    $services->load('Swag\\BasicExample\\', '../../')
        ->exclude('../../{Resources,Migration,*.php}');
};
```

:::

Now every PHP class in the `src` directory of your plugin will be registered as a service.
The directory `Resources` and `Migration` are excluded, as they usually should not contain services.

### Explicit declaration

Instead of autowiring and autoconfiguring, you can also declare your service explicitly.
Use this option if you want to have more control over your service.

::: code-group

```php [PLUGIN_ROOT/src/Resources/config/services.php]
<?php declare(strict_types=1);

use Swag\BasicExample\Service\ExampleService;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(ExampleService::class);
};
```

:::

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

## Alternatives to PHP configuration

Symfony supports two other file formats to define your services: YAML and XML.
However, starting with Symfony 7.4, XML service configuration has been deprecated, and it will no longer be supported in Symfony 8.0.
Choose the one that suits you best.

## Next steps

You have now created your own custom service. In the same manner, you can create other important plugin classes, such as [commands](../plugin-fundamentals/add-custom-commands.md), [scheduled tasks](../plugin-fundamentals/add-scheduled-task.md), or a [subscriber to listen to events](../framework/event/listening-to-events.md).

Furthermore, we also have a guide explaining how to [customize an existing service](../services/adjusting-service.md) instead.
