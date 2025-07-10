---
nav:
  title: Troubleshooting
  position: 30

---

# Troubleshooting

Address issues during migration with the following steps:

- **Check Errors**: Review the `b2b_components_migration_errors` table for detailed error logs if the status is `Complete with error`.
- **New Records**: If `Has new records` appears, re-run the migration to include new records.

## Rollback Migration

If you need to revert the migration, you can roll back the changes made by the migration process. This will remove all migrated data from B2B Commercial and restore the state before migration.

What is this command doing?

- Deletes all records from the B2B Commercial tables that were migrated.
- Resets the migration state, mapping, and error tables to their initial state.
- Delete all messages from the message queue related to the migration.
- All data from B2B Suite will remain intact.

  ```bash
  bin/console b2b:migrate:rollback
  ```
  
## Rollback Specific Components

Additionally, you can specify which component to roll back. This is useful if you want to revert specific components without affecting others. The name of the component should match the technical name defined in the [configurator](../concept/technical-terms-and-concepts.md#configurator).

  ```bash
  bin/console b2b:migrate:rollback component_name_1 component_name_2
  ```

- **Example**: To roll back only the `shopping_list` and `quote_management` components:

  ```bash
  bin/console b2b:migrate:rollback quote_management shopping_list
  ```

**Note**: The `employee_management` component is a prerequisite for all other B2B components and. Therefore, if you specify `employee_management` in the rollback command, it will roll back all other components as well.

:::info
The order of components listed in the command does not matter for rollback. The command will process all specified components in the reverse order of their migration sequence.
:::

## Force Rollback

If you want to force the rollback command without confirming the deletion of data, you can use the `--force` or `-f` option:

```bash
bin/console b2b:migrate:rollback --force
```

## Batch Size

By default, the rollback command will delete the records in each batch of 1000 records. If you want to change the batch size, you can use the `--max-batch-size` option:

```bash
bin/console b2b:migrate:rollback --max-batch-size=500
```
