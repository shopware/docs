# Subscription concept

To use subscriptions, you will need to be familiar with three core concepts: **Subscription Plans**, **Subscription Intervals**, and the **Checkout Processes**.

## Terminology

### Subscription Plans

A plan is a set of rules that define the subscription.
This includes the [billing interval](#subscription-intervals) and the product that the customer will receive.
Multiple intervals can be assigned to a single plan.
Plans can be created and managed in the Shopware administration.

### Subscription Intervals

An interval is the time between each delivery cycle.
For example, a delivery can be monthly, quarterly, or annually.
Billing is triggered each time a delivery cycle repeats.
The interval is defined in the plan and can be set to any time frame.
This is also created and managed in the Shopware administration.

Intervals can be of three different types:

1. **Relative**  
   A relative interval is determined by a previous interval.
   For example, if a customer subscribes to a monthly plan, the next interval will be one month after the first delivery.
   These intervals are determined using PHP's `DateInterval`.

2. **Absolute**  
   An absolute interval is determined by a fixed date.
   For example, if a customer subscribes to a monthly plan, the next interval will be on a fixed day like the 1st or 15th of each month.
   These intervals are defined using cron expressions.

   Absolute intervals can also possess a relative element, such as a delivery occurring every 12 weeks (relative component), but exclusively on Fridays (absolute component).
   Note that both parts will be satisfied in sequence.
   Depending on the order date, in this example the next calculated date could exceed 12 weeks by an additional 6 days in order to fulfil the requirement of being a Friday.

### Subscription products

A product with a [subscription plan](#subscription-plans) assigned.
You can purchase the product as a one-off or subscribe to it at the intervals assigned to the plan.

Subscription products are ordinary product line items when added to the cart, but since 6.7.4.0 carry the selected subscription plan and interval IDs in their payload.

### Subscription

A subscription contains all the information needed to generate new orders on a recurring basis.
This includes among other things:

- The subscription plan and interval
- The schedule for subsequent orders
- The number of deliveries left to fulfil the minimum delivery cycles
- The payment method used
- A copy of the order to be placed on a recurring basis

:::info
Please note that the necessary payment information for paying subsequent orders is not included in a subscription.
It is the responsibility of the recurring payment method to store this information.
:::

### Subscription cart

A subscription cart contains [subscription products](#subscription-products) from a single [subscription plan](#subscription-plans) and [interval](#subscription-intervals) combination.
It has been calculated using the subscription cart calculator.
The only difference between this and the normal cart calculator is the subset of cart processors and collectors used.
After checkout, the subscription cart will be converted into a [subscription](#subscription).

Read more about how to work with [subscription carts here](./guides/separate-checkout.md#how-to-manipulate-cart).

The database table `subscription_cart` is used to link the cart / context token to any subscription cart / context.

### Subscription context

A subscription context is a sales channel context that has additional subscription metadata added as an extension called `subscription`.
It can be accessed via `salesChannelContext.extensions.subscription`.
It contains the selected subscription plan, interval as well as the context token of the main sales channel context.

As the subscription context is derived from the sales channel context, the original sales channel context is referred to as the _main context_ further on.

## Checkout Processes

### Separate Subscription Checkout

The **separate subscription checkout** allows customers to purchase subscription products via an isolated checkout process and dedicated cart.
This process is best described as an express checkout for subscription products.

**Key aspects:**

- Subscription products have to be checked out one by one
- For each subscription product a new [subscription cart](#subscription-cart) is created, preserving the contents of the main cart
- For each subscription checkout a new [subscription context](#subscription-context) is derived, preserving the address, shipping method and payment method selections of the main cart

### Mixed Cart Checkout

::: info
Available since Shopware version 6.7.4.0
:::

The **mixed cart checkout** allows customers to purchase subscription products and one-time products together in a single cart.

**Key aspects:**

- Subscription products are added to the main cart as normal product line items, but additionally containing subscription plan and subscription interval metadata in its payload
- For each combination of subscription interval and subscription plan a new _managed*_ subscription cart will be derived, only containing matching products of the main cart
- For each combination of subscription interval and subscription plan a new _managed*_ subscription context will be derived, allowing for context changes in a managed subscription cart
- Each managed subscription cart will be calculated and serves as the point of truth for the later generated subscriptions and are shown as subscription group in the storefront

\* as context and cart are _always_ derived from their original counterparts and only a subset of information will be inherited from the existing managed context or cart, we call context and cart _managed_.

## Reasons for the architectural design

To understand the subscription feature better, it may help to know the reasons behind the architecture:

The Subscriptions feature is designed to prevent interference from existing extensions and avoid applying potentially incompatible business logic to subscriptions.
Developers who want to have their manipulations, PHP or Storefront, applied to subscriptions have to "opt-in" via [scoped templates](guides/template-scoping.md), [scoped events](guides/separate-checkout.md#events) or by [special service tags](guides/separate-checkout.md#manipulate-subscription-cart).
This is done to ensure that existing extensions do not manipulate the cart in a way that is not intended in a subscription context or hinder the subsequent generation of orders.
This should ensure a smooth subscription process from the beginning, eliminating the need to ask extension authors to adapt their integration before the feature can be used.
For that reason [Storefront scopes](guides/template-scoping.md) were introduced to avoid template additions like express checkout buttons, which are incompatible due to being a guest checkout or may not support recurring payments and would not be possible to hide otherwise.
The same applies to the isolated subscription calculation process and event scoping - all to avoid undesirable cart manipulation.\
Note that promotions are one example for undesirable business logic due to their complexity when it comes to including them in recurring orders or excluding specific cases, such as one-use codes.

The subscription feature was first implemented with the [separate checkout](#separate-subscription-checkout) experience.
It was chosen because it only handles one subscription at a time, which keeps the complexity low.
Generated subscription orders are straight forward and look exactly like their storefront cart representation.\
In order for such a checkout to be possible, a cart containing only the subscription product is required.
A new cart and context are created to avoid manipulating the main cart and context if it has already been filled.
As this subscription cart is independent of the main cart, all cart routes were copied and scoped to be able to resolve the correct subscription cart. You can find out more about [request scoping here](./guides/separate-checkout.md#request-scoping).

The mixed cart checkout was added later and is built on top of the existing codebase for calculating and managing additional [subscription carts](#subscription-cart).
This was done so that orders generated from subscriptions created by a mixed cart would appear as if they had been placed independently, with their own total price, shipping costs, and so on.
Reusing existing logic reduces the friction to adapt existing extensions too.\
It would be far too complex to treat subscription carts as separate entities, so they are always derived from the main cart.
This is possible because any subscription item must be in the main cart to end up in the initial order anyway.

## Further Reading

You can read more about the setup of plans, intervals, and checkout processes in the [Shopware documentation](https://docs.shopware.com/en/shopware-6-en/settings/shop/subscriptions).
