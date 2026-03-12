---
nav:
    title: Integration
    position: 4
---

# Business Central Integration

The Business Central integration allows workflows to perform CRUD operations on supported entities via the Business Central API.

## Supported Entities

The following entities are supported in the system:

- Customers
- Items
- Sales Orders

### Available Operations

All entities support the following operations:

- `getAll` – Retrieve all records
- `getOne` – Retrieve a single record by identifier
- `createOrUpdate` – Create a new record or update an existing one
- `delete` – Remove a record
- `action` – Execute a specific action on the entity

## OData Filter Examples

Business Central queries support OData filtering syntax.

```text
email eq 'john@example.com'
inventory lt 10
status eq 'Open'
externalDocumentNumber eq 'SW-10001'
```
