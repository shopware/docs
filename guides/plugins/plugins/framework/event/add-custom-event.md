# Add Custom Event

## Overview

In this guide you will learn how to create your own event. You can read more about events in the [Symfony documentation](https://symfony.com/doc/current/event_dispatcher.html).

## Prerequisites

In order to create your own event for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../../plugin-base-guide.md).

::: info
Refer to this video on **[Event dispatching and handling](https://www.youtube.com/watch?v=JBpa5nBoC78)** which is a live coding example on custom events. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Event interfaces and classes

In Shopware, you have multiple interfaces and classes for different types of events, in the following you can find a list of them:

* `ShopwareEvent`: This interface is just a basic event providing a `Context`, we need for almost all events.
* `ShopwareSalesChannelEvent`: This interface extends from `ShopwareEvent` and additionally provides a `SalesChannelContext`.
* `SalesChannelAware`: This interface provides the `SalesChannelId`.
* `GenericEvent`: This interface will be used if you want to give your event a specific name like the database events \(e.g. `product.written.`\). Otherwise, you have to reference to the event class.
* `NestedEvent`: This class will be used for events using other events for example the `EntityDeletedEvent` extends from the `EntityWrittenEvent`.
* `BusinessEventInterface`: This interface extends from `ShopwareEvent` and will be used for dynamically assignment and is always named.

## Create the event class

First, we create a new class for our event, which we name `ExampleEvent`. In this example we implement the `Shopware\Core\Framework\Event\ShopwareSalesChannelEvent`. As mentioned above our class already implements a method for the `SalesChannelContext` and the `Context`. Now we pass an `ExampleEntity` and the `SalesChannelContext` through the constructor and create a function which returns our `ExampleEntity`.

Therefore, this is how your event class could look like:

```php
// <plugin root>/src/Core/Content/Example/Event/ExampleEvent.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\Event;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Event\ShopwareSalesChannelEvent;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Swag\BasicExample\Core\Content\Example\ExampleEntity;

class ExampleEvent implements ShopwareSalesChannelEvent
{
    protected ExampleEntity $exampleEntity;

    protected SalesChannelContext $salesChannelContext;

    public function __construct(ExampleEntity $exampleEntity, SalesChannelContext $context)
    {
        $this->exampleEntity = $exampleEntity;
        $this->salesChannelContext = $context;
    }

    public function getExample(): ExampleEntity
    {
        return $this->exampleEntity;
    }

    public function getContext(): Context
    { 
        return $this->salesChannelContext->getContext();
    }

    public function getSalesChannelContext(): SalesChannelContext
    {
        return $this->salesChannelContext;
    }
}
```

## Fire the event

After we've created our entity class, we need to fire our new event. For this we need the service `event_dispatcher` which provides a method called `dispatch`. In this example we created a service `ExampleEventService` which fires our event. Below you can find the example implementation.

```php
// <plugin root>/src/Service/ExampleEventService.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Swag\BasicExample\Core\Content\Example\Event\ExampleEvent;
use Swag\BasicExample\Core\Content\Example\ExampleEntity;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

class ExampleEventService
{
    private EventDispatcherInterface $eventDispatcher;

    public function __construct(EventDispatcherInterface $eventDispatcher)
    {
        $this->eventDispatcher = $eventDispatcher;
    }

    public function fireEvent(ExampleEntity $exampleEntity, SalesChannelContext $context)
    {
        $this->eventDispatcher->dispatch(new ExampleEvent($exampleEntity, $context));
    }
}
```

## Next steps

Now that you know how to create your own event, you may want to act on it. To get a grip on this, head over to our [Listening to events](../../plugin-fundamentals/listening-to-events.md) guide.
