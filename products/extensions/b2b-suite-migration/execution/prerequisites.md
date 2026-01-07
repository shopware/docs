---
nav:
  title: Prerequisites
  position: 10

---

# Prerequisites

Before starting the migration, complete the following steps:

## Backup Your Data

::: warning
If you are using B2B Commercial and already have data in it, you should back up your Database before initiating the migration. The migration is designed to add data to B2B Commercial and not remove any data from B2B Suite, having a backup ensures you can restore your data in case of any issues.
:::

## Queue Worker

Ensure the message queue worker is running to process migration tasks.

## Extension Version

Ensure your B2B Suite version is `4.9.3` or above.

## Component Requirements

### Budget Management

- Requires B2B Commercial version `7.6.0` or above.
- Note: The Organization Unit of the budget will be empty after migration and needs to be manually assigned in B2B Commercial.
