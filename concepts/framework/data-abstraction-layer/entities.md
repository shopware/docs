# Entities

## Core entities

Core entities are interacted with through CRUD (create, read, update, delete) operations. This is done using the
`EntityRepository` which provides an interface to the DAL.

### Reading entities by ID

The entity repositories provide a `search()` method which takes two arguments:

1. The `Criteria` object, which holds a list of ids.
2. The `Context` object to be read with.

```php
/** @var EntityRepositoryInterface $productRepository */
$productRepository = $this->container->get('product.repository');

/** @var EntityCollection $entities */
$entities = $productRepository->search(
    new Criteria([
        'f8d36562c5614c5994aecb9c73d2b13e',
        '67a8a047b638493d95bb2a4cdf351cf3',
        'b94055962e4b49ceb86f55f8d1932607',
    ]),
    \Shopware\Core\Framework\Context::createDefaultContext()
);
```

The return value will be a collection containing all found entities as hydrated objects.

### Searching entities by criteria

When searching for entities without a specific ID, a `Criteria` object with more complex filters can be constructed.

The following example code will be looking for a product whose name equals 'Example product':

```php
 /** @var EntityRepositoryInterface $productRepository */
$productRepository = $this->container->get('product.repository');

/** @var EntityCollection $entities */
$entities = $productRepository->search(
    (new Criteria())->addFilter(new EqualsFilter('name', 'Example product')),
    \Shopware\Core\Framework\Context::createDefaultContext()
);
```

Below is an overview of all filters available by default.

#### Equals

The `Equals` filter allows you to check fields for an exact value. The following SQL statement is executed in the
background: `WHERE stock = 10`.

{% tabs %} {% tab title="PHP" %}

