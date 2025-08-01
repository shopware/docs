---
nav:
  title: Concept
  position: 10

---

# Concept

The migration process is designed to handle large datasets while maintaining data integrity. It uses three dedicated tables to track status, map records, and log errors. A message queue ensures scalability, and sequential migration respects entity relationships (e.g., migrating employees before quotes). Understanding these concepts is crucial before proceeding to execution.

## Migration Approach

The whole migration is executed in a message queue, allowing for scalable processing of large volumes of data. The migration is structured to ensure that all components and entities are migrated in the correct order, respecting their relationships and dependencies. All mappings fields and tables are defined via XML configuration files, which are processed by configurator. This modular approach allows for easy customization and extension of the migration process.

## Key Features

- **Message Queue**: Utilizes a message queue to process large volumes of data, ensuring scalability.
- **Sequential Migration**: Components (e.g., Employee, Quote, Shopping List) are migrated sequentially to respect entity relationships (e.g., employee records before quotes).
- **Entity-Level Sequencing**: Within each component, entities (e.g., business partners, employees, roles) are migrated in the correct order.

::: info
Proper sequencing is critical to avoid dependency issues. Verify the migration order for your dataset.
:::
