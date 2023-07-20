# Entities and schema

## Entities

### Company

The company entity represents a company that is registered as a customer in the shop. It is used to gather a company's employees and roles.

### Employee

The employee entity represents a customer working for a specific B2B merchant. It acts on behalf of the associated company to e.g. place orders. A role can be assigned to an employee.

### Role

The role entity represents a set of permissions that can be assigned to an employee. Permissions can restrict or allow employees to perform certain actions in the shop, like ordering or managing roles or employees themselves.

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
    swag_b2b_role }o--|| customer : "uses company data from"
```
