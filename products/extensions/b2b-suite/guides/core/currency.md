# Currency

## Introduction

The Currency component provides the means for currency calculation in the B2B Suite. The following graph shows components depending on this component:

![image](../../../../../.gitbook/assets/currency-usage.svg)

## Context

The Currency component provides an additional Context object (`Shopware\B2B\Currency\Framework\CurrencyContext`) containing a currency factor.
You can retrieve the default Context, which always contains the currently selected currency factor through the `Shopware\B2B\Currency\Framework\CurrencyService`.

```php
<?php declare(strict_types=1);

use Shopware\B2B\Currency\Framework\CurrencyContext;
use Shopware\B2B\Currency\Framework\CurrencyService;

class TestController
{
    private CurrencyService $currencyService;

    public function __construct(
        CurrencyService $currencyService
    ) {
        $this->currencyService = $currencyService;
    }

    public function testAction(): array
    {
        return [
            'currencyContext' => $this->currencyService->createCurrencyContext(),
        ];
    }
```

This way, you can either store the currency factor with a newly provided amount or retrieve recalculated data from your repository.

## Entity

All recalculable entities must implement the interface `Shopware\B2B\Currency\Framework\CurrencyAware`, which provides the means to access the currency data.

```php
use Shopware\B2B\Currency\Framework\CurrencyAware;

class MyEntity implements CurrencyAware
{
    public float $amount1;

    public float $amount2;

    private float $factor;

    public function getCurrencyFactor(): float
    {
        return $this->factor;
    }

    public function setCurrencyFactor(float $factor)
    {
        $this->factor = $factor;
    }

    /**
     * @return string[]
     */
    public function getAmountPropertyNames(): array
    {
        return [
            'amount1',
            'amount2',
        ];
    }
}
```

## Repository

The repository has to guarantee that every entity retrieved from storage has valid and, if necessary, recalculated money values.
The Currency component provides `Shopware\B2B\Currency\Framework\CurrencyCalculator` to help with this promise.
So a typical repository looks like this:

```php
<?php declare(strict_types=1);

use Shopware\B2B\Currency\Framework\CurrencyCalculator;

class Repository
{
    private CurrencyCalculator $currencyCalculator;

    public function __construct(
        CurrencyCalculator $currencyCalculator
    ) {
        $this->currencyCalculator = $currencyCalculator;
    }
}
```

### Calculating in PHP (preferred)

To recalculate an entity amount, the calculator provides two convenient functions.

* `recalculateAmount` for a single entity:

```php
    public function fetchOneById(int $id, CurrencyContext $currencyContext): CurrencyAware
    {
        [...] // load entity from Database

        $this->currencyCalculator->recalculateAmount($entity, $currencyContext);

        return $entity;
    }
```

* `recalculateAmounts` to recalculate an array of entities:

```php
    public function fetchList([...], CurrencyContext $currencyContext): array
    {
        [...] // load entities from Database

        //recalculate with the current amount
        $this->>currencyCalculator->recalculateAmounts($entities, $currencyContext);

        return $entities;
    }
```

### Calculating in SQL

Although calculation in PHP is the preferred way, it may sometimes be necessary to recalculate the amounts in SQL.
This is the case if you, for example, use a `GROUP BY` statement and try to create a sum.
For this case, the Currency component creates a SQL calculation snippet.

So if your original snippet looked like this:

```php
    public function fetchAmount(int $budgetId): float
    {
        return (float) $this-connection->fetchColumn(
            'SELECT SUM(amount) AS sum_amount FROM b2b_budget_transaction WHERE budget_id=:budgetId',
            ['budgetId' => $budgetId]
        )
    }
```

But it should actually look like this:

```php
    public function fetchAmount(int $budgetId, CurrencyContext $currencyContext): float
    {
        $transactionSnippet = $this->currencyCalculator
            ->getSqlCalculationPart('amount', 'currency_factor', $currencyContext);

        return (float) $this-connection->fetchColumn(
            'SELECT SUM(' . $transactionSnippet . ') AS sum_amount FROM b2b_budget_transaction WHERE budget_id=:budgetId',
            ['budgetId' => $budgetId]
        )
    }
```
