---
nav:
  title: Migration Approach
  position: 20

---

# Migration Approach

The migration process is designed to handle large datasets efficiently while maintaining data integrity.

## Key Features

- **Message Queue**: Utilizes a message queue to process large volumes of data, ensuring scalability.
- **Sequential Migration**: Components (e.g., Employee, Quote, Shopping List) are migrated sequentially to respect entity relationships (e.g., employee records before quotes).
- **Entity-Level Sequencing**: Within each component, entities (e.g., business partners, employees, roles) are migrated in the correct order.

::: info
Proper sequencing is critical to avoid dependency issues. Verify the migration order for your dataset.
:::
