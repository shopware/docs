---
nav:
  title: Convert and Mapping
  position: 60
---

# Convert and Mapping

## Overview

Data gathered by `Reader` objects is transferred to `Converter` objects that put the data in a format Shopware 6 is able to work with. Simultaneously entries in the underlying mapping table are inserted to map the old identifiers to the new ones for future migrations. The mapping is saved for the current connection. After the migration, the converted data will be removed, and the mapping will stay persistent.

## Converter

Converters are registered in the service container:

```html
<service id="SwagMigrationAssistant\Profile\Shopware\Converter\ProductConverter"
         parent="SwagMigrationAssistant\Profile\Shopware\Converter\ShopwareConverter" abstract="true">
    <!-- ... -->
</service>
```

The converters have to extend the `ShopwareConverter` class and implement the `convert` method. This method will receive one data entry at a time. It will have to be returned in the right format to be usable for the `writer`.

```php
// SwagMigrationAssistant\Profile\Shopware\Converter\ProductConverter

abstract class ProductConverter extends ShopwareConverter
{
    // ...

    public function convert(
        array $data,
        Context $context,
        MigrationContextInterface $migrationContext
    ): ConvertStruct {
        $this->generateChecksum($data);

        // ...

        $converted = $this->getProductData($data, $converted);

        // ...

        $this->updateMainMapping($migrationContext, $context);

        // ...

        return new ConvertStruct($converted, $returnData, $mainMapping);
    }
}
```

As shown above, the `convert()` method accepts the source data, builds the necessary mappings, and returns a `ConvertStruct`. In a full implementation, converters do not perform validation of required or invalid fields. However, they should return early with a `ConvertStruct` that does not contain a converted entity if the data cannot reasonably be converted (for example, due to an unknown type).

Validation of the converted data is handled separately by the Error Resolution process, specifically through the `MigrationEntityValidationService` and the `MigrationFieldValidationService`.

Also, every `Converter` needs to implement the `getSourceIdentifier()` method like the below:

```php
// SwagMigrationAssistant\Profile\Shopware\Converter\ProductConverter

abstract class ProductConverter extends ShopwareConverter
{
    // ...

    public function getSourceIdentifier(array $data): string
    {
        return $data['detail']['ordernumber'];
    }
}
```

This is the main identifier of the incoming data, and it will be used to look for already migrated data \(which will be covered later in this chapter by the Deltas concept\).

## Mapping

Many entities rely on other entities, so they have to be converted in a specific order. Because of this and the Shopware Migration Assistant's ability to perform multiple migrations without resetting Shopware 6, source system identifiers must be mapped to their new counterparts. Find a mapping example in the following code snippet:

```php
// SwagMigrationAssistant\Profile\Shopware\Converter\ProductConverter

abstract class ProductConverter extends ShopwareConverter
{
    // ...

    private function getUuidForProduct(array &$data): array
    {
        $this->mainMapping = $this->mappingService->getOrCreateMapping(
            $this->connectionId,
            DefaultEntities::PRODUCT,
            $this->oldProductId,
            $this->context,
            $this->checksum
        );

        $converted = [];
        $converted['id'] = $this->mainMapping['entityId'];

        $mapping = $this->mappingService->getOrCreateMapping(
            $this->connectionId,
            DefaultEntities::PRODUCT_MAIN,
            $data['detail']['articleID'],
            $this->context,
            null,
            null,
            $converted['id']
        );

        // Take a look at the performance section below for details on this.
        $this->mappingIds[] = $mapping['id'];

        return $converted;
    }
}
```

The following function employs the `getOrCreateMapping()` function, which is part of the mapping service to acquire a unique identifier for the product that is about to get mapped to the source system's identifier and, at the same time, creating a new mapping entry in the `swag_migration_mapping` table. If there already is a unique identifier for the product, the `getOrCreateMapping()` method, instead of creating a duplicate entry, returns the existing identifier:

