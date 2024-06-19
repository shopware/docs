---
nav:
  title: Prevent Deletion of Media Files Referenced in your Plugins
  position: 10

---

# Prevent Deletion of Media Files Referenced in your Plugins

::: info
The ability to prevent Media entities from being deleted is available since Shopware 6.5.1.0.
:::

## Overview

The Shopware CLI application provides a `media:delete-unused` command which deletes all media entities and their corresponding files which are not used in your application.
Not used means that it is not referenced by any other entity. This works well in the simple case that all your entity definitions store references to Media entities with correct foreign keys.

However, this does not cover all the possible cases, even for many internal Shopware features. For example the CMS entities store their configuration as JSON blobs with references to Media IDs stored in a nested data structure.

In order to fix the case of Media references that cannot be resolved without knowledge of the specific entity and its features, an extension point is provided via an event.

If you are developing an extension which references Media entities, and you cannot use foreign keys, this guide will detail how to prevent shopware deleting the Media entities your extension references.

## Prerequisites

As most of our plugin guides, this guide was also built upon our [Plugin base guide](../../plugin-base-guide).
Furthermore, you'll have to know about adding classes to the [Dependency injection](../../plugin-fundamentals/dependency-injection) container
and about using a subscriber in order to [Listen to events](../../plugin-fundamentals/listening-to-events).

## The deletion process

The `\Shopware\Core\Content\Media\UnusedMediaPurger` service first searches for Media entities that are not referenced by any other entities in the system via foreign keys. Then it dispatches an event containing the Media IDs it believes are unused.

The event is an instance of `\Shopware\Core\Content\Media\Event\UnusedMediaSearchEvent`. A subscriber can then cross-reference the Media IDs scheduled to be deleted and mark any of them as *used*.

The remaining Media IDs will then be deleted by the `\Shopware\Core\Content\Media\UnusedMediaPurger` service.

Please note that this process is completed in small batches to maintain stability, so the event may be dispatched multiple times when an installation has many unused Media entities.

## Adding a subscriber

In this section, we're going to register a subscriber for the `\Shopware\Core\Content\Media\Event\UnusedMediaSearchEvent` event.

Have a look at the following code example:

```php
// <plugin root>/src/Subscriber/UnusedMediaSubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Shopware\Core\Content\Media\Event\UnusedMediaSearchEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class UnusedMediaSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            UnusedMediaSearchEvent::class => 'removeUsedMedia',
        ];
    }

    public function removeUsedMedia(UnusedMediaSearchEvent $event): void
    {
        $idsToBeDeleted = $event->getUnusedIds();
    
        $doNotDeleteTheseIds = $this->getUsedMediaIds($idsToBeDeleted);
    
        $event->markAsUsed($doNotDeleteTheseIds);
    }
    
    private function getUsedMediaIds(array $idsToBeDeleted): array
    {
        // do something to get the IDs that are used
        return [];
    }
}
```

You can use the method `getUnusedIds` of the `$event` variable to get the current an array of Media IDs scheduled for removal.

You can use these IDs to query whatever storage your plugin uses to store references to Media entities, to check if they are currently used.

If any of the IDs are used by your plugin, you can use the method `markAsUsed` of the `$event` variable to prevent the Media entities from being deleted. `markAsUsed` accepts an array of string IDs.

If your storage is a relational database such as MySQL you should, when possible, use direct database queries to check for references. This saves memory and CPU cycles by not loading unnecessary data.

Imagine an extension which provides an image slider feature. An implementation of `getUsedMediaIds` might look something like the following:

```php
// <plugin root>/src/Subscriber/UnusedMediaSubscriber.php
private function getUsedMediaIds(array $idsToBeDeleted): array
{
    $sql = <<<SQL
    SELECT JSON_EXTRACT(slider_config, "$.images") as mediaIds FROM my_slider_table
    WHERE JSON_OVERLAPS(
        JSON_EXTRACT(slider_config, "$.images"),
        JSON_ARRAY(?)
    );
    SQL;

    $usedMediaIds = $this->connection->fetchFirstColumn(
        $sql,
        [$event->getUnusedIds()],
        [ArrayParameterType::STRING]
    );

    return array_map(fn (string $ids) => json_decode($ids, true, \JSON_THROW_ON_ERROR), $usedMediaIds);
}
```

In the above example, `$this->connection` is an instance of `\Doctrine\DBAL\Connection` which can be injected in to your subscriber.
We use the MySQL JSON functions to query the table `my_slider_table`.
We check if there are any references to the Media IDs from the event, in the `slider_config` column which is a JSON blob. The `JSON_EXTRACT` function looks into the `images` key of the data. We use the where condition in combination with the `JSON_OVERLAPS` function to only query rows that have references to the Media IDs we are interested in.

Finally, we return all the IDs of Media which are used in the slider config so that they are not deleted.

Make sure to register your event subscriber to the [Dependency injection container](../../plugin-fundamentals/dependency-injection)
by using the tag `kernel.event_subscriber`.

<Tabs>
<Tab title="services.xml">

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Subscriber\UnusedMediaSubscriber">
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```

</Tab>
</Tabs>
