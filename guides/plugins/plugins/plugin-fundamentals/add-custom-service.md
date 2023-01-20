# Add Custom Service

## Overview

In this guide you'll learn how to create a custom service using the Symfony [DI Container](https://symfony.com/doc/current/service_container.html).

## Prerequisites

In order to add your own custom service for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide.md).

## Adding service

Adding a custom service requires to load a `services.xml` file with your plugin. This is done by placing a file with name `services.xml` into a directory called `src/Resources/config/`.

Here's our example `services.xml`:

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\ExampleService" />
    </services>
</container>
```

Therefore, this is how your service could then look like:

```php
// <plugin root>/src/Service/ExampleService.php
// SwagBasicExample/src/Service/ExampleService.php

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

::: info
By default, all services in Shopware 6 are marked as _private_. Read more about [private and public services](https://symfony.com/doc/current/service_container.html#public-versus-private-services).
:::

## Next steps

You have now created your own custom service. In the same manner, you can create other important plugin classes, such as [commands](add-custom-commands.md), [scheduled tasks](add-scheduled-task.md) or a [subscriber to listen to events](listening-to-events.md).

Furthermore, we also have a guide explaining how to [customize an existing service](adjusting-service.md) instead.