```php
// SwagMigrationAssistant\Migration\Mapping\MappingService

class MappingService implements MappingServiceInterface, ResetInterface
{
    // ...

    public function getOrCreateMapping(
        string $connectionId,
        string $entityName,
        string $oldIdentifier,
        Context $context,
        ?string $checksum = null,
        ?array $additionalData = null,
        ?string $uuid = null,
        ?string $entityValue = null,
    ): array {
        $mapping = $this->getMapping($connectionId, $entityName, $oldIdentifier, $context);

        if (!isset($mapping)) {
            return $this->createMapping($connectionId, $entityName, $oldIdentifier, $checksum, $additionalData, $uuid, $entityValue);
        }

        if ($additionalData !== null) {
            $mapping['additionalData'] = $additionalData;
        }

        if ($uuid !== null) {
            $mapping['entityId'] = $uuid;
        }

        if ($entityValue !== null) {
            $mapping['entityValue'] = $entityValue;
        }

        if (
            $uuid !== null
            || $additionalData !== null
            || $entityValue !== null
        ) {
            $this->saveMapping($mapping);
        }

        return $mapping;
    }
}
```

Sometimes it is not necessary to create a new identifier, and it may be enough to only get the mapping identifier. In the following example, there is an entity with a premapping and the converter simply uses the mapping service's `getMapping()` method:

```php
// SwagMigrationAssistant\Profile\Shopware\Converter\CustomerConverter

abstract class CustomerConverter extends ShopwareConverter
{
    // ...

    protected function getDefaultPaymentMethod(array $originalData): ?string
    {
        $paymentMethodMapping = $this->mappingService->getMapping(
            $this->connectionId,
            PaymentMethodReader::getMappingName(),
            $originalData['id'],
            $this->context
        );

        if ($paymentMethodMapping === null) {
            $this->loggingService->log(
                MigrationLogBuilder::fromMigrationContext($this->migrationContext)
                    ->withEntityName(CustomerDefinition::ENTITY_NAME)
                    ->withFieldName('defaultPaymentMethodId')
                    ->withFieldSourcePath('default_payment_method')
                    ->withSourceData($originalData)
                    ->build(ConvertEntityUnknownLog::class)
            );

            return null;
        }

        $this->mappingIds[] = $paymentMethodMapping['id'];

        return $paymentMethodMapping['entityId'];
    }
}
```

The `getMapping()` method only fetches the identifier from the database and doesn't create a new one:

```php
// SwagMigrationAssistant\Migration\Mapping\MappingService

class MappingService implements MappingServiceInterface, ResetInterface
{
    // ...

    public function getMapping(
        string $connectionId,
        string $entityName,
        string $oldIdentifier,
        Context $context,
    ): ?array {
        $cacheKey = $entityName . $oldIdentifier;
        if (isset($this->mappings[$cacheKey])) {
            return $this->mappings[$cacheKey];
        }

        $sql = 'SELECT id,
                       connection_id AS connectionId,
                       entity,
                       old_identifier AS oldIdentifier,
                       entity_id AS entityId,
                       entity_value AS entityValue,
                       checksum,
                       additional_data AS additionalData
                FROM swag_migration_mapping
                WHERE connection_id = :connectionId
                    AND entity = :entity
                    AND old_identifier = :oldIdentifier;';

        $mapping = $this->connection->fetchAssociative($sql, ['connectionId' => Uuid::fromHexToBytes($connectionId), 'entity' => $entityName, 'oldIdentifier' => $oldIdentifier]);

        if ($mapping === false) {
            return null;
        }

        $mapping['id'] = Uuid::fromBytesToHex($mapping['id']);
        $mapping['connectionId'] = Uuid::fromBytesToHex($mapping['connectionId']);
        $mapping['entityId'] = $mapping['entityId'] === null ? null : Uuid::fromBytesToHex($mapping['entityId']);

        if (!empty($mapping['additionalData'])) {
            $mapping['additionalData'] = \json_decode($mapping['additionalData'], true, 512, \JSON_THROW_ON_ERROR);
        } else {
            $mapping['additionalData'] = null;
        }

        $mapping['oldIdentifier'] = $mapping['oldIdentifier'] === null ? null : (string) $mapping['oldIdentifier'];
        $mapping['entityValue'] = $mapping['entityValue'] === null ? null : (string) $mapping['entityValue'];
        $mapping['checksum'] = $mapping['checksum'] === null ? null : (string) $mapping['checksum'];

        $this->mappings[$cacheKey] = $mapping;

        return $mapping;
    }
}
```

