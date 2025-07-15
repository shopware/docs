---
nav:
  title: API & Pricing
  position: 30

---

## Store API

Here are some of the actions you can perform on *Shopping lists* with Store API.

### Create new shopping list

```http request
POST {url}/store-api/shopping-list {
    name: {string}
}
```

### Duplicate shopping list

```http request
POST {url}/store-api/shopping-list/{id}/duplicate {
    name: {string}
}
```

### Get shopping list

```http request
GET {url}/store-api/shopping-list/{id}
```

### Get shopping lists

```http request
GET {url}/store-api/shopping-lists
```

### Remove shopping lists

```http request
DELETE {url}/store-api/shopping-lists {
    ids: {array}
    }
```

### Get summary price shopping list

The shopping list price will be included in the API for getting the shopping list. However, if you want to directly get the shopping list summary price, you can use this API.

```http request
GET {url}/store-api/shopping-list/{id}/summary
```

For more details, refer to [B2B Shopping Lists](https://shopware.stoplight.io/docs/store-api/c9849725606fd-create-new-shopping-list) from Store API docs.

## Admin API

Shopping lists do not provide any special APIs. The Admin API offers CRUD operations for every entity within Shopware, and you can use it to work with shopping lists.

### Shopping lists price

A shopping list shows a list of products. The prices of these products may change depending on the time, customers, and sales channels. Therefore, the price of each product and the total price of the shopping list will not be saved in the database but will be calculated when loading the shopping list.

The `Shopware\Commercial\B2B\ShoppingList\Subscriber\ShoppingListSubscriber` listens to any loading of a shopping list.

```php
class ShoppingListSubscriber implements EventSubscriberInterface
{
    ...
    public static function getSubscribedEvents(): array
    {
        return [
            self::SHOPPING_LIST_LOADED => 'adminLoadedForSpecificCustomer',
            self::SALES_CHANNEL_SHOPPING_LIST_LOADED => 'salesChannelLoaded',
            self::SALES_CHANNEL_SHOPPING_LIST_LINE_ITEM_LOADED => 'salesChannelLineItemLoaded',
        ];
    }
    ...
}
```

The `Shopware\Commercial\B2B\ShoppingList\Domain\Price\ShoppingListPriceCalculator::calculate` will process calculations for entities:

```php
class ShoppingListPriceCalculator extends AbstractShoppingListPriceCalculator
{
    ...
    public function calculate(iterable $shoppingLists, SalesChannelContext $context): void
    {
        $productIds = $this->getProductIds($shoppingLists);
        $products = $this->productRepository->search(new Criteria($productIds), $context)->getEntities();

        foreach ($shoppingLists as $entity) {
            $listPrices = new PriceCollection();

            if (!$entity->getLineItems() instanceof ShoppingListLineItemCollection) {
                $entity->setPrice($this->calculatedPrices($listPrices, $context));
                continue;
            }

            $this->processCalculatedLineItems($entity->getLineItems(), $products, $context);

            foreach ($entity->getLineItems() as $lineItem) {
                if (!$lineItem->getPrice()) {
                    continue;
                }

                $listPrices->add($lineItem->getPrice());
            }

            $entity->assign([
                'price' => $this->calculatedPrices($listPrices, $context),
            ]);
        }
    }
    ...
}
```

For loading a shopping list in the admin, to include the price of the shopping list and the price of the products, it is necessary to ensure that all shopping lists have the same customer. If not, the price will not be calculated.

Also, products can also be activated or deactivated at any time. The shopping lists will still store deactivated products, but they will not be included in the calculations when loading the shopping lists.
