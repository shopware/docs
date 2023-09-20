# Using the State Machine

## Overview

An order in Shopware consists of three states:

* The order state itself, such as "Is the order open?", its technical name being `order`
* The order transaction state, e.g. "Was it paid?", its technical name being `order_transaction`
* The order delivery state, e.g. "Was it shipped?", its technical name being `order_delivery`

Each of those comes with several possible values, e.g. for the transactions some of those are: "open", "reopen", "cancel", etc. States are connected in a way, that you cannot just jump from each state to each other state, e.g. you can't set the order transaction state to "refunded" when the state was not "paid" yet. Those connections are called `transitions`.

Each of those states can be changed using the [StateMachineRegistry](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/System/StateMachine/StateMachineRegistry.php). This guide will cover how to use the state machine and show some examples.

## Transitioning

This section will cover an example for each kind of order state, for the order itself, the transaction \(aka payment\) and delivery.

For each example you have to inject the `Shopware\Core\System\StateMachine\StateMachineRegistry` into your service using the [Dependency Injection container](../../plugin-fundamentals/dependency-injection).

You then execute the method `transition` on the said `StateMachineRegistry`. It expects two parameters:

* The first being an instance of `Shopware\Core\System\StateMachine\Transition`
* The second is the context \(`Shopware\Core\Framework\Context`\)

### Transition parameters

Let's have a look at the constructor parameters for the `Transition`:

