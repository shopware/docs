---
nav:
  title: Mixed checkout
  position: 20

---
# Mixed subscription checkout

::: info
Available since Shopware version 6.7.4.0
:::

This guide describes how the mixed carts in the subscription feature works and how extensions should integrate with it.
Mixed carts let customers buy subscription products and one‑time products in the same checkout while keeping subscription calculation isolated and predictable.

Please familiarise yourself with the [concept](../concept.md) first before continuing here.

## Overview

Subscription line items are ordinary product line items in the main cart, but they carry subscription plan and interval IDs in their payload.
During cart calculation, line items containing subscription plan and interval IDs in their payload are collected and grouped by plan and interval.
For each group a derived _managed_ subscription context and a _managed_ subscription cart are created and calculated using the subscription cart calculation path.
These represent the context and content of the later generated subscription.

Managed subscription contexts and carts are persisted in the database as well.
They are linked back to the main context by the `subscription_cart` database table.

## Retrieving information

You can access the managed carts through the cart extension named `subscriptionManagedCarts`, which maps keys in the form `<plan-id>-<interval-id>` to their corresponding [managed cart](../concept.md#subscription-cart).
The sales channel context extension named `subscriptionManagedContexts` provides the same mapping for [managed sales channel contexts](../concept.md#subscription-context).
The mapping is considered stable and the plan and interval IDs can be retrieved by splitting the composite ID.

When an order is placed from a mixed cart, the order will contain an `initialSubscriptions` extension that includes all created subscriptions.
As any subsequent orders are generated per subscription, the orders will contain a `subscriptionId` / `subscription` extension instead.

## Manipulate mixed cart

Subscription mixed carts does not change how the main cart is manipulated.
If your cart collectors and processors should process subscription carts too, they need to be tagged with `subscription.cart.collector` and `subscription.cart.processor` too.
If you need to differentiate between main and subscription cart calculations, check the sales channel context for the [subscription extension](../concept.md#subscription-context).
If you need to differentiate between a mixed and a separate subscription cart calculation, check `salesChannelContext.extensions.subscription.isManaged`.

The cart processor `Shopware\Commercial\Subscription\Checkout\Cart\Discount\SubscriptionDiscountProcessor` is a good example how to add line items to mixed carts.

:::warning
We discourage the use of subscription collectors and processors for adding new line items to subscription carts **only**.
This is because its potentially confusing for customers and handling line items in subscription carts missing in the main cart is more difficult.
Instead, follow [the steps described below](#how-to-add-a-subscription-line-item) to add additional line items.

If you still want to add line items to subscription carts only, please add a subscriber to the `SubscriptionOrderLineItemRestoredEvent` event to correctly show the line item in Shopware's after order process.
:::

### Adding subscription line items

In order to add a line item to a subscription cart, the relevant subscription plan and interval IDs must be added.

The following methods are available to do so via the **API**:

- Add `lineItem.subscriptionPlan` and `lineItem.subscriptionInterval` IDs to a line item
- Add `lineItem.subscriptionPlan` and `lineItem.subscriptionInterval-<plan-id>` IDs to a line item (useful when submitting HTML forms)
- Add `lineItem.payload.subscriptionPlan` and `lineItem.payload.subscriptionInterval` IDs to a line item's payload

Information added through the first two methods will be remapped to the line item's payload, as shown in the last method.

To do so via the **backend**, like in cart collectors or processors, the following methods are available:

- Add `lineItem.payload.subscriptionPlan` and `lineItem.payload.subscriptionInterval` IDs to a line items payload

<Tabs>
<Tab title="PHP">

```php
// retrieve plan and interval IDs in subscription collectors and processors 
$subscriptionPlanId = $salesChannelContext->getExtension('subscription')->getPlan()->getId();
$subscriptionIntervalId = $salesChannelContext->getExtension('subscription')->getInterval()->getId();

// generating a composite ID to avoid
// merging into existing line items of the same product
$lineItemId = sprintf('%s-%s-%s', '<product-id>', '<subscription-plan-id>', '<subscription-interval-id>');

$lineItem = new LineItem($lineItemId, LineItem::PRODUCT_LINE_ITEM_TYPE, '<product-id>');
$lineItem->setQuantity(1);
$lineItem->setPayloadValue('subscriptionPlan', $planId);
$lineItem->setPayloadValue('subscriptionInterval', $intervalId);
// ...

$cart->add($lineItem);
```

</Tab>

<Tab title="HTML Forms">

```html
<form
  id="productDetailPageSubscriptionBuyProductForm"
  action="/checkout/line-item/add"
  method="post"
>
  <input
    type="hidden"
    name="lineItems[<product-id>][id]"
    value="<product-id>"
  >

  <input
    type="radio"
    name="lineItems[<product-id>][subscriptionPlan]"
    value="<subscription-plan-id>"
  >

  <select name="lineItems[<product-id>][subscriptionInterval-<subscription-plan-id>]">
    <option value="<subscription-interval-id>">Weekly interval</option>
    <option value="<subscription-interval-id>">Monthly interval</option>
    <option value="<subscription-interval-id>">Yearly interval</option>
  </select>
</form>
```

</Tab>

<Tab title="Headless (curl)">

```sh
curl -XPOST '/store-api/checkout/line-item/add' -d '{
    "lineItems": [{
      "id": <product-id>,
      "subscriptionPlan": <subscription-plan-id>,
      "subscriptionInterval": <subscription-interval-id>
      ...
    }]
  }'
```

</Tab>
</Tabs>

## Events

A mixed cart will fire all events like usual.
Additionally, any event fired during the subscription cart calculation will be prefixed with `subscription.` like it is the case in the [separate checkout](./separate-checkout.md#events).
Unlike the separate checkout, only the normal `CheckoutOrderPlacedEvent` but no `'subscription.' . CheckoutOrderPlacedEvent` (or similar) will be fired, as the subscription carts are not placed as separate orders.

## Mixed carts in the Storefront

In order to change the following Storefront pages if a mixed cart is present, the template scope `mixed-subscription` must be added to the page's Twig templates and subsequent Twig templates used:

- `frontend.checkout.cart.page` / `@Storefront/storefront/page/checkout/cart/index.html.twig`
- `frontend.checkout.confirm.page` / `@Storefront/storefront/page/checkout/confirm/index.html.twig`
- `frontend.checkout.register.page` / `@Storefront/storefront/page/checkout/address/index.html.twig`
- `frontend.account.edit-order.page` / `@Storefront/storefront/page/account/order/index.html.twig`
- `frontend.account.login.page` / `@Storefront/storefront/page/account/register/index.html.twig`
- `frontend.account.register.page` / `@Storefront/storefront/page/account/register/index.html.twig`
- `frontend.cart.offcanvas` / `@Storefront/storefront/component/checkout/offcanvas-cart.html.twig`

Further information can be found in the [dedicated guide here](./template-scoping.md).
The list can be changed through the `subscription.routes.mixed-storefront-scope` Symfony container parameter.

Besides the scope change in Twig templates, the following additional information is available in Twig templates:

- The global `context` will have the `subscriptionManagedContexts` extension available. See [here](#where-to-retrieve-information)
- `page.cart` will have the `subscriptionManagedCarts` extension available. See [here](#where-to-retrieve-information)
- `page.order` will have the `initialSubscriptions` extension available, containing the collection
