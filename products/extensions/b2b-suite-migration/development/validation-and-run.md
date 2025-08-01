---
nav:
  title: Validation and Run
  position: 30

---

# Configuration Validation and Migration Execution

## Validation Command

- Validate your migration configuration to ensure correctness before running the migration.

```bash
bin/console b2b:migrate:validate
```

- Checks the configuration for errors.
- Provides hints to resolve issues if validation fails.

::: info
Validation helps catch configuration errors early, saving time during migration.
:::

## Next Steps

After configuring and validating your migration, follow these steps:

1. Validate the configuration:

   ```bash
   bin/console b2b:migrate:validate
   ```

2. Monitor progress:

   ```bash
   bin/console b2b:migrate:progress --watch
   ```

3. Start the migration:

   ```bash
   bin/console b2b:migrate:commercial
   ```

4. Review logs and errors in `b2b_components_migration_errors` to ensure a successful migration.

5. In case you want to roll back the migration, use:

   ```bash
   bin/console b2b:migrate:rollback
   ```
