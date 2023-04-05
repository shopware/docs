# Replacing Associated Data

## Overview

This short guide will give you an example on how to replace associated `ToMany` data using our Data Abstraction Layer.

## Prerequisites

Having read our guide about [Writing data](writing-data) is mandatory to understand the next few steps here. Other than that, the default prerequisites apply here as well: A running Shopware 6 instance and full access to the files.

The examples mentioned here are built upon the [Plugin base guide](../../plugin-base-guide). If you don't know how to create a plugin or how to use the code examples here in the first place, the plugin base guide is a good way to start.

## Replacing data

So let's start with the main issue going on here. Let's imagine you've created a product using our previously mentioned guide about [Writing data](writing-data) and you have assigned a category to it. Unfortunately you made a mistake, since this was the wrong category to be assigned and you want another category to be assigned instead.

### A wrong example

The following example will show you how **not** to do it. It's assuming that you've previously assigned the category `Old category` with the ID `oldId` to the product.

```php
public function replaceData(Context $context): void
{
    $this->productRepository->update([
        [
            'id' => 'myProductId',
            'categories' => [
                [
                    'id' => 'newCategoryId'
                ]
            ]
        ]
    ], $context);
}
```

You're assigning an array of category arrays to the product with the ID `myProductId`. This array of category arrays does **not** contain the old category ID, only the new one. Thus, the old category association should be removed and instead the new category should be assigned, right?

Well, this is **not** how it works. Using a write operation will **not** delete data, but only add up more data. The result of the example above will be a product with two categories assigned instead.

### The right example

The right way to do it is to delete the category association first, only to then re-assign a new category. Let's take a look at the deletion part first, since this is where most people struggle.

The product categories are a `ManyToMany` association and thus come with a mapping table, and a custom entity. You can find the entity definition for the association [here](https://github.com/shopware/platform/blob/trunk/src/Core/Content/Product/Aggregate/ProductCategory/ProductCategoryDefinition.php).

In order to delete it, we once again need its repository. The name for the entity can be found in the definition, to be precise inside of the `getEntityName` method.

So let's inject this repository into our class called `ReplacingData`:

```xml
// SwagBasicExample/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\ReplacingData" >
            <argument type="service" id="product.repository"/>
            <argument type="service" id="product_category.repository"/>
        </service>
    </services>
</container>
```

Afterwards, you can just use the `delete` method on the repository, just like you did before in the [Writing data](writing-data) guide.

```php
public function replaceData(Context $context): void
{
    $this->productCategoryRepository->delete([
        [
            'productId' => 'myProductId',
            'categoryId' => 'oldId'
        ]
    ], $context);
}
```

Now the association to the old category was removed and you can now use the code above to add the new category instead.

```php
public function replaceData(Context $context): void
{
    $productId = 'myProductId';

    $this->productCategoryRepository->delete([
        [
            'productId' => $productId,
            'categoryId' => 'oldCategoryId'
        ]
    ], $context);

    $this->productRepository->update([
        [
            'id' => $productId,
            'categories' => [
                [
                    'id' => 'newCategoryId'
                ]
            ]
        ]
    ], $context);
}
```

And that's it, you've successfully deleted one association and then replaced it by another. This works for both `ManyToMany`, as well as `OneToMany` associations.

### ToOne associations

Replacing `OneToOne` or `ManyToOne` associations works just like expected via an `update` call, e.g. for the tax of a product:

```php
public function replaceData(Context $context): void
{
    $this->productRepository->update([
        [
            'id' => 'myProductId',
            'taxId' => 'newTaxId'
        ]
    ], $context);
}
```

This works as expected.

## More interesting topics

* [Deleting associated data](deleting-associated-data)
