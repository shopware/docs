---
nav:
  title: Extending Migration
  position: 20

---

# Extending an Existing Migration

This section explains how to add new fields to an existing entity or introduce new entities to an existing component.

## Registering a New Extension Configurator

- Create a class extending `Shopware\Commercial\B2B\B2BSuiteMigration\Core\Domain\Extension\ExtensionConfigurator\AbstractB2BExtensionMigrationConfigurator`.
- Tag the class with `b2b.migration.configurator.extension` in the service definition.
- Specify the component to extend in the `getName` method.
- Provide the directory path to your XML configuration file in the `configPath` method.

  **Example**:

  ```xml
  <service id="MigrationExtension\B2BMigration\B2BExtensionMigrationConfigurator">
      <tag name="b2b.migration.configurator.extension"/>
  </service>
  ```

  ```php
  class B2BExtensionMigrationConfigurator extends AbstractB2BExtensionMigrationConfigurator
  {
    public function getName(): string
    {
        return 'employee_management';
    }

    public function configPath(): string
    {
        return __DIR__ . '/../../src/Resources/employee.xml';
    }
    ...
  }
  ```

  ::: info
  The other functions, such as `migrationProcess`, `conditions`, and `defaultValues` ... inside this class will have the same functionality as described at [here](adding-component.md); they will override the base functionality instead of replacing it.
  :::

## Adding New Fields to an Existing Entity

To add new fields to an existing migration entity, you need to update the XML configuration.

### Update XML Configuration

   Define the new fields in an XML file using the `<entity-extension>` element.
   **Example**:

   ```xml
   <migration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../../SwagCommercial/src/B2B/B2BSuiteMigration/Core/Resources/Schema/Xml/migration-extension-1.0.xsd">
       <entity-extension>
           <name>migration_b2b_component_business_partner</name>
           <fields>
               <field source="new_column" target="target_column"/>
           </fields>
       </entity-extension>
   </migration>
   ```

- **name**: Must match the entity name defined in the base migration (e.g., `migration_b2b_component_business_partner`).
- **fields**: Follow the same mapping logic as described in [Field Mapping Configuration](./adding-component.md#field-mapping-configuration) (e.g., one-to-one, relational, or handler-based mappings).

::: info
Adding fields extends the existing entity without altering its original mappings.
:::

## Adding a New Entity to an Existing Component

To introduce a new entity to an existing component, define the entity in the XML configuration and update the extension configurator.

### Update XML Configuration

   Define the new entity in the XML file using the `<entity>` element, similar to the base migration setup for [Entity](./adding-component.md#entity-definition).

   **Example**:

   ```xml
   <migration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../../SwagCommercial/src/B2B/B2BSuiteMigration/Core/Resources/Schema/Xml/migration-extension-1.0.xsd">
       <entity>
           <name>migration_b2b_component_customer_specific_features</name>
           <source>customer</source>
           <target>customer_specific_features</target>
           <fields>
               <field source="id.b2b_business_partner[customer_id].customer_id" target="customer_id"/>
               <field target="features" handler="Shopware\Commercial\B2B\B2BSuiteMigration\Components\EmployeeManagement\DataTransformer\CustomerSpecificFeature\CustomerSpecificFeaturesTransformer"/>
           </fields>
       </entity>
   </migration>
   ```

### Update Configurator

   Add the new entity name to the `migrationProcess` method in the `B2BExtensionMigrationConfigurator` class to include it in the migration process.

   **Example**:

   ```php
   protected function migrationProcess(): array
   {
       return [
           'migration_b2b_component_customer_specific_features',
           ...
       ];
   }
   ```
