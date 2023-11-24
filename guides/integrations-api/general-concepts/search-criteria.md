---
nav:
  title: Search Criteria
  position: 10

---

# Search Criteria

## Overview

Generally, we refer to the endpoints that use `POST` method and receive the criteria as a JSON object as **search criteria**. It takes the same arguments as a [DAL criteria](../../plugins/plugins/framework/data-handling/reading-data#filtering). Some endpoints expect more parameters than specified here. However, these differ from one endpoint to another, so we don't specify them here.

A typical **search criteria** looks like this:

```json
{
  "limit": 10,
  "associations": {
    "manufacturer": {},
    "propertyIds": {},
    "cover": {},
    "options": {
      "associations": {
        "productOptions": {},
        "group": {}
      }
    }
  },
  "includes": {
    "product": [
      "calculatedPrice",
      "cover",
      "id",
      "translated",
      "seoUrls",
      "manufacturer",
      "propertyIds",
      "options"
    ],
    "product_media": [
      "media"
    ],
    "media": [
      "thumbnails",
      "width",
      "height",
      "url"
    ],
    "calculated_price": [
      "unitPrice",
      "quantity"
    ]
  }
}
```

In the following, we will go through different parameters that criteria can be assembled from.

| Parameter | Usage |
| :--- | :--- |
| `associations` | Allows to load additional data to the standard data of an entity |
| `includes` | Restricts the output to the defined fields |
| `ids` | Limits the search to a list of Ids |
| `total-count-mode` | Defines whether a total must be determined |
| `page` | Defines at which page the search result should start |
| `limit` | Defines the number of entries to be determined |
| `filter` | Allows you to filter the result and aggregations |
| `post-filter` | Allows you to filter the result but not the aggregations |
| `query` | Enables you to determine a ranking for the search result |
| `term` | Enables you to determine a ranking for the search result |
| `sort` | Defines the sorting of the search result |
| `aggregations` | Specify aggregations to be computed on-the-fly |
| `grouping` | Lets you group records by fields |

## Parameters

### `associations`

The `associations` parameter allows you to load additional data to the minimal data set of an entity without sending an extra request similar to a SQL Join. The parameter's key is the association's property name in the entity. You can pass nested criteria just for that association, e.g., to perform a sort to or apply filters within the association.

```json
{
    "associations": {
        "products": {
            "limit": 5,
            "filter": [
                { "type": "equals", "field": "active", "value": true }
            ],
            "sort": [
                { "field": "name", "order": "ASC" }    
            ]
        }
    }
}
```

### `includes (apiAlias)`

The `includes` parameter allows you to restrict the returned fields.

* Transfer only what you need reduces response payload.
* Easier to consume for client applications.
* When debugging, the response is smaller, and you can concentrate on the essential fields.

```json
{
    "includes": {
        "product": ["id", "name"]
    }
}

// Response
{
    "total": 120,
    "data": [
        {
            "name": "Synergistic Rubber Fish Soda",
            "id": "012cd563cf8e4f0384eed93b5201cc98",
            "apiAlias": "product"
        },
        {
            "name": "Mediocre Plastic Ticket Lift",
            "id": "075fb241b769444bb72431f797fd5776",
            "apiAlias": "product"
        }
  ]
}
```

::: info
All response types come with a `apiAlias` field which you can use to identify the type in your includes field. If you only want a categories id, add: `"category": ["id"]`. For entities, this is the entity name: `product`, `product_manufacturer`, `order_line_item`, ... For other non-entity types like a listing result or a line item, check the full response. This pattern applies not only to simple fields but also to associations.
:::

### `ids`

If you want to perform a simple lookup using just the ids of records, you can pass a list of those using the `ids` field:

```json
{
    "ids": [
        "012cd563cf8e4f0384eed93b5201cc98", 
        "075fb241b769444bb72431f797fd5776",
        "090fcc2099794771935acf814e3fdb24"
    ]
}
```

### `total-count-mode`

The `total-count-mode` parameter can be used to define whether the total for the total number of hits should be determined for the search query. This parameter supports the following values:

* `0 [default]` - No total is determined.
  * Advantage: This is the most performing mode because MySQL Server does not need to run the `SQL_CALC_FOUND_ROWS` in the background.
  * Purpose: Should be used if pagination is not required.
* `1` - An exact total is determined.
  * Purpose: Should be used if a pagination with the exact page number has to be displayed.
  * Disadvantage: Performance intensive. Here you have to work with `SQL_CALC_FOUND_ROWS`.
* `2` - It is determined whether there is a next page.
  * Advantage: Good performance, same as `0`.
  * Purpose: Can be used well for infinite scrolling because, with infinite scrolling, the information is enough to know if there is a next page to load.

```json
{
    "total-count-mode": 1
}
```

### `page & limit`

The `page` and `limit` parameters can be used to control pagination. The `page` parameter is 1-indexed.

```json
{
    "page": 1,
    "limit": 5
}
```

### `filter`

The `filter` parameter allows you to filter the result and aggregations using many filters and parameters. The filter types are equivalent to the filters available for the DAL.

<PageRef page="../../../resources/references/core-reference/dal-reference/filters-reference" />

::: info
When you are filtering for nested values - for example, you are filtering orders by their transaction state \(`order.transactions.stateMachineState`\) - make sure to fetch those in your `associations` field before.
:::

```json
{
  "associations": {
    "transactions": {
      "associations": {
        "stateMachineState": {}
      }
    }
  },
  "filter": [
    {
      "type": "multi",
      "operator": "and",
      "queries": [
        {
          "type": "multi",
          "operator": "or",
          "queries": [
            {
              "type": "equals",
              "field": "transactions.stateMachineState.technicalName",
              "value": "paid"
            },
            {
              "type": "equals",
              "field": "transactions.stateMachineState.technicalName",
              "value": "open"
            }
          ]
        },
        {
          "type": "equals",
          "field": "customFields.exportedFlag",
          "value": null
        }
      ]
    }
  ]
}
```

### `post-filter`

Work the same as `filter`; however, they don't apply to aggregations. This is great when you want to work with aggregations to display facets for filter navigation but already filter results based on filters without making an additional request.

### `query`

Use this parameter to create a weighted search query that returns a `_score` for each found entity. Any filter type can be used for the `query`. A `score` has to be defined for each query. The sum of the matching queries then results in the total `_score` value.

```json
{
    "query": [
        {
            "score": 500,
            "query": { "type": "contains", "field": "name", "value": "Bronze"}
        },
        { 
            "score": 500,
            "query": { "type": "equals", "field": "active", "value": true }
        },
        {
            "score": 100,
            "query": {
                "type": "equals",
                "field": "manufacturerId",
                "value": "db3c17b1e572432eb4a4c881b6f9d68f"
            }
        }
    ]
}
```

The resulting score is appended to every resulting record in the `extensions.search` field:

```json
{
    "total": 5,
    "data": [
        {
            "manufacturerId": "db3c17b1e572432eb4a4c881b6f9d68f",
            "name": "Awesome Bronze Krill Kream",
            "extensions": {
                "search": {
                    "_score": "1100"
                }
            },
            "id": "0acc3aa5c45a492c9a2adb8844cb7adc",
            "apiAlias": "product"
        },
        {
            "manufacturerId": "d0c0daa910d94b3c8b03c2bef6acb9b8",
            "name": "Synergistic Bronze New Tab",
            "extensions": {
                "search": {
                    "_score": "1000"
                }
            },
            "id": "72858576ac634f209b7ad61db15b7cc3",
            "apiAlias": "product"
        },
        {
            "manufacturerId": "3b5f9d51803849c68bb72360debd3da0",
            "name": "Fantastic Paper Zamox",
            "extensions": {
                "search": {
                    "_score": "500"
                }
            },
            "id": "18d2b4225ea34b17a6099108da159e7f",
            "apiAlias": "product"
        }
    ]
}
```

### `term`

Using the `term` parameter, the server performs a text search on all records based on their data model and weighting as defined in the entity definition using the `SearchRanking` flag.

::: info
Don't use `term` parameters together with `query` parameters.
:::

```json
{
    "term": "Awesome Bronze"
}
```

The results are formatted the same as for the `query` parameter above.

## `sort`

The `sort` parameter allows controlling the sorting of the result. Several sorts can be transferred at the same time.

* The `field` parameter defines the field to be used for sorting.
* The `order` parameter defines the sort direction.
* The parameter `naturalSorting` allows using a [Natural Sorting Algorithm](https://en.wikipedia.org/wiki/Natural_sort_order)
* The parameter `type` allows using divergent sorting behavior. Valid values are:
  * `count`: Sort by the count of associations via the given field. SQL representation: `ORDER BY COUNT({field}) {order}`

```json
{
    "limit": 5,
    "sort": [
        { "field": "name", "order": "ASC", "naturalSorting": true },
        { "field": "active", "order": "DESC" },
        { "field": "products.id", "order": "DESC", "type": "count" }
  ]
}
```

### `count` sorting behavior
  
For demonstration purposes, see the following request payload that additionally includes a `count` aggregation.

::: info
This `count` type was introduced with Shopware 6.4.12.0 and is not available in prior versions.
:::

```json
{
  "limit": 3,
  "includes": {
    "product": ["id"]
  },
  "sort": [
    { "field": "categories.id", "order": "DESC", "type": "count" }
  ],
  "aggregations": [
    {  
        "name": "product-id",
        "type": "terms",
        "field": "id",
        "limit": 3,
        "sort": { "field": "_count", "order": "DESC" },
        "aggregation": {  
            "name": "category-count",
            "type": "count",
            "field": "product.categories.id"
        }
    }
  ]
}
```

In response, the order of the `product` elements is now equal to the order of the aggregated buckets:

```json
{
    "total": 3,
    "aggregations": {
        "product-id": {
            "buckets": [
                {
                    "key": "f977f6a845a54b0381cbaf322f53b63e",
                    "count": 5
                },
                {
                    "key": "8d0ee52433df44b78a6f7827180049d9",
                    "count": 4
                },
                {
                    "key": "003a9df163474b28bc8a000243549547",
                    "count": 3
                }
            ]
        }
    },
    "elements": [
        { "id": "f977f6a845a54b0381cbaf322f53b63e" },
        { "id": "8d0ee52433df44b78a6f7827180049d9" },
        { "id": "003a9df163474b28bc8a000243549547" }
    ]
}
```

## `aggregations`

The `aggregations` parameter can determine metadata for a search query. There are different types of aggregations that are listed in the reference documentation. A simple example is the determination of the average price from a product search query.

* Purpose: Calculation of statistics and metrics.
* Purpose: Determination of possible filters.

The aggregation types are equivalent to the aggregations available in the DAL:

<PageRef page="../../../resources/references/core-reference/dal-reference/aggregations-reference" />

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
        {
            "name": "average-price",
            "type": "avg",
            "field": "price"
        }    
    ]
}
```

## `grouping`

The `grouping` parameter allows you to group the result over fields. It can be used to realize queries such as:

* Fetch one product for each manufacturer.
* Fetch one order per day and customer.

```json
{
    "limit": 5,
    "grouping": ["active"]
}
```