* The first parameter is the name of the state. As already mentioned in the Overview, possible values here are [order](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Order/OrderDefinition.php#L49), [order\_transaction](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Order/Aggregate/OrderTransaction/OrderTransactionDefinition.php#L23) or [order\_delivery](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Order/Aggregate/OrderDelivery/OrderDeliveryDefinition.php#L31). Since those are basically the name of their respective entity, you can use the constant of those definitions. This ensures, that if Shopware would ever change a state's name, your changes would keep working.
* The second parameter is the ID of the entity. This means the ID of the order, the order transaction or the order delivery entity. You can find those using the respective entities' repositories, find out more about those in general in our guide about [reading data](../../framework/data-handling/reading-data). There will a full example at the end of this guide as well.
* The third parameter is the new state to be transitioned to. E.g. this could be `paid`, if the order is still `open`.
* The last parameter is the name of the `StateMachineStateField`. If you have a look at the [order definition](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Order/OrderDefinition.php#L106), you will find the respective field. This is the case for each of those definitions, the [order definition](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Order/OrderDefinition.php#L106), the [order transaction](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Order/Aggregate/OrderTransaction/OrderTransactionDefinition.php#L60) and the [order delivery](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Order/Aggregate/OrderDelivery/OrderDeliveryDefinition.php#L79). Thankfully, this field is always called `stateId` in our default definitions.

So now let's start with the explanations for each state.

### Order state

The order state is plain simple the state of the order. Is it still open, or in progress? Was it cancelled or is it even done? Those are the possible transition values here:

* `reopen`: Will result in "open"
* `process`: Will result in "in\_progress"
* `cancel`: Will result in "cancelled"
* `complete`: Will result in "completed"

Let's see an example on how to set the order state to `process`:

```php
$this->stateMachineRegistry->transition(new Transition(
    OrderDefinition::ENTITY_NAME,
    '<ID here>',
    'process',
    'stateId'
), $context);
```

As described above, this will result in the order being set to "in\_progress".

### Order transaction state

The order transaction state represents the state of the transaction, or the payment if you want so. The possible transition values here are:

* `reopen`: Will result in "open"
* `fail`: Will result in "failed"
* `authorize`: Will result in "authorized"
* `refund_partially`: Will result in "refunded\_partially"
* `refund`: Will result in "refunded"
* `do_pay`: Will result in "in\_progress"
* `paid`: Will result in "paid"
* `paid_partially`: Will result in "paid\_partially"
* `remind`: Will result in "reminded"
* `cancel`: Will result in "cancelled"

Here's an example on how to set the order transaction from `open` to `in_progress` via the `pay` action:

```php
$this->stateMachineRegistry->transition(new Transition(
    OrderTransactionDefinition::ENTITY_NAME,
    '<Order transaction ID here>',
    'do_pay',
    'stateId'
), $context);
```

Afterwards the order transaction will be set to "in\_progress".

### Order delivery state

The order delivery state represents the state of the delivery.

The possible transition values here are:

* `reopen`: Will result in "open"
* `ship`: Will result in "shipped"
* `ship_partially`: Will result in "shipped\_partially"
* `cancel`: Will result in "cancelled"
* `retour`: Will result in "returned"
* `retour_partially`: Will result in "returned\_partially"

The following will be an example on how to set the order delivery state to "shipped" via the `ship` transition:

```php
$this->stateMachineRegistry->transition(new Transition(
    OrderDeliveryDefinition::ENTITY_NAME,
    '<Order delivery ID here>',
    'ship',
    'stateId'
), $context);
```

Afterwards the order delivery will be set to "shipped".

## Finding possible transitions

As already said, you can't switch from each state to each other state. E.g. you can't `reopen` an order, that was never started. Likewise, you can't `refund` a delivery, that was never shipped so far.

In order to find the possible transition available to your current state, you can use the method `getAvailableTransitions` on the `StateMachineRegistry`.

Let's have a look at an example:

```php
$transitions = $this->stateMachineRegistry->getAvailableTransitions(
    OrderDefinition::ENTITY_NAME,
    '<Order ID here>',
    'stateId', 
    $context
);
```

In this example, it is fetching all available order state transitions for the order with the given ID. It will return an array of possible actions. If your order was still "open", this would result in two entries: One for `cancel` and one for `process`.

## Full example

The following will show an example how to set the order delivery state to "shipped" by just knowing the order ID. For this section, we're going to deal with entity repositories, like explained in our guide about [reading data](../../framework/data-handling/reading-data).

```php
public function setOrderDeliveryToShipped(string $orderId, $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('orderId', $orderId));

    $orderDeliveryEntityId = $this->orderDeliveryRepository->searchIds($criteria, $context)->firstId();

    $this->stateMachineRegistry->transition(new Transition(
        OrderDeliveryDefinition::ENTITY_NAME,
        $orderDeliveryEntityId,
        'ship',
        'stateId'
    ), $context);
}
```

So this example is making use of the repository for the `order_delivery` entity. It was injected previous using the [Dependency injection container](../../plugin-fundamentals/dependency-injection) and its respective ID `order_delivery.repository`.

Then it's creating a new `Criteria` object and adds a filter in order to only search for `order_delivery` entities, whose order ID equals our given order ID.

With that `Criteria` object, you can use the method `searchIds` on the respective repository, followed by the `firstId` method to only get the first ID of the result set.

This ID is then used in the state machine.

Of course you could also use the repository of the `OrderDefinition` here. That would change the logic a bit, but not too much:

```php
public function setOrderDeliveryToShipped(string $orderId, $context): void
{

    $criteria = new Criteria([$orderId]);
    $criteria->addAssociation('deliveries');

    /** @var OrderEntity $orderEntity */
    $orderEntity = $this->orderRepository->search($criteria, $context)->first();
    $orderDeliveryId = $orderEntity->getDeliveries()->first()->getId();

    $this->stateMachineRegistry->transition(new Transition(
        OrderDeliveryDefinition::ENTITY_NAME,
        $orderDeliveryId,
        'ship',
        'stateId'
    ), $context);
}
```

In this case we're using the `Criteria` constructor parameter, which is an array of IDs to filter for. Also we need to add the `deliveries` association here.

After searching for the order, we're using the `getDeliveries` method on the order entity and this way receive the ID of the delivery, which we can then continue to use with the state machine.

::: warning
In those examples, we're using the method `first` on the deliveries. Yet, it's important to note, that there may be more than one delivery or even transaction and using `first` may not always return the right delivery or transaction. In that case, you'll definitely need more filters to find the proper delivery or transaction, e.g. if you want to change the very last delivery, you could use a sorting for this.
:::

And that's it. You should now be able to change all kinds of order states!

## Using the helper

Just one more thing worth noting. There's a [helper class](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Order/Aggregate/OrderTransaction/OrderTransactionStateHandler.php) in Shopware, which can take of order transaction states for you.

It comes with a helper method for each of the possible order transaction states and only needs the respective transaction ID and the context.

```php
$this->orderTransactionStateHandler->cancel('<your ID here>', $context);
// $this->orderTransactionStateHandler->refund('<your ID here>', $context);
// $this->orderTransactionStateHandler->fail('<your ID here>', $context);
// $this->orderTransactionStateHandler->paid('<your ID here>', $context);
// $this->orderTransactionStateHandler->payPartially('<your ID here>', $context);
// $this->orderTransactionStateHandler->process('<your ID here>', $context);
// $this->orderTransactionStateHandler->refundPartially('<your ID here>', $context);
// $this->orderTransactionStateHandler->remind('<your ID here>', $context);
// $this->orderTransactionStateHandler->reopen('<your ID here>', $context);
```
