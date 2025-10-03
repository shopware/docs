---
nav:
  title: Entities & Schema
  position: 20

---

# Entities and schema

## Entities

### Advanced Product Catalog

The Advanced Product Catalog entity represents a customized product catalog that can be associated with specific customer groups, organizational units, and sales channels. It allows merchants to control product visibility and create tailored catalog experiences for different B2B customer segments.

### Advanced Product Catalog Category

The Advanced Product Catalog Category entity represents the relationship between product catalogs and product categories, enabling merchants to define which categories are included in specific catalogs. This is implemented as a junction table that links catalogs to categories with version support.

## Schema

```mermaid
erDiagram
    b2b_components_advanced_product_catalogs {
        uuid id PK
        boolean auto_add_new_categories
        uuid sales_channel_id FK
        uuid created_by_id FK
        uuid updated_by_id FK
        uuid customer_id FK
        uuid organization_id FK
        uuid customer_group_id FK
        datetime updated_at
        datetime created_at
        json custom_fields
    }
    b2b_components_advanced_product_catalogs_category {
        uuid advanced_product_catalogs_id FK
        uuid category_id FK
        uuid category_version_id FK
    }
    category {
        uuid id PK
        uuid version_id PK
    }
    b2b_components_advanced_product_catalogs ||o{ b2b_components_advanced_product_catalogs_category : "has categories"
    b2b_components_advanced_product_catalogs_category }o|| category : "belongs to"
```

The Advanced Product Catalog system consists of two main tables:

**b2b_components_advanced_product_catalogs:**

- `auto_add_new_categories`: Controls whether new categories are automatically included in the catalog
- `organization_id`: Required field linking the catalog to a specific organizational unit
- `customer_group_id`: Optional field for customer group-specific catalogs (unique constraint)
- `sales_channel_id`: Optional field for sales channel-specific catalogs
- `custom_fields`: JSON field for additional metadata and extensibility

**b2b_components_advanced_product_catalogs_category:**

- Junction table linking catalogs to categories with version support
- Composite primary key: `(advanced_product_catalogs_id, category_id, category_version_id)`
- Supports Shopware's versioning system for categories
