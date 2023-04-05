# Writing Data

## Overview

This guide will teach you everything you need to know in order to write data to the database in Shopware 6. It will also include a short explanation about writing associated data.

## Prerequisites

This guide is built upon the [Plugin base guide](../../plugin-base-guide.md), so having a look at it first won't hurt. Having read the guide about [Reading data](reading-data.md) or understanding how to read data is mandatory for at least one short part of this guide.

You also might want to have a look at the concept behind the [Data abstraction layer](../../../../../concepts/framework/data-abstraction-layer.md) first to get a better grasp of how it works.

::: info
Refer to this video on **[Using repositories](https://www.youtube.com/watch?v=b3wOs_OWvP0)** that covers the basics of repositories. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Writing data

Let's get started with examples to write data. This example will be about writing **products**, but adjusting the examples for other data or entities is of course possible.

### Injecting the repository

Dealing with the Data Abstraction Layer is done by using the automatically generated repositories for each entity, such as a product. This means, that you have to inject the repository into your service first.

The repository's service name follows this pattern: `entity_name.repository`  
For products this then would be `product.repository`. Additional to that, you're going to need the `tax` repository later for this guide, so let's add this as well already.

```xml
// SwagBasicExample/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\WritingData" >
            <argument type="service" id="product.repository"/>
            <argument type="service" id="tax.repository"/>
        </service>
    </services>
</container>
```

And here's the respective class including its constructor:

```php
// SwagBasicExample/src/Service/WritingData.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;

class WritingData
{
    private EntityRepository $productRepository;

    private EntityRepository $taxRepository;

    public function __construct(EntityRepository $productRepository, EntityRepository $taxRepository)
    {
        $this->productRepository = $productRepository;
        $this->taxRepository = $taxRepository;
    }
}
```

So we registered a custom service called `WritingData` and applied the repositories as a constructor parameter. If you want to fetch data for another entity, just switch the `id` in the `services.xml` to whatever repository you need, e.g. `order.repository` for orders.

### Creating data

Now that you've injected the repositories into your service, you can start using them.

Let's start with creating new data, a new product in this case:

```php
public function writeData(Context $context): void
{
    $this->productRepository->create([
        [
            'name' => 'Example product',
            'productNumber' => 'SW123',
            'stock' => 10,
            'taxId' => $this->getTaxId($context),
            'price' => [['currencyId' => Defaults::CURRENCY, 'gross' => 50, 'net' => 25, 'linked' => false]],
        ]
    ], $context);
}

private function getTaxId(Context $context): string
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('taxRate', 19.00));

    return $this->taxRepository->searchIds($criteria, $context)->firstId();
}
```

First of all, for this example you'll need the following new imports:

```php
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
```

This example creates a new method called `writeData`, which will take of creating a new product. Its first parameter is the `Context`, which you need for the upcoming methods. This is usually passed through the stack, starting at a controller or event.

In there, we're calling the `create` method on the product repository with two parameters. The first one is an array of arrays, since you can write more than just one product with a single call, thus the first array. The second and inner array is representing the entities' data to be written.

This minimal example is just filling in the product's mandatory fields: The `name`, the `productNumber`, the `stock`, the `taxId` and the `price`. So the first three fields are just plain values, easy as that.

The `taxId` though represents the ID of the associated `tax`. Since we want to assign an existing tax here, we've created a new method called `getTaxId` to actually read the ID that we need. For this purpose, you need to understand how to read data from Shopware, so have a look at our guide about [Reading data](reading-data.md). We're calling `searchIds` on the `taxRepository` to only get IDs, since we don't need the full tax data here. Since we only need the first ID with the given tax rate here, we're just grabbing the first ID by using the `firstId` method on the collection. And there we go, we got a tax ID to fill into the mandatory field `taxId`.

A further explanation on how to write new associated data, instead of using existing entities, is also provided in the section [Assigning associated data](writing-data.md#assigning-associated-data).

Now, let's go on to the last field, the `price`. The price is saved to the product entity via a `JsonField`, so it's saved in the JSON format in the database. A product can have multiple prices, thus we're providing an array of arrays again here. For this example we'll still just write a single price. The structure for the JSON can be found in the [getConstraints method of the PriceFieldSerializer](https://github.com/shopware/platform/blob/v6.3.4.0/src/Core/Framework/DataAbstractionLayer/FieldSerializer/PriceFieldSerializer.php#L112-L141). Basically you need to provide a currency ID, for which we'll just use the shop's default currency, a gross and a net price and a boolean value of whether or not the gross and the net price are linked. If `linked` is set to `true`, changes to the gross price will also affect the net price, using the product's tax.

And that's it, this will write and create your first entity, a product. Of course there are way more fields you could have filled here for the product. All of them can be found in the [Product definition](https://github.com/shopware/platform/blob/trunk/src/Core/Content/Product/ProductDefinition.php).

#### Creating data with a given ID

In Shopware 6 we're using UUIDs for the ID fields in the entities. This comes with a major advantage: You can define your IDs when creating an entity already and thus do not have to figure out which ID your newly created entity received, e.g. by auto-increment.

```php
public function writeData(): void
{
    $context = Context::createDefaultContext();

    $productId = Uuid::randomHex();

    $this->productRepository->create([
        [
            'id' => $productId,
            'name' => 'Example product',
            'productNumber' => 'SW127',
            'stock' => 10,
            'tax' => $this->getTaxId($context),
            'price' => [['currencyId' => Defaults::CURRENCY, 'gross' => 50, 'net' => 25, 'linked' => false]],
            'categories' => [
                [
                    'id' => Uuid::randomHex(),
                    'name' => 'Example category'
                ]
            ]
        ]
    ], $context);
}
```

First of all: The used `Uuid` class can be found here: `Shopware\Core\Framework\Uuid\Uuid` Make sure to import this class first.

So note the `id` field we've provided now - even though you're just creating your new entity, you can already define which ID it's going to have, so you can keep working with the said ID right afterwards without having to fetch the recently written data again.

### Updating data

So what if you don't want to create a new entity, but rather update an existing one? For that case, you can use the `update` method on the repository. Let's just update our previously created product and change its name.

```php
public function writeData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example product'));

    $productId = $this->productRepository->searchIds($criteria, $context)->firstId();

    $this->productRepository->update([
        [
            'id' => $productId,
            'name' => 'New name'
        ]
    ], $context);
}
```

Just like when creating, you can update more than one entity at once, hence the array of arrays. Updating an entity will always require you to provide the respective ID, which we're searching for in the first few lines, just like we did before with the tax.

Then we're just applying the fields which we want to update and their new value, in that case only the name.

### Upserting data

Sometimes you don't really mind if an entity already exists and thus has to be updated, or created in the first place. For that case, we've implemented the `upsert` method. Make sure to provide an ID in the data, because otherwise the data will always be created and never updated.

### Deleting data

You've learned to read data, to create data and to update data. Let's get to the last part of the CRUD operations: Deleting data.

In order to create data, we've used the `create` method. For updating data, we've used the `update` method. You might have guesses it already, for this example you'll need the `delete` method.

Here's an example on how to delete the previously created product:

```php
public function writeData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example product'));

    $productId = $this->productRepository->searchIds($criteria, $context)->firstId();

    $this->productRepository->delete([
        [
            'id' => $productId
        ]
    ], $context);
}
```

Once again: An array of arrays, since you can delete more than one entry at once. The data arrays only have to contain the ID of the entity to be deleted.

### Assigning associated data

Assigning associated data is different for each kind of association. Every single of them will be covered here, from `OneToOne` associations, to `ManyToOne` and `OneToMany` associations and `ManyToMany` associations.

If you don't know how to add associations to an entity, maybe to your own entity, head over to our guide for adding an association to an entity [Add data associations](add-data-associations.md).

#### OneToOne and ManyToOne associations

Earlier in this guide, you created a product and used an existing tax entity for that case. This is representing a ManyToOne association, but OneToOne associations are handled the same.

```php
public function writeData(Context $context): void
{
    $this->productRepository->create([
        [
            'name' => 'Example product',
            'productNumber' => 'SW123',
            'stock' => 10,
            'taxId' => $this->getTaxId($context),
            'price' => [['currencyId' => Defaults::CURRENCY, 'gross' => 50, 'net' => 25, 'linked' => false]],
        ]
    ], $context);
}

private function getTaxId(Context $context): string
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('taxRate', 19.00));

    return $this->taxRepository->searchIds($criteria, $context)->firstId();
}
```

You just fill in the ID field of the associated entity, `taxId` in this example, with the respective ID value of the entity to be associated.

#### OneToMany and ManyToMany associations

OneToMany and ManyToMany associations are handled the same.

An example in the product context would be assigning a category to a product.

```php
public function writeData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example product'));

    $productId = $this->productRepository->searchIds($criteria, $context)->firstId();
    $categoryId = $this->categoryRepository->searchIds(new Criteria())->firstId();

    $this->productRepository->update([
        [
            'id' => $productId,
            'categories' => [
                [
                    'id' => $categoryId
                ]
            ]
        ]
    ], $context);
}
```

In this example, we are just fetching the very first category and reading its ID. Later we are assigning this category by using the associations name, which is `categories`. Since this is a `ManyToMany` association, you could technically assign more than just one category, hence the array of arrays again. In the second inner array, you just need to fill the `id` field again.

This works exactly the same for `OneToMany` associations.

**Updating mapping entities**

Every `ManyToMany` association comes with a mapping entity. It's important to know that you **cannot** update a mapping entity itself.

The following example will fail:

```php
public function writeData(Context $context): void
{
    // This is the product_category.repository service
    $this->productCategoryRepository->update([
        [
            'productId' => 'myOldProductId',
            'categoryId' => 'myNewCategoryId'
        ]
    ], $context);
}
```

The reason for that is simple: With every update action, you need to provide the primary key and the data to be updated. For mapping entities though, all data you could provide are primary keys themselves and you can't update primary keys.

Your only way to solve this is by replacing the association. Head over to our guide regarding [Replacing associated data](replacing-associated-data.md).

### Creating associated data

So you don't want to assign an existing tax entity when creating a product, but rather you'd like to create a new tax entity in the same step. That is also possible, and this section will show you an example on how to do it.

```php
public function writeData(Context $context): void
{
    $this->productRepository->create([
        [
            'name' => 'Example product',
            'productNumber' => 'SW123',
            'stock' => 10,
            'tax' => ['name' => 'test', 'taxRate' => 15],
            'price' => [['currencyId' => Defaults::CURRENCY, 'gross' => 50, 'net' => 25, 'linked' => false]],
        ]
    ], $context);
}
```

This example is exactly the same like the one when we explained creating a product in the first place, but with an important change to it: We're not assigning a tax ID of an existing entity, but instead we're filling the `tax` field.

In order to create a tax entity while creating the product, you have to provide all required data for the tax entity itself, which is the `name` and the `taxRate` here.

And that's already it - now the tax will be created in the same step when the product is created and will be assigned automatically. This works almost the same for `ToMany` associations.

```php
public function writeData(Context $context): void
{
    $this->productRepository->create([
        [
            'name' => 'Example product',
            'productNumber' => 'SW127',
            'stock' => 10,
            'tax' => ['name' => 'test', 'taxRate' => 15],
            'price' => [['currencyId' => Defaults::CURRENCY, 'gross' => 50, 'net' => 25, 'linked' => false]],
            'categories' => [
                [
                    'id' => 'YourCategoryId',
                    'name' => 'Example category'
                ]
            ]
        ]
    ], $context);
}
```

Note the `categories` field here. Just remember to use an array of arrays for `ToMany` associations.

### Replacing and deleting associated data

Replacing associated data is not always as easy as it seems. Head over to our guide about [Replacing associated data](replacing-associated-data.md) to get a full grasp of how it is done. While [Deleting associated data](deleting-associated-data.md) is a separate guide refer to that as well.

## Next steps

You should now be able to write data to the database using the Data Abstraction Layer from Shopware 6. You might have missed the guide about [Reading data](reading-data.md) in the first place though, and you should definitely know how that is done.