```php
 $criteria = new Criteria();
 $criteria->addFilter(new EqualsFilter('stock', 10));
```

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
{
    "filter": [
        { 
            "type": "equals", 
            "field": "stock", 
            "value": 10
        }    
    ]
}
```

{% endtab %} {% endtabs %}

#### EqualsAny

The `EqualsAny` filter allows you to filter a field where at least one of the defined values matches exactly. The
following SQL statement is executed in the background: `WHERE productNumber IN ('3fed029475fa4d4585f3a119886e0eb1', '
77d26d011d914c3aa2c197c81241a45b')`.

{% tabs %} {% tab title="PHP" %}

```php
$criteria = new Criteria();
$criteria->addFilter(
    new EqualsAnyFilter('productNumber', [
        '3fed029475fa4d4585f3a119886e0eb1', 
        '77d26d011d914c3aa2c197c81241a45b'
    ])
);
```

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
{
    "filter": [
        { 
            "type": "equalsAny", 
            "field": "productNumber", 
            "value": [
                "3fed029475fa4d4585f3a119886e0eb1", 
                "77d26d011d914c3aa2c197c81241a45b"
            ] 
        }    
    ]
}
```

{% endtab %} {% endtabs %}

#### Contains

The `Contains` filter allows you to filter a field to an approximate value, where the passed value must be contained as
a full value. The following SQL statement is executed in the background: `WHERE name LIKE '%Lightweight%'`.

{% tabs %} {% tab title="PHP" %}

```php
$criteria = new Criteria();
$criteria->addFilter(new ContainsFilter('name', 'Lightweight'));
```

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
{
    "filter": [
        { 
            "type": "contains", 
            "field": "name", 
            "value": "Lightweight"
       }    
    ]
}
```

{% endtab %} {% endtabs %}

#### Range

The `Range` filter allows you to filter a field to a value space. This can work with a date or numerical values. Within
the parameter property the following values are possible:

- `gte` => Greater than equals
- `lte` => Less than equals
- `gt` => Greater than
- `lt` => Less than

The following SQL statement is executed in the background: `WHERE stock >= 20 AND stock <= 30`.

{% tabs %} {% tab title="PHP" %}

```php
$criteria = new Criteria();
$criteria->addFilter(
    new RangeFilter('stock', [
        RangeFilter::GTE => 20,
        RangeFilter::LTE => 30
    ])
);
```

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
{
    "filter": [
        { 
            "type": "range", 
            "field": "stock", 
            "parameters": {
                "gte": 20,      
                "lte": 30
            }
        }    
    ]
}
```

{% endtab %} {% endtabs %}

#### Not

The `Not` filter is a container that allows reversing the criteria of any kind of filter. The `operator` allows you to
define the combination of queries within the NOT filter (`OR` and `AND`). The following SQL statement is executed in the
background: `WHERE !(stock = 1 OR availableStock = 1) AND active = 1`.

{% tabs %} {% tab title="PHP" %}

```php
$criteria = new Criteria();
$criteria->addFilter(new EqualsFilter('active', true));

$criteria->addFilter(
    new NotFilter(
       NotFilter::CONNECTION_OR,
       [
            new EqualsFilter('stock', 1),
            new EqualsFilter('availableStock', 10)
       ]
    )
 );
```

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
{
	"filter": [
		{ 
			"type": "not", 
			"operator": "or",
			"queries": [
				{
					"type": "equals",
					"field": "stock",
					"value": 1
				},
				{
					"type": "equals",
					"field": "availableStock",
					"value": 1
				}    
			]
		},
		{
			"type": "equals",
			"field": "active",
			"value": true
		}
	]
}
```

{% endtab %} {% endtabs %}

#### Multi

The `Multi` filter is a container, which allows combining filters with `AND` or `OR`. The following SQL statement is
executed in the background: `WHERE (stock = 1 OR availableStock = 1) AND active = 1`.

{% tabs %} {% tab title="PHP" %}

```php
$criteria = new Criteria();
$criteria->addFilter(
	new MultiFilter(
		MultiFilter::CONNECTION_OR,
		[
			new EqualsFilter('stock', 1),
			new EqualsFilter('availableStock', 10)
		]
	)
);
$criteria->addFilter(
	new EqualsFilter('active', true)
);
```

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
{
	"filter": [
		{ 
			"type": "multi",   
			"operator": "or",
			"queries": [
				{
					"type": "equals",
					"field": "stock",
					"value": 1
				},
				{
					"type": "equals",
					"field": "availableStock",
					"value": 1
				} 
			]
		},
		{
			"type": "equals",
			"field": "active",
			"value": true
		}
	]
}
```

{% endtab %} {% endtabs %}

### Aggregations

Aggregations allow you to determine further information about the overall result in addition to the actual search
results. These include totals, unique values, or the average of a field.

#### Metric aggregation

This type of aggregation applies a mathematical formula to a field. A metric aggregation always has a calculated result.
These are aggregations to calculate sums or maximum values.

| Name | Description |
| :--- | :--- |
| avg | Average of all numeric values for the specified field |
| count | Number of records for the specified field |
| max | Highest value present in the specified field |
| min | Lowest value present in the specified field |
| stats | Provides metrics about numerical fields - max, min, avg, count |
| sum | Sum of all numeric values for the specified field |

#### Bucket aggregation

With this type of aggregation, a list of keys is determined. Further aggregations can then be determined for each key.

| Name | Description |
| :--- | :--- |
| entity | Groups the result for each value of the provided field and fetches the entities for this field |
| filter | Filter the aggregation result on a specified field |
| terms | Groups the result for each value of the provided field and fetches the count of affected documents |
| histogram | Groups the result for each value of the provided field and fetches the count of affected rows. Also allows for providing date interval (day, month, ...) |

#### Avg aggregation

The `Avg` aggregation makes it possible to calculate the average value for a field. The following SQL statement is
executed in the background: `AVG(price)`.

{% tabs %} {% tab title="PHP" %}

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

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

#### Count aggregation

The `count` aggregation makes it possible to determine the number of entries for a field that are filled with a value.
The following SQL statement is executed in the background: `COUNT(DISTINCT(manufacturerId))`.

{% tabs %} {% tab title="PHP" %}

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

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

#### Max aggregation

The `max` aggregation allows you to determine the maximum value of a field. The following SQL statement is executed in
the background: `MAX(price)`.

{% tabs %} {% tab title="PHP" %}

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

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

#### Min aggregation

The `min` aggregation makes it possible to determine the minimum value of a field. The following SQL statement is
executed in the background: `MIN(price)`

{% tabs %} {% tab title="PHP" %}

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

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

#### Sum aggregation

The `sum` aggregation makes it possible to determine the total of a field. The following SQL statement is executed in
the background: `SUM(price)`.

{% tabs %} {% tab title="PHP" %}

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

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

#### Stats aggregation

The `stats` aggregation makes it possible to calculate several values at once for a field. This includes the
previous `max`, `min`, `avg` and `sum` aggregation. The following SQL statement is executed in the
background: `SELECT MAX(price), MIN(price), AVG(price), SUM(price)`.

{% tabs %} {% tab title="PHP" %}

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

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

#### Terms aggregation

The `terms` aggregation allows you to determine the values of a field. The result contains each value once and how often
this value occurs in the result. The `terms` aggregation also supports the following parameters:

- `limit` - Defines a maximum number of entries to be returned (default: zero)
- `sort` - Defines the order of the entries. By default the following is not sorted
- `aggregation` - Enables you to calculate further aggregations for each key

The following SQL statement is executed in the
background: `SELECT DISTINCT(manufacturerId) as key, COUNT(manufacturerId) as count`

{% tabs %} {% tab title="PHP" %}

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
```

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

#### Filter aggregation

Unlike all other aggregations, the `filter` aggregation does not determine any result, it cannot be used alone. It is
only used to further filter the result of an aggregation in a `Criteria`. Filters defined inside the `filter` property
of this aggregation type, are only used when calculating this aggregation. The filters have no effect on other
aggregations or on the result of the search.

{% tabs %} {% tab title="PHP" %}

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

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

#### Entity aggregation

The `entity` aggregation is similar to the `terms` aggregation, it determines the unique values for a field. The
aggregation then uses the determined keys to load the defined entity. The keys are used here as IDs.

{% tabs %} {% tab title="PHP" %}

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

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

#### Histogram aggregation

The `histogram` aggregation is used as soon as the data to be determined refers to a date field. With the histogram
aggregation one of the following date intervals can be given: `minute`, `hour`, `day`, `week`, `month`, `quarter`
, `year`, `day`. This interval groups the result and calculates the corresponding count of hits.

{% tabs %} {% tab title="PHP" %}

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

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

#### Nesting aggregations

A metric aggregation calculates the value for a specific field. This can be a total or, for example, a minimum or
maximum value of the field. Bucket aggregations are different. This determines how often a value occurs in a search
result and returns it together with the count. The special thing about bucket aggregation is that it can contain further
aggregations. This allows the API to enable complex queries like for example:

- Calculate the number of manufacturers per category that have a price over 500 Euro.

{% tabs %} {% tab title="PHP" %}

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

{% endtab %} {% tab title="API" %}

```text
POST /api/v3/search/product
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

{% endtab %} {% endtabs %}

### Enriching results with associations

Associations allow you to select more than the data of just one entity when searching through the DAL. Assuming you've
already built a `Criteria` object for your search, an association can be added using the `addAssociation` method:

```php
$criteria->addAssociation('lineItems');
```

### Creating entities

You want to create a new entry for an existing entity in your plugin, e.g. adding a new tax rate upon installing your
plugin. All of the following methods are to be executed on the entities' respective repository.

#### Using create

The `create()` method is for creating new entities that do not exist yet.

- The first parameter `$data` is the payload to be written
- The second parameter `$context` is the context to be used when writing the data

The writing process works in batch and requires you to provide a list of data to be written. Even if you want to create
a single entity, it must be provided as an array containing a single item.

##### Single entity

```php
/** @var EntityRepositoryInterface $taxRepository */
$taxRepository = $this->container->get('tax.repository');

$taxRepository->create(
    [
        [ 'name' => '15% tax', 'taxRate' => 15 ],
    ],
    \Shopware\Core\Framework\Context::createDefaultContext()
);
```

##### Multiple entities

```php
/** @var EntityRepositoryInterface $taxRepository */
$taxRepository = $this->container->get('tax.repository');

$taxRepository->create(
    [
        [ 'name' => '15% tax', 'taxRate' => 15 ],
        [ 'name' => '25% tax', 'taxRate' => 25 ],
        [ 'name' => '35% tax', 'taxRate' => 35 ],
    ],
    \Shopware\Core\Framework\Context::createDefaultContext()
);
```

#### Using upsert

The `upsert()` method is a great way to ensure their data is persisted to the database, no matter if the record
previously existed or not. It combines both `create()` and `update()` and is mainly used for syncing data. If the
described record exists, it will be updated, otherwise it will be created. The method takes the same parameters as
the `create()` or
`update()` method. Make sure to have a look at the explanation on how to update entities via DAL below.

- The first parameter `$data` is the payload to be written
- The second parameter `$context` is the context to be used when writing the data

##### Single entity

```php
/** @var EntityRepositoryInterface $taxRepository */
$taxRepository = $this->container->get('tax.repository');

$taxRepository->upsert(
    [
        [ 'name' => 'I will be created' ],
    ],
    \Shopware\Core\Framework\Context::createDefaultContext()
);
```

##### Multiple entities

```php
/** @var EntityRepositoryInterface $taxRepository */
$taxRepository = $this->container->get('tax.repository');

$taxRepository->upsert(
    [
        [ 'id' => 'e163778197a24b61bd2ae72d006a6d3c', 'name' => 'I will have an updated name' ],
        [ 'name' => 'I am a new record' ],
    ],
    \Shopware\Core\Framework\Context::createDefaultContext()
);
```

If you provide an `id`, the system will try to update an existing record and if there is no record, it will be created
with the provided `id`. If you don't provide the `id`, a new record will always be created.

Note, that the container
instance, `$this->container in these cases, is not available in every case. Make sure to use the DI container to inject the respective repository into your service, if the container instance itself is not available in your code.`

##### Working with relations

A big advantage when using the DataAbstractionLayer is that you can provide an entire entity for the write. For example,
you can create a product including all relations and even create them in place, without having to create the related
records beforehand:

```php
/** @var EntityRepositoryInterface $productRepository */
$productRepository = $this->container->get('product.repository');

$productRepository->upsert(
    [
        [
            'name' => 'Example product',
            'price' => [['currencyId' => Defaults::CURRENCY, 'gross' => 15, 'net' => 10, 'linked' => false ]],
            'manufacturer' => [ 'name' => 'shopware AG' ],
            'tax' => [ 'name' => '19%', 'taxRate' => 19 ]
        ]
    ],
    Context::createDefaultContext()
);
```

The example above will create a new product with an auto-generated identifier. In addition, it creates a new
manufacturer named `shopware AG` and a new tax with a rate of `19%`.

You don't have to care about writing orders or foreign key constraints if your definition and the database is designed
correctly.

### Updating entities

The `update()` method is for updating existing entities and takes the same parameters as the `create()` method.

- The first parameter `$data` is the payload to be written
- The second parameter `$context` is the context to be used when writing the data

Keep in mind, that every top-level record needs an existing `id` property, otherwise, you'll get exceptions because of
the missing or non-existing records.

#### Single entity

```php
/** @var EntityRepositoryInterface $productRepository */
$productRepository = $this->container->get('product.repository');

$productRepository->update(
    [
        [ 'id' => 'e163778197a24b61bd2ae72d006a6d3c', 'name' => 'Updated name' ],
    ],
    \Shopware\Core\Framework\Context::createDefaultContext()
);
```

#### Multiple entities

```php
/** @var EntityRepositoryInterface $productRepository */
$productRepository = $this->container->get('product.repository');

$productRepository->update(
    [
        [ 'id' => 'e163778197a24b61bd2ae72d006a6d3c', 'name' => 'Updated name' ],
        [ 'id' => '11cf2cdd303c41d7bf66808bfe7769a5', 'name' => 'Another updated name' ],
        [ 'id' => 'a453634acb414768b2542ae9a57639b5', 'active' => 0, 'name' => 'Inactive product' ],
    ],
    \Shopware\Core\Framework\Context::createDefaultContext()
);
```

### Deleting entities

An entities respective repository always comes with a `delete` method, whose usage is as simple as this:

- The first parameter `$data` is the payload of the entity to be deleted, must only contain the ID
- The second parameter `$context` is the context to be used when deleting the data

#### Single entity

```php
/** @var EntityRepositoryInterface $productRepository */
$productRepository = $this->container->get('product.repository');
$productRepository->delete(
    [
        [ 'id' => 'e163778197a24b61bd2ae72d006a6d3c' ],
    ],
    \Shopware\Core\Framework\Context::createDefaultContext()
);
```

#### Multiple entities

```php
/** @var EntityRepositoryInterface $productRepository */
$productRepository = $this->container->get('product.repository');
$productRepository->delete(
    [
        [ 'id' => 'e163778197a24b61bd2ae72d006a6d3c' ],
        [ 'id' => 'c3d6a600d27ea2db16b42a791877361e' ],
    ],
    \Shopware\Core\Framework\Context::createDefaultContext()
);
```

#### Deleting entities without an ID

You might have noticed, that you're required to know an entities' ID in order to delete it. You can find a short
explanation on how to figure out an entities' ID in
our [Reading entities via DAL](/concepts/framework/data-abstraction-layer/entities.md#searching-entities-by-criteria)
section.

## Entity extension

If you're wondering how to extend existing core entities, this 'HowTo' will have you covered. Do not confuse entity
extensions with entities' custom fields though, as they serve a different purpose. In short: Extensions are technical
and not configurable by the admin user just like that. Also, they can deal with more complex types than scalar ones.
Custom fields are, by default, configurable by the admin user in the administration and they mostly support scalar
types, e.g. a text-field, a number field, or the likes.

### Extending an entity

Own entities can be integrated into the core via the corresponding entry in the `services.xml`. To extend existing
entities, the abstract class `\Shopware\Core\Framework\DataAbstractionLayer\EntityExtension` is used. The
EntityExtension must define which entity should be extended in the `getDefinitionClass` method. Once this extension is
accessed in the system, the extension can add more fields to it:

```php
<?php declare(strict_types=1);
namespace Swag\EntityExtension\Extension\Content\Product;
use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityExtension;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Runtime;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ObjectField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
class CustomExtension extends EntityExtension
{
    public function extendFields(FieldCollection $collection): void
    {
        $collection->add(
            (new ObjectField('custom_struct', 'customStruct'))->addFlags(new Runtime())
        );
    }
    public function getDefinitionClass(): string
    {
        return ProductDefinition::class;
    }
}
```

This example adds another association named `custom_struct` to the `ProductDefinition`. The `Runtime` flag tells the
data abstraction layer, that you're going to take care of the field's content yourself. Have a look at our detailed list
of [flags](/concepts/framework/data-abstraction-layer/entities.md#aggregations) and what their purpose is, or find out
which [field types](/concepts/framework/data-abstraction-layer/entities.md#searching-entities-by-criteria) are available
in Shopware 6. So, time to take care of the product entities' new field yourself. You're going to need a new subscriber
for this. Have a look here to find out how to properly add your own subscriber class.

```php
<?php declare(strict_types=1);
namespace Swag\EntityExtension\Subscriber;
use Swag\EntityExtension\Struct\MyCustomStruct;
use Shopware\Core\Content\Product\ProductEntity;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Core\Content\Product\ProductEvents;
class MySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ProductEvents::PRODUCT_LOADED_EVENT => 'onProductsLoaded'
        ];
    }
    public function onProductsLoaded(EntityLoadedEvent $event): void
    {
        /** @var ProductEntity $productEntity */
        foreach ($event->getEntities() as $productEntity) {
            $productEntity->addExtension('custom_struct', new MyCustomStruct());
        }
    }
}
```

As you can see, the subscriber listens to the `PRODUCT_LOADED` event, which is triggered every time a set of products is
requested. The listener `onProductsLoaded` then adds a custom struct into the new field. Content of the
respective `services.xml`:

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">
    <services>
        <service id="Swag\EntityExtension\Extension\Content\Product\CustomExtension">
            <tag name="shopware.entity.extension"/>
        </service>
        <service id="Swag\EntityExtension\Subscriber\MySubscriber">
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```

