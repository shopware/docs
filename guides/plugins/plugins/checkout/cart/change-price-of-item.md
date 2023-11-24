---
nav:
  title: Change price of items in cart
  position: 50

---

# Change price of items in cart

## Overview

This guide will tackle the issue of changing the price of a line item in the cart dynamically. The following example is **not** recommended if you want to add a discount / surcharge to your products. Make sure to check out the guide about [adding a discount into the cart](add-cart-discounts).

::: warning
Changing the price like it's done in the following example should rarely be done and only with great caution. A live-shopping plugin would be a good example about when to actually change an item's price instead of adding a discount / surcharge.
:::

## Prerequisites

This guide is also built upon the [plugin base guide](../../plugin-base-guide), which creates a plugin first. The namespaces used in the examples of this guide match those of the plugin base guide, yet those are just examples.

Furthermore, you should know how to register a service to the [dependency injection container](../../plugin-fundamentals/dependency-injection).

## Changing the price

In order to change a price of an item in the cart, you'll have to use a cart collector and a cart processor. The collector is used to collect all new prices necessary for your line items and therefore provide this data. It will also take care of reducing duplicated requests, but we'll get into that later.

The processor will then take the new prices, calculate them appropriately and apply them to the line items.

While we will start with the collector part, do not be confused later on in this guide, because we'll use the same class for both collecting the prices and processing the cart.

### The collector

So the collector has to collect all prices necessary in order to overwrite a line item.

This guide will not cover where to actually fetch the new prices from, that's up to you. This could e.g. be an [extension of the product entity](../../framework/data-handling/add-complex-data-to-existing-entities), which contains the new price, or an API call from somewhere else, which will return the new price.

Your collector class has to implement the interface `Shopware\Core\Checkout\Cart\CartDataCollectorInterface` and therefore the method `collect`.

Let's have a look at an example:

```php
// <plugin root>/src/Core/Checkout/Cart/OverwritePriceCollector.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Cart;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\CartBehavior;
use Shopware\Core\Checkout\Cart\CartDataCollectorInterface;
use Shopware\Core\Checkout\Cart\LineItem\CartDataCollection;
use Shopware\Core\Checkout\Cart\LineItem\LineItem;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class OverwritePriceCollector implements CartDataCollectorInterface
{
    public function collect(CartDataCollection $data, Cart $original, SalesChannelContext $context, CartBehavior $behavior): void
    {
        // get all product ids of current cart
        $productIds = $original->getLineItems()->filterType(LineItem::PRODUCT_LINE_ITEM_TYPE)->getReferenceIds();

        // remove all product ids which are already fetched from the database
        $filtered = $this->filterAlreadyFetchedPrices($productIds, $data);

        // Skip execution if there are no prices to be requested & saved
        if (empty($filtered)) {
            return;
        }

        foreach ($filtered as $id) {
            $key = $this->buildKey($id);

            // Needs implementation, just an example
            $newPrice = $this->doSomethingToGetNewPrice();

            // we have to set a value for each product id to prevent duplicate queries in next calculation
            $data->set($key, $newPrice);
        }
    }

    private function filterAlreadyFetchedPrices(array $productIds, CartDataCollection $data): array
    {
        $filtered = [];

        foreach ($productIds as $id) {
            $key = $this->buildKey($id);

            // already fetched from database?
            if ($data->has($key)) {
                continue;
            }

            $filtered[] = $id;
        }

        return $filtered;
    }

    private function buildKey(string $id): string
    {
        return 'price-overwrite-'.$id;
    }
}
```

So the example class is called `OverwritePriceCollector` here and it implements the method `collect`. This method's parameters are the following:

* `CartDataCollection`: This is the object, that will contain our new data, which is then processed in the processor.

  Here you're going to save the new price. It contains key-value pairs, so we will save the new price as the value, and its key

  being the line item ID. We will prefix a custom string to the line item ID, so our code will not interfere with other collectors,

  that might also save the line item ID as a key.

* `Cart`: Well, the current cart and its line items.
* `SalesChannelContext`: The current sales channel context, containing information about the currency, the country, etc.
* `CartBehavior`: It contains cart permissions, which are not necessary for our example.

Inside of the `collect` method, we're first fetching all **products** from the `Cart`, named `$original`, since we do not want to change the price of a discount or any other custom type of line item.

Now we're calling a method `filterAlreadyFetchedPrices`. So what it does is basically checking if we already saved a new price for a given line item ID to the `CartDataCollector`. We do this, since your collect method may be executed multiple times per request and we want to prevent multiple database requests here. If you do need to request it multiple times because your prices may have changed in between, you can remove that method.

Afterwards we're iterating over all product IDs, that still need to request a new price, and we do so with an example method. The `doSomethingToGetNewPrice` method is just an example and therefore not implemented. **Make sure to replace this part with any kind of actually fetching a new price.**

The last step is to save that new price to the `CartDataCollector`.

