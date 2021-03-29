# Add custom service

## Overview

In this guide you'll learn how to create a custom service using the Symfony [DI Container](https://symfony.com/doc/current/service_container.html).

## Prerequisites

In order to add your own custom service for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide.md).

## Adding service

Adding a custom service requires to load a `services.xml` file with your plugin. This is done by placing a file with name `services.xml` into a directory called `src/Resources/config/`.

Here's our example `services.xml`:

{% code title="<plugin root>/src/Resources/config/services.xml" %}
```xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\ExampleService" />
    </services>
</container>
```
{% endcode %}

Therefore, this is how your service could then look like:

{% code title="<plugin root>/src/Service/ExampleService.php" %}
```php
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
{% endcode %}

Note: By default, all services in Shopware 6 are marked as _private_. Read more about private and public services [here](https://symfony.com/doc/current/service_container.html#public-versus-private-services).

## Next steps

Now that you know how to create a service, you can head over to our guide on creating a subscriber of the service. [Listening to Events](listening-to-events.md)