### Code examples

There's a GitHub repository available, containing this example source. Check it
out [here](https://github.com/shopware/swag-docs-entity-extension).

## Creating a custom entity

Quite often, your plugin has to save data into a custom database table. Shopware 6's data abstraction layer fully
supports custom entities, so you don't have to take care of the data handling at all.

### Plugin base class

The plugin base class registers your `services.xml` file by simply putting it into the proper
directory `<plugin root>/src/Resources/config/`. This way, Shopware 6 is able to automatically find and load
your `services.xml` file.

### The EntityDefinition class

The main entry point for custom entities is an `EntityDefinition` class. For more information about what
the `EntityDefinition` class does, have a look at the guide about the data abstraction layer. Your custom entity, as
well as your `EntityDefinition` and the `EntityCollection` classes, should be placed inside a folder named after the
domain it handles, e.g. "Checkout" if you were to include a Checkout entity. In this example, they will be put into a
directory called `src/Custom` inside of the plugin root directory.

```php
<?php declare(strict_types=1);
namespace Swag\CustomEntity\Custom;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
class CustomEntityDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'custom_entity';
    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }
    public function getCollectionClass(): string
    {
        return CustomEntityCollection::class;
    }
    public function getEntityClass(): string
    {
        return CustomEntity::class;
    }
    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            new StringField('technical_name', 'technicalName'),
        ]);
    }
}
```

As you can see, the `EntityDefinition` lists all available fields of your custom entity, as well as its name,
its `EntityCollection` class and its actual entity class. Keep in mind, that the return of your `getEntityName` method
will be used for two cases:

- The database table name
- The repository name in the DI container (`<the-name>.repository`)
  The methods `getCollectionClass` and `getEntityClass` are optional, **yet we highly recommend implementing them
  yourself in your entity definition**. The two missing classes, the `Entity` itself and the `EntityCollection`, will be
  created in the next steps.

### The entity class

The entity class itself is a simple value object, like a struct, which contains as much properties as fields in the
definition, ignoring the ID field.

```php
<?php declare(strict_types=1);
namespace Swag\CustomEntity\Custom;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;
class CustomEntity extends Entity
{
    use EntityIdTrait;
    /**
     * @var string
     */
    protected $technicalName;
    public function getTechnicalName(): string
    {
        return $this->technicalName;
    }
    public function setTechnicalName(string $technicalName): void
    {
        $this->technicalName = $technicalName;
    }
}
```

As you can see, it only holds the properties and its respective getters and setters, for the fields mentioned in
the `EntityDefinition` class.

### CustomEntityCollection

An `EntityCollection class is a class, whose main purpose it is to hold one or more of your entities, when they are
being read/searched. It will be automatically returned by the DAL when dealing with the custom entity repository.

```php
<?php declare(strict_types=1);
namespace Swag\CustomEntity\Custom;
use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;
/**
 * @method void              add(CustomEntity $entity)
 * @method void              set(string $key, CustomEntity $entity)
 * @method CustomEntity[]    getIterator()
 * @method CustomEntity[]    getElements()
 * @method CustomEntity|null get(string $key)
 * @method CustomEntity|null first()
 * @method CustomEntity|null last()
 */
class CustomEntityCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return CustomEntity::class;
    }
}
```

You should also add the annotation above the class to make sure your IDE knows how to properly handle your custom
collection. Make sure to replace every occurrence of `CustomEntity` in there with your actual entity class.

### Registering your custom entity

Now it's time to actually register your new entity in the DI container. All you have to do is to register
your `EntityDefinition` using the `shopware.entity.definition` tag. This is how your `services.xml` could look like:

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">
    <services>
        <service id="Swag\CustomEntity\Custom\CustomEntityDefinition">
            <tag name="shopware.entity.definition" entity="custom_entity"/>
        </service>
    </services>
</container>
```

