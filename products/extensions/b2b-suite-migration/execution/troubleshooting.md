---
nav:
  title: Troubleshooting
  position: 30

---

# Troubleshooting

Address issues during migration with the following steps:

- **Check Errors**: Review the `b2b_components_migration_errors` table for detailed error logs if the status is `Complete with error`. This error is logged when the migration process encounters issues that prevent it from completing successfully.
- **New Records**: If `Has new records` appears in the output of the watch progress command, it indicates that new records were added during the migration process. This can happen if there are changes in the B2B Suite while the migration is running.

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

### 1. Rollback Specific Components

Additionally, you can specify which component to roll back. This is useful if you want to revert specific components without affecting others. The name of the component should match the technical name defined in the [configurator](../concept/technical-terms-and-concepts.md#configurator).

  ```bash
  bin/console b2b:migrate:rollback component_name_1 component_name_2
  ```

- **Example**: To roll back only the `shopping_list` and `quote_management` components:

  ```bash
  bin/console b2b:migrate:rollback quote_management shopping_list
  ```

**Note**: The `employee_management` component is a prerequisite for all other B2B components. Therefore, if you specify `employee_management` in the rollback command, it will roll back all other components as well.

:::info
The order of components listed in the command does not matter for rollback. The command will process all specified components in the reverse order of their migration sequence.
:::

### 2. Force Rollback

If you want to force the rollback command without confirming the deletion of data, you can use the `--force` or `-f` option:

```bash
bin/console b2b:migrate:rollback --force
```

### 3. Batch Size

Just like the migration command, you can specify a maximum batch size for the rollback operation. This is useful for managing memory usage and performance during the rollback.

```bash
bin/console b2b:migrate:rollback --batch-size=500
```

## Error Troubleshooting

If you encounter errors during migration, follow these steps to troubleshoot:

1. **Check Migration Errors**: Review the `b2b_components_migration_errors` table for detailed error logs. This table contains information about any issues encountered during the migration process, including the component, entity, and specific error messages.
2. Because the migration process executes in a batch mode, it is possible that some records were migrated successfully while others failed. In this case, all records that belong to this batch will be marked as `Error` and will not be migrated. All of them will be logged in the `b2b_components_migration_errors` table and link to the `b2b_components_migration_map` table. You can base on this information to indicate which records were not migrated and why.
