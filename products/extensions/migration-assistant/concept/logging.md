---
nav:
  title: Logging
  position: 70

---

# Logging

Logging is essential for migration runs. It explains why data could not be converted or written and provides the basis for Error Resolution in Administration.

Logging is based on `MigrationLogEntry` objects created through `MigrationLogBuilder`.

```php
// SwagMigrationAssistant\Profile\Shopware\Converter\CustomerConverter

abstract class CustomerConverter extends ShopwareConverter
{
    // ...

    public function convert(
        array $data,
        Context $context,
        MigrationContextInterface $migrationContext
    ): ConvertStruct {
        if (!isset($data['_locale']) || $data['_locale'] === '') {
            $this->loggingService->log(
                MigrationLogBuilder::fromMigrationContext($migrationContext)
                    ->withEntityName(CustomerDefinition::ENTITY_NAME)
                    ->withFieldSourcePath('_locale')
                    ->withSourceData($data)
                    ->build(ConvertSourceDataIncompleteLog::class)
            );

            return new ConvertStruct(null, $data);
        }

        // ...
    }
}
```

The logging service interface uses `log()` and `flush()`. The `log()` method will and your log to the service buffer and `flush()` will write every log entry in the buffer to the database. This allows you to log entries during the conversion process and decide when to write them to the database. Additionally, the logging service will flush automatically after a threshold of `50` entries is reached to prevent missing logs.

```php
// SwagMigrationAssistant\Migration\Logging\LoggingServiceInterface

interface LoggingServiceInterface
{
    // ...

    public function log(MigrationLogEntry $logEntry): self;

    public function flush(): void;
}
```

To create a custom log entry, extend `AbstractMigrationLogEntry` and define static metadata:

```php
// SwagMigrationAssistant\Migration\Logging\Log\ConvertSourceDataIncompleteLog

readonly class ConvertSourceDataIncompleteLog extends AbstractMigrationLogEntry
{
    public static function isUserFixable(): bool
    {
        return false;
    }

    public static function getLevel(): string
    {
        return self::LOG_LEVEL_WARNING;
    }

    public static function getCode(): string
    {
        return 'SWAG_MIGRATION_CONVERT_SOURCE_DATA_INCOMPLETE';
    }
}
```

Key element is `getCode()`: it must remain stable and generic so that log entries can be grouped reliably.
To ensure clarity and uniqueness, use the following naming convention for the code:
`SWAG_MIGRATION_{Category}{Description}{Outcome}Log`

- Category should clearly relate to the migration step, e.g., Fetch, Convert, Write, Media, etc.
- Description should briefly describe the context, e.g., SourceData, MimeType, etc.
- Outcome should indicate the result or issue, e.g., Incomplete, Invalid, Missing, etc.

The `isUserFixable()` method indicates whether the log entry can be resolved by the user in Administration. If it returns `true`, it will be possible for the user to create a fix during the Error Resolution process. Have in mind that this is only the first step to enable user fixes. The actual fix, creation must be implemented separately in the administration.
