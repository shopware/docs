---
nav:
  title: Validation and Run
  position: 50

---

# Configuration Validation and Migration Execution

After configuring your migration, follow these steps:

1. Validate the configuration:
   Validate your migration configuration to ensure correctness before running the migration.

   ```bash
   bin/console b2b:migrate:validate
   ```

   - Checks the configuration for errors. Ensure the XML is well-formed and adheres to a valid schema. It will also verify if the fields and tables exist in the database; otherwise, it will throw an exception.
   - Provides hints to resolve issues if validation fails.

    ::: info
    Validation helps catch configuration errors early, saving time during migration.
    :::

2. Monitor progress (should be run in a separate terminal):

   ```bash
   bin/console b2b:migrate:progress --watch
   ```

3. Start the migration (ensure the queue worker is running):

   ```bash
   bin/console b2b:migrate:commercial
   ```

4. Review logs and errors in `b2b_components_migration_errors` to ensure a successful migration.

5. In case you want to roll back the migration, use:

   ```bash
   bin/console b2b:migrate:rollback
   ```
