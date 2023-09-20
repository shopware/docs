---
nav:
  title: Reading data
  position: 10

---

# Reading Data

## Overview

In this guide you will learn how to properly fetch data from the database in your plugin or for core contributions. This will also cover how to add filters to only find specific data, and how to aggregate your desired data. Unlike most other Symfony applications, Shopware 6 uses no ORM but rather a thin Data Abstraction Layer. It's worth getting used to the "DAL", as you might stumble upon this term every now and then in the Shopware universe.

## Prerequisites

Since this guide is built upon the plugin base guide [Plugin base guide](../../plugin-base-guide), you might want to have a look at it. Furthermore, the guide about [Dependency injection](../../plugin-fundamentals/dependency-injection) will come in handy, since you need to know how to inject a service using the DI container.  
You also might want to have a look at the concept behind the [Data abstraction layer concept](../../../../../concepts/framework/data-abstraction-layer) first to get a better grasp of how it works.

## Reading data

Let's get started with examples on how to read data now. This example will be about reading **products**, but adjusting them for other data is easy, you'll see what we mean.

### Injecting the repository

Dealing with the Data Abstraction Layer is done by using the automatically generated repositories for each entity, such as a product. This means, that you have to inject the repository into your service first.

The repository's service name follows this pattern: `entity_name.repository`  
For products this then would be `product.repository`, so let's do this.

```xml
// SwagBasicExample/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\ReadingData" >
            <argument type="service" id="product.repository"/>
        </service>
    </services>
</container>
```

And here's the respective class including its constructor:

```php
// SwagBasicExample/src/Service/ReadingData.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;

class ReadingData
{
    private EntityRepository $productRepository;

    public function __construct(EntityRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }
}
```

So we registered a custom service called `ReadingData` and applied the repository as a constructor parameter. If you want to fetch data for another entity, just switch the `id` in the `services.xml` to whatever repository you need, e.g. `order.repository` for orders.

### Using the repository

Now that you've injected the repository into your service, you can start using it. First of all, for the following examples you'll need two more imports:

```php
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
```

Let's start with the most basic read action now:

```php
public function readData(Context $context): void
{
    $products = $this->productRepository->search(new Criteria(), $context);
}
```

This example assumes that you're using / calling a method called `readData` on your previously created service. That's it already. It will read some products without any special filtering. The result of the `search` method will be an instance of an `EntitySearchResult`, which then contains the collection of products.

The `$context` is usually passed through to your method, starting from a controller or an event.

#### Filtering

Now let's get into actually filtering your search result to get more precise results.

**Searching for IDs**

Often you have an ID from an entity and you just want to find the whole dataset related to that ID, so here you go:

```php
public function readData(Context $context): void
{
    $product = $this->productRepository->search(new Criteria([$myId]), $context)->first();
}
```

This will just find the product with the ID `$myId` or it will return `null`, if no product was found with that ID. But how does that work now?

The `Criteria` object accepts an array of IDs to search for as a constructor parameter. This means, that you could apply more than just one ID here.

The `search` method will then return a `EntitySearchResult`, which contains the according entity collection of all products. Even though just one product can be matched here, the method will always return a collection, which then contains your single product. Therefore we're calling `first()` to get the actual entity, and not the collection as a return.

**Searching for any other field**

While searching for an ID will do the trick quite often, you might want to search a product by e.g. its name instead.

In order to do this, you can apply filters to the `Criteria` object, such as an `EqualsFilter`, which accepts a field name and the value to search for. You can find the `EqualsFilter` here: `Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter`

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example name'));

    $products = $this->productRepository->search($criteria, $context);
}
```

This example will search for all products with the name `Example name` and return an `EntitySearchResult` containing all matched products. Since the `EntitySearchResult` is extending the `EntityCollection`, which is iterable, you could just iterate over the results using a `foreach`.

All available fields can be found in the entities' respective definition, `ProductDefinition` for this example.

#### Combining filters

What would you do now if you are fine with a product which has either the ID "X" OR the mentioned name "Example name"?

For this case, you can combine filters using the `OrFilter` or the `AndFilter`, or the `NandFilter`, etc.

Let's just build the example mentioned above:

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new OrFilter([
        new EqualsFilter('id', 'Your example ID'),
        new EqualsFilter('name', 'Example name')
    ]));

    $products = $this->productRepository->search($criteria, $context);
}
```

