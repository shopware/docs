---
nav:
  title: Handlers
  position: 30

---

# Handlers

This section guides developers on how to create and configure handlers for transforming data during the migration from B2B Suite to B2B Commercial. Handlers allow for custom logic to be applied to source data before it is mapped to target fields, enabling complex transformations and data processing.

## Handler-Based Transformation

As you notice, the previous examples of field mappings are straightforward. However, in some cases, you may need to apply custom logic to transform data before mapping it to the target field(s). This is where **handlers** come into play.

Handlers allow custom logic to transform data before mapping it to the target field(s). Handlers are PHP classes that process source data (if provided) and return values for the target field(s). A handler is specified in the XML configuration using the `handler` attribute within a `<field>` element, the value of which is the technical name of the handler class(It would be described in the section [How Handlers Work](#how-handlers-work)).

### 1. Options

- **With Source Field**:

     ```XML
     <field source="foo" target="permissions" handler="b2b.employee.employee_status_transformer"/>
     ```

     The handler takes the value of `foo` from the source table, applies transformation logic, and maps the result to `permissions`.

- **Without Source Field**:

     ```XML
     <field target="permissions" handler="b2b.employee.employee_status_transformer"/>
     ```

     The handler generates the value for `permissions` without requiring a source field, using custom logic.

### 2. Multiple Sources or Targets

- **Multiple Source Fields to One Target**:

     ```XML
     <field target="quote_number" handler="b2b.employee.employee_status_transformer">
         <source>currency_factor</source>
         <source>auth_id.b2b_store_front_auth.customer_id.customer.sales_channel_id.sales_channel.language_id</source>
         <source>auth_id.b2b_store_front_auth.customer_id.customer.sales_channel_id</source>
     </field>
     ```

     The handler processes multiple source fields (e.g., `currency_factor`, relational fields) to compute a single target value (`quote_number`).

- **Multiple Source Fields to Multiple Targets**:

     ```XML
     <field handler="b2b.employee.employee_status_transformer">
         <source>currency_factor</source>
         <source>auth_id.b2b_store_front_auth.customer_id.customer.sales_channel_id.sales_channel.language_id</source>
  
         <target>state_id</target>
         <target>expiration_date</target>
     </field>
     ```

     The handler processes multiple source fields and maps the results to multiple target fields (`state_id`, `expiration_date`).

- **Single Source Field to Multiple Targets**:

     ```XML
     <field source="converted_at" handler="b2b.employee.employee_status_transformer">
         <target>order_version_id</target>
         <target>order_id</target>
     </field>
     ```

     The handler transforms a single source field (`converted_at`) into multiple target fields (`order_version_id`, `order_id`).

## Handler Registration

To use a handler, implement a PHP class (e.g., `RolePermissionsTransformer`) that extends `Shopware\Commercial\B2B\B2BSuiteMigration\Core\Domain\DataTransformer\AbstractFieldTransformer` and tag it with `b2b.migration.transformer` in your service configuration.

```XML
<service id="Shopware\Commercial\B2B\B2BSuiteMigration\Components\QuoteManagement\DataTransformer\QuoteComment\StateTransformer" lazy="true">
    <argument type="service" id="Shopware\Core\Framework\Extensions\ExtensionDispatcher"/>

    <tag name="b2b.migration.transformer" />
</service>
```

The best practice is to mark this service as `lazy="true"` to improve performance by loading it only when needed.

## Handler Implementation

### Constructor

- Each handler must extend `AbstractFieldTransformer` and implement the required methods.
- Each handler's constructor must inject the `ExtensionDispatcher` service to allow for extension points and event handling.

```PHP
class StateTransformer extends AbstractFieldTransformer
{
    public function __construct(
        ExtensionDispatcher $extensions
    ) {
        parent::__construct($extensions);
    }
}
```

### Technical Name

Each handler must have to define a technical name in the `getName()` method, which is used in the XML configuration (`field` element's `handler` attribute). This name should be unique and descriptive. The `FieldTransformerRegistry` will use this name to identify and instantiate the handler during the migration process.

```PHP
...
public function getName(): string
{
    return 'b2b.employee.employee_status_transformer';
}
```

### Required Fields

Each handler must implement the `requiredFields` method to specify which source fields are required for the transformation.

```PHP
protected function requiredSourceFields(): array
{
  return ['foo', 'bar'];
}
```

**Example**:

1. If just one source field is required:

    ```XML
    <field source="foo" target="permissions" handler="b2b.employee.employee_status_transformer"/>
    ```
  
    ```PHP
    protected function requiredSourceFields(): array
    {
      return ['foo'];
    }
    ```

2. If multiple source fields are required:

    ```XML
    <field handler="b2b.employee.employee_status_transformer">
        <source>foo</source>
        <source>bar</source>
      
        <target>permissions</target>
    </field>
    ```
  
    ```PHP
    protected function requiredSourceFields(): array
    {
      return ['foo', 'bar'];
    }
    ```

### Transform Method

- Each handler must implement the `_transform` method with the following signature:

```PHP
protected function _transform(
    Field $field,
    array $sourceRecord,
): mixed
```

- **Parameters**:
  - **Field `$field`**: Represents the field configuration from the XML mapping. Use:
    - `$field->getSource()`: Retrieves the single source field name (if specified).
    - `$field->getSourceElements()`: Retrieves an array of source field names for multiple sources.
  - **array `$sourceRecord`**: Contains the data of the current record being migrated, with keys corresponding to source field names or relational paths.

- **Return Value**:
  - For a single target field: Return a single value (e.g., string, integer, or JSON-encoded string).
  - For multiple target fields: Return an associative array where keys are target field names and values are the corresponding transformed values.
  
#### Examples

**_Example 1: Single Source to Single Target_**

Transform a source field to determine an employee's status based on an `active` flag.

```XML
<entity>
  <name>migration_b2b_component_employee</name>
  <source>b2b_debtor_contact</source>
  <target>b2b_employee</target>
  <fields>
    <field source="active" target="status" handler="b2b.employee.employee_status_transformer"/>
  </fields>
</entity>
```

```PHP
public function transform(Field $field, array $sourceRecord): mixed
{
    $active = $sourceRecord[$field->getSource()] ?? 0;

    return $active ? EmployeeStatus::ACTIVE->value : EmployeeStatus::INACTIVE->value;
}
```

**Explanation**:

- The value of `$field->getSource()` is the plain string `active` - the column 'active' in the source table `b2b_debtor_contact`
- The value of this column `active` is retrieved from the `$sourceRecord` by using `$sourceRecord[$field->getSource()]`
- Checks if `$active` is truthy; returns `EmployeeStatus::ACTIVE->value` if true, or `EmployeeStatus::INACTIVE->value` if false.
- The handler returns a single value for the target field `status`.

**_Example 2: Multiple Sources to multiple Target_**
Transform multiple source fields to multiple target fields, such as generating an order ID and version ID.

```XML
<entity>
  <name>migration_b2b_component_quote_line_item</name>
  <source>b2b_line_item_reference</source>
  <target>quote_line_item</target>
  <fields>
    <field handler="b2b.quote_line_item.line_item_price_transformer">
      <source>list_id</source>
      <source>mode</source>
  
      <target>order_id</target>
      <target>order_version_id</target>
    </field>
  </fields>
</entity>
```

```PHP
public function transform(Field $field, array $sourceRecord): mixed
{
    ...
    if (!isset($field->getSourceElements()['list_id']) || !isset($field->getSourceElements()['mode'])) {
        // Handle missing required source fields
    }
    
    $listId = $sourceRecord['list_id'];
    $mode = $sourceRecord['mode'];
    // Perform transformation logic based on listId and mode
    return [
        'order_id' => $orderId,
        'order_version_id' => Uuid::fromHexToBytes(Defaults::LIVE_VERSION),
    ];
}
```

**Explanation**:

- `$field->getSourceElements()` retrieves the source fields `list_id` and `mode` which are present in the XML configuration - these are the columns in the source table `b2b_line_item_reference`.
- The handler retrieves values of 2 columns `list_id` and `mode` from source record of table `b2b_line_item_reference`.
- Returns an associative array with multiple target fields (`order_id`, `order_version_id`).

### Extending Handlers Transformation Logic

By default, handlers are designed to handle specific transformations. However, you can extend their functionality by subscribing to the corresponding event. We will publish the extension `B2BMigrationFieldTransformerExtension` (which is extended from `Shopware\Core\Framework\Extensions\Extension`) with the name is the technical name of the handler. This allows you to add custom logic to the transformation process without modifying the original handler code.
