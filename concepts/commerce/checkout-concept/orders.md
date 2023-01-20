# Orders

From a cart instance, an `Order` can be created. The whole structure of the cart is stored in the database. Contrary to the cart, a structure that allows a great degree of freedom and is *calculation optimized*, the order is *workflow optimized*.

## Design goals

### Denormalization

The order itself does not depend on the catalog or the products. The line item with all of its data, as well as all calculated prices, is persisted in the database. Orders only get recalculated when triggered explicitly through the API.

### Workflow dependant

The order state changes in a defined, predictable and configurable way - other state transitions are blocked.

## State management

During the order placement, at least three distinct state machines are started as described in the below diagrams:

![The order state machine](../../../.gitbook/assets/order-state-machine.png)
![The transaction state machine](../../../.gitbook/assets/order-payment-state-machine.png)
![The delivery state machine](../../../.gitbook/assets/order-delivery-state-machine.png)

::: tip
The state machines displayed in the following sections can actually be modified through the API, this is just the default setup.
:::

These can be used to track the progress during the order process and notify the customer about the current state of the order.
