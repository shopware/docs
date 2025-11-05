---
nav:
  title: Implementing your own stock storage
  position: 10

---

# Implementing your own stock storage

## Overview

Shopware stores stock as simple integer values in the `product` table. If you need a more advanced stock management system or would like to write the stock alterations to a different system, you can implement your own stock storage.

## Prerequisites

Here you will be decorating a service; therefore, it will be helpful to familiarize yourself with the [Adjusting a Service](../../../../../guides/plugins/plugins/plugin-fundamentals/adjusting-service) guide.

## Add a decorator to load the stock

First, to communicate stock alterations to a third-party service, you will have to decorate `\Shopware\Core\Content\Product\Stock\AbstractStockStorage` and implement the `alter` method. This method is triggered with an array of `StockAlteration`'s, which contains:

* the Product and Line Item IDs,
* the old quantity and
* the new quantity.

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
use Shopware\Core\Content\Product\Stock\StockAlteration;

class StockStorageDecorator extends AbstractStockStorage
{
    public function __construct(private AbstractStockStorage $decorated, private MyStockApi $stockApi)
    {
    }

    public function getDecorated(): AbstractStockStorage
    {
        return $this->decorated;
    }

    public function load(StockLoadRequest $stockRequest, SalesChannelContext $context): StockDataCollection
    {
        return $this->decorated->load($stockRequest, $context);
    }

    /**
     * @param list<StockAlteration> $changes  
     */
    public function alter(array $changes, Context $context): void
    {
        foreach ($changes as $alteration) {
            $this->stockApi->updateStock($alteration->productId, $alteration->newQuantity);
        }
        
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

The alter method will be called when the stock of a product should be updated. The `$changes` array contains a list of `StockAlteration` instances. These objects contain the following properties/methods:

| Property/Method | Type   | Description                                             |
|-----------------|--------|---------------------------------------------------------|
| lineItemId      | string | The ID of the line item that triggered the stock update |
| productId       | string | The ID of the product that should be updated            |
| quantityBefore  | int    | The old product stock level                             |
| newQuantity     | int    | The new product stock level                             |
| quantityDelta() | int    | The difference between the old and new stock level      |

## Stock changing scenarios

The following list contains all the scenarios that trigger stock alterations. All implementations of `AbstractStockStorage` should be able to handle these scenarios.

* Order placed
* Order canceled
* Order deleted
* Cancelled order, reopened
* Line item added to the order
* Line item removed from an order
* Line item updated (Product qty increased)
* Line item updated (Product qty decreased)
* Line item updated (Product sku changed)

All of these scenarios are handled by the event subscriber `Shopware\Core\Content\Product\Stock\OrderStockSubscriber`.

## Further extension points for advanced customization

1. If you need to listen to more events to trigger stock alterations, you can create an event subscriber for the required events and call the `\Shopware\Core\Content\Product\Stock\AbstractStockStorage::alter` method with a `StockAlteration` instance representative of the alteration.
2. If you don't want to use Shopware's default events and stock storage, you can implement your own system and recommend that the project owner disables the Shopware stock management system. Refer them to [Configuration guide](../../../../../guides/hosting/configurations/shopware/stock).
