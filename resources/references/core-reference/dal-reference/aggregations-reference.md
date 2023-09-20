# Aggregations Reference

Aggregations allow you to determine further information about the overall result in addition to the actual search results. These include totals, unique values, or the average of a field.

The DAL knows two types of aggregations:

* `metric` aggregation - This type of aggregation applies a mathematical formula to a field. A metric aggregation always has a calculated result. These are aggregations to calculate sums or maximum values.
* `bucket` aggregation - With this type of aggregation, a list of keys is determined. Further aggregations can then be determined for each key.

| Name | Type | Description |
| :--- | :--- | :--- |
| avg | metric | Average of all numeric values for the specified field |
| count | metric | Number of records for the specified field |
| max | metric | Maximum value for the specified field |
| min | metric | Minimal value for the specified field |
| stats | metric | Stats overall numeric values for the specified field |
| sum | metric | Sum of all numeric values for the specified field |
| entity | bucket | Groups the result for each value of the provided field and fetches the entities for this field |
| filter | bucket | Allows to filter the aggregation result |
| terms | bucket | Groups the result for each value of the provided field and fetches the count of affected documents |
| histogram | bucket | Groups the result for each value of the provided field and fetches the count of affected documents. Although allows to provide date interval \(day, month, ...\) |
| range | bucket | Groups the result for each defined set of ranges into each bucket - bucket of numerical data and a count of items/documents for each bucket |

## Avg aggregation

The `Avg` aggregation makes it possible to calculate the average value for a field. The following SQL statement is executed in the background: `AVG(price)`.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new AvgAggregation('avg-price', 'price')
);

$result = $repository->search($criteria, $context);

/** @var AvgResult $aggregation */
$aggregation = $result->getAggregations()->get('avg-price');

$aggregation->getAvg();
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
        {  
            "name": "avg-price",
            "type": "avg",
            "field": "price"
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Gorgeous Cotton Magellanic Penguin",
            "id": "0402ca6a746b41458fd000124c308cc8",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "avg-price": {
            "avg": 505.73333333333335,
            "extensions": []
        }
    }
}
```

</Tab>
</Tabs>

## Count aggregation

The `count` aggregation makes it possible to determine the number of entries for a field that are filled with a value. The following SQL statement is executed in the background: `COUNT(DISTINCT(manufacturerId))`.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new CountAggregation('count-manufacturers', 'manufacturerId')
);

$result = $repository->search($criteria, $context);

/** @var CountResult $aggregation */
$aggregation = $result->getAggregations()->get('count-manufacturers');

$aggregation->getCount();
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
        {  
            "name": "count-manufacturers",
            "type": "count",
            "field": "manufacturerId"
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Gorgeous Cotton Magellanic Penguin",
            "id": "0402ca6a746b41458fd000124c308cc8",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "count-manufacturers": {
            "count": 44,
            "extensions": []
        }
    }
}
```

</Tab>
</Tabs>

## Max aggregation

The `max` aggregation allows you to determine the maximum value of a field. The following SQL statement is executed in the background: `MAX(price)`.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new MaxAggregation('max-price', 'price')
);

$result = $repository->search($criteria, $context);

/** @var MaxResult $aggregation */
$aggregation = $result->getAggregations()->get('max-price');

$aggregation->getMax();
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
        {  
            "name": "max-price",
            "type": "max",
            "field": "price"
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Gorgeous Cotton Magellanic Penguin",
            "id": "0402ca6a746b41458fd000124c308cc8",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "max-price": {
            "max": "979",
            "extensions": []
        }
    }
}
```

</Tab>
</Tabs>

## Min aggregation

The `min` aggregation makes it possible to determine the minimum value of a field. The following SQL statement is executed in the background: `MIN(price)`

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new MinAggregation('min-price', 'price')
);

$result = $repository->search($criteria, $context);

/** @var MinResult $aggregation */
$aggregation = $result->getAggregations()->get('min-price');

$aggregation->getMin();
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
        {  
            "name": "min-price",
            "type": "min",
            "field": "price"
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Gorgeous Cotton Magellanic Penguin",
            "id": "0402ca6a746b41458fd000124c308cc8",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "min-price": {
            "min": "5",
            "extensions": []
        }
    }
}
```

