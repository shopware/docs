# Customize Price Calculation

## Overview

There are cases where you globally want to adjust the calculation of product prices. This can be achieved in Shopware by decorating a single service.

This guide will cover this subject with a short example.

## Prerequisites

As most guides, this guide is also built upon our [plugin base guide](../../plugin-base-guide), but it's not mandatory to use exactly that plugin as a foundation. The examples in this guide use the namespace however.

Furthermore, you'll have to understand service decoration for this guide, so if you're not familiar with that, head over to our guide regarding [adjusting a service](../../plugin-fundamentals/adjusting-service).

## Decorating the calculator

In order to customize the price calculation for products as a whole, you'll have to decorate the service [ProductPriceCalculator](https://github.com/shopware/platform/blob/trunk/src/Core/Content/Product/SalesChannel/Price/ProductPriceCalculator.php). It comes with a `calculate` method, which you can decorate and therefore customize.

So let's do that real quick. If you're looking for an in-depth explanation, head over to our guide about [adjusting a service](../../plugin-fundamentals/adjusting-service).

Here's an example decorated calculator:

```php
// <plugin root>/src/Service/CustomProductPriceCalculator.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Content\Product\SalesChannel\Price\AbstractProductPriceCalculator;
use Shopware\Core\Content\Product\SalesChannel\SalesChannelProductEntity;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class CustomProductPriceCalculator extends AbstractProductPriceCalculator
{
    /**
     * @var AbstractProductPriceCalculator
     */
    private AbstractProductPriceCalculator $productPriceCalculator;

    public function __construct(AbstractProductPriceCalculator $productPriceCalculator)
    {
        $this->productPriceCalculator = $productPriceCalculator;
    }

    public function getDecorated(): AbstractProductPriceCalculator
    {
        return $this->productPriceCalculator;
    }

    public function calculate(iterable $products, SalesChannelContext $context): void
    {
        /** @var SalesChannelProductEntity $product */
        foreach ($products as $product) {
            $price = $product->getPrice();
            // Just an example!
            // A product can have more than one price, which you also have to consider.
            // Also you might have to change the value of "getCheapestPrice"!
            $price->first()->setGross(100);
            $price->first()->setNet(50);
        }

        $this->getDecorated()->calculate($products, $context);
    }
}
```

So what is done here? The constructor gets passed the inner instance of `AbstractProductPriceCalculator`, most likely the `ProductPriceCalculator` itself. This will be used to call the original `calculate` method later on. You also have to return that instance in your `getDecorated` method.

Inside the overridden `calculate` method, we're iterating over each product and we straight forward set new prices. Of course this is just an example to show how you can now manipulate a product's prices.

Most likely you also want to narrow down which product's prices you want to edit, as in this example we're adjusting every single product and setting them all to the same price. You might want to have a look at the original [calculate method](https://github.com/shopware/platform/blob/trunk/src/Core/Content/Product/SalesChannel/Price/ProductPriceCalculator.php#L45-L58) to see how calculating a price is done in the core code.

### Registering the decorator

Do not forget to actually register your decoration to the service container, otherwise it will not have any effect.

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\CustomProductPriceCalculator" decorates="Shopware\Core\Content\Product\SalesChannel\Price\ProductPriceCalculator">
            <argument type="service" id="Swag\BasicExample\Service\CustomProductPriceCalculator.inner" />
        </service>
    </services>
</container>
```

## Next steps

Instead of manipulating a product's price, you can also try to add a discount or a surcharge to the cart. This is explained in our guide about [adding cart discounts](add-cart-discounts).
