# Add Cart Collector/Processor

## Overview

In order to change the cart at runtime, you can use a custom [collector](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Cart/CartDataCollectorInterface.php)
or a custom [processor](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Checkout/Cart/CartProcessorInterface.php).

Their main purpose is explained in their respective section.

## Collector class

A collector can and should be used to retrieve additional data for the cart, e.g. by querying the database, hence the name "collector".
This could also be querying an API endpoint, querying the database or fetching data in any other way you can think of.

Very often a collector is used to fetch data necessary for a processor.

It has to implement the interface `Shopware\Core\Checkout\Cart\CartDataCollectorInterface` and therefore implement a `collect` method.

But let's have a look at an example collector class.

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Cart;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\CartBehavior;
use Shopware\Core\Checkout\Cart\CartDataCollectorInterface;
use Shopware\Core\Checkout\Cart\LineItem\CartDataCollection;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class CustomCartCollector implements CartDataCollectorInterface
{
    public function collect(CartDataCollection $data, Cart $original, SalesChannelContext $context, CartBehavior $behavior): void
    {
        // Do your stuff in order to collect data, this is just an example method call
        $newData = $this->collectData();

        $data->set('uniqueKey', $newData);
    }
}
```

The `collect` method's parameters are the following:

- `CartDataCollection`: Use this object to save your new cart data. You'll most likely use the `set` method here, which expects
a unique key and its value. This object will be available in all processors.
- `Cart`: The current cart and its line items.
- `SalesChannelContext`: The current sales channel context, containing information about the currency, the country, etc.
- `CartBehavior`: It contains a cart state, which describes which actions are allowed. E.g. in the [product processor](https://github.com/shopware/platform/blob/trunk/src/Core/Content/Product/Cart/ProductCartProcessor.php#L33), there's
a permission to check if the product stock validation should be skipped.

Your collector has to be defined in the service container using the tag `shopware.cart.collector`.

## Processor class

A processor is the class that will actually process the cart and is supposed to apply changes to the cart.
It will most likely use data, that was previously fetched by a collector.

::: warning
Do not query data in the process method, since it may be executed a lot of times. Always use the collect method of a collector for this case!
:::

Your processor class has to implement the interface `Shopware\Core\Checkout\Cart\CartProcessorInterface` and its `process` method.

Let's have a look at an example processor.

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Cart;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\CartBehavior;
use Shopware\Core\Checkout\Cart\CartProcessorInterface;
use Shopware\Core\Checkout\Cart\LineItem\CartDataCollection;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class CustomCartProcessor implements CartProcessorInterface
{
    public function process(CartDataCollection $data, Cart $original, Cart $toCalculate, SalesChannelContext $context, CartBehavior $behavior): void
    {
        $newData = $data->get('uniqueKey');

        // Do stuff to the `$toCalculate` cart with your new data
        foreach ($toCalculate->getLineItems()->getFlat() as $lineItem) {
            $lineItem->setPayload($newData['stuff']);
        }
    }
}
```

The `process` method contains the same parameters as the `collect` method, but there's one main difference:

Next to the `$original` `Cart`, you've got another `Cart` parameter being called `$toCalculate` here.
Make sure to do all the changes on the `$toCalculate` instance, since this is the cart that's going to be considered in the end.

Your processor has to be defined in the service container using the tag `shopware.cart.processor`.

## Next steps

If you want to see a better example on what can be done with a collector and a processor, you might want to have a look at our guide
regarding [Changing the price of an item in the cart](./change-price-of-item).