So now you'll find all products, that either have the mentioned `id` OR the mentioned `name`. The `OrFilter` can be found here: `Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\OrFilter`.

You can find an example for each of the available filters in our [DAL reference about filters](../../../../../resources/references/core-reference/dal-reference/filters-reference).

#### Post filters

Later in this guide you will learn about aggregated data. Sometimes you want to filter the result returned by the DAL, but you don't want those filters to apply to the aggregation result.

E.g.: Fetch all products, whose name is `Example product`, but also return the total amount of products available.

In that case, you can just use the `addPostFilter` instead of `addFilter`:

```php
public function readData(): void
{
    $criteria = new Criteria();
    $criteria->addPostFilter(new EqualsFilter('name', 'Example name'));

    $products = $this->productRepository->search($criteria, $context);
}
```

This example does not contain any aggregation, since they're only explained later.

**Other filters**

There is more than just an `EqualsFilter`, which is the SQL equivalent of `WHERE fieldX = valueX`. You can find all other filters either on [GitHub](https://github.com/shopware/platform/tree/trunk/src/Core/Framework/DataAbstractionLayer/Search/Filter) or in our [filters reference](../../../../../resources/references/core-reference/dal-reference/filters-reference) with explanation.

#### Associations

Of course associations to other entities are also possible in Shopware 6. If you, for example, want to load all product-reviews, which is an entity itself, related to the product you have found, you can do so by adding associations to the criteria object.

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example name'));
    $criteria->addAssociation('productReviews');

    $products = $this->productRepository->search($criteria, $context);
}
```

Just like the available entity fields, you can find all possible associations in the entity definition.

Also worth to mention is the fact, that you can chain the association key. E.g. a product-review has another association to the customer, who created that review. If you want access to both the review itself, as well as the customer, you can just write the association like that:

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example name'));
    $criteria->addAssociation('productReviews.customer');

    $products = $this->productRepository->search($criteria, $context);
}
```

**Filter associations**

Yes, this is doable. You can apply filters to an association. E.g. "Add all product reviews to the product, whose rating is above 4 stars.".

For this we can use `getAssociation` instead, which basically returns its own `Criteria` object, on which you can apply a filter.

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example name'));

    $criteria->getAssociation('productReviews')->addFilter(new RangeFilter('points', [
        RangeFilter::GTE => 4
    ]));

    $product = $this->productRepository->search($criteria, $context)->first();
}
```

Once again: Note, that we used `getAssociation` here now instead of `addAssociation`. Also you need the `RangeFilter`, which can be found here: `Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\RangeFilter`

Another example to clarify what's going on here:

```php
public function readData(Context $context): void
{
    // This will always return the product with the given name, no matter if it has a review with 4 or more stars.
    // But only matching reviews are added to the dataset then.
    $criteria->getAssociation('productReviews')->addFilter(new RangeFilter('points', [
        RangeFilter::GTE => 4
    ]));
    $product = $this->productRepository->search($criteria, $context)->first();

    // This will only return products, whose name matches AND which have at least one rating of 4 stars or more
    $criteria->addAssociation('productReviews');
    $criteria->addFilter(new RangeFilter('productReviews.points', [
        RangeFilter::GTE => 4
    ]));
    $product = $this->productRepository->search($criteria, $context)->first();
}
```

The first will return your product, that you found anyway, and add all matching `productReview` associations. The latter will just return your product, if it has at least one matching review.

**Reading mapping entities**

Every `ManyToMany` association comes with a mapping entity, such as the `ProductCategoryDefinition`. It's important to know, that you **cannot** read those mapping entities using the `search()` method.

The following example will **not** work:

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();

    // It's the product_category.repository here
    $result = $this->productCategoryRepository->search($criteria, $context);
}
```

Since mapping entities just consist of two primary keys, there is no need to search for the "full entity" via `search`. It will suffice to use `searchIds` instead, which will return the IDs - and that's all there is in a mapping entity.

#### Aggregations

