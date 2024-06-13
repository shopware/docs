---
nav:
  title: Entities & Schema
  position: 20

---

# Entities and schema

## Entities

### Shopping Lists

Shopping lists represent a list of products prepared for a customer or a sales channel. They show basic information about the product list, such as the name, customer, sales channel and so on.

### Line item

he Shopping List Line Item represents individual products within a shopping list. Each product in the shopping list is considered a line item.

## Schema

```mermaid
erDiagram
    b2b_components_shopping_list {
        uuid id PK
        uuid customer_id FK
        uuid employee_id FK
        uuid sales_channel_id FK
        string name
        boolean active
        json custom_fields
    }
    b2b_components_shopping_list_line_item {
        uuid id PK
        uuid b2b_components_shopping_list_id FK
        uuid product_id FK
        int quantity
    }
b2b_components_shopping_list_line_item o{--|| b2b_components_shopping_list : "has line items"
```
