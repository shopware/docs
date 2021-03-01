# Entities

## Core entities

Core entities are interacted with through CRUD (create, read, update, delete) operations. This is done using the
`EntityRepository` which provides an interface to the DAL.

## Reading entities by ID

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

## Searching entities by criteria

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

### Equals

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

### EqualsAny

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

### Contains

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

### Range

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

### Not

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

### Multi

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

## Aggregations

Aggregations allow you to determine further information about the overall result in addition to the actual search
results. These include totals, unique values, or the average of a field.

### Metric aggregation

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

### Bucket aggregation

With this type of aggregation, a list of keys is determined. Further aggregations can then be determined for each key.

| Name | Description |
| :--- | :--- |
| entity | Groups the result for each value of the provided field and fetches the entities for this field |
| filter | Filter the aggregation result on a specified field |
| terms | Groups the result for each value of the provided field and fetches the count of affected documents |
| histogram | Groups the result for each value of the provided field and fetches the count of affected rows. Also allows for providing date interval (day, month, ...) |

### Avg aggregation

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

### Count aggregation

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

### Max aggregation

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

### Min aggregation

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

## Sum aggregation

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

### Stats aggregation

The `stats` aggregation makes it possible to calculate several values at once for a field. This includes the
previous `max`, `min`, `avg` and `sum` aggregation. The following SQL statement is executed in the
background: `SELECT MAX(price), MIN(price), AVG(price), SUM(price)`.
