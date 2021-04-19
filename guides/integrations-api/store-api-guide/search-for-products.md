# Searching for products

## Overview

One of the most common actions that customers perform in an online store is browsing products. We'll cover different topics in this guide

* Search products
* Filter and sort products
* Apply field projections \(make the response smaller\)
* Work with associations

## Simple search

Let's start by performing a simple product search

```javascript
// POST /store-api/search

{
    "search": "braeburn"
}
```

Let's look at the response:

```javascript
{
  "sorting": "score",
  "currentFilters": {
    "manufacturer": [],
    "price": {
      "min": null,
      "max": null
    },
    "rating": null,
    "shipping-free": false,
    "properties": [],
    "search": "braeburn"
  },
  "page": 1,
  "limit": 24,
  "availableSortings": [
    {
      "key": "name-asc",
      "label": "Name A-Z",
      "id": "2526e30bf667446a888d04804483939b",
      "apiAlias": "product_sorting"
    },
    {
      "key": "name-desc",
      "label": "Name Z-A",
      "id": "3757223aef334b61a41c7d1b07fad8f1",
      "apiAlias": "product_sorting"
    },
    {
      "key": "price-asc",
      "label": "Price ascending",
      "id": "05d09bfc26c6468ca2ede06e0f8ebf52",
      "apiAlias": "product_sorting"
    },
    {
      "key": "price-desc",
      "label": "Price descending",
      "id": "79db02f2acf644178c0fae80434d95cd",
      "apiAlias": "product_sorting"
    },
    {
      "key": "score",
      "label": "Top results",
      "id": "12be6eee109444b39e15bf014bf8e928",
      "apiAlias": "product_sorting"
    },
    {
      "key": "topseller",
      "label": "Topseller",
      "id": "acbde485a5fd429c94dada82260c465a",
      "apiAlias": "product_sorting"
    }
  ],
  "total": 1,
  "aggregations": {
    "manufacturer": {
      "entities": [ ... ],
      "apiAlias": "manufacturer_aggregation"
    },
    "price": {
      "min": "149",
      "max": "149",
      "avg": null,
      "sum": null,
      "apiAlias": "price_aggregation"
    },
    "rating": {
      "max": 0,
      "apiAlias": "rating_aggregation"
    },
    "shipping-free": {
      "max": 0,
      "apiAlias": "shipping-free_aggregation"
    },
    "properties": { ... },
    "options": { ... }
  },
  "elements": [
    {
      "translated": {
        "name": "Box Braeburn Apples (2 kg)",
      },
      "id": "eaf1ee42ef884f3c941f22596aa0163f",
      "apiAlias": "product"
    }
  ],
  "apiAlias": "product_listing"
}
```

Even though this response is broken down, it's still quite a lot to grasp at once. Let's go step by step:

**sorting**  
Contains the key of the sorting that was applied to your search result.

**currentFilters**  
Contains the filters applied to reduce your search result. In our case only the search term.

**page, limit, total**  
Pagination configuration.

**availableSortings**  
Contains the options available for sorting.

**aggregations**  
Contains aggregations such as min and max prices, ratings, or product properties. Super helpful to build filters.

**elements**  
Contains the actual search result.

## Refined search

We can apply any of the given sortings by passing them through the `order` field:

```javascript
// POST /store-api/search

{
    "search": "braeburn",
    "order": "topseller"
}
```

Let's say you want to filter out products with a price higher than 50.00. We simply add a `filter` section and applying a `range` filter for the price field. Note, that `filter` is an array - you can pass in multiple filters at once.

```javascript
// POST /store-api/search

{
    "search": "braeburn",
    "order": "topseller",
    "filter": [
        {
            "type": "range",
            "field": "price",
            "parameters": {
                "lt": 50.0
            }
        }
    ]
}
```

## Field projection

A single-product response from the search endpoint already measures ~11KB. That's because a lot of fields from the product are loaded eagerly. However, we can restrict response to only the fields that we need.

If you take a look at the search response from above - almost every object contains a `apiAlias` key. We can use this key to refer to a list of fields that we want to be included in our response.

The following request provides us with a response containing the most essential fields that we need to display a simple product listing which only measures ~2.5KB for a single-product listing.

```javascript
// POST /store-api/search

{
    "search": "braeburn",
    "includes": {
        "product_sorting": ["id", "translated"],
        "product_manufacturer": ["id", "translated"],
        "product": ["id", "translated", "cover", "calculatedPrice"],
        "calculated_price": ["totalPrice", "listPrice"],
        "product_media": ["media"],
        "media": ["thumbnails"],
        "media_thumbnail": ["width", "height", "url"]
    }
}
```

It doesn't take a lot of time to shrink your response down to a fraction and you have full control over the fields it contains.

{% hint style="info" %}
Why is the **`translated`** field always included?

Most natural text fields in Shopware are stored as translatable values. Depending on the current language, Shopware will try to hydrate these fields with the correct value. Sometimes it occurs, that a text value is not maintained in a given language. For that case, Shopware provides a fallback mechanism based on a translation hierarchy. However, these fallback values are only contained in the translated field of the entity.

By using **`product.translated.name`** instead of **`product.name`** you can make sure to always fall back correctly if there's no translated value present.
{% endhint %}

## Fetching associations

Sometimes it's necessary to fetch additional associations like categories or properties of a product. We can specify those additional associations using a corresponding field within the request body:

```javascript
// POST /store-api/search

{
    "search": "braeburn",
    "associations": {
        "categories": {}
    },
    "includes": {
        "product_listing": ["elements"],
        "product": ["id", "translated", "categories"],
        "category": ["id", "translated"]
    }
}
```

Once we've provided the association, Shopware will try to fetch the related entities and hydrate the response accordingly.

{% hint style="info" %}
**Wonder which associations there are?**

Normally, an unfiltered response already suggests which associations you could load. Usually these fields are pre-filled with `null` if the association is not fetched. You can always look into the entities `*Definition.php` class to see which associations it contains.
{% endhint %}

## Fetch a single product

Sometimes, you just want to fetch a single product, the product endpoint \(as well as doing searches\) lets you do this:

```text
// POST /store-api/product/eaf1ee42ef884f3c941f22596aa0163f
```

Now that we're done with searching products, let's do something with them.

{% page-ref page="work-with-the-cart.md" %}

