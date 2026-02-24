---
nav:
    title: Nexus
    position: 4
---

# Business Central Integration

The Business Central integration allows workflows to perform CRUD operations on supported entities via the Business Central API.

---

## Supported Entities

| Entity | Operations |
|--------|------------|
| Customers | Get, Create, Update, Delete |
| Items | Get, Create, Update |
| Sales Orders | Get, Create, Update |
| Sales Invoices | Get |
| Vendors | Get, Create, Update |
| Purchase Orders | Get, Create |

---

## OData Filter Examples

Business Central queries support OData filtering syntax.

```text
email eq 'john@example.com'
inventory lt 10
status eq 'Open'
externalDocumentNumber eq 'SW-10001'
```