Of course you can also aggregate your data. Just like filters and associations, this can be done by using an `addAggregation` method on the `Criteria` object. Let's create an example aggregation, that returns the average rating for a product:

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example name'));

    $criteria->addAssociation('productReviews');
    $criteria->addAggregation(new AvgAggregation('avg-rating', 'productReviews.points'));

    $products = $this->productRepository->search($criteria, $context);
    $rating = $products->getAggregations()->get('avg-rating');
}
```

Important to note here is that you have to remove the `first()` call, because we do **not** need the entity itself but the `EntitySearchResult` here instead. The `AvgAggregation` class can be found here: `Shopware\Core\Framework\DataAbstractionLayer\Search\Aggregation\Metric\AvgAggregation`

A list of all available aggregations can be found on [GitHub](https://github.com/shopware/platform/tree/trunk/src/Core/Framework/DataAbstractionLayer/Search/Aggregation) or in the [DAL aggregations reference](../../../../../resources/references/core-reference/dal-reference/aggregations-reference).

#### Limiting, paging and sorting

There's just a few more things missing: Limiting your result intentionally to e.g. ten results, adding an offset for paging reasons and sorting the result.

Let's start with the limiting of the result:

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example name'));
    $criteria->setLimit(1);

    $product = $this->productRepository->search($criteria, $context)->first();
}
```

That's quite self-explanatory, isn't it? Just use the `setLimit` method with your desired limit as parameter. Little spoiler: It's the same for the offset!

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example name'));
    $criteria->setOffset(1);
    $criteria->setLimit(1);

    $product = $this->productRepository->search($criteria, $context)->first();
}
```

This way you get the 2nd possible product. But since you didn't define a sorting yourself, the result can be quite confusing, so let's add a sorting.

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->addFilter(new EqualsFilter('name', 'Example name'));
    $criteria->setOffset(1);
    $criteria->setLimit(1);
    $criteria->addSorting(new FieldSorting('createdAt', FieldSorting::ASCENDING));

    $product = $this->productRepository->search($criteria, $context)->first();
}
```

Now you've added an ascending sort by the `createdAt` field, so the result becomes a lot more predictable. The `FieldSorting` can be found here: `Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting`.

### Using the RepositoryIterator

Another special way to read data in Shopware is by using the [RepositoryIterator](https://github.com/shopware/platform/blob/trunk/src/Core/Framework/DataAbstractionLayer/Dbal/Common/RepositoryIterator.php).

But what does it do? Basically it's a little helper class that helps you deal with big data sets by being iterable and returning a batch of data with each iteration, but never all data at once.

Imagine you need to iterate over all products of your shop, which contains more than 100000 products. Reading them all out at once and saving this huge set of data into a variable will most likely crash your server with a "memory exhausted" error message.

Instead, the `RepositoryIterator` will return a batch of data, which size you can define, with each iteration. Just be sure to not use it unnecessarily, since it will create a new database request with each iteration, which is not needed for smaller chunks of data.

```php
public function readData(Context $context): void
{
    $criteria = new Criteria();
    $criteria->setLimit(500);

    $iterator = new RepositoryIterator($this->productRepository, $context, $criteria);

    while (($result = $iterator->fetch()) !== null) {
        $products = $result->getEntities();

        // Do something with the products
    }
}
```

In this example, you'd get a batch of 500 products with each iteration of the `while` loop. This way, `$result` will not cause a "memory exhausted" error and you can handle huge amounts of data this way.

One small caveat to be aware of: When using the `RepositoryIterator`, make sure that the `Criteria` uses a sorting which is deterministic.

Put differently, you must ensure that your sorting means that there's only one correct way to order your results, otherwise different batches might decide to sort the entities differently in the database. That would mean you risk getting the same entity in several batches (and having entities that won't be iterated at all).

For example, ordering products by `manufacturerNumber` alone could cause this issue, because several products can have the same `manufacturerNumber`, so there's several correct orderings of those products. On the other hand, because each product is guaranteed to have a unique ID, sorting by ID is an easy way to mitigate this issue:

```php
$criteria = new Criteria();
//This sorting alone would result in sorting that is nondeterministic as several products might have the same value for this field:
$criteria->addSorting(new FieldSorting('manufacturerNumber'));  
//However, simply by adding a secondary sorting by ID, the sorting becomes deterministic again, as the IDs are unique per product.
$criteria->addSorting(new FieldSorting('id'));  
$criteria->setLimit(500);
```

And that's basically it for this guide!

## Next steps

Now that you know how to read data from the database using the Data Abstraction Layer, you can head over to our guide on [Writing data](writing-data).
