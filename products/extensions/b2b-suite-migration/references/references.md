---
nav:
  title: References
  position: 10

---

# References

This section consolidates key command-line commands used throughout the migration process and provides instructions for configuring the batch size (`Chunk_size`) for message queues. It serves as a quick reference for developers executing or customizing the migration from B2B Suite to B2B Commercial.

## Command-Line Commands

The following table lists all console commands used in the migration process, along with their purpose and relevant handbook sections.

| Command                              | Purpose                                                                                                                                                                                                                                                                                | Reference                                                                         |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| `bin/console b2b:migrate:commercial` | Starts the migration process, transferring data from B2B Suite to B2B Commercial.<br/>- `--batch-size` to set batch size for deletion. <br/>- Arguments: `component_name_1 component_name_2` to specify components to migrate.                                                         | [Running the Migration](../execution/running-migration.md)                        |
| `bin/console b2b:migrate:validate`   | Validates the migration configuration (XML and configurator classes) for correctness.                                                                                                                                                                                                  | [Configuration Validation](../development/validation-and-run.md)                  |
| `bin/console b2b:migrate:progress`   | Displays the current migration status. <br/>- Use `--watch` for real-time updates.                                                                                                                                                                                                     | [Running the Migration](../execution/running-migration.md#check-migration-status) |
| `bin/console b2b:migrate:rollback`   | Reverts the migration, clearing migrated data from target tables while preserving source data.<br/>- `-f --force` to skip confirmation <br/>- `--batch-size` to set batch size for deletion. <br/>- Arguments: `component_name_1 component_name_2` to specify components to roll back. | [Troubleshooting](../execution/troubleshooting.md#rollback-migration)             |
::: info
Ensure the message queue worker is running before executing migration commands, as described in [Prerequisites](../execution/prerequisites.md)
:::

## Configuring Batch Size (Chunk size)

A **batch size** is a configuration parameter that determines how many records are processed in a single migration operation. It helps manage memory usage and performance during the migration process, allowing for efficient handling of large datasets.

### Current Configuration

The default batch size is set to 100, but it can be adjusted in several ways:

- By setting the `SHOPWARE_B2B_MIGRATION_BATCH_SIZE` environment variable in the `.env` file.
- By passing the `--batch-size` option when executing the migration command.

### Considerations

- **Smaller Batch Size (e.g., 50)**:
  - Reduces memory usage and load on the database and queue.
  - Suitable for environments with limited resources or when debugging.
  - Increases total migration time due to more frequent batch processing.
- **Larger Batch Size (e.g., 500)**:
  - Speeds up migration for large datasets by processing more records per batch.
  - May increase memory and CPU usage, risking timeouts in constrained environments.
- **Testing**: Test the new batch size in a staging environment to ensure stability.

:::warning
Changing the batch size without testing may lead to performance issues or timeouts. Always validate the configuration after modifications.
:::
