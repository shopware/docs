# Cart

Shopping cart management is a central feature of Shopware 6. The shopping cart resides in the checkout bundle and is a central part of the checkout process.

## Design goals

The cart was designed with a few design goals in mind.

### Adaptability

Although many services exist to make working with the cart simple and intuitive, the cart itself can be changed through various processes and adapt to numerous use cases.

### Performance

The cart is designed by identifying key processes and optimizing upon them. Therefore the amount of calculations, queries, and iterations are kept to a minimum, and a clear state management is implemented.

### Abstraction

The cart has very few hard dependencies on other core entities in Shopware 6. Entities such as products, surcharges, or discounts are referenced through interfaces that the line items in the cart reference.

## Cart Struct

`\Shopware\Core\Checkout\Cart\Cart`

An instance of this class represents one single cart. As shown in the diagram below, relations to central Entities of the system are omitted. This allows Shopware 6 to manage multiple carts per user, per sales channel, or across all sales channels. The only identification is a token hash.

![Representation of the cart struct](../../../.gitbook/assets/cart-struct.png)

This highly mutable data structure is acted upon from requests and calculated and validated through services. It contains:

### Line Items

A line item represents an order position.

* It may be a  shippable good, a download article, or even a bundle of many products.
* Line items contain properties that tell the cart how to handle changes in line items. E.g., *stackable* - quantity can be changed, *removable* - removable through the API, and so on.
* A line item is the main extension point for the cart process. Therefore a promotion, a discount, or a surcharge is also a line item.
* A line item can even contain other line items. So a single order position can be the composition of multiple single line items.

### Transaction

It is the payment in the cart. Contains a payment handler and the amount.

### Delivery

It is a shipment in the cart. It contains a date, a method, a target location, and the line items that should be shipped together.

### Error

Validation errors which prevent ordering from that cart.

### Tax

The calculated tax rate for the cart.

### Price

The price of all line items, including tax, delivery costs, voucher discounts, and surcharges.

## State

Shopware 6 manages the cart's state through different services. The diagram below illustrates the different states the cart can have and the state changes it can go through.

![Cart state](../../../.gitbook/assets/cart-state.png)

## Calculation

Calculating a cart is one of the more costly operations an ecommerce system must support. Therefore the interfaces of the cart are designed as precise and as quick as possible. The calculation is a multi-stage process that revolves around the mutation of the data structure of the cart struct shown in the diagram below:

![Cart calculation](../../../.gitbook/assets/cart-calculation-steps.png)

### Cart enrichment

Enrichment secures the *Independence_ and _Adaptability* of Shopware 6. As shown in the below code snippet, the cart can create and contain line items that are initially empty and will only be loaded \(enriched\) during the calculation.

```php
<?php 

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\LineItem\LineItem;

$lineItem = new LineItem(/* ... */);
/** @var $cart Cart */
$cart->getLineItems()->add($lineItem);

$lineItem->getPrice(); // is now null
// enrich the cart
$lineItem->getPrice(); // now set up
```

This process is transparently controlled from the cart but executed through implementations of `\Shopware\Core\Checkout\Cart\CartDataCollectorInterface`. This interface is cut in order to reduce the number of database calls necessary to set up the cart's data structure for **price calculation** and **inspection** \(meaning: rendering in a storefront, reading from the API\).

A default set of collectors is implemented in Shopware 6, which has a set call order shown in the diagram below.

| Service ID | Task |
| :--- | :--- |
| Shopware\Core\Content\Product\Cart\ProductCartProcessor | Enrich all referenced products |
| Shopware\Core\Checkout\Promotion\Cart\CartPromotionsCollector | Enrich add, remove and validate promotions |
| Shopware\Core\Checkout\Shipping\Cart\ShippingMethodPriceCollector | Handle shipping prices |

![Cart enrichment steps](../../../.gitbook/assets/cart-enrichtment-steps.png)

## Cart processors - price calculation and validation

After a cart is enriched, the cart is processed. The price information for all individual `LineItems` is now set up to calculate the sums. This happens in the `\Shopware\Core\Checkout\Cart\Processor` class, following these steps:

* The `lineItem` prices are calculated by applying the quantity and the tax rate.
* Deliveries are set up and cost calculated.
* Different cart values are summed up \(incl, excl. vat, inc. excl. shipping\).

Then the calculation of prices is done, and the cart can be inspected from the rule system.

## Context rules

After the cart has been processed, it is validated against the rules, which can lead to a change in the carts' data, so a revalidation becomes necessary. We can envision a scenario where we sell cars and have the following rules:

* Everybody buying a car gets a pair of sunglasses for free.
* Every cart containing two products gets a discount of 2%.

![Cart validation](../../../.gitbook/assets/cart-validation.png)

As you can see in the diagram above, the cart is modified during the enrichment process. The sunglasses are added in the first iteration, and in the second iteration, the discount is added as the cart contains two products. This results in the expected state of one car, one pair of sunglasses, and a two-percent discount.

## Cart storage

Contrary to other entities in the system, the cart is not managed through the [Data Abstraction Layer](/docs/concepts/framework/data-abstraction-layer)\(DAL)\. The cart can only be written and retrieved as a whole. As discussed in the sections, the workload of Shopware 6 can only be performed on the whole object in memory.

## Cart control

The state changes and cart mutation is handled automatically by a facade the `\Shopware\Core\Checkout\Cart\SalesChannel\CartService`. It controls, sets up, and modifies the cart struct.
