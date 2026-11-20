---
nav:
  title: CreatedByField and UpdatedByField Reference
  position: 110

---

# CreatedByField and UpdatedByField Reference

`CreatedByField` and `UpdatedByField` store the ID of the Administration user who created or last updated an entity. This page explains when the Data Abstraction Layer (DAL) fills these fields, why they are often `null`, how to read the related user, and what happens when that user is deleted. The `customer` and `order` entities are used as examples.

## Field definition

Both fields extend `FkField` and reference the `user` entity:

| Field            | Storage name    | Property name |
| :--------------- | :-------------- | :------------ |
| `CreatedByField` | `created_by_id` | `createdById` |
| `UpdatedByField` | `updated_by_id` | `updatedById` |

The constructor accepts a list of context scopes in which the field is written. The default is `[Context::SYSTEM_SCOPE]`. When the constructor is called without arguments and the `v6.8.0.0` feature flag is active, the default becomes `[Context::SYSTEM_SCOPE, Context::CRUD_API_SCOPE]`. When the flag is not active, calling the constructor without arguments triggers a deprecation notice, except when the `TESTS_RUNNING` environment variable is set. Pass the scopes explicitly to keep a stable behavior.

`CustomerDefinition` and `OrderDefinition` declare the same fields, pass both scopes explicitly, and add a `ManyToOneAssociationField` to the user for each field. This is the declaration in `CustomerDefinition`:

```php
(new CreatedByField([Context::SYSTEM_SCOPE, Context::CRUD_API_SCOPE]))->addFlags(new ApiAware()),
(new UpdatedByField([Context::SYSTEM_SCOPE, Context::CRUD_API_SCOPE]))->addFlags(new ApiAware()),
new ManyToOneAssociationField('createdBy', 'created_by_id', UserDefinition::class, 'id', false),
new ManyToOneAssociationField('updatedBy', 'updated_by_id', UserDefinition::class, 'id', false),
```

## When the fields are written

The DAL processes both fields on every write, even when the payload doesn't contain them.

### CreatedByField

`createdById` is written only when the entity is created. The serializer checks these conditions in order:

1. If the entity already exists, nothing is written.
2. If the context scope isn't in the allowed scopes of the field, nothing is written. This also applies to a value passed in the payload.
3. If the payload contains a value, that value is written.
4. If the context isn't in the live version, nothing is written.
5. If the context source is an `AdminApiSource` with a user ID, that user ID is written.

### UpdatedByField

`updatedById` is written only when an existing entity is updated, the context scope is allowed, and the context source is an `AdminApiSource`. The user ID of the source replaces any value passed in the payload. When the source has no user ID, nothing is written. With the `v6.8.0.0` feature flag active, the field is set to `null` in that case.

### Context scopes

A `Context` uses `Context::USER_SCOPE` by default and `Context::SYSTEM_SCOPE` when its source is a `SystemSource`. The generic Admin API entity routes and the sync endpoint run their writes in `Context::CRUD_API_SCOPE`.

As a result, the DAL doesn't fill the fields in these cases:

- The write doesn't come from an `AdminApiSource`, for example a write with a `SalesChannelApiSource` or a `SystemSource` without an explicit value.
- The `AdminApiSource` has no user ID, for example when the request is authenticated by an integration, which carries an integration ID instead.
- The write runs in a scope that the field doesn't allow, for example custom code that writes with a context in `Context::USER_SCOPE`.

## Reading the user

The `createdBy` and `updatedBy` associations aren't loaded automatically. Add them to the criteria to get the `UserEntity`:

```php
$criteria = new Criteria([$customerId]);
$criteria->addAssociation('createdBy');
$criteria->addAssociation('updatedBy');
```

On `CustomerEntity`, the properties `createdById`, `createdBy`, `updatedById`, and `updatedBy` are nullable, so check for `null` before using them. For more on loading associations, see [Reading Data](../../../../plugins/plugins/framework/data-handling/reading-data.md).

The `user` entity defines the inverse associations `createdCustomers`, `updatedCustomers`, `createdOrders`, and `updatedOrders`.

## Deleting a user

The `created_by_id` and `updated_by_id` columns of the `customer` table are nullable `BINARY(16)` columns. The foreign keys of these columns on the `customer` and `order` tables reference `user.id` with `ON DELETE SET NULL`. Deleting a user therefore keeps the customers and orders and sets the reference to `NULL`.