</Tab>
</Tabs>

## Sum aggregation

The `sum` aggregation makes it possible to determine the total of a field. The following SQL statement is executed in the background: `SUM(price)`.[PHP](https://docs.shopware.com/en/shopware-platform-dev-en/references-internals/core/dal?category=shopware-platform-dev-en/references-internals/core#)[API](https://docs.shopware.com/en/shopware-platform-dev-en/references-internals/core/dal?category=shopware-platform-dev-en/references-internals/core#)

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new SumAggregation('sum-price', 'price')
);

$result = $repository->search($criteria, $context);

/** @var SumResult $aggregation */
$aggregation = $result->getAggregations()->get('sum-price');

$aggregation->getSum();
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
        {  
            "name": "sum-price",
            "type": "sum",
            "field": "price"
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Gorgeous Cotton Magellanic Penguin",
            "id": "0402ca6a746b41458fd000124c308cc8",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "sum-price": {
            "sum": 30344,
            "extensions": []
        }
    }
}
```

</Tab>
</Tabs>

## Stats aggregation

The `stats` aggregation makes it possible to calculate several values at once for a field. This includes the previous `max`, `min`, `avg` and `sum` aggregation. The following SQL statement is executed in the background: `SELECT MAX(price), MIN(price), AVG(price), SUM(price)`.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new StatsAggregation('stats-price', 'price')
);

$result = $repository->search($criteria, $context);

/** @var StatsResult $aggregation */
$aggregation = $result->getAggregations()->get('stats-price');

$aggregation->getSum();
$aggregation->getMax();
$aggregation->getAvg();
$aggregation->getMin();
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
        {  
            "name": "stats-price",
            "type": "stats",
            "field": "price"
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Gorgeous Cotton Magellanic Penguin",
            "id": "0402ca6a746b41458fd000124c308cc8",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "stats-price": {
            "min": "5",
            "max": "979",
            "avg": 505.73333333333335,
            "sum": 30344,
            "extensions": []
        }
    }
}
```

</Tab>
</Tabs>

## Terms aggregation

The `terms` aggregation belongs to the bucket aggregations. This allows you to determine the values of a field. The result contains each value once and how often this value occurs in the result. The `terms` aggregation also supports the following parameters:

* `limit` - Defines a maximum number of entries to be returned \(default: zero\)
* `sort` - Defines the order of the entries. By default, the following is not sorted
* `aggregation` - Enables you to calculate further aggregations for each key

The following SQL statement is executed in the background: `SELECT DISTINCT(manufacturerId) as key, COUNT(manufacturerId) as count`

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new TermsAggregation(
        'manufacturer-ids',
        'manufacturerId',
        10,
        new FieldSorting('manufacturer.name', FieldSorting::DESCENDING)
    )
);

$result = $repository->search($criteria, $context);

/** @var TermsResult $aggregation */
$aggregation = $result->getAggregations()->get('manufacturer-ids');

foreach ($aggregation->getBuckets() as $bucket) {
    $bucket->getKey();
    $bucket->getCount();
}
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
        {
            "name": "manufacturer-ids",
            "type": "terms",
            "limit": 3,
            "sort": { "field": "manufacturer.name", "order": "DESC" },
            "field": "manufacturerId"
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Gorgeous Cotton Magellanic Penguin",
            "id": "0402ca6a746b41458fd000124c308cc8",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "manufacturer-ids": {
            "buckets": [
                {
                    "key": "7af1534f96604744a4bc16e713550107",
                    "count": 1,
                    "extensions": []
                },
                {
                    "key": "32d5c55f960b409ab209fe25c88a6676",
                    "count": 1,
                    "extensions": []
                },
                {
                    "key": "935ceec182714a8da48227d4772628a4",
                    "count": 1,
                    "extensions": []
                }
            ],
            "extensions": []
        }
    }
}
```

</Tab>
</Tabs>

## Filter aggregation

The `filter` aggregation belongs to the bucket aggregations. Unlike all other aggregations, this aggregation does not determine any result. It can't be used alone. It is only used to further restrict the result of an aggregation in a criterion. Filters defined inside the `filter` property of this aggregation type are only used when calculating this aggregation. The filters have no effect on other aggregations or on the result of the search.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new FilterAggregation(
        'active-price-avg',
        new AvgAggregation('avg-price', 'price'),
        [
            new EqualsFilter('active', true)
        ]
    )
);

$result = $repository->search($criteria, $context);

/** @var AvgResult $aggregation */
$aggregation = $result->getAggregations()->get('avg-price');

$aggregation->getAvg();
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
       {
            "name": "active-price-avg",
            "type": "filter",
            "filter": [
                { 
                    "type": "equals", 
                    "field": "active", 
                    "value": true
                }
            ],
            "aggregation": {  
                "name": "avg-price",
                "type": "avg",
                "field": "price"
            }
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Awesome Granite HelpingHand",
            "id": "000bba26e2044b98a3ee4a84b03f9551",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "avg-price": {
            "avg": 517.5898195488719,
            "extensions": []
        }
    }
}
```

