---
nav:
  title: Listening to events
  position: 50

---

# Listening to Events

A way to listen to events in Symfony projects is via an [event subscriber,](https://symfony.com/doc/current/event_dispatcher.html#creating-an-event-subscriber) which is a class that defines one or more methods that listen to one or various events. It is thus the same in Shopware, so this article will guide you on how to create event subscriber in your Shopware extension.

## Prerequisites

In order to build your own subscriber for your plugin, of course you first need a plugin as base. To create an own plugin, you can refer to the [Plugin Base Guide](../plugin-base-guide).

::: info
Refer to this video on **[Live coding example with product.loaded event.](https://www.youtube.com/watch?v=cJDaiuyjKJk)**. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Creating your own subscriber

### Plugin base class

Registering a custom subscriber requires to load a `services.xml` file with your plugin. This is done by either placing a file with name `services.xml` into a directory called `src/Resources/config/`.

Basically, that's it already if you're familiar with [Symfony subscribers](https://symfony.com/doc/current/event_dispatcher.html#creating-an-event-subscriber). Don't worry, we got you covered here as well.

### Creating your new subscriber class

To start creating a subscriber, we need to create a class first implementing EventSubscriberInterface. As mentioned above, such a subscriber for Shopware 6 looks exactly the same like in Symfony itself.

Therefore, this is how your subscriber could then look like:

```php
// <plugin root>/src/Subscriber/MySubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Core\Content\Product\ProductEvents;

class MySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        // Return the events to listen to as array like this:  <event to listen to> => <method to execute>
        return [
            ProductEvents::PRODUCT_LOADED_EVENT => 'onProductsLoaded'
        ];
    }

    public function onProductsLoaded(EntityLoadedEvent $event)
    {
        // Do something
        // E.g. work with the loaded entities: $event->getEntities()
    }
}
```

In this example, the subscriber would be located in the `<plugin root>/src/Subscriber` directory.

The subscriber is now listening for the `product.loaded` event to trigger. Unfortunately, your subscriber is not even loaded yet - this will be done in the previously registered `services.xml` file.

### Registering your subscriber via services.xml

Registering your subscriber to Shopware 6 is also as simple as it is in Symfony. You're simply registering your \(subscriber\) service by mentioning it in the `services.xml`. The only difference to a normal service is, that you need to add the `kernel.event_subscriber` tag to your subscriber for it to be recognized as such.

```php
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Subscriber\MySubscriber">
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```

That's it, your subscriber service is now automatically loaded at runtime and it should start listening to the mentioned events to be dispatched.
