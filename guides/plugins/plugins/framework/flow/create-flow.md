# Create a flow builder flow

## Overview

In this guide you'll learn how to create a flow in Shopware. Flow are used by the flow builder.

This example will introduce a new flow

## Prerequisites

In order to add your own custom flows for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../../plugin-base-guide.md)

## Flow interfaces and classes

In Shopware, you have multiple interfaces and classes for different types of events, in the following you can find a list of them:

- `ShopwareEvent`: This interface is just a basic event providing a `Context`, we need for almost all events.

  - New Interfaces: `FlowAwareEvent`: This interface extends from `ShopwareEvent` and will be used for dynamically assignment and is always named. Use this interface instead of deprecated interface `BusinessEventInterface`

 - `MailAware`: This interface provides the SalesChanneId and MailStruct

- `UserAware`: This interface provides the UserId

- `OrderAware`: This interface provides the OrderId

- `CustomerAware`: This interface provides the CustomerId

- New classes:

`FlowEvent`:

## Create the flow class

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Flow;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Event\FlowEventAware;
use Shopware\Core\Framework\Event\EventData\EventDataCollection;
use Swag\BasicExample\Core\Content\Example\ExampleEntity;

class ExampleFlow implements FlowEventAware
{
    /**
     * @var ExampleEntity
     */
    protected $exampleEntity;

    /**
     * @var Context
     */
    protected $scontext;

    public function __construct(ExampleEntity $exampleEntity, Context $context)
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
        return $this->context->getContext();
    }

    public function getName(): string
    {
        return $this->salesChannelContext;
    }

		public static function getAvailableData(): EventDataCollection
    {
        return new EventDataCollection();
    }
}
```

# Create custom flow triggers
//TODO: Add the custom flow trigger here

# Create custom flow actions

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\Dispatching\Action;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Event\FlowEvent;
use Shopware\Core\Framework\Event\FlowEventAware;
use Shopware\Core\Content\Flow\Dispatching\Action\FlowAction;

class ExampleFlowAction extends FlowAction
{
   public static function getName(): string
    {
        return 'action.basic.example';
    }
}
```

## Next steps

Now that you know how to create your own flow, you may want to act on it. To get a grip on this, head over to our "Create custom flow builder action" guide.