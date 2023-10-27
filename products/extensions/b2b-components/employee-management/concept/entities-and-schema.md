---
nav:
  title: Entities & Schema
  position: 10

---

# Entities and schema

## Entities

### Business Partner

The business partner entity contains additional B2B company data and therefore extends the basic storefront customer. Business partners are used to pool employees, roles and global settings.

### Employee

The employee entity represents a separate login within the context of the same business partner. This is to say that, employees operate on behalf of the linked business partner, facilitating actions like order placement. Additionally, these employees can be assigned specific roles.

### Role

The role entity represents a set of permissions that can be assigned to an employee. Permissions can restrict or allow employees to perform certain actions in the shop, like ordering or managing roles as well as employees.

## Schema

```mermaid
erDiagram
    swag_b2b_business_partner {
        uuid id PK
        uuid customer_id FK
        uuid default_role_id FK
        json custom_fields
    }
    swag_b2b_employee {
        uuid id PK
        uuid business_partner_customer_id FK
        uuid role_id FK
        boolean active
        string first_name
        string last_name
        string email
        string password
        datetime recovery_time
        string recovery_hash
    }
    swag_b2b_role {
        uuid id PK
        uuid business_partner_customer_id FK
        string name
        json permissions
    }
    swag_b2b_business_partner |o--|| customer : "is company administrator"
    swag_b2b_employee }o--|| customer : "uses data for orders from"
    swag_b2b_employee }o--o| swag_b2b_role : "has role"
    swag_b2b_role }o--|| customer : "belongs to"
```
