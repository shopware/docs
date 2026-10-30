---
nav:
  title: Validating Writes
  position: 160

---

# Validating Writes

## Overview

This guide explains how to check data before the Data Abstraction Layer writes it to the database, and how to reject the write if the data breaks one of your rules.

## Prerequisites

This guide is built upon the [Plugin base guide](../../plugin-base-guide.md) and the guide about [Writing data](writing-data.md).
You should also know how to [listen to events](../event/listening-to-events.md).

::: info
`WriteOutcome` is available from Shopware 6.7.17.0.
:::

## Validating before the write

Before the DAL runs a write, it dispatches the `PreWriteValidationEvent` with all write commands of the request.
A subscriber can inspect them and add violations to the event.
If any check adds a violation, the whole write is rolled back and the API returns the errors.

## Checking each record, not each command

A single request can write the same record several times.
For example, a Sync request (`POST /api/_action/sync`) can contain several operations for the same product, and each operation becomes its own write command:

```json
[
    {
        "action": "upsert",
        "entity": "product",
        "payload": [{ "id": "0190d6c4a1b27c3f8e5d9a4b6c2f1e07", "stock": -5 }]
    },
    {
        "action": "upsert",
        "entity": "product",
        "payload": [{ "id": "0190d6c4a1b27c3f8e5d9a4b6c2f1e07", "isCloseout": true }]
    }
]
```

A check that looks at one command at a time sees a negative stock in the first command and the clearance sale flag in the second, but never both together.
To judge a record correctly, a check has to merge all writes to it in order, on top of the values already stored in the database.

`WriteOutcome` does this for you.
Its `resultingRows()` method takes the write commands of one entity and the columns your check needs, and returns one `OutcomeRow` per record, as the record will be after the write.
The stored values for all records are loaded in one query.

## Writing a check with `WriteOutcome`

The following check rejects a product on clearance sale (`is_closeout`) with a negative stock.
First, register the subscriber and inject `WriteOutcome`:

```php
// SwagBasicExample/src/Resources/config/services.php
<?php declare(strict_types=1);

use Shopware\Core\Framework\DataAbstractionLayer\Write\Validation\WriteOutcome;
use Swag\BasicExample\Subscriber\CloseoutStockValidator;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(CloseoutStockValidator::class)
        ->args([
            service(WriteOutcome::class),
        ])
        ->tag('kernel.event_subscriber');
};
```

Then the subscriber itself:

```php
// SwagBasicExample/src/Subscriber/CloseoutStockValidator.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Validation\PreWriteValidationEvent;
use Shopware\Core\Framework\DataAbstractionLayer\Write\Validation\WriteOutcome;
use Shopware\Core\Framework\Validation\WriteConstraintViolationException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;

class CloseoutStockValidator implements EventSubscriberInterface
{
    public function __construct(private readonly WriteOutcome $writeOutcome)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            PreWriteValidationEvent::class => 'validate',
        ];
    }

    public function validate(PreWriteValidationEvent $event): void
    {
        $commands = $event->getCommandsForEntity(ProductDefinition::ENTITY_NAME);

        foreach ($this->writeOutcome->resultingRows($commands, ['is_closeout', 'stock']) as $product) {
            $stock = (int) $product->getResultingValue('stock');
            if (!$product->getResultingValue('is_closeout') || $stock >= 0) {
                continue;
            }

            $violations = new ConstraintViolationList([
                new ConstraintViolation('A product on clearance sale must not have a negative stock.', null, [], null, '/stock', $stock),
            ]);

            $event->getExceptions()->add(new WriteConstraintViolationException($violations, $product->path));
        }
    }
}
```

For the Sync request above, `resultingRows()` returns the product with a stock of `-5` and the clearance sale flag set, so the request is rejected.

## Checking the stored record

Some checks need a record as it is stored before the write, for example to block deleting a record that is still in use, or to check who owns a record before it is changed.
`touchedRows()` returns one `OutcomeRow` for every record the request creates, updates or deletes, whatever columns its writes set.
Each row holds the stored values and the values after the write.

The following check blocks deleting a product that still has stock:

```php
public function validate(PreWriteValidationEvent $event): void
{
    $commands = $event->getCommandsForEntity(ProductDefinition::ENTITY_NAME);

    foreach ($this->writeOutcome->touchedRows($commands, ['stock']) as $product) {
        if (!$product->isDeleted || (int) $product->getStoredValue('stock') <= 0) {
            continue;
        }

        $violations = new ConstraintViolationList([
            new ConstraintViolation('A product with stock must not be deleted.', null, [], null, '/stock', null),
        ]);

        $event->getExceptions()->add(new WriteConstraintViolationException($violations, $product->path));
    }
}
```

### What an `OutcomeRow` offers

| Member                             | Description                                                                                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getResultingValue($column)`       | The column's value after the write: from the write if it sets the column, otherwise from the database. `null` for a column a new record leaves out, and for a deleted record.          |
| `getStoredValue($column)`          | The column's value in the database before the write. `null` for a record that is not stored.                                                                                           |
| `getPayloadValue($column)`         | The value the write sets for the column. `null` if the write does not set it.                                                                                                          |
| `payloadContainsAny(...$columns)`  | Whether the write sets any of the columns.                                                                                                                                             |
| `payloadContainsOnly(...$columns)` | Whether the write sets no other columns than these, for example only switches a record on or off. `false` for a deleted record.                                                        |
| `toResultingArray()`               | The primary key and the value of each requested column after the write.                                                                                                                |
| `toStoredArray()`                  | The primary key and the value of each requested column before the write.                                                                                                               |
| `isNew`                            | Whether the request creates the record.                                                                                                                                                |
| `isDeleted`                        | Whether the request deletes the stored record. Always `false` in rows from `resultingRows()`.                                                                                          |
| `path`                             | Where the record sits in the request, for example `/1/0` for the first row of the second Sync operation. Use it as the error path, so the API points at the right part of the request. |
| `primaryKey`                       | The record's primary key, keyed by column name, for example `['id' => <bytes>, 'version_id' => <bytes>]`.                                                                              |

## Worth knowing

* **Storage format:** columns are named as in the database, for example `is_closeout` instead of `isCloseout`.
  Values are stored values: ids are 16 binary bytes, JSON fields are JSON strings.
  Use `Uuid::fromBytesToHex()` to turn an id into its hex form.
* **Only requested columns:** `getResultingValue()`, `getStoredValue()` and `getPayloadValue()` throw for a column you didn't pass to `WriteOutcome`, even if the write sets it.
  `payloadContainsAny()` and `payloadContainsOnly()` work for any column.
  Both methods throw for an empty column list.
* **Only relevant records:** `resultingRows()` returns records that the write creates, or whose writes set one of the requested columns.
  An update that only renames a product is not part of the result when you ask for `is_closeout` and `stock`.
* **Deletes:** `resultingRows()` leaves out a record whose last write is a delete.
  Use `touchedRows()` to check deletes.
* **Deleted and created again:** a record the request deletes and then creates again is new in `resultingRows()`, without its stored values.
  In `touchedRows()` it is both new and deleted.
* **Custom fields:** a write that changes only some custom fields is merged into the stored custom fields, so `getResultingValue('custom_fields')` returns the full set.
