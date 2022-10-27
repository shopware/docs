# Add customer flow action

::: info
  This functionality is available starting with Shopware 6.4.6.0
:::

## Overview

In this guide, you'll learn how to create a custom flow trigger in Shopware. Triggers are used by the flow builder. This example will introduce a new custom trigger. The shop owner is then able to define what to do with the new trigger.

## Prerequisites

In order to add your own custom flow trigger for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../../plugin-base-guide).

You also should be familiar with [Add custom event](../event/add-custom-event) to know how to create an event. Please refer to the [Flow Builder concept](../../../../../concepts/framework/flow-concept)
for better integration later.

## Existing triggers and actions

You can refer to the [Flow reference](../../../../../resources/references/core-reference/flow-reference) to read triggers and actions detail.

## Event interfaces and classes

Any event that implements one of these interfaces will be available in the trigger list of the Flow Builder module in administration. Besides, the event will have the ability to execute the action that belongs to the interface.

- `MailAware`: This interface provides `MailRecipientStruct` and `salesChannelId`.

- `OrderAware`: This interface provides `orderId`, which is used to add tags, sendmail or generate documents, etc...

- `CustomerAware`: This interface same as `OrderAware` but for customer, which provide `customerId`, used to add tags, remove tags, sendmail, etc...

- `UserAware`: This interface provides `userId` for all actions related to the user.

- `SalesChannelAware`: This interface simply provides `salesChannelId`.

## Create custom flow trigger

To create a custom flow trigger, firstly you have to create a plugin and install it, you can refer to the [Plugin Base Guide](../../plugin-base-guide) to do it. I will create a plugin named `ExamplePlugin`. There will be an example to actually show your new trigger in the administration.

### Create a new trigger (event)

In this example, we will name it ExampleEvent to some actions related to customers when dispatching this event. It will be placed in the directory <plugin root>/src/Core/Checkout/Customer/Event. Our new event has to implement Shopware\Core\Framework\Event\CustomerAware interface to enable actions requiring this Aware.

Currently, you will need to also implement `Shopware\Core\Framework\Event\BusinessEventInterface;` in case the feature flag `FEATURE_NEXT_17858` is inactive. Please take note that this interface will be removed in `v6.5` .

Below you can find an example implementation:

<CodeBlock title="<plugin root>/src/Core/Checkout/Customer/Event/ExampleEvent.php">

```php
<?php declare(strict_types=1);

namespace Swag\ExamplePlugin\Core\Checkout\Customer\Event;

use Shopware\Core\Checkout\Customer\CustomerDefinition;
use Shopware\Core\Checkout\Customer\CustomerEntity;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Event\CustomerAware;
use Shopware\Core\Framework\Event\BusinessEventInterface;
use Shopware\Core\Framework\Event\EventData\EntityType;
use Shopware\Core\Framework\Event\EventData\EventDataCollection;
use Symfony\Contracts\EventDispatcher\Event;

class ExampleEvent extends Event implements CustomerAware, BusinessEventInterface
{
    public const EVENT_NAME = 'example.event';

    private CustomerEntity $customer;

    private Context $context;

    public function __construct(Context $context, CustomerEntity $customer)
    {
        $this->customer = $customer;
        $this->context = $context;
    }

    public function getName(): string
    {
        return self::EVENT_NAME;
    }

    public function getCustomer(): CustomerEntity
    {
        return $this->customer;
    }

    public function getCustomerId(): string
    {
        return $this->customer->getId();
    }

    public static function getAvailableData(): EventDataCollection
    {
        return (new EventDataCollection())
            ->add('customer', new EntityType(CustomerDefinition::class));
    }

    public function getContext(): Context
    {
        return $this->context;
    }
}
```

</CodeBlock>

### Add your new event to the flow trigger list

 At this step you need to add your new event to the flow trigger list, let see the code below:

<CodeBlock title="<plugin root>/src/Core/Checkout/Customer/Subscriber/BusinessEventCollectorSubscriber.php">

```php
<?php declare(strict_types=1);

namespace Swag\ExamplePlugin\Core\Checkout\Customer\Subscriber;

use Shopware\Core\Framework\Event\BusinessEventCollector;
use Shopware\Core\Framework\Event\BusinessEventCollectorEvent;
use Swag\ExamplePlugin\Core\Checkout\Customer\Event\ExampleEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class BusinessEventCollectorSubscriber implements EventSubscriberInterface
{
    private BusinessEventCollector $businessEventCollector;

    public function __construct(BusinessEventCollector $businessEventCollector) {
        $this->businessEventCollector = $businessEventCollector;
    }

    public static function getSubscribedEvents()
    {
        return [
            BusinessEventCollectorEvent::NAME => ['onAddExampleEvent', 1000],
        ];
    }

    public function onAddExampleEvent(BusinessEventCollectorEvent $event): void
    {
        $collection = $event->getCollection();

        $definition = $this->businessEventCollector->define(ExampleEvent::class);

        if (!$definition) {
            return;
        }

        $collection->set($definition->getName(), $definition);
    }
}
```

</CodeBlock>

Please note that your subscriber has to have a higher priority point to ensure your event is added before any subscriber `BusinessEventCollectorEvent` to prevent missing awareness or action. I set 1000 for `onAddExampleEvent` action:

<CodeBlock title="<plugin root>/src/Core/Checkout/Customer/Subscriber/BusinessEventCollectorSubscriber.php">

```php
public static function getSubscribedEvents()
{
   return [
      BusinessEventCollectorEvent::NAME => ['onAddExampleEvent', 1000],
   ];
}
```

</CodeBlock>

And don't forget to register your subscriber to the container at `<plugin root>/src/Resources/config/services.xml`

<CodeBlock title="<plugin root>/src/Resources/config/services.xml">

```xml
<service id="Swag\ExamplePlugin\Core\Checkout\Customer\Subscriber\BusinessEventCollectorSubscriber">
    <argument type="service" id="Shopware\Core\Framework\Event\BusinessEventCollector"/>
    <tag name="kernel.event_subscriber"/>
</service>
```

</CodeBlock>

Well done, you have successfully created your own flow trigger.

### Let's check the result

Go to administration page -> Settings -> Flow Builder, then click Add flow to create a new flow, search for Example Event. You could see your event is available and having actions related to the Customer likes to Add tag, Remove tag, etc...

![Flow Builder Action Example](../../../../../.gitbook/assets/flow-builder-action.png)