### Creating the table

Basically that's it for your custom entity. Yet, there's a very important part missing: Creating the database table. As
already mentioned earlier, the database table **has to** be named after your chosen entity name. You should create the
database table using the plugin migration system. In short: Create a new directory named `src/Migration` in your plugin
root and add a migration class like this in there:

```php
<?php declare(strict_types=1);
namespace Swag\CustomEntity\Migration;
use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;
class Migration1552484872Custom extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1552484872;
    }
    public function update(Connection $connection): void
    {
        $sql = <<<SQL
CREATE TABLE IF NOT EXISTS `custom_entity` (
    `id` BINARY(16) NOT NULL,
    `technical_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3),
    PRIMARY KEY (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;
SQL;
        $connection->executeUpdate($sql);
    }
    public function updateDestructive(Connection $connection): void
    {
    }
}
```

### Dealing with your custom entity

Since the DAL automatically creates a repository for your custom entities, you can now ask the DAL to return some of
your custom data.

```php
/** @var EntityRepositoryInterface $customRepository */
$customRepository = $this->container->get('custom_entity.repository');
$customId = $customRepository->searchIds(
    (new Criteria())->addFilter(new EqualsFilter('technicalName', 'Foo')),
    Context::createDefaultContext()
)->getIds()[0];
```

In this example, the ID of your custom entity, whose technical name equals to 'FOO', is requested.

### Code examples

There's a GitHub repository available, containing this example source. Check it
out [here](https://github.com/shopware/swag-docs-custom-entity).
