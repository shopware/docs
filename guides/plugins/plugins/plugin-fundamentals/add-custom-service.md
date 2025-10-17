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

For adding a custom service, you need to provide a `services.xml` file in your plugin.
Place a file with name `services.xml` into a directory called `src/Resources/config/`.

::: code-group

```xml [<plugin root>/src/Resources/config/services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
    </services>
</container>
```

:::

Now you have two possibilities to add a service to your plugin.

### Using autowire and autoconfigure

Set `autowire` and `autoconfigure` to `true` in your `services.xml` file.
Symfony will then automatically register your service.
Read more about it, in the [Symfony docs](https://symfony.com/doc/current/service_container.html#creating-configuring-services-in-the-container).

::: code-group

```xml [<plugin root>/src/Resources/config/services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <defaults autowire="true" autoconfigure="true"/>
        <prototype namespace="Swag\BasicExample\" resource="../../" exclude="../../{Resources,Migration,*.php}"/>
    </services>
</container>
```

:::

Now every PHP class in the `src` directory of your plugin will be registered as a service.
The directory `Resources` and `Migration` are excluded, as they usually should not contain services.

### Explicit declaration

Instead of autowiring and autoconfiguring, you can also declare your service explicitly.
Use this option if you want to have more control over your service.

::: code-group

```xml [<plugin root>/src/Resources/config/services.xml]
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\ExampleService"/>
    </services>
</container>
```

:::

### Actual service class

Then this is what your service could look like:

::: code-group

```php [<plugin root>/src/Service/ExampleService.php]
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

## Alternatives to XML

Symfony offers two other file formats to define your services: YAML and PHP.
In Shopware, it is also possible to use one of these.
Choose the one that suits you best.

## Next steps

You have now created your own custom service.
In the same manner, you can create other important plugin classes, such as [commands](add-custom-commands), [scheduled tasks](add-scheduled-task) or a [subscriber to listen to events](listening-to-events).

Furthermore, we also have a guide explaining how to [customize an existing service](adjusting-service) instead.
