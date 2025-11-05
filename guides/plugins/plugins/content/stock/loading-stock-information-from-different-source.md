---
nav:
  title: Loading Stock Information from a different Source
  position: 20

---

# Loading Stock Information from a Different Source

## Overview

If Shopware is not the source of truth for your stock data, you can customize the stock loading process and provide your data from a third-party source.

## Prerequisites

Here again, you will be decorating a service; therefore, it will be helpful to familiarize yourself with the [Adjusting a Service](../../../../../guides/plugins/plugins/plugin-fundamentals/adjusting-service) guide.

## Add a decorator to load the stock

For example, to load stock from a third-party API, you need to decorate `\Shopware\Core\Content\Product\Stock\AbstractStockStorage` and implement the `load` method. When products are loaded in Shopware the `load` method will be invoked with the loaded product IDs.

<Tabs>
<Tab title="StockStorageDecorator.php">

```php
// <plugin root>/src/Swag/Example/Service/StockStorageDecorator.php
<?php declare(strict_types=1);

namespace Swag\Example\Service;

use Shopware\Core\Content\Product\Stock\AbstractStockStorage;
use Shopware\Core\Content\Product\Stock\StockData;
use Shopware\Core\Content\Product\Stock\StockDataCollection;
use Shopware\Core\Content\Product\Stock\StockLoadRequest;
use Shopware\Core\Framework\Context;
use Shopware\Core\System\SalesChannel\SalesChannelContext;

class StockStorageDecorator extends AbstractStockStorage
{
    public function __construct(private AbstractStockStorage $decorated)
    {
    }

    public function getDecorated(): AbstractStockStorage
    {
        return $this->decorated;
    }

    public function load(StockLoadRequest $stockRequest, SalesChannelContext $context): StockDataCollection
    {
        $productsIds = $stockRequest->productIds;

        //use $productIds to make an API request to get stock data
        //$result would come from the api response
        $result = ['product-1' => 5, 'product-2' => 10];

        return new StockDataCollection(
            array_map(function (string $productId, int $stock) {
                return new StockData($productId, $stock, true);
            }, array_keys($result), $result)
        );
    }

    public function alter(array $changes, Context $context): void
    {
        $this->decorated->alter($changes, $context);
    }

    public function index(array $productIds, Context $context): void
    {
        $this->decorated->index($productIds, $context);
    }
}
```

</Tab>

<Tab title="services.xml">

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\Example\Service\StockStorageDecorator" decorates="Shopware\Core\Content\Product\Stock\StockStorage">
            <argument type="service" id="Swag\Example\Service\StockStorageDecorator.inner" />
        </service>
    </services>
</container>
```

</Tab>
</Tabs>

In your `load` method, you can access the product IDs from the `StockLoadRequest` instance and perform a request to your system to retrieve the data.

You then construct and return a `StockDataCollection` full of `StockData` instances. Each `StockData` instance represents a product.

You can use the static method `Shopware\Core\Content\Product\Stock::fromArray()` to construct an instance, passing in an array of the stock attributes.

There are several required values and some optional values.

| Attribute   | Type    | Description                                                     | Optional/Required |
|-------------|---------|-----------------------------------------------------------------|-------------------|
| productId   | string  | The product ID                                                  | Required          |
| stock       | int     | The stock amount                                                | Required          |
| available   | boolean | Whether the product is considered available                     | Required          |
| minPurchase | int     | The minimum purchase value for this product                     | Optional          |
| maxPurchase | int     | The maximum purchase value for this product                     | Optional          |
| isCloseout  | boolean | Whether the product can be ordered if there is not enough stock | Optional          |

For example:

```php
$stockData = \Shopware\Core\Content\Product\Stock\StockData::fromArray([
    'productId' => 'product-1',
    'stock' => 5,
    'available' => true,
    'minPurchase' => 1,
    'maxPurchase' => 10,
    'isCloseout' => false,
]);
```

It is also possible to provide arbitrary data via extensions:

```php
$stockData = \Shopware\Core\Content\Product\Stock\StockData::fromArray([
    'productId' => 'product-1',
    'stock' => 5,
    'available' => true,
]);

$stockData->addArrayExtension('extraData', ['foo' => 'bar']);
```

The values in the `StockData` instance will be used to update the loaded product instance. Furthermore, fetching the `StockData` instance from the product via the `stock_data` extension is possible. For example:

```php
$stockData = $product->getExtension('stock_data');
```
