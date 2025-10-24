---
nav:
  title: Separate checkout
  position: 10

---

# Separate subscription checkout

This guide describes how buying a subscription via the separate checkout flow works and how extensions should integrate with it.
The **separated subscription checkout** allows customers to purchase subscription products via an isolated checkout process and dedicated cart.
This process is best described as an _express checkout_ for subscription products.

Please familiarise yourself with the [concept](../concept.md) first before continuing here.

## Overview

Subscription line items are added to a new subscription cart containing **only** the subscription product.
The checkout process will start right away and the customer will not be able to add any additional products.
If a customer leaves the subscription checkout, they can only return to it via their browser history or by starting a new checkout with their desired product.
The main cart and the original sales channel context will be left untouched.

## Retrieving information

In a separated subscription checkout a [subscription cart](../concept.md#subscription-cart) and [subscription context](../concept.md#subscription-context) and replaces the main cart and sales channel context.
Additional information about the subscription can be retrieved from the subscription context via it's `subscription` extension.

When an order is placed from a subscription cart, the order will contain an `subscriptionId` / `subscription` extension references the created subscription as well as an `initialSubscriptions` extension like a [mixed order](./mixed-checkout.md#retrieving-information).
Any subsequent orders generated will only contain the `subscriptionId` / `subscription` extension.

<Tabs>
<Tab title="Sales Channel Context">

```json
{   // subscription sales channel context
  "token": "<subscription-context-token>",
  "extensions": {
    "subscription": {
      "mainToken": "<main-context-token>",
      "subscriptionToken": "<subscription-context-token>",
      "managed": true,
      "plan": {},     // subscription plan entity
      "interval": {}, // subscription interval entity
    }
  }
}
```

</Tab>

<Tab title="Cart">

```json
{   // subscription cart
  "token": "<subscription-context-token>",
  "lineItems": [
    { // subscription line item
      "label": "Product A",
      "payload": { // Only since 6.7.4.0
        "subscriptionPlan": "<plan-id>",
        "subscriptionInterval": "<interval-id>",
      }
    }
  ]
}
```

</Tab>
</Tabs>

## Manipulate subscription cart

The [subscription cart](../concept.md#subscription-cart) is calculated with the subscription cart calculator.
To add cart collectors or processors to the calculation process, they have to be tagged with `subscription.cart.collector` and `subscription.cart.processor` respectively.
If you need to differentiate between a separate and a mixed subscription cart calculation, check `salesChannelContext.extensions.subscription.isManaged`.

The cart processor `Shopware\Commercial\Subscription\Checkout\Cart\Discount\SubscriptionDiscountProcessor` can serve as example how to add line items to subscription carts. But note that the processor supports [mixed carts](./mixed-checkout.md) too.

### Adding subscription line items

In order to add a line item to a subscription cart, the relevant subscription plan and interval IDs must be added.

The following methods are available to do so via the **Store-API**, remember to use the subscription endpoints including necessary headers:

- Add `subscription-plan-option` and `subscription-plan-option-<subscription-plan-id>-interval` IDs besides `lineItems`.

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
    name="subscription-plan-option"
    value="<subscription-plan-id>"
  >

  <select name="subscription-plan-option-<subscription-plan-id>-interval">
    <option value="<subscription-interval-id>">Weekly interval</option>
    <option value="<subscription-interval-id>">Monthly interval</option>
    <option value="<subscription-interval-id>">Yearly interval</option>
  </select>
</form>
```

</Tab>

<Tab title="Headless (curl)">

Store-API requests need the subscription headers to be set, see [Request scoping](#request-scoping).

The only exception is adding a line item:

```sh
curl -XPOST '/store-api/subscription/checkout/cart/line-item' -d '{
    "lineItems": [{
      "id": <product-id>,
      ...
    }],
    "subscription-plan-option": <subscription-plan-id>,
    "subscription-plan-option-<subscription-plan-id>-interval": <subscription-interval-id>
  }'
```

</Tab>
</Tabs>

## Events

Most of the events triggered within subscription checkout are prefixed with `subscription.`.
These events are identical to normal checkout events.
If you wish to use these events, you need to subscribe to them.
A list of known prefixed events can be found in `Subscription/Framework/Event/SubscriptionEventRegistry.php`

```php
// Normal Event Listener
class MyEventSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [CheckoutOrderPlacedCriteriaEvent::class => 'onOrderPlacedCriteria'];
    }

    public function onOrderPlacedCriteria(CheckoutOrderPlacedCriteriaEvent $event): void
    {
        // Your event handler logic
    }
}

// Subscription Event Listener
class MyEventSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return ['subscription.' . CheckoutOrderPlacedCriteriaEvent::class => 'onOrderPlacedCriteria'];
    }

    public function onOrderPlacedCriteria(CheckoutOrderPlacedCriteriaEvent $event): void
    {
        // Your event handler logic
    }
}
```

## Request scoping

In Storefront, there is an additional URL parameter (`subscriptionToken`) that gets resolved.
In headless, there are two header parameters that need to be set namely `sw-subscription-plan` and `sw-subscription-interval`.

Below is an example of the context set on a subscription cart in the Storefront:

```xml
<route id="frontend.subscription.checkout.cart.page"
        path="/subscription/checkout/cart/{subscriptionToken}"
        methods="GET"
        controller="subscription.storefront.controller.checkout::cartPage">
    <default key="_noStore">true</default>
    <default key="_routeScope"><list><string>storefront</string></list></default>
    <default key="_subscriptionCart">true</default>
    <default key="_subscriptionContext">true</default>
    <default key="_controllerName">checkout</default>
    <default key="_controllerAction">cartpage</default>
    <default key="_templateScopes">subscription</default>
    <option key="seo">false</option>
</route>
```

And, here is an example of the headers set on a subscription cart using headless:

```sh
curl -XPOST '/store-api/subscription/checkout/cart/line-item' /
    -H 'sw-subscription-plan: <subscription-plan-id>' /
    -H 'sw-subscription-interval: <subscription-interval-id>' /
    -d '{
      "lineItems": [{
        "id": <product-id>,
        "subscriptionPlan": <subscription-plan-id>,
        "subscriptionInterval": <subscription-interval-id>
        ...
      }]
    }'
```

These context definitions can be found in `Subscription/Resources/app/config/routes/storefront.xml` or `Subscription/Resources/app/config/routes/store-api.xml`.

## Subscription carts in the Storefront

In order to change Storefront pages while a customer is a subscription checkout process, the template scope `subscription` must be added to the page's Twig templates and subsequent Twig templates used.
This effects at least the following pages:

- `frontend.checkout.cart.page` / `@Storefront/storefront/page/checkout/cart/index.html.twig`
- `frontend.checkout.confirm.page` / `@Storefront/storefront/page/checkout/confirm/index.html.twig`
- `frontend.checkout.register.page` / `@Storefront/storefront/page/checkout/address/index.html.twig`
- `frontend.account.edit-order.page` / `@Storefront/storefront/page/account/order/index.html.twig`
- `frontend.account.login.page` / `@Storefront/storefront/page/account/register/index.html.twig`
- `frontend.account.register.page` / `@Storefront/storefront/page/account/register/index.html.twig`

Further information can be found in the [dedicated guide here](./template-scoping.md).
