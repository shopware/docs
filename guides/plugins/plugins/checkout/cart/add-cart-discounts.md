---
nav:
  title: Add cart discounts
  position: 30

---

# Add Cart Discounts

## Overview

In this guide you'll learn how to create discounts for your cart. In this example, we will create a discount for products that have 'Example' in their name.

## Prerequisites

In order to create cart discounts for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../../plugin-base-guide).

Furthermore you should be familiar with the service registration in Shopware, otherwise head over to our [Add custom service](../../plugin-fundamentals/add-custom-service) guide.

## Creating the processor

To add a discount to the cart, you should use the processor pattern. For this you need to create your own cart processor. We'll start with creating a new class called `ExampleProcessor` in the directory `<plugin root>/src/Core/Checkout`. Our class has to implement `Shopware\Core\Checkout\Cart\CartProcessorInterface` and we have to inject `Shopware\Core\Checkout\Cart\Price\PercentagePriceCalculator` in our constructor. All adjustments are done in the `process` method, where the product items already own a name and a price.

Let's start with the actual example code:

```php
// <plugin root>/src/Core/Checkout/ExampleProcessor.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\CartBehavior;
use Shopware\Core\Checkout\Cart\CartProcessorInterface;
use Shopware\Core\Checkout\Cart\LineItem\CartDataCollection;
use Shopware\Core\Checkout\Cart\LineItem\LineItem;
use Shopware\Core\Checkout\Cart\LineItem\LineItemCollection;
use Shopware\Core\Checkout\Cart\Price\PercentagePriceCalculator;
use Shopware\Core\Checkout\Cart\Price\Struct\PercentagePriceDefinition;
use Shopware\Core\Checkout\Cart\Rule\LineItemRule;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class ExampleProcessor implements CartProcessorInterface
{
    private PercentagePriceCalculator $calculator;

    public function __construct(PercentagePriceCalculator $calculator)
    {
        $this->calculator = $calculator;
    }

    public function process(CartDataCollection $data, Cart $original, Cart $toCalculate, SalesChannelContext $context, CartBehavior $behavior): void
    {
        $products = $this->findExampleProducts($toCalculate);

        // no example products found? early return
        if ($products->count() === 0) {
            return;
        }

        $discountLineItem = $this->createDiscount('EXAMPLE_DISCOUNT');

        // declare price definition to define how this price is calculated
        $definition = new PercentagePriceDefinition(
            -10,
            new LineItemRule(LineItemRule::OPERATOR_EQ, $products->getKeys())
        );

        $discountLineItem->setPriceDefinition($definition);

        // calculate price
        $discountLineItem->setPrice(
            $this->calculator->calculate($definition->getPercentage(), $products->getPrices(), $context)
        );

        // add discount to new cart
        $toCalculate->add($discountLineItem);
    }

    private function findExampleProducts(Cart $cart): LineItemCollection
    {
        return $cart->getLineItems()->filter(function (LineItem $item) {
            // Only consider products, not custom line items or promotional line items
            if ($item->getType() !== LineItem::PRODUCT_LINE_ITEM_TYPE) {
                return false;
            }

            $exampleInLabel = stripos($item->getLabel(), 'example') !== false;

            if (!$exampleInLabel) {
                return false;
            }

            return $item;
        });
    }

    private function createDiscount(string $name): LineItem
    {
        $discountLineItem = new LineItem($name, 'example_discount', null, 1);

        $discountLineItem->setLabel('Our example discount!');
        $discountLineItem->setGood(false);
        $discountLineItem->setStackable(false);
        $discountLineItem->setRemovable(false);

        return $discountLineItem;
    }
}
```

As you can see, all line items of type product containing the string 'example' in their name are fetched. Also, a few information are saved into variables, since we'll need them several times. If no product in the cart matches your condition, we can early return in the `process` method. Afterwards we create a new line item for the new discount. For the latter, we don't want that the line item is stackable and it shouldn't be removable either.

So let's get to the important part, which is the price. For a percentage discount, we have to use the `PercentagePriceDefinition`. It consists of an actual value, the currency precision and, if necessary, some rules to apply to. This definition is required for the cart to tell the core how this price can be recalculated even if the plugin would be uninstalled.

Shopware comes with a called `LineItemRule`, which requires two parameters:

* The operator being used, e.g. `LineItemRule::OPERATOR_EQ` \(Equals\) or `LineItemRule::OPERATOR_NEQ` \(Not equals\)
* The identifiers to apply the rule to. Pass the line item identifiers here, in this case the identifiers of the previously filtered products

After adding the definition to the line item, we have to calculate the current price of the discount. Therefore we can use the `PercentagePriceCalculator` of the core. The last step is to add the discount to the new cart which is provided as `Cart $toCalculate`.

That's it for the main code of our custom `CartProcessor`. Now we only have to register it in our `services.xml` using the tag `shopware.cart.processor` and priority `4500`, which is used to get access to the calculation after the [product processor](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/DependencyInjection/cart.xml#L223-L231) handled the products.