And that's it, we're now collecting the prices for our product line items. Registering the class to the [dependency injection container](../../plugin-fundamentals/dependency-injection) will be done in the [last section](change-price-of-item#Registering%20to%20DI%20container) of this guide.

### The processor

The processor now has to fetch the new prices from the `CartDataCollector` and it has to calculate the actual new price of that line item, e.g. due to taxes. For this case, it will need the `Shopware\Core\Checkout\Cart\Price\QuantityPriceCalculator`.

As already mentioned, we'll use the same class for the processor, which we will do by implementing two interfaces. Of course you could split them into separate classes.

Your processor has to implement the interface `Shopware\Core\Checkout\Cart\CartProcessorInterface`, which forces you to implement the `process` method.

But once, again, let's have a look at the example:

```php
// <plugin root>/src/Core/Checkout/Cart/OverwritePriceCollector.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Cart;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\CartBehavior;
use Shopware\Core\Checkout\Cart\CartDataCollectorInterface;
use Shopware\Core\Checkout\Cart\CartProcessorInterface;
use Shopware\Core\Checkout\Cart\LineItem\CartDataCollection;
use Shopware\Core\Checkout\Cart\LineItem\LineItem;
use Shopware\Core\Checkout\Cart\Price\QuantityPriceCalculator;
use Shopware\Core\Checkout\Cart\Price\Struct\QuantityPriceDefinition;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class OverwritePriceCollector implements CartDataCollectorInterface, CartProcessorInterface
{
    private QuantityPriceCalculator $calculator;

    public function __construct(QuantityPriceCalculator $calculator) {
        $this->calculator = $calculator;
    }

    public function collect(CartDataCollection $data, Cart $original, SalesChannelContext $context, CartBehavior $behavior): void
    {
        // get all product ids of current cart
        $productIds = $original->getLineItems()->filterType(LineItem::PRODUCT_LINE_ITEM_TYPE)->getReferenceIds();

        // remove all product ids which are already fetched from the database
        $filtered = $this->filterAlreadyFetchedPrices($productIds, $data);

        // Skip execution if there are no prices to be saved
        if (empty($filtered)) {
            return;
        }

        foreach ($filtered as $id) {
            $key = $this->buildKey($id);

            // Needs implementation, just an example
            $newPrice = $this->doSomethingToGetNewPrice();

            // we have to set a value for each product id to prevent duplicate queries in next calculation
            $data->set($key, $newPrice);
        }
    }

    public function process(CartDataCollection $data, Cart $original, Cart $toCalculate, SalesChannelContext $context, CartBehavior $behavior): void
    {
        // get all product line items
        $products = $toCalculate->getLineItems()->filterType(LineItem::PRODUCT_LINE_ITEM_TYPE);

        foreach ($products as $product) {
            $key = $this->buildKey($product->getReferencedId());

            // no overwritten price? continue with next product
            if (!$data->has($key) || $data->get($key) === null) {
                continue;
            }

            $newPrice = $data->get($key);

            // build new price definition
            $definition = new QuantityPriceDefinition(
                $newPrice,
                $product->getPrice()->getTaxRules(),
                $product->getPrice()->getQuantity()
            );

            // build CalculatedPrice over calculator class for overwritten price
            $calculated = $this->calculator->calculate($definition, $context);

            // set new price into line item
            $product->setPrice($calculated);
            $product->setPriceDefinition($definition);
        }
    }

    private function filterAlreadyFetchedPrices(array $productIds, CartDataCollection $data): array
    {
        $filtered = [];

        foreach ($productIds as $id) {
            $key = $this->buildKey($id);

            // already fetched from database?
            if ($data->has($key)) {
                continue;
            }

            $filtered[] = $id;
        }

        return $filtered;
    }

    private function buildKey(string $id): string
    {
        return 'price-overwrite-'.$id;
    }
}
```

First of all, note the second interface we implemented, next to the `CartDataCollectorInterface`. We also added a constructor in order to inject the `QuantityPriceCalculator`.

But now, let's have a look at the `process` method. You should already be familiar with most of its parameters, since they're mostly the same with those of the collector. Yet, there's one main difference: Next to the `$original` `Cart`, you've got another `Cart` parameter being called `$toCalculate`here. Make sure to do all the changes on the `$toCalculate` instance, since this is the cart that's going to be considered in the end. The `$original` one is just there, because it may contain necessary data for the actual cart instance.

Now let's have a look inside the `process` method.

We start by filtering all line items down to only products, just like we did in the `collect` method. Then we're iterating over all products found, building the unique key, which is necessary for fetching the new price from the `CartDataCollector`.

If there's no price to be processed saved in the `CartDataCollector`, there's nothing to do here. Otherwise, we're fetching the new price, we're building a new instance of a `QuantityPriceDefinition` containing the new price. Using that instance, we can calculate the actual new price using the previously injected `QuantityPriceCalculator`.

Only thing left to do now, is to save the newly calculated price to the line item - and that's it!

::: warning
Do not query the database in the `process` method. Make sure to always use a collector for that.
:::

### Registering to DI container

One last thing, we need to register our processor and collector to the DI container. Our collector / processor has to be registered using the two tags `shopware.cart.processor` and `shopware.cart.collector`.

Let's have a look at it:

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Core\Checkout\Cart\OverwritePriceCollector">
            <argument type="service" id="Shopware\Core\Checkout\Cart\Price\QuantityPriceCalculator"/>

            <!-- after product collector/processor -->
            <tag name="shopware.cart.processor" priority="4500" />
            <tag name="shopware.cart.collector" priority="4500" />
        </service>
    </services>
</container>
```

And that's it. Your processor / collector should now be working.
