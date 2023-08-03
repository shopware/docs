# Entities and schema

## Entities

### Company

The company entity contains additional B2B company data and therefore extends the basic storefront customer. Companies are used to pool employees, roles and global settings.

### Employee

The employee entity represents a separate login for the same company customer / B2B business partner. Employees act on behalf of the associated company, e.g., to place orders. An employee can have a role assigned.

### Role

The role entity represents a set of permissions that can be assigned to an employee. Permissions can restrict or allow employees to perform certain actions in the shop, like ordering or managing roles as well as employees.

## Schema

```mermaid
erDiagram
    swag_b2b_company {
        uuid id PK
        uuid company_customer_id FK
        uuid default_role_id FK
        json custom_fields
    }
    swag_b2b_employee {
        uuid id PK
        uuid company_customer_id FK
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
        uuid company_customer_id FK
        string name
        json permissions
    }
    swag_b2b_company |o--|| customer : "is company administrator"
    swag_b2b_employee }o--|| customer : "uses data for orders from"
    swag_b2b_employee }o--o| swag_b2b_role : "has role"
    swag_b2b_role }o--|| customer : "belongs to"
```
