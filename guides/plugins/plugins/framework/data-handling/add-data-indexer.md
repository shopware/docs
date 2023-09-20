# Adding Data Indexer

## Overview

Data indexer are used to optimize the performance of recurring complex tasks. One good example to understand the benefit of data indexer would be the cheapest price calculation within Shopware. Every product has a `cheapest_price` column in the database which should contain the cheapest price a product has. The calculation of this column can be complex, because a product can have several variants with advanced pricing rules and so on. This makes the calculation more difficult and would take too much time when reading 25 products for a listing. To optimize the performance there is a data indexer that calculates the cheapest price of a product every time the product is updated by the DAL. This means that no new calculation has to be performed when a product is read, and performance during reading is significantly increased. Furthermore data indexer can make use of the [Message queue](../../../../hosting/infrastructure/message-queue) to handle the calculations asynchronously.

## Prerequisites

This guide is built upon the [Plugin base guide](../../plugin-base-guide), but any plugin will work here. Just note that all examples are using the plugin mentioned above. In order to create data indexer you should have read the [Adding custom complex data guide](./add-custom-complex-data).

## Adding an own data indexer

It is possible to add data indexer for your own entities, like the one created in the [Adding custom complex data](./add-custom-complex-data) guide or for existing entities. However, if you want to react on changes of existing entities the preferred way should be subscribing to the events if available. See the [Index data using existing events](Index data using existing events) section below. To create a new indexer, just create a new class in your plugin:

```php
// <plugin root>/src/Core/Framework/DataAbstractionLayer/Indexing/ExampleIndexer.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Framework\DataAbstractionLayer\Indexing;

use Doctrine\DBAL\Connection;
use Shopware\Core\Checkout\Customer\CustomerDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Dbal\Common\IteratorFactory;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenContainerEvent;
use Shopware\Core\Framework\DataAbstractionLayer\Indexing\EntityIndexer;
use Shopware\Core\Framework\DataAbstractionLayer\Indexing\EntityIndexingMessage;
use Shopware\Core\Framework\Uuid\Uuid;

class ExampleIndexer extends EntityIndexer
{
    private IteratorFactory $iteratorFactory;

    private EntityRepository $repository;

    private Connection $connection;

    public function __construct(
        IteratorFactory $iteratorFactory,
        EntityRepository $repository,
        Connection $connection
    ) {
        $this->iteratorFactory = $iteratorFactory;
        $this->repository = $repository;
        $this->connection = $connection;
    }

    /**
     * Returns a unique name for this indexer.
     */
    public function getName(): string
    {
        return 'swag.basic.example.indexer';
    }

    /**
     * Called when a full entity index is required. This function should generate a list of message for all records which
     * are indexed by this indexer.
     */

    public function iterate($offset): ?EntityIndexingMessage
    {
        $iterator = $this->iteratorFactory->createIterator($this->repository->getDefinition(), $offset);

        $ids = $iterator->fetch();

        if (empty($ids)) {
            return null;
        }

        return new EntityIndexingMessage(array_values($ids), $iterator->getOffset());
    }

    /**
     * Called when entities are updated over the DAL. This function should react to the provided entity written events
     * and generate a list of messages which has to be processed by the `handle` function over the message queue workers.
     */
    public function update(EntityWrittenContainerEvent $event): ?EntityIndexingMessage
    {
        $updates = $event->getPrimaryKeys(CustomerDefinition::ENTITY_NAME);

        if (empty($updates)) {
            return null;
        }

        return new EntityIndexingMessage(array_values($updates), null, $event->getContext());
    }

    /**
     * Called over the message queue workers. The messages are the generated messages
     * of the `self::iterate` or `self::update` functions.
     */
    public function handle(EntityIndexingMessage $message): void
    {
        $ids = $message->getData();

        if (!$ids) {
            return;
        }

        foreach ($ids as $id) {
            $this->writeLog($id);
        }
    }

    private function writeLog($customerId)
    {
        $this->connection->executeStatement('INSERT INTO `log_entry` (`id`, `message`, `level`, `channel`, `created_at`) VALUES (:id, :message, :level, :channel, now())', [
            'id' => Uuid::randomBytes(),
            'message' => 'Indexed customer with id: ' . $customerId,
            'level' => 1,
            'channel' => 'debug'
        ]);
    }
}
```

With the corresponding service registration:

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
                <service id="Swag\BasicExample\Core\Framework\DataAbstractionLayer\Indexing\ExampleIndexer">
                    <argument type="service" id="Shopware\Core\Framework\DataAbstractionLayer\Dbal\Common\IteratorFactory"/>
                    <argument type="service" id="customer.repository"/>
                    <argument type="service" id="Doctrine\DBAL\Connection" />
                    <tag name="shopware.entity_indexer"/>
                </service>
    </services>
