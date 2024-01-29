---
nav:
  title: Filters Reference
  position: 30

---

# Filters Reference

| Name | Notes |
| :--- | :--- |
| equals | Exact match for the given value |
| equalsAny | At least one exact match for a value of the given list |
| contains | Before and after wildcard search for the given value |
| range | For range compatible fields like numbers or dates |
| not | Allows to negate a filter |
| multi | Allows to combine different filters |
| prefix | Before wildcard search for the given value |
| suffix | After wildcard search for the given value |

## Equals

The `Equals` filter allows you to check fields for an exact value. The following SQL statement is executed in the background: `WHERE stock = 10`.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->addFilter(new EqualsFilter('stock', 10));
```
</Tab>

<Tab title="API Criteria">

```javascript
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
</Tab>
</Tabs>

## EqualsAny

The `EqualsAny` filter allows you to filter a field where at least one of the defined values matches exactly. The following SQL statement is executed in the background: `WHERE productNumber IN ('3fed029475fa4d4585f3a119886e0eb1', '77d26d011d914c3aa2c197c81241a45b')`.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->addFilter(
    new EqualsAnyFilter('productNumber', ['3fed029475fa4d4585f3a119886e0eb1', '77d26d011d914c3aa2c197c81241a45b'])
);
```
</Tab>

<Tab title="API Criteria">

```json
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
</Tab>
</Tabs>

## Contains

The `Contains` Filter allows you to filter a field to an approximate value, where the passed value must be contained as a full value. The following SQL statement is executed in the background: `WHERE name LIKE '%Lightweight%'`.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->addFilter(new ContainsFilter('name', 'Lightweight'));
```
</Tab>

<Tab title="API Criteria">

```json
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
</Tab>
</Tabs>

## Range

The `Range` filter allows you to filter a field to a value space. This can work with date or numerical values. Within the `parameter` property the following values are possible:

* `gte` =&gt; Greater than equals
* `lte` =&gt; Less than equals
* `gt` =&gt; Greater than
* `lt` =&gt; Less than

The following SQL statement is executed in the background: `WHERE stock >= 20 AND stock <= 30`.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->addFilter(
    new RangeFilter('stock', [
        RangeFilter::GTE => 20,
        RangeFilter::LTE => 30
    ])
);
```
</Tab>

<Tab title="API Criteria">

```json
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
</Tab>
</Tabs>

## Not

The `Not` Filter is a container which allows to negate any kind of filter. The `operator` allows you to define the combination of queries within the NOT filter \(`OR` and `AND`\). The following SQL statement is executed in the background: `WHERE !(stock = 1 OR availableStock = 1) AND active = 1`:

<Tabs>
<Tab title="PHP Criteria">

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
</Tab>

<Tab title="API Criteria">

```json
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
</Tab>
</Tabs>

## Multi

The `Multi` Filter is a container, which allows to set logical links between filters. The `operator` allows you to define the links between the queries within the `Multi` filter \(`OR` and `AND`\). The following SQL statement is executed in the background: `WHERE (stock = 1 OR availableStock = 1) AND active = 1`.

<Tabs>
<Tab title="PHP Criteria">

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
</Tab>

<Tab title="API Criteria">

```javascript
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
</Tab>
</Tabs>

## Prefix

The `Prefix` Filter allows you to filter a field to an approximate value, where the passed value must be the start of a full value. The following SQL statement is executed in the background: `WHERE name LIKE 'Lightweight%'`.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->addFilter(new PrefixFilter('name', 'Lightweight'));
```
</Tab>

<Tab title="API Criteria">

```json
{
    "filter": [
        {
            "type": "prefix",
            "field": "name",
            "value": "Lightweight"
        }
    ]
}
```
</Tab>
</Tabs>

## Suffix

The `Suffix` Filter allows you to filter a field to an approximate value, where the passed value must be the end of a full value. The following SQL statement is executed in the background: `WHERE name LIKE '%Lightweight'`.

<Tabs>
<Tab title="PHP Criteria">

```php
$criteria = new Criteria();
$criteria->addFilter(new SuffixFilter('name', 'Lightweight'));
```
</Tab>

<Tab title="API Criteria">

```json
{
    "filter": [
        {
            "type": "suffix",
            "field": "name",
            "value": "Lightweight"
        }
    ]
}
```
</Tab>
</Tabs>
