---
nav:
  title: Listen to order changes
  position: 20

---

# Listen to Order Changes

## Overview

This guide will teach you how to react to order changes, e.g. changes to the ordered line items, or changes to one of the order states.

## Prerequisites

This guide is built upon our [plugin base guide](../../plugin-base-guide) and uses the same namespaces as the said plugin.
Also, since we're trying to listen to an event in this guide, you need to know about [subscribers](../../plugin-fundamentals/listening-to-events).

## Listening to the event

First, you need to know about the several possible order events to find your right order.
You can find them in the [OrderEvents](https://github.com/shopware/shopware/blob/v6.6.9.0/src/Core/Checkout/Order/OrderEvents.php) class.

Let's assume you want to react to general changes to the order itself, then the event `ORDER_WRITTEN_EVENT` is the one to choose.

```php
// <plugin root>/src/Service/ListenToOrderChanges.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\OrderEvents;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ListenToOrderChanges implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            OrderEvents::ORDER_WRITTEN_EVENT => 'onOrderWritten',
        ];
    }

    public function onOrderWritten(EntityWrittenEvent $event): void
    {
        // Making sure we're only reacting to changes in the live version
        if ($event->getContext()->getVersionId() !== Defaults::LIVE_VERSION) {
            return;
        }

        // Do stuff
    }
}
```

## Reading changeset

Due to performance reasons, a changeset of the write operation is not automatically added to the event parameter.
To force Shopware to generate a changeset, we need to listen to another event.

For this, we're going to use the [PreWriteValidationEvent](https://github.com/shopware/shopware/blob/v6.6.9.0/src/Core/Framework/DataAbstractionLayer/Write/Validation/PreWriteValidationEvent.php), which is triggered **before** the write result set is generated.

```php
// <plugin root>/src/Service/ListenToOrderChanges.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\OrderDefinition;
use Shopware\Core\Checkout\Order\OrderEvents;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenEvent;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Command\ChangeSetAware;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Validation\PreWriteValidationEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ListenToOrderChanges implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            PreWriteValidationEvent::class => 'triggerChangeSet',
            OrderEvents::ORDER_WRITTEN_EVENT => 'onOrderWritten',
        ];
    }

    public function triggerChangeSet(PreWriteValidationEvent $event): void
    {
        if ($event->getContext()->getVersionId() !== Defaults::LIVE_VERSION) {
            return;
        }

        foreach ($event->getCommands() as $command) {
            if (!$command instanceof ChangeSetAware) {
                continue;
            }

            if ($command->getEntityName() !== OrderDefinition::ENTITY_NAME) {
                continue;
            }

            $command->requestChangeSet();
        }

    }

    public function onOrderWritten(EntityWrittenEvent $event): void
    {
        if ($event->getContext()->getVersionId() !== Defaults::LIVE_VERSION) {
            return;
        }

        foreach ($event->getWriteResults() as $result) {
            $changeSet = $result->getChangeSet();

            // Do stuff
        }
    }
}
```

So the `PreWriteValidationEvent` is triggered before the write set is generated.
In its respective listener `triggerChangeSet`, we're first checking if the current command is able to generate a changeset.
E.g., an "insert" command cannot generate a changeset, because nothing has changed - a whole new entity is generated.

Afterward, we're checking which entity is currently being processed.
Since this has an impact on the performance, we only want to generate a changeset for our given scenario.
Make sure to narrow it down as much as possible.
Especially the check for the version is important.
E.g., during editing an order in the admin, a new draft version of the order is created, which will be merged with the live version on save.
But this is probably not the state you want to react to.
So make sure you only cover the live version.

Afterward we execute the method `requestChangeSet` on the command.

Note the changes made to the `onOrderWritten` method, which is now reading the newly generated change set.
