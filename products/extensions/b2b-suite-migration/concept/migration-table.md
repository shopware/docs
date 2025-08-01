---
nav:
  title: Migration Table
  position: 10

---

# Migration Tables

The migration process introduces three tables to manage and track data migration from B2B Suite to B2B Commercial:

1. **`b2b_components_migration_state`**  
   Tracks the status of the migration process for each entity.

2. **`b2b_components_migration_map`**  
   Maps records between B2B Suite and B2B Commercial, ensuring traceability.

3. **`b2b_components_migration_errors`**  
   Logs errors encountered during migration for troubleshooting.

::: info
These tables enable monitoring, verification, and debugging of the migration process.
:::
