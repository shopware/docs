---
nav:
  title: Extending Migration
  position: 40

---

# Extending an Existing Migration

This section explains how to add new fields to an existing entity or introduce new entities to an existing component.

## Registering a New Extension Configurator

- Create a class extending `Shopware\Commercial\B2B\B2BSuiteMigration\Core\Domain\Extension\ExtensionConfigurator\AbstractB2BExtensionMigrationConfigurator`.
- Tag the class with `b2b.migration.configurator.extension` in the service definition.
- Specify the component to extend in the `getName` method.
- Provide the directory path to your XML configuration file in the `configPath` method.

  **Example**:

  ```XML
  <service id="MigrationExtension\B2BMigration\B2BExtensionMigrationConfigurator">
      <tag name="b2b.migration.configurator.extension"/>
  </service>
  ```

  ```PHP
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

## Adding new conditions to an existing entity

To add new conditions to an existing migration entity, you need to update the XML configuration.

### Update XML Configuration

   Define the new conditions in an XML file using the `<conditions>` element.
   **Example**:

   ```XML
   <migration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../../SwagCommercial/src/B2B/B2BSuiteMigration/Core/Resources/Schema/Xml/migration-extension-1.0.xsd">
       <entity>
           <name>migration_b2b_component_business_partner</name>
           <source>b2b_customer_data</source>
           <target>b2b_business_partner</target>
           <conditions>
             <condition>new_condition = value</condition>
             <condition>new_condition2 != value</condition>
           </conditions>
           <fields>
               ...
           </fields>
       </entity>
   </migration>
   ```

**Note**: The `<conditions>` element allows you to specify additional filtering criteria for the migration entity. Each `<condition>` can be a simple SQL condition that will be applied to the source data. All of these conditions will be merged with the existing conditions defined in the base migration entity.

## Adding New Fields to an Existing Entity

To add new fields to an existing migration entity, you need to update the XML configuration.

### Update XML Configuration

   Define the new fields in an XML file using the `<entity-extension>` element.
   **Example**:

   ```XML
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

   ```XML
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
