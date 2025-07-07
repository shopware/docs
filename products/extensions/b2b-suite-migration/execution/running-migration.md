---
nav:
  title: Running Migration
  position: 20

---

# Running Migration

This section describes how to execute and monitor the migration process.

## Commands

### Check Migration Status

   ```bash
     bin/console b2b:migrate:progress
   ```

- Add `--watch` for real-time updates in every 5 seconds:
    - Output columns:
      - **Total**: Total records in the source table.
      - **Valid**: Records meeting migration criteria.
      - **Newly**: Records added post-migration start.
      - **Migrated**: Successfully migrated records.
      - **Pending**: Records awaiting migration.
      - **Error**: Records that failed to migrate.
    - Statuses:
      - `Complete`: Migration completed successfully.
      - `Pending`: Waiting to start.
      - `In progress`: Migration in progress.
      - `Complete with error`: Errors occurred (check `b2b_components_migration_errors`).
      - `Has new records`: New records detected in B2B Suite.

### Start the Migration

   ```bash
   bin/console b2b:migrate:commercial
   ```

::: info
 Monitor the console output from `b2b:migrate:progress` to track progress and address errors.
:::
