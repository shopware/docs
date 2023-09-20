---
nav:
  title: Removing associated data
  position: 60

---

# Removing Associated Data

## Overview

This guide explains with some examples on how to delete associated data or most likely how to delete the association to another entity.

## Prerequisites

This example will be built upon the [Plugin base guide](../../plugin-base-guide), so having a look at it will come in handy.

Also, the same subject was already mentioned in our guide about [Replacing associated data](replacing-associated-data).

## Deleting associated data

Since the method differs from each type of association, it will be split from here.
Note, that deleting an association \(as in: Removing the association without a replacement\) is only possible if the association is **not** required.

E.g. you cannot just remove the `taxId` from a product, since the product always has to be associated to a tax entity.

### Deleting ToOne associations

This section will cover both `OneToOne` as well as `ManyToOne` associations, since they're basically treated the same.
In this example we'll assume that you've assigned a manufacturer to your product.
The manufacturerId is **not** required and thus the association can be removed.

```php
public function removeAssocData(Context $context): void
{
    $this->productRepository->update([
        [
            'id' => 'myProductId',
            'manufacturerId' => null
        ]
    ], $context);
}
```

We're simply setting the ID field of the respective association to `null`.
Now this product won't have a manufacturer assigned anymore.

**Note: If your product is e.g. inheriting from a parent product, the manufacturer will not be unset for the parent product as well.**

### Deleting ManyToMany associations

This section will only cover `ManyToMany` associations.
If you're looking for `OneToMany` associations, head over to the next section. But for now, let's have a look at a `ManyToMany` example.

Assuming you want to un-assign a category from a product, this is how it's done.

```php
public function removeAssocData(Context $context): void
{
    $this->productCategoryRepository->delete([
        [
            'productId' => 'myProductId',
            'categoryId' => 'myCategoryId'
        ]
    ], $context);
}
```

When using the `delete` method, you always need to provide the entities' primary keys in the data array.
Usually, this is just one `id` field, but since we're dealing with a mapping entity here, it owns two primary keys.
This piece of information can be found by looking into the respective entity definition.
Have a look at the [ProductCategoryDefinition](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Content/Product/Aggregate/ProductCategory/ProductCategoryDefinition.php#L37-L41) that we're dealing with here.
It owns two primary keys, `productId` and `categoryId`, and you need to provide both to precisely delete this association.

### Deleting OneToMany associations

The `OneToMany` associations deserve an own section, since they come with a special use case in Shopware 6.
They are sometimes used to create a `ManyToMany` association but with extra data in the mapping table, and sometimes they're just simple `OneToMany` associations.

You need to figure out which kind of `OneToMany` association you're facing here: A normal `OneToMany` association or a hidden `ManyToMany` association?

Let's start with the normal one. Usually, a `OneToMany` association is just the other side of a `ManyToOne` association, whose deletion was already explained in the section about deleting associated data.

Assume you're looking into the [ProductManufacturerDefinition](https://github.com/shopware/platform/blob/trunk/src/Core/Content/Product/Aggregate/ProductManufacturer/ProductManufacturerDefinition.php), which has a `OneToMany` association to the products.
Deleting this kind of association was already explained in the section about `ToOne` associations.
Instead of working with the repository of the `ProductManufacturerDefinition`, you would be working with the repository from the `ProductDefinition` to remove this association.

```php
public function removeAssocData(Context $context): void
{
    $this->productRepository->update([
        [
            'id' => 'myProductId',
            'manufacturerId' => null
        ]
    ], $context);
}
```

Just set the `manufacturerId` to null and there we go - the `OneToMany` association was removed.
It's the very same code example again.

Unfortunately, it's not always that simple.
As explained above, sometimes `OneToMany` associations are hidden `ManyToMany` associations.
To understand what we mean, have a look at the `media` field in the [Product definition](https://github.com/shopware/platform/blob/v6.3.4.0/src/Core/Content/Product/ProductDefinition.php#L210-L211).
Technically a product can have multiple medias, and a media can be assigned to multiple products, so this should have been a `ManyToMany` association, right?
Yet, looking at the `media` field in the `ProductDefinition`, you can see that it's a `OneToMany` association.
The second case, that we described earlier in this section, fits here: Technically a `ManyToMany` association, hidden by a `OneToMany` association for the reason mentioned above: There's more data needed for the mapping entity.

If this is the case, you have to treat it just like a `ManyToMany` association in terms of deleting it.
Get the mapping definition's repository, `product_media.repository` in this example, and execute a `delete` on that repository.
This time though, you don't have to use the `productId` and the `mediaId` to delete it, since this kind of definition has its own ID field.
And that's the one you need to use.

So figure out its ID by using the known `productId` and `mediaId` and figure out the mapping entities' ID this way.

```php
public function removeAssocData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('productId', 'myProductId'));
    $criteria->addFilter(new EqualsFilter('mediaId', 'myMediaId'));

    $productMediaId = $this->productMediaRepository->searchIds($criteria, $context)->firstId();

    $this->productMediaRepository->delete([
        [
            'id' => $productMediaId
        ]
    ], $context);
}
```

By having a look at the [ProductMediaDefinition](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Content/Product/Aggregate/ProductMedia/ProductMediaDefinition.php), we know that it only has one primary key, which is `id` - and as always when using the `delete` method, this is all you need to provide in the data array.

This way the product will now lose the association to the media entity.
Note: This will **not** delete the media entity itself, just the association between the product and the media entity.

## More interesting topics

* [Replacing associated data](replacing-associated-data)
