---
nav:
  title: Running Migration
  position: 20

---

# Running Migration

This section describes how to execute and monitor the migration process.

## Commands

In this section, we will introduce 2 helpful commands:

- `b2b:migrate:commercial`: Start the migration process.
- `b2b:migrate:progress`: Check migration status.

For an optimal experience, we recommend running both commands simultaneously in separate terminal windows rather than sequentially. See details below.

### Start the Migration

#### 1. How to run the migration command

This command initiates the migration process, transferring all components and entities as defined in the configuration

   ```bash
   bin/console b2b:migrate:commercial
   ```

#### 2. How to run the migration command with specific components

You could also specify which component to migrate. This is useful for testing or when you want to migrate specific components without affecting others. The name of the component should match the technical name defined in the [configurator](../concept/technical-terms-and-concepts.md#configurator).

   ```bash
   bin/console b2b:migrate:commercial component_name_1 component_name_2
   ```

    **Example**: To migrate only the `shopping_list` and `quote_management` components:

     ```bash
     bin/console b2b:migrate:commercial quote_management shopping_list
     ```

    **Note**: The `employee_management` component is a prerequisite for all other B2B components and is migrated first by default, regardless of the specified order. For instance, executing `bin/console b2b:migrate:commercial quote_management shopping_list` will migrate `employee_management` first, followed by `quote_management`, and then `shopping_list`. The order of components
    listed in the command does not affect the migration sequence. The order of migration is determined by the priority of the configurators, which is defined in the service definition file. The configurator with the highest priority will be executed first.

#### 3. How to run the migration command with a specific batch size

To control the number of records processed in each batch, you can specify a batch size using the `--batch-size` option. This is useful for managing memory usage and performance during migration.

   ```bash
   bin/console b2b:migrate:commercial --batch-size=100
   ```

   **Note**: Adjust the batch size according to your system's capabilities and the size of the data being migrated.

::: info
This command utilizes the message queue system to process the migration in the background. Even after the command execution completes, the migration may still be ongoing. To monitor the migration status in real-time, run the `bin/console b2b:migrate:progress` command in a separate terminal window.
:::

### Check Migration Status

This command provides real-time insights into the migration process, displaying progress and statistics in a table format.

The output includes the following columns:

- **Total**: Total records in the source table.
- **Valid**: Records meeting migration criteria.
- **Newly**: Records added post-migration start.
- **Migrated**: Successfully migrated records.
- **Pending**: Records awaiting migration.
- **Error**: Records that failed to migrate.

And the **Status** column will indicate the current state of the migration:

- `Complete`: Migration completed successfully.
- `Pending`: Waiting to start.
- `In progress`: Migration in progress.
- `Complete with error`: Errors occurred (check `b2b_components_migration_errors`).
- `Has new records`: New records detected in B2B Suite.

   ```bash
     bin/console b2b:migrate:progress
   ```

In order to monitor the migration process effectively, it is recommended to run this command in a separate terminal window while the migration is ongoing. This allows you to see real-time updates on the migration status. You could also add `--watch` option to automatically refresh the output every 5 seconds:

   ```bash
   bin/console b2b:migrate:progress --watch
   ```