</Tab>
</Tabs>

## Entity aggregation

The `entity` aggregation is similar to the `terms` aggregation. It belongs to the bucket aggregations. As with `terms` aggregation, all unique values are determined for a field. The aggregation then uses the determined keys to load the defined entity. The keys are used here as ids.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new EntityAggregation('manufacturers', 'manufacturerId', 'product_manufacturer')
);

$result = $repository->search($criteria, $context);

/** @var EntityResult $aggregation */
$aggregation = $result->getAggregations()->get('manufacturers');

/** @var ProductManufacturerEntity $entity */
foreach ($aggregation->getEntities() as $entity) {
    $entity->getName();
}
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"],
        "product_manufacturer": ["id", "name"]
    },
    "aggregations": [
        {
            "name": "manufacturers",
            "type": "entity",
            "definition": "product_manufacturer",
            "field": "manufacturerId"
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Gorgeous Cotton Magellanic Penguin",
            "id": "0402ca6a746b41458fd000124c308cc8",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "manufacturers": {
            "entities": [
                {
                    "name": "Kris, Thiel and Tillman",
                    "id": "0055fe4c16ac4d34a57b460d225682cb",
                    "apiAlias": "product_manufacturer"
                },
                {
                    "name": "Beier Group",
                    "id": "073e354c7a854287ac8c084cd70ebf90",
                    "apiAlias": "product_manufacturer"
                }
            ],
            "apiAlias": "manufacturers_aggregation"
        }
    }
}
```

</Tab>
</Tabs>

## Histogram aggregation

The histogram aggregation is used as soon as the data to be determined refers to a date field. With the histogram aggregation, one of the following date intervals can be given: `minute`, `hour`, `day`, `week`, `month`, `quarter`, `year`, `day`. This interval groups the result and calculates the corresponding count of hits.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new DateHistogramAggregation(
        'release-dates',
        'releaseDate',
        DateHistogramAggregation::PER_MONTH
    )
);

$result = $repository->search($criteria, $context);

/** @var DateHistogramResult $aggregation */
$aggregation = $result->getAggregations()->get('release-dates');

foreach ($aggregation->getBuckets() as $bucket) {
    $bucket->getKey();
    $bucket->getCount();
}
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
        {
            "name": "release-dates",
            "type": "histogram",
            "field": "releaseDate",
            "interval": "month"
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Gorgeous Cotton Magellanic Penguin",
            "id": "0402ca6a746b41458fd000124c308cc8",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "release-dates": {
            "buckets": [
                {
                    "key": "2020-04-01 00:00:00",
                    "count": 50,
                    "extensions": []
                },
                {
                    "key": "2020-03-01 00:00:00",
                    "count": 4,
                    "extensions": []
                },
                {
                    "key": "2020-04-01 00:00:00",
                    "count": 6,
                    "extensions": []
                }
            ],
            "apiAlias": "release-dates_aggregation"
        }
    }
}
```

</Tab>
</Tabs>

## Range aggregations

Allows to aggregate data on a predefined range of values for more flexibility in the DAL - for example, it provides faceted filters on a predefined range.

Bound are computed in SQL as in the Elasticsearch native range aggregation:
* `from` will be compared with greater than or equal to
* `to` will be compared with lower than

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->addAggregation(
    new RangeAggregation(
        'price_ranges', 
        'products.price',
        [
            ['to' => 100],
            ['from' => 100, 'to' => 200],
            ['from' => 200]
        ]
    )
);

