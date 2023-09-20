# Listen to Order Changes

## Overview

This guide will teach you how to react to order changes, e.g. changes to the ordered line items, or changes to one of the order states.

## Prerequisites

This guide is built upon our [plugin base guide](../../plugin-base-guide) and uses the same namespaces as the said plugin. Also, since we're trying to listen to an event in this guide, you need to know about [subscribers](../../plugin-fundamentals/listening-to-events).

## Listening to the event

First of all you need to know about the several possible order events in order to find your right order. You can find them in the [OrderEvents](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Order/OrderEvents.php) class.

Let's assume you want to react to general changes to the order itself, then the event `ORDER_WRITTEN_EVENT` is the one to choose.

```php
// <plugin root>/src/Service/ListenToOrderChanges.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\OrderEvents;
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
        // Do stuff
    }
}
```

## Reading changeset

Due to performance reasons, a changeset of the write operation is not automatically added to the event parameter. In order to force Shopware to generate a changeset, we need to listen to another event.

For this we're going to use the [PreWriteValidationEvent](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Framework/DataAbstractionLayer/Write/Validation/PreWriteValidationEvent.php), which is triggered **before** the write result set is generated.

```php
// <plugin root>/src/Service/ListenToOrderChanges.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Checkout\Order\OrderDefinition;
use Shopware\Core\Checkout\Order\OrderEvents;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenEvent;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Command\ChangeSetAware;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Command\InsertCommand;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Command\UpdateCommand;
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
        foreach ($event->getCommands() as $command) {
            if (!$command instanceof ChangeSetAware) {
                continue;
            }

            /** @var ChangeSetAware|InsertCommand|UpdateCommand $command */
            if ($command->getDefinition()->getEntityName() !== OrderDefinition::ENTITY_NAME) {
                continue;
            }

            $command->requestChangeSet();
        }

    }

    public function onOrderWritten(EntityWrittenEvent $event): void
    {
        foreach ($event->getWriteResults() as $result) {
            $changeSet = $result->getChangeSet();

            // Do stuff
        }
    }
}
```

So the `PreWriteValidationEvent` is triggered before the write set is generated. In its respective listener `triggerChangeSet`, we're first checking if the current command is even able to generate a changeset. E.g. an "insert" command cannot generate a changeset, because nothing has changed - a whole new entity is generated.

Afterwards we're checking which entity is currently being processed. Since this has an impact on the performance, we only want to generate a changeset for our given scenario. Make sure to narrow it down as much as possible.

Afterwards we execute the method `requestChangeSet` on the command.

Note the changes made to the `onOrderWritten` method, which is now reading the newly generated change set.