## Deltas

One of the parameters for the `getOrCreateMapping()` Method is the `checksum`. It is used to identify unchanged data \(source system data that has not been changed since the last migration\). This will greatly improve the performance of future migrations.

To get this checksum, you can use the `generateChecksum()` method of the base `Converter` class:

```php
// SwagMigrationAssistant\Migration\Converter\Converter

abstract class Converter implements ConverterInterface
{
   // ...

    /**
     * Generates a unique checksum for the data array to recognize changes
     * on repeated migrations.
     *
     * @param array<mixed> $data
     */
    protected function generateChecksum(array $data): void
    {
        $this->checksum = Hasher::hash(\serialize($data));
    }
}
```

This is used in the first line of the converter with the raw data that comes from the `Reader` object:

```php
// SwagMigrationAssistant\Profile\Shopware\Converter\ProductConverter

abstract class ProductConverter extends ShopwareConverter
{
    // ...

    public function convert(
        array $data,
        Context $context,
        MigrationContextInterface $migrationContext
    ): ConvertStruct {
        $this->generateChecksum($data);

        // ...
    }
}
```

For the checksum to be saved to the right mapping, make sure that you set the `mainMapping` attribute of the base `Converter` class. Internally the checksum of the main mapping of an entity will be compared to the incoming data checksum and if it is the same, it will be skipped by the converter and also by the writer \(you will not receive the data with the same checksum in your converter\), which increases the performance of repeated migrations massively. For more information, look at the corresponding `filterDeltas()` method in the `MigrationDataConverter` class. Important for the delta concept is to return the `mainMapping` with the `ConvertStruct`. This is necessary to map the converted data to the main mapping entry.

## Additional performance tips

The `Converter` base class also contains an array named `mappingIds`. This can be filled with all mapping IDs related to the current data. Internally the related mappings will be fetched all at once in future migrations, which reduces the performance impact of `getMapping()` calls \(because not every call needs to query data from the database\). So it is advised to add related mapping IDs in the following manner:

```php
// SwagMigrationAssistant\Profile\Shopware\Converter\ProductConverter

abstract class ProductConverter extends ShopwareConverter
{
    // ...

    private function getUnit(array $data): array
    {
        $unit = [];
        $mapping = $this->mappingService->getOrCreateMapping(
            $this->connectionId,
            DefaultEntities::UNIT,
            $data['id'],
            $this->context
        );
        $unit['id'] = $mapping['entityId'];
        $this->mappingIds[] = $mapping['id'];

        $this->applyUnitTranslation($unit, $data);
        $this->convertValue($unit, 'shortCode', $data, 'unit');
        $this->convertValue($unit, 'name', $data, 'description');

        return $unit;
    }
}
```

To save these mapping IDs in the `mainMapping`, it is necessary to call the `updateMainMapping()` before returning the `ConvertStruct`:

```php
// SwagMigrationAssistant\Profile\Shopware\Converter\ProductConverter

abstract class ProductConverter extends ShopwareConverter
{
    // ...

    public function convert(
        array $data,
        Context $context,
        MigrationContextInterface $migrationContext
    ): ConvertStruct {
        // ...

        $this->updateMainMapping($migrationContext, $context);

        $mainMapping = $this->mainMapping['id'] ?? null;

        return new ConvertStruct($converted, $returnData, $mainMapping);
    }
}
```
