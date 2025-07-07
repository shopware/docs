---
nav:
  title: Adding Component
  position: 10

---

# Adding a New Component

This section guides developers on adding a new component to the migration process.

## Register a Migration Configurator

- Create a class extending `Shopware\Commercial\B2B\B2BSuiteMigration\Core\Domain\MappingConfigurator\AbstractB2BMigrationConfigurator`.
- Define the component name in lowercase snake_case in `getName()`.
- Specify the [XML mapping](#create-xml-mapping-file) path in `configPath()`.
- List entities in `baseMigrationProcesses()`, matching `<name>` in the XML mapping file.
- Optionally define `baseConditions()`, `baseDefaultValues()`, and `baseFallbackValues()`.
- Tag the class with `b2b.migration.configurator`.

   **Example**:

   ```xml
   <service id="Shopware\Commercial\B2B\B2BSuiteMigration\Components\EmployeeManagement\EmployeeManagementMigrationConfigurator">
      <tag name="b2b.migration.configurator" priority="9000"/>
   </service>
   ```

  ```php
  class EmployeeManagementMigrationConfigurator extends AbstractB2BMigrationConfigurator
  {
      public function getName(): string
      {
          return 'employee_management';
      }
  
      public function configPath(): string
      {
          return 'path/to/your/xml/mapping/file.xml';
      }
  
      protected function baseMigrationProcesses(): array
      {
          return [
              // should match the <name> in the XML mapping file
              'migration_b2b_component_business_partner',
          ];
      }
      ...
  }
   ```

## Create XML Mapping File

### Entity Definition

   ```xml
   <migration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../../Core/Resources/Schema/Xml/migration-1.0.xsd">
    <entity>
      <name>migration_b2b_component_business_partner</name>
      <source>b2b_customer_data</source>
      <source_primary_key>customer_id</source_primary_key>
      <target>b2b_business_partner</target>
      <target_primary_key>id</target_primary_key>
      <fields>
        ...
      </fields>
    </entity>
  </migration>
   ```

- **name**: Unique migration process identifier.
- **source**: Source table name.
- **source_primary_key**: Source table primary key (default: `id`).
- **target**: Target table name.
- **target_primary_key**: Target table primary key (default: `id`).

### Fields

```xml
<fields>
  <field source="customer_id" target="customer_id"/>
  <field source="created_at" target="created_at"/>
</fields>
```

- **fields**: Contains field mappings between source and target tables.
- **field**: Defines how to map fields from the source to the target.

## Field Mapping Configuration

Field mappings define how data is transferred from source tables in B2B Suite to target tables in B2B Commercial. These mappings are specified in the XML configuration within the `<fields>` element. This section explains the different mapping types and their syntax.

### One-to-One Mapping

A one-to-one mapping directly maps a field from the source table to a field in the target table.

**Example**:

```xml
<field source="customer_id" target="customer_id"/>
```

- **source**: The field name in the source table (e.g., `customer_id` in `b2b_customer_data`).
- **target**: The field name in the target table (e.g., `customer_id` in `b2b_business_partner`).

::: info
Use one-to-one mappings for straightforward field transfers where no transformation is needed.
:::  

### Relational Mapping

Relational mappings allow you to map a field from a related table by joining through foreign keys. This is useful when the source table references data in another table.

**Example**:

```xml
<field source="context_owner_id.b2b_store_front_auth.customer_id" target="business_partner_customer_id"/>
```

- **Explanation**: Joins the source table to `b2b_store_front_auth` using `context_owner_id = b2b_store_front_auth.id`, then retrieves `customer_id` from `b2b_store_front_auth` and maps it to `business_partner_customer_id` in the target table.

#### Syntax

**a. Basic Format**
  
- `foreign_field.foreign_table.field_of_foreign_table`
    - `foreign_field`: The field in the source table used to join to the foreign table.
    - `foreign_table`: The related table to join.
    - `field_of_foreign_table`: The field to retrieve from the foreign table.

**b. Multiple Joins**: Chain joins for deeper relationships:  

- `foreign_field.foreign_table.foreign_field_2.foreign_table_2.field_of_foreign_table`  
  **Example**:

  ```xml
  <field source="foo_id.foo.bar_id.bar.name" target="target_field"/>
  ```

  Joins `source_table.foo_id` to `foo.id`, then `foo.bar_id` to `bar.id`, and retrieves `bar.name`.

**c. Custom Join Field**

- By default, joins use the `id` field of the foreign table. To use a different field, specify it in square brackets:  
  `foreign_field.foreign_table[custom_field].field_of_foreign_table`  
  **Example**:

  ```xml
  <field source="foo_id.foo[custom_field].bar_id.bar.name" target="target_field"/>
  ```

  Joins `source_table.foo_id` to `foo.custom_field` instead of `foo.id`.

::: info
Ensure the foreign key relationships are valid to avoid errors during migration.
:::

## Handler-Based Transformation

Handlers allow custom logic to transform data before mapping it to the target field(s). Handlers are PHP classes that process source data (if provided) and return values for the target field(s).

### Options

- **With Source Field**:

     ```xml
     <field source="foo" target="permissions" handler="Shopware\Commercial\B2B\B2BSuiteMigration\Components\EmployeeManagement\DataTransformer\Role\RolePermissionsTransformer"/>
     ```

     The handler takes the value of `foo` from the source table, applies transformation logic, and maps the result to `permissions`.

- **Without Source Field**:

     ```xml
     <field target="permissions" handler="Shopware\Commercial\B2B\B2BSuiteMigration\Components\EmployeeManagement\DataTransformer\Role\RolePermissionsTransformer"/>
     ```

     The handler generates the value for `permissions` without requiring a source field, using custom logic.

### Multiple Sources or Targets

- **Multiple Source Fields to One Target**:

     ```xml
     <field target="quote_number" handler="Shopware\Commercial\B2B\B2BSuiteMigration\Components\QuoteManagement\DataTransformer\Quote\QuoteNumberTransformer">
         <source>currency_factor</source>
         <source>auth_id.b2b_store_front_auth.customer_id.customer.sales_channel_id.sales_channel.language_id</source>
         <source>auth_id.b2b_store_front_auth.customer_id.customer.sales_channel_id</source>
     </field>
     ```

     The handler processes multiple source fields (e.g., `currency_factor`, relational fields) to compute a single target value (`quote_number`).

- **Multiple Source Fields to Multiple Targets**:

     ```xml
     <field handler="Shopware\Commercial\B2B\B2BSuiteMigration\Components\QuoteManagement\DataTransformer\Quote\StateTransformer">
         <source>currency_factor</source>
         <source>auth_id.b2b_store_front_auth.customer_id.customer.sales_channel_id.sales_channel.language_id</source>
         <source>expired_at</source>
         <source>accepted_admin_at</source>
         <source>list_id.b2b_order_context.ordernumber</source>
         <target>state_id</target>
         <target>expiration_date</target>
     </field>
     ```

     The handler processes multiple source fields and maps the results to multiple target fields (`state_id`, `expiration_date`).

- **Single Source Field to Multiple Targets**:

     ```xml
     <field source="converted_at" handler="Shopware\Commercial\B2B\B2BSuiteMigration\Components\QuoteManagement\DataTransformer\Quote\OrderTransformer">
         <target>order_version_id</target>
         <target>order_id</target>
     </field>
     ```

     The handler transforms a single source field (`converted_at`) into multiple target fields (`order_version_id`, `order_id`).

## How Handlers Work

### Handler Registration

- To use a handler, implement a PHP class (e.g., `RolePermissionsTransformer`) that extends `Shopware\Commercial\B2B\B2BSuiteMigration\Core\Domain\DataTransformer\AbstractFieldTransformer` and tag it with `b2b.migration.transformer`.

::: info
Handlers are ideal for complex transformations, such as formatting data, combining fields, or applying business logic.
:::

### Handler Implementation

- Handlers implement their logic in the transform method, which processes source data and returns values for the target field(s). The method receives specific parameters to access source data and configuration details.

```php
public function transform(
    Field $field,
    array $sourceRecord,
    array $defaultValues = [],
    array $fallbackValues = []
): mixed
```

- **Parameters**:
  - **Field `$field`**: Represents the field configuration from the XML mapping. Use:
    - `$field->getSource()`: Retrieves the single source field name (if specified).
    - `$field->getSourceElements()`: Retrieves an array of source field names for multiple sources.
  - **array `$sourceRecord`**: Contains the data of the current record being migrated, with keys corresponding to source field names or relational paths.
  - **array `$defaultValues`**: Default values defined for the entity (see [Migration Conditions and Values Configuration](#set-default-values).
  - **array `$fallbackValues`**: Fallback values defined for invalid source data (see [Migration Conditions and Values Configuration](#set-fallback-values)).

- **Return Value**:
  - For a single target field: Return a single value (e.g., string, integer, or JSON-encoded string).
  - For multiple target fields: Return an associative array where keys are target field names and values are the corresponding transformed values.

### Key Points

- Handlers are referenced in the XML configuration using their fully qualified class name (e.g., `Shopware\Commercial\B2B\B2BSuiteMigration\Components\EmployeeManagement\DataTransformer\Role\RolePermissionsTransformer`).
- They are ideal for scenarios requiring data formatting, conditional logic, or combining multiple source fields.

::: info
Ensure the handler class is properly registered in your migration configurator and accessible within the application's namespace.
:::

### Examples

**_Example 1: Single Source to Single Target_**

Transform a source field to determine an employee's status based on an `active` flag.

```php
public function transform(Field $field, array $sourceRecord, array $defaultValues = [], array $fallbackValues = []): mixed
{
    $active = $sourceRecord[$field->getSource()] ?? 0;

    return $active ? EmployeeStatus::ACTIVE->value : EmployeeStatus::INACTIVE->value;
}
```

- **Explanation**:
  - Retrieves the source field value (e.g., `active`) using `$field->getSource()`.
  - Checks if `$active` is truthy; returns `EmployeeStatus::ACTIVE->value` if true, or `EmployeeStatus::INACTIVE->value` if false.
  - Returns a single value for the target field (e.g., `status`).

**_Example 2: Multiple Sources to Single Target_**

Transform multiple source fields to create a JSON-encoded discount structure.

```php
public function transform(Field $field, array $sourceRecord, array $defaultValues = [], array $fallbackValues = []): mixed
{
    ...
    
    return [
        'order_id' => $orderId,
        'order_version_id' => Uuid::fromHexToBytes(Defaults::LIVE_VERSION),
    ];
}
```

- **Explanation**:
  - Returns an associative array with multiple target fields (`order_id`, `order_version_id`).

## Define Conditions

- Conditions allow you to filter which records from the source table are included in the migration process. They are defined in the `baseConditions` method of the migration configurator class.

**Example**:

```php
protected function baseConditions(): array
{
    return [
        'migration_b2b_component_business_partner' => [
            'is_debtor = 1',
        ],
    ];
}
```

- **Explanation**: This filters records for the entity `migration_b2b_component_business_partner` (as defined in the XML configuration) to include only those where the `is_debtor` field equals `1`.
- **Key Points**:
  - The entity name must match the `<name>` specified in the XML `<entity>` block.
  - Conditions are written as SQL-like expressions (e.g., `is_debtor = 1`, `status != 'inactive'`).
  - Multiple conditions can be specified as an array for a single entity.

::: info
Ensure conditions are valid for the source table schema to avoid runtime errors.
:::

## Set Default Values

- Default values are assigned to target fields when no corresponding source data is mapped or when the source field is empty. They are defined in the `baseDefaultValues` method.

**Example**:

```php
protected function baseDefaultValues(): array
{
    return [
        'migration_b2b_component_employee' => [
            'language' => Uuid::fromHexToBytes(Defaults::LANGUAGE_SYSTEM),
        ],
        'migration_b2b_component_order_employee' => [
            'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
        ],
    ];
}
```

- **Explanation**:
  - For the `migration_b2b_component_employee` entity, the `language` field in the target table is set to the system default language UUID.
  - For the `migration_b2b_component_order_employee` entity, the `created_at` field is set to the current timestamp in `Y-m-d H:i:s` format.
- **Key Points**:
  - The entity name must match the XML configuration.
  - Default values are applied when no source field is defined

::: info
Use default values to ensure required fields in the target table are populated, even if source data is missing.
:::

## Set Fallback Values

- Fallback values are used when the source data is invalid or unacceptable (e.g., fails validation checks). They are defined in the `baseFallbackValues` method.

**Example**:

```php
protected function baseFallbackValues(): array
{
    return [
        'migration_b2b_component_employee' => [
            'language' => Uuid::fromHexToBytes(Defaults::LANGUAGE_SYSTEM),
        ],
        'migration_b2b_component_order_employee' => [
            'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
        ],
    ];
}
```

- **Explanation**:
  - If the `language` field for `migration_b2b_component_employee` contains an invalid value, it falls back to the system default language UUID.
  - If the `created_at` field for `migration_b2b_component_order_employee` is invalid, it falls back to the current timestamp.
- **Key Points**:
  - Fallback values are applied only when the source value exists but is deemed invalid by the migration logic.
  - The entity name must match the XML configuration.

::: info
 Fallback values help maintain data integrity by providing safe alternatives for problematic source data.
:::
