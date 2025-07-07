---
nav:
  title: References
  position: 10

---

# References

This section consolidates key command-line commands used throughout the migration process and provides instructions for configuring the batch size (`Chunk_size`) for message queues. It serves as a quick reference for developers executing or customizing the migration from B2B Suite to B2B Commercial.

## Command-Line Commands

The following table lists all console commands used in the migration process, along with their purpose and relevant handbook sections.

| Command                              | Purpose                                                                                                                                                         | Reference                                                                         |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| `bin/console b2b:migrate:validate`   | Validates the migration configuration (XML and configurator classes) for correctness.                                                                           | [Configuration Validation](../development/validation-and-run.md)                  |
| `bin/console b2b:migrate:progress`   | Displays the current migration status, including counts for `Total`, `Valid`, `Newly`, `Migrated`, `Pending`, and `Error`. Use `--watch` for real-time updates. | [Running the Migration](../execution/running-migration.md#check-migration-status) |
| `bin/console b2b:migrate:commercial` | Starts the migration process, transferring data from B2B Suite to B2B Commercial.                                                                               | [Running the Migration](../execution/running-migration.md#start-the-migration)    |
| `bin/console b2b:migrate:rollback`   | Reverts the migration, clearing migrated data from target tables while preserving source data.                                                                  | [Troubleshooting](../execution/troubleshooting.md)                                |

::: info
Ensure the message queue worker is running before executing migration commands, as described in [Prerequisites](../execution/prerequisites.md)
:::

## Configuring Batch Size (Chunk size)

The batch size - determines the number of records processed in each message queue batch during the migration. Adjusting the batch size can optimize performance for large datasets or resource-constrained environments.

### Current Configuration

The default batch size is set to 100 records per batch, defined in the XML configuration:

```xml
<parameters>
    <parameter key="b2b.migration.batch_size">100</parameter>
</parameters>
```

### How to Change the Batch Size

To modify the batch size, update the `b2b.migration.batch_size` parameter in the XML configuration file.
**Example**:

1. Overwrite the `b2b.migration.batch_size` default value to your desired number (e.g., `50` for smaller batches, `500` for larger batches):

   ```xml
   <parameters>
       <parameter key="b2b.migration.batch_size">50</parameter>
   </parameters>
   ```

2. Run the migration with the updated batch size:

   ```bash
   bin/console b2b:migrate:commercial
   ```

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
