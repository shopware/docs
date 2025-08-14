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
- Tag the class with `b2b.migration.configurator`.
   **Example**:

   ```XML
   <service id="Shopware\Commercial\B2B\B2BSuiteMigration\Components\EmployeeManagement\EmployeeManagementMigrationConfigurator">
      <tag name="b2b.migration.configurator" priority="9000"/>
   </service>
   ```

  ```PHP
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
    ...
  }
  ```
  
  - The `priority` attribute in the tag determines the order of execution among multiple configurator. Higher values execute first.
    :::info
    You can run this command to see the order of execution:

    ```bash
    php bin/console debug:container --tag=b2b.migration.configurator
    ```

    The default priorities for existing configurator are:
    - `EmployeeManagementMigrationConfigurator` has a priority of `9000`.
    - `QuoteB2BMigrationConfigurator` has a priority of `8000`.
    - `ShoppingListMigrationConfigurator` has a priority of `7000`.
    :::
  
## Create XML Mapping File

### Entity Definition

   ```XML
   <migration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../../Core/Resources/Schema/Xml/migration-1.0.xsd">
    <entity>
      <name>migration_b2b_component_business_partner</name>
      <source>b2b_customer_data</source>
      <source_primary_key>customer_id</source_primary_key>
      <target>b2b_business_partner</target>
      <target_primary_key>id</target_primary_key>
      <conditions>
        <condition>foo = bar</condition>
      </conditions>
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
- **conditions**: Optional conditions to filter source records (see [Conditions](#conditions)).
- **fields**: Field mappings between source and target tables (see [Field Mapping Configuration](./fields-mapping.md)).

## Conditions

```XML
<conditions>
    <condition>foo = bar</condition>
</conditions>
```

- Conditions allow you to filter which records from the source table are included in the migration process. They are defined in `<condition>` elements within the `<conditions>` block of the XML configuration for each entity.

**Example**:

```XML
<entity>
  <name>migration_b2b_component_business_partner</name>
  <source>b2b_customer_data</source>
  <target>b2b_business_partner</target>
  ...
  <conditions>
    <condition>is_debtor = 1</condition>
  </conditions>
  ...
</entity>
```

- **Explanation**: This filters the records from the `b2b_customer_data` source table (as specified in the XML configuration) to include only entries where the `is_debtor` field is set to `1`.
- **Key Points**:
  - Conditions are written as SQL-like expressions (e.g., `is_debtor = 1`, `status != 'inactive'`).
  - Multiple conditions can be specified, and they are combined with `AND` logic.

::: info
Ensure conditions are valid for the source table schema to avoid runtime errors.
:::
