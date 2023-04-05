---
nav:
  title: Using database events
  position: 90

---

# Using Database Events

## Overview

Events are the easiest way to extend the DataAbstractionLayer. Every entity comes with a set of events which will be dispatched in various situations.

All events are nested into one container event so that your subscriber should only get called once for e.g. a search request instead of dispatching the event 30 times.

## Prerequisites

This guide is built upon the [Plugin base guide](../../plugin-base-guide), but any plugin will work here. Just note that all examples are using the plugin mentioned above.

Furthermore you should have a look at our [Listening to events](../../plugin-fundamentals/listening-to-events) guide since we are subscribing to events in this guide.

## Event overview

The events below are dispatched for every entity in Shopware. The first part before the dot \(.\) equals your entity name. The examples are based on the `product` entity.

| Event | Description |
| :--- | :--- |
| `product.written` | After the data has been written to storage |
| `product.deleted` | After the data has been deleted in storage |
| `product.loaded` | After the data has been hydrated into objects |
| `product.search.result.loaded` | After the search returned data |
| `product.aggregation.result.loaded` | After the aggregations have been loaded |
| `product.id.search.result.loaded` | After the search for ids only has been finished |

### product.written

The written event refers to `Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenEvent` and provides the following information:

* The reference class of the written definition
* The data that was written
* The context the data was written with
* The list of affected primary keys
* The list of errors if there are any

### product.deleted

The deleted event refers to `Shopware\Core\Framework\DataAbstractionLayer\Event\EntityDeletedEvent` and provides the following information:

* The reference class of the deleted definition
* The context the data was deleted with
* The list of affected primary keys
* The list of errors if there are any

### product.loaded

The loaded event refers to `Shopware\Core\Framework\DataAbstractionLayer\Event\EntityLoadedEvent` and provides the following information:

* The reference class of the loaded definition
* The context the data was loaded with
* The list of hydrated entities

### product.search.result.loaded

The loaded event refers to `Shopware\Core\Framework\DataAbstractionLayer\Event\EntitySearchResultLoadedEvent` and provides the following information:

* The reference class of the loaded definition
* The context the data was loaded with
* The search result object including count, criteria and hydrated entities

### product.aggregation.result.loaded

The loaded event refers to `Shopware\Core\Framework\DataAbstractionLayer\Event\EntityAggregationResultLoadedEvent` and provides the following information:

* The results of the aggregation
* The criteria the data was searched with
* The context the data was loaded with

### product.id.search.result.loaded

The loaded event refers to `Shopware\Core\Framework\DataAbstractionLayer\Event\EntityIdSearchResultLoadedEvent` and provides the following information:

* The reference class of the loaded definition
* The context the data was loaded with
* The search result object including count, criteria, and list of ids

## Event classes

All of stock entities come with their own event class. To keep the example of the product entity, you've got the `ProductEvents` class which is a list of constants to provide auto-completion and in case we are changing event names, you are covered.

The example below shows you how to use the constants in your event subscriber:

```php
// <plugin root>/src/Subscriber/ProductSubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Shopware\Core\Content\Product\ProductEvents;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityLoadedEvent;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ProductSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
            ProductEvents::PRODUCT_LOADED_EVENT => 'onLoad',
            ProductEvents::PRODUCT_WRITTEN_EVENT => 'afterWrite',
        ];
    }

    public function onLoad(EntityLoadedEvent $event)
    {
        ...
    }

    public function afterWrite(EntityWrittenEvent $event)
    {
        ...
    }
```

After creating the event subscriber, you have to register it. If you don't know how that's done, head over to our guide about [Listening to events](../../plugin-fundamentals/listening-to-events).

Here's our `services.xml`:

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Subscriber\ProductSubscriber">
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```
