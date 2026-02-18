---
nav:
  title: Error Resolution
  position: 75
---

# Error Resolution

The Error Resolution feature introduces a manual step in the migration workflow where users can review and fix
validation errors before the data is written to the target Shopware system. This prevents data loss and ensures
data integrity during migration.

## Key Components

| Component | Namespace | Purpose                                                                  |
|-----------|-----------|--------------------------------------------------------------------------|
| `MigrationEntityValidationService` | `Migration\Validation` | Validates entire converted entities including nested associations        |
| `MigrationFieldValidationService` | `Migration\Validation` | Validates individual field values using DAL field serializers            |
| `MigrationErrorResolutionService` | `Migration\ErrorResolution` | Loads and applies fixes from database to migration data                  |
| `MigrationFix` | `Migration\ErrorResolution` | Value object representing a single fix with path-based application logic |
| `ErrorResolutionController` | `Controller` | API controller providing validation and example value endpoints          |

## Migration Flow Integration

The Error Resolution step is a **manual step** in the migration workflow where the process pauses to allow users to
fix validation errors. Validation of the converted data itself is performed before this step, in the Fetching
step during conversion. If validation errors are found, they are stored in the database and can be retrieved and
fixed during the Error Resolution step.

```php
// SwagMigrationAssistant\Migration\Run\MigrationStep

enum MigrationStep: string
{
    case ERROR_RESOLUTION = 'error-resolution';

    case WAITING_FOR_APPROVE = 'waiting-for-approve';

    // ...

    final public const MANUAL_STEPS = [
        self::ERROR_RESOLUTION,
        self::WAITING_FOR_APPROVE,
    ];
}
```

The Error Resolution step is defined as a manual step, meaning:
- The migration process pauses at this step
- Users can review validation errors in the Administration UI
- Users can create fixes for fixable errors
- The migration resumes when the user continues to the writing phase

## Validation

The validation system validates converted migration data before it is written to Shopware. It operates at two levels:

### Entity Validation

Located at: `SwagMigrationAssistant\Migration\Validation\MigrationEntityValidationService`

This service validates complete entity structures including:

1. **Required Field Presence**: Checks if all required fields are present in the converted data
2. **Field Value Validation**: Validates each field value using DAL serializers if possible, or basic checks as a fallback
3. **Nested Association Validation**: Recursively validates nested entities

#### System Managed Fields

The following field types are automatically excluded from required field validation:

```php
private const SYSTEM_MANAGED_FIELDS = [
    CreatedAtField::class,
    UpdatedAtField::class,
    VersionField::class,
    ReferenceVersionField::class,
    TranslationsAssociationField::class,
];
```

#### Required Field Definition

Required fields are determined based on the entity definition and database schema. A field is considered required if:

- It is marked as `Required` in the entity definition
- It is not a system-managed field
- It is not nullable in the database schema
- It does not have a default value in the database schema
- It does not have a default value in the entity definition

### Field Validation

Located at: `SwagMigrationAssistant\Migration\Validation\MigrationFieldValidationService`

This service validates individual field values using Shopware's DAL field serializers and basic validation rules
for association fields. It provides detailed error information for each invalid field.

### Validation Log Types

| Log Class | User Fixable | Description |
|-----------|--------------|-------------|
| `MigrationValidationRequiredFieldMissingLog` | Yes          | Required field is missing from converted data |
| `MigrationValidationRequiredFieldValueInvalidLog` | Yes          | Required field has invalid value |
| `MigrationValidationOptionalFieldValueInvalidLog` | Yes          | Optional field has invalid value |
| `MigrationValidationAssociationInvalidLog` | Yes          | Association structure is invalid |
| `MigrationValidationRequiredTranslationInvalidLog` | No           | Translation structure is invalid |
| `MigrationValidationExceptionLog` | No           | Generic validation exception |

## Fix creation and storage

Fixes are stored in the `swag_migration_fix` table with the following structure:

