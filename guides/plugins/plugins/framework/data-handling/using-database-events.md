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

## General event overview

The events below are dispatched during certain DAL operations, they are not necessarily associated with a particular entity, rather they are triggered with batches of commands.

| Event                                                                   | Description                                                                                        |
|:------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------|
| `Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWriteEvent`   | Before a batch of commands has been written to storage. Written means inserted, updated or deleted |
| `Shopware\Core\Framework\DataAbstractionLayer\Event\EntityDeleteEvent`  | Before a batch of delete commands has been executed                                                |

### `Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWriteEvent`

This event allows you to hook into the process of writing an entity. This includes creating, updating, and deleting entities. You have the possibility to execute the code before and after the entity is written via the "success" and "error" callbacks. You can call the `addSuccess` or `addError` methods with any PHP callable.

You can use this event to capture state, perform actions, and sync data after an entity is written. It could be used, for example, to synchronize images to a CDN when they are written, updated, or deleted. This event is useful when you need the before state of the entity. For example, the old filename.

Below is an example subscriber listening to the generic entity write event and logging the ID's of the written entities.

```php
// <plugin root>/src/Subscriber/EntityWriteSubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWriteEvent;
use Shopware\Core\Content\Cms\CmsPageDefinition;
use Psr\Log\LoggerInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Command\WriteCommand;

class EntityWriteSubscriber implements EventSubscriberInterface
{

    public function __construct(private readonly LoggerInterface $logger)
    {
    }

    public static function getSubscribedEvents()
    {
        return [
            EntityWriteEvent::class => 'beforeWrite',
        ];
    }

    public function beforeWrite(EntityWriteEvent $event)
    {
        //get the ids of any cms entities about to be written/updated/deleted
        //this event is triggered for batches of entities, so you can use this to filter for specific entities
        $ids = $event->getIds(CmsPageDefinition::ENTITY_NAME);
        
        //get ids of all entities to be written, regardless of type
        $ids = $event->getIds();
        
        //you can also fetch the payloads (DeleteCommand's do not have payloads)
        $payloads = array_map(fn (WriteCommand $command) => $command->getPayload(), $event->getCommands());
        
        //or for a specific entity type
        $payloads = array_map(fn (WriteCommand $command) => $command->getPayload(), $event->getCommandsForEntity(CmsPageDefinition::ENTITY_NAME));
                
        
        $event->addSuccess(function () use ($ids) {
            //the entities have now been successfully written
            
            $this->logger->info(sprintf('Entities with ids: "%s" were written', implode(', ', $ids)));
        });
        
        $event->addError(function () use ($ids) {
            //the entities failed to write, you can write a log, send an e-mail, or anything else.
            $this->logger->critical(sprintf('Entities with ids: "%s" were not written', implode(', ', $ids)));
        });
    }
}
```

After creating the event subscriber, you have to register it. If you don't know how it is done, then refer to the [Listening to events](../../plugin-fundamentals/listening-to-events) guide.

### `Shopware\Core\Framework\DataAbstractionLayer\Event\EntityDeleteEvent`

This event allows you to hook into the process of removing an entity. You have the possibility to execute the code before and after the entity is removed via the "success" and "error" callbacks. You can call the `addSuccess` or `addError` methods with a closure.

You can use this event to capture state and perform actions after an entity is removed. For example, you could collect the entity name before it is deleted, then after it is deleted, use the name to remove the respective data from a third-party system via an API call.

Below is an example subscriber listening to the generic entity delete event, filtering for CMS page deletions, and then performing a different action based on whether the delete was successful or not.

```php
// <plugin root>/src/Subscriber/DeleteSubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityDeleteEvent;
use Shopware\Core\Content\Cms\CmsPageDefinition;

class DeleteSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
            EntityDeleteEvent::class => 'beforeDelete',
        ];
    }

    public function beforeDelete(EntityDeleteEvent $event)
    {
        //get the ids of any cms entities about to be deleted
        //this event is triggered for batches of entities, so you can use this to filter for specific entities
        $ids = $event->getIds(CmsPageDefinition::ENTITY_NAME);
        
        $event->addSuccess(function () use ($ids) {
            //the entities have now been successfully deleted
            
            $this->cache->purge($ids);
        });
        
        $event->addError(function () use ($ids) {
            //the entities failed to delete, you can write a log, send an e-mail, or anything else.
        });
    }
}
```

After creating the event subscriber, you have to register it. If you don't know how it is done, then refer to the [Listening to events](../../plugin-fundamentals/listening-to-events) guide.

## Entity event overview

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

With `autoconfigure` enabled in your `services.php`, the subscriber is automatically registered because it implements `EventSubscriberInterface` — no additional configuration is needed.