</container>
```

The indexer service has to be tagged as `shopware.entity_indexer` in order to work.

Let's take a closer look at the functions of the entity indexer class.

* `public function getName(): string`:
    * This function returns the name of the indexer and should be unique. It is used in the `EntityIndexerRegistry` to identify which messages should be handled by which indexer.
* `public function iterate($offset): ?EntityIndexingMessage`:
    * This function is called when a full entity indexing was requested. This is for example the case if the console command `bin/console dal:refresh:index` is used or if a user of the Administration requested an update of all indexes in the settings.
    It should generate a list of messages for all records which are indexed by this indexer. In the example documentation above, the customer entity should be indexed. Therefore, the `Shopware\Core\Framework\DataAbstractionLayer\Dbal\Common\IteratorFactory` is used to fetch customer ids. The offset is used to reduce the amount of data which is processed at once.
* `public function update(EntityWrittenContainerEvent $event): ?EntityIndexingMessage`:
    * This function is called when entities are updated over the DAL. This function should react to the provided entity written events and generate a list of messages which has to be processed by the `handle` function. In the example implementation above, we get all customer identifiers that have been updated by `$updates = $event->getPrimaryKeys(CustomerDefinition::ENTITY_NAME);`. A closer look at the `EntityWrittenContainerEvent` class is also good idea. It is for example possible to filter the updated customer by the updated column. For example if you only need to index customers with a changed firstname. It is always a good idea to filter the entities as much as possible to save performance.
    * The `update()` can also be used to update data that has always to be changed synchronously.
* `public function handle(EntityIndexingMessage $message): void`
    * The `handle()` method handles the messages which were generated in the `self::iterate` or `self::update` function. In the example above a small log entry is written to the database indicating that a customer was indexed. The preferred way to manipulate data here is using the `connection` directly and not to use the DAL. See the section [Use DAL functionalities in the indexer](Use DAL functionalities in the indexer) for more information.

### Handle messages asynchronously or synchronously

By default, all messages which are returned by the `public function update()` function in the indexer are handled synchronously. That means the `handle()` function is called directly after the `update()` function. To handle the messages asynchronously over the [Message queue](../../../../hosting/infrastructure/message-queue) the `EntityIndexingMessage` can be used with different constructor parameters. A closer look at the `EntityIndexingMessage` class shows that it has a fourth parameter named `$forceQueue` which is `false` by default. This parameter can be set to `true` and then the message will be handled asynchronously by the message queue.

### Use DAL functionalities in the indexer

By default, indexing is also active while working with an indexer, which means, that entities that are written over the DAL also trigger `EntityWrittenContainerEvent` events. So the indexers are triggered again. This can lead to an infinite loop. Therefore, the connection should be used directly to alter data in the database. You can find more information about this in the corresponding ADR [when to use plain SQL or the DAL](../../../../../resources/references/adr/dal/2021-05-14-when-to-use-plain-sql-or-dal). However, if you want to use the DAL for manipulation data in a data indexer, indexing can be disabled. This can be done by passing adding a flag to the context, as shown in the example below:

```php
public function update(EntityWrittenContainerEvent $event): ?EntityIndexingMessage
{
    $updates = $event->getPrimaryKeys(CustomerDefinition::ENTITY_NAME);

    if (empty($updates)) {
        return null;
    }

    $context = $event->getContext();
    $context->addExtension(EntityIndexerRegistry::DISABLE_INDEXING, new ArrayEntity());

    return new EntityIndexingMessage(array_values($updates), null, $context);
}
```

## Index data using existing events

There are already a bunch of indexers in shopware that you can use. If you take a look at the `CustomerIndexer` or `CategoryIndexer` classes for example, you will see that they dispatch an event in the `handle` method. This should be used for indexing data of the main entities. Among others, the following indexers already exist and dispatch events that can be used for indexing data:  

* `CustomerIndexer`
* `CategoryIndexer`
* `LandingPageIndexer`
* `ProductIndexer`
* `ProductStreamIndexer`
* `PromotionIndexer`
* `RuleIndexer`
* `MediaIndexer`
* `MediaFolderIndexer`
* `MediaFolderConfigurationIndexer`
* `SalesChannelIndexer`
* `BreadcrumpIndexer`

### Subscribe to an indexer event

For this we need a new subscriber. If you are not familiar with a subscriber, have a look at our [Listening to events](../../plugin-fundamentals/listening-to-events) guide. For this example, we just write a new entry to the `log_entry` database table, indicating that a customer was updated.

```php
// <plugin root>/src/Service/Subscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Doctrine\DBAL\Connection;
use Shopware\Core\Checkout\Customer\Event\CustomerIndexerEvent;
use Shopware\Core\Framework\DataAbstractionLayer\Doctrine\MultiInsertQueryQueue;
use Shopware\Core\Framework\Uuid\Uuid;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class Subscriber implements EventSubscriberInterface
{
    /**
     * @var Connection
     */
    private Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public static function getSubscribedEvents(): array
    {
        return [
//            CustomerIndexerEvent::class => 'onCustomerIndexerHandle'
        ];
    }

    public function onCustomerIndexerHandle(CustomerIndexerEvent $customerIndexerEvent)
    {
        $queue = new MultiInsertQueryQueue($this->connection);
        foreach ($customerIndexerEvent->getIds() as $id) {
            $this->addLog($id, $queue);
        }
        $queue->execute();
    }

    private function addLog($customerId, MultiInsertQueryQueue $queue)
    {
        $queue->addInsert('log_entry', [
            'id' => Uuid::randomBytes(),
            'message' => 'Updated customer with id: ' . $customerId,
            'level' => 1,
            'channel' => 'debug'
        ]);
    }
}
```

The service definition for the subscriber would look like this.

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\Subscriber" >
            <argument type="service" id="Doctrine\DBAL\Connection" />
            <tag name="kernel.event_subscriber" />
        </service>
    </services>
</container>
```

It is recommended to work directly with the `Connection` since the event is dispatched in the context of an indexer. If we would use the Data Abstraction Layer \(DAL\) for writing changes to the database, the indexer  would be triggered again, because it listens for `EntityWrittenContainerEvent` events. This would lead to an infinite loop. Using the `Connection` directly prevents the DAL from dispatching entity written events. Also the performance of plain sql is much higher, which is very important for indexers in general.