```php
// SwagMigrationAssistant\Migration\ErrorResolution\Entity\SwagMigrationFixDefinition

class SwagMigrationFixDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'swag_migration_fix';

    // ...

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new IdField('connection_id', 'connectionId'))->addFlags(new Required()),
            (new AnyJsonField('value', 'value'))->addFlags(new Required()),
            (new StringField('path', 'path'))->addFlags(new Required()),
            new IdField('entity_id', 'entityId'),
            new StringField('entity_name', 'entityName'),
            new CreatedAtField(),
            new UpdatedAtField(),
        ]);
    }
}
```

### Fix Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | UUID | Unique identifier for the fix |
| `connectionId` | UUID | Reference to the migration connection |
| `value` | JSON | The fix value to apply (JSON encoded) |
| `path` | String | Dot-notation path to the field (e.g., `category.translations.name`) |
| `entityId` | UUID | ID of the entity being fixed |
| `entityName` | String | Name of the entity being fixed |

### MigrationFix Value Object

The `MigrationFix` value object encapsulates the fix data and provides methods to apply the fix to the converted
data based on the specified path.

```php
// SwagMigrationAssistant\Migration\ErrorResolution\MigrationFix

readonly class MigrationFix
{
    private const PATH_SEPARATOR = '.';

    public function __construct(
        public string $id,
        public string $value,
        public string $path,
    ) {}

    public static function fromDatabaseQuery(array $data): self;
    {
        // ...
    }

    public function apply(array &$item): void
    {
        // ...
    }
}
```

## Fix Application

The `MigrationErrorResolutionService` is responsible for loading fixes from the database and applying them to the
converted data before it is written to Shopware. It uses the `MigrationFix` value object to apply fixes based on
their defined paths.

#### Path Examples

The `MigrationFix::apply()` method uses dot-notation paths to apply fixes to nested data structures:

| Path | Target | Description |
|------|--------|-------------|
| `name` | `$item['name']` | Root level field |
| `translations.name` | `$item['translations'][*]['name']` | All translation names |
| `categories.translations.name` | `$item['categories'][*]['translations'][*]['name']` | Nested list traversal |
| `manufacturer.name` | `$item['manufacturer']['name']` | Single association |

### Integration with Writer

Fixes are applied before writing data to Shopware:

```php
// SwagMigrationAssistant\Migration\Service\MigrationDataWriter

class MigrationDataWriter implements MigrationDataWriterInterface
{
    // ...

    public function writeData(MigrationContextInterface $migrationContext, Context $context): int
    {
        // ...

        $convertedValues = array_values($converted);

        $this->errorResolutionService->applyFixes(
            $convertedValues,
            $migrationContext->getConnection()->getId(),
            $migrationContext->getRunUuid(),
            $context
        );

        $currentWriter->writeData($convertedValues, $this->writeContext);

        // ...
    }
}
```

## Extension Points

### Validation Events

- `MigrationPreValidationEvent`: Dispatched before an entity is validated. Allows modification of the validation context.
- `MigrationPostValidationEvent`: Dispatched after an entity is validated. Allows access to validation results.

### Error Resolution Events

- `MigrationPreErrorResolutionEvent`: Dispatched before fixes are applied to migration data. Allows modification of the error resolution context.
- `MigrationPostErrorResolutionEvent`: Dispatched after fixes are applied to migration data. Allows access to the modified data.

### Context Objects

#### MigrationValidationContext

```php
// SwagMigrationAssistant\Migration\Validation\MigrationValidationContext

readonly class MigrationValidationContext
{
    public function getContext(): Context;
    public function getMigrationContext(): MigrationContextInterface;
    public function getConvertedData(): array;
    public function getSourceData(): array;
    public function getEntityDefinition(): EntityDefinition;
    public function getValidationResult(): MigrationValidationResult;
}
```

#### MigrationErrorResolutionContext

```php
// SwagMigrationAssistant\Migration\ErrorResolution\MigrationErrorResolutionContext

class MigrationErrorResolutionContext
{
    public function getData(): array;
    public function setData(array $data): void;
    public function getFixes(): array;
    public function setFixes(array $fixes): void;
    public function getConnectionId(): string;
    public function getRunId(): string;
    public function getContext(): Context;
}
```
