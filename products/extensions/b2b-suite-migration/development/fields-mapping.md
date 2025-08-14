---
nav:
  title: Fields Mapping
  position: 20

---

# Fields Mapping

This section guides developers on how to create and configure field mappings for migrating data from B2B Suite to B2B Commercial.

## Fields

In the previous sections, we discussed how to create a component and its entities. Now, we will focus on how to define field mappings between source tables in B2B Suite and target tables in B2B Commercial.
**Example**:

```XML
<fields>
  <field source="customer_id" target="customer_id"/>
  <field source="created_at" target="created_at"/>
</fields>
```

## Field Mapping Configuration

Field mappings define how data is transferred from source tables in B2B Suite to target tables in B2B Commercial. These mappings are specified in the XML configuration within the `<fields>` element. This section explains the different mapping types and their syntax.

### One-to-One Mapping

A one-to-one mapping directly maps a field from the source table to a field in the target table.

**Example**:

```XML
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

```XML
<field source="context_owner_id.b2b_store_front_auth.customer_id" target="business_partner_customer_id"/>
```

**Explanation**:

Joins the source table to `b2b_store_front_auth` using `context_owner_id = b2b_store_front_auth.id`, then retrieves `customer_id` from `b2b_store_front_auth` and maps it to `business_partner_customer_id` in the target table.

#### 1. Basic Format

This is the example on how to define a basic relational mapping in the XML configuration:

```XML
<field source="foreign_field.foreign_table.field_of_foreign_table" target="target_field"/>
```

**Explanation**:

- `foreign_field`: The field in the source table used to join to the foreign table.
- `foreign_table`: The related table to join.
- `field_of_foreign_table`: The field to retrieve from the foreign table.
  
#### 2. Multiple Joins

Chain joins for deeper relationships

```XML
<field source="foo_id.foo.bar_id.bar.name" target="target_field"/>
```

**Explanation**:

Joins `source_table.foo_id` to `foo.id`, then `foo.bar_id` to `bar.id`, and retrieves `bar.name`.
  
#### 3. Custom Join Field

By default, joins use the `id` field of the foreign table. To use a different field, specify it in square brackets:  

```XML
<field source="foreign_field.foreign_table[custom_field].field_of_foreign_table" target="target_field"/>
```

**Explanation**:

Joins `source_table.foo_id` to `foo.custom_field` instead of `foo.id`.
  
::: info
Ensure the foreign key relationships are valid to avoid errors during migration.
:::

### Handler-Based Mapping

In some cases, you may need to apply custom logic to transform data before mapping it to the target field(s). This is where **handlers** come into play.
Let's continue with the next [section](./handler.md) to understand how handlers work and how to implement them in your migration process.