$result = $repository->search($criteria, $context);

/** @var RangeResult $aggregation */
$aggregation = $result->getAggregations()->get('price_ranges');

foreach ($aggregation->getRanges() as $key => $docCount) {
    // ...
}
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    ...
    "aggregations": {
        "price_ranges": {
            "range": {
                "field": "products.price",
                    "ranges": [
                    { "to": 100.0 },
                    { "from": 100.0, "to": 200.0 },
                    { "from": 200.0 }
                ]
            }
        }
    }
}
```

Response

```json
{
    ...
    "aggregations": {
        "price_ranges": {
            "buckets": [
                {
                    "key": "*-100.0",
                    "to": 100.0,
                    "doc_count": 2
                },
                {
                    "key": "100.0-200.0",
                    "from": 100.0,
                    "to": 200.0,
                    "doc_count": 2
                },
                {
                    "key": "200.0-*",
                    "from": 200.0,
                    "doc_count": 3
                }
            ]
        }
    }
}
```

</Tab>
</Tabs>

## Nesting aggregations

A metric aggregation calculates the value for a specific field. This can be a total or, for example, a minimum or maximum value of the field. Bucket aggregations are different. This determines how often a value occurs in a search result and returns it together with the count. The special thing about bucket aggregation is that it can contain further aggregations. This allows the API to perform complex queries like, for example:

* Calculate the number of manufacturers per category that have a price over 500 Euro. \*

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->setLimit(1);

$criteria->addAggregation(
    new FilterAggregation(
        'my-filter',
        new TermsAggregation(
            'per-category',
            'categories.id',
            null,
            null,
            new TermsAggregation(
                'manufacturer-ids',
                'manufacturerId'
            )
        ),
        [
            new RangeFilter('price', ['gte' => 500])
        ]
    )
);

$result = $repository->search($criteria, $context);

/** @var TermsResult $aggregation */
$aggregation = $result->getAggregations()->get('per-category');

foreach ($aggregation->getBuckets() as $bucket) {
    $categoryId = $bucket->getKey();

    /** @var TermsResult $manufacturers */
    $manufacturers = $bucket->getResult();

    foreach ($manufacturers->getBuckets() as $nestedBucket) {
        $manufacturerId = $nestedBucket->getKey();
    }
}
```

</Tab>

<Tab title="API Criteria">
Request

```json
{
    "limit": 1,
    "includes": {
        "product": ["id", "name"]
    },
    "aggregations": [
        {
            "name": "my-filter",
            "type": "filter",
            "filter": [
                { 
                    "type": "range", 
                    "field": "price", 
                    "parameters": {
                        "gte": 500
                    }
                }
            ],
            "aggregation": {  
                "name": "per-category",
                "type": "terms",
                "field": "categories.id",
                "aggregation": {
                    "name": "manufacturer-ids",
                    "type": "terms", 
                    "field": "manufacturerId"
                }
            }
        }
    ]
}
```

Response

```json
{
    "total": 1,
    "data": [
        {
            "name": "Gorgeous Cotton Magellanic Penguin",
            "id": "0402ca6a746b41458fd000124c308cc8",
            "apiAlias": "product"
        }
    ],
    "aggregations": {
        "per-category": {
            "buckets": [
                {
                    "key": "25fb912226fa48c2a5c9f4788f1f552d",
                    "count": 1,
                    "extensions": [],
                    "manufacturer-ids": {
                        "buckets": [
                            {
                                "key": "715901f2b5864181a777d1a1b912d9a2",
                                "count": 1,
                                "extensions": []
                            }
                        ],
                        "extensions": []
                    }
                },
                {
                    "key": "59b38c960597446e8c7bb76593ff7043",
                    "count": 2,
                    "extensions": [],
                    "manufacturer-ids": {
                        "buckets": [
                            {
                                "key": "98e53a711d8549059325da044da2951d",
                                "count": 1,
                                "extensions": []
                            },
                            {
                                "key": "ee8b37324c5a4c32962367146be4d7b4",
                                "count": 1,
                                "extensions": []
                            }
                        ],
                        "extensions": []
                    }
                }
            ],
            "apiAlias": "per-category_aggregation"
        }
    }
}
```

</Tab>
</Tabs>
