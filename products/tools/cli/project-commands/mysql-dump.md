---
nav:
  title: Generating MySQL Dumps
  position: 1

---

# Generating MySQL Dumps

Shopware CLI has built-in support for generating MySQL dumps. The dump command is native implementation and does not use existing tools like `mysqldump`.

Creating a MySQL dump is as simple as running the following command:

```bash
shopware-cli project dump
```

This will create a `dump.sql` in the current directory. The dump command will use the database credentials from the `.env` file. If you want to use different credentials, you can use the following flags:

```bash
shopware-cli project dump --host 127.0.0.1 --username root --password root --database sw6
```

It is possible to use `--skip-lock-tables` to skip the lock tables command. This is useful for large databases or when the MySQL user has no rights to lock the table.

## Compressing the dump

Database dumps can be pretty large, it is possible to compress the dump using `gzip` or `zstd`. Use flag `--compression=gzip` for gzip compression or `--compression=zstd` for zstd compression.

## Table locking

By default, Shopware CLI will try to lock the table before dumping the data. This can fail if the MySQL user has no rights to lock the table. To skip the lock tables command, use the `--skip-lock-tables` flag.

## `INSERT` batching

The dump command batches up to 100 rows per `INSERT` statement and targets a maximum statement size of 1 MiB. It starts a new statement before adding a row that would exceed the size target. This keeps large image or document values from accumulating into a single oversized statement.

Use `--insert-into-limit` to adjust the row limit and `--insert-into-max-bytes` to adjust the byte target. Both limits apply:

```bash
shopware-cli project dump --insert-into-limit 100 --insert-into-max-bytes 1048576
```

For one row per statement, use `--insert-into-limit 1`. `--quick` also writes one row per statement unless an explicit positive `--insert-into-limit` takes precedence.

A row larger than the byte target is written on its own and remains intact. The target counts the SQL syntax and encoded values, including the hex expansion of binary data. Individual rows must still fit the import client's and server's `max_allowed_packet` settings. See [MySQL's packet size documentation](https://dev.mysql.com/doc/refman/8.4/en/packet-too-large.html).

## Anonymizing data

The `--anonymize` flag rewrites known personal data fields while preserving customer and order records for local testing:

```bash
shopware-cli project dump --anonymize
```

See the [built-in anonymization rules](https://github.com/shopware/shopware-cli/blob/main/internal/shop/config.go). Plugin data and configuration secrets require additional rules.

It is possible to customize the anonymization process by using the `dump.rewrite` configuration in the `.config/shopware-project.yml` file.

```yaml
# .config/shopware-project.yml
dump:
  rewrite:
    <table-name>:
      # Rewrite column content to new value
      <column-name>: "'new-value'"
      # Use go-faker to generate data
      <column-name>: "faker.Internet.Email()" # See https://github.com/jaswdr/faker for all available functions
```

### Emptying individual columns

Use `dump.rewrite` to clear a column while keeping the table's rows and its other columns. For example, to empty `my_table.foo_bar_col`:

```yaml
# .config/shopware-project.yml
dump:
  rewrite:
    my_table:
      foo_bar_col: "NULL"
```

Rewrite values are SQL expressions. Use `"NULL"` for a nullable column, `"''"` for an empty string, or `"0"` to reset a numeric value. Quote `"NULL"` in YAML so it remains a SQL expression rather than a YAML null value. The replacement must satisfy the column's constraints.

These rewrites apply to every dump, including dumps with `--skip-customer-data`; `--anonymize` is not required. They change only the exported values, leaving the source database unchanged.

### Extension anonymization

`shopware-cli project dump --anonymize` rewrites personal data in Shopware core tables. An extension can add its own tables and system config secrets in `.config/shopware-extension.yml`. A project dump with `--anonymize` merges those rules from every installed extension. A column already set under `dump.rewrite` in the project config, or by the built-in rules, is left unchanged. If an extension config cannot be read, or an extension listed in `composer.lock` cannot be loaded from `vendor`, the dump stops with an error instead of skipping that extension.

```yaml
anonymize:
  tables:
    swag_example_token:
      access_token: "''"
      email: faker.Internet.Email()
  system_config:
    - SwagExample.config.clientSecret
    - key: SwagExample.config.merchantEmail
      value: faker.Internet.Email()
    - key: SwagExample.config.environment
      value: sandbox
```

`tables` uses the same column expressions as the project `dump.rewrite` map. Write `"''"` to store an empty string and `"NULL"` to store NULL. `system_config` matches `system_config.configuration_key`. A plain key omits that row from the dump. `value` replaces `configuration_value` with `{"_value": value}`. A value that starts with `faker.` is generated per row. When several extensions remove keys from the same column with `JSON_REMOVE`, their rules are combined.

## Ignoring table content

Some tables are not relevant for dumps, like log tables. To ignore some default tables, use the `--clean` flag. This will ignore the content of the following tables:

- `cart`
- `customer_recovery`
- `dead_message`
- `enqueue`
- `messenger_messages`
- `import_export_log`
- `increment`
- `elasticsearch_index_task`
- `log_entry`
- `message_queue_stats`
- `notification`
- `payment_token`
- `refresh_token`
- `version`
- `version_commit`
- `version_commit_data`
- `webhook_event_log`

To exclude additional table data from every dump, use `dump.nodata` in `.config/shopware-project.yml`. Table schemas are still exported. Table names and glob patterns are supported; tables that are absent are skipped.

```yaml
# .config/shopware-project.yml
dump:
  nodata:
    - log_entry
    - 'my_plugin_log_*'
```

For one invocation, pass `--no-data` repeatedly:

```bash
shopware-cli project dump --no-data log_entry --no-data 'my_plugin_log_*'
```

These exclusions apply independently of `--skip-customer-data`. Use `dump.skip_customer_data_tables` when additional exclusions should apply only in that mode.

## Ignoring entire tables

It is also possible to completely ignore a table **not only the content**.

```yaml
# .config/shopware-project.yml
dump:
  ignore:
    - <table-name>
```

## Dumps without customer data

Use `shopware-cli project dump --skip-customer-data` to export a shop without customers, orders, wishlists, newsletter recipients, reviews, documents, and related history. Table schemas are kept. Customer groups, document types, admin users, integrations, and catalog data are kept.

Skipping customer data automatically includes `--clean`, excluding transient data such as queued messages, logs, indexing tasks, and queue statistics. This also applies when enabled through `dump.skip_customer_data: true`.

Promotion settings and individual codes are kept, but their redemption history is reset:

- `promotion.orders_per_customer_count` is set to `NULL`.
- `promotion.order_count` is set to `0`.
- `promotion_individual_code.payload` is set to `NULL`.

These resets take precedence over project rewrites for those columns. Rewrites for other columns remain in effect.

`--skip-customer-data` and `--anonymize` are mutually exclusive. Add plugin tables in `.config/shopware-project.yml` to exclude their data only when skipping customer data:

```yaml
dump:
  skip_customer_data_tables:
    - klarna_payment_request_log
    - payone_payment_card
    - payone_payment_mandate
    - payone_payment_redirect
    - unzer_payment_payment_device
    - unzer_payment_transfer_info
    - crefo_pay_transaction_refund_history
    - crefo_pay_transaction_capture_history
```

`dump.skip_customer_data_tables` extends the built-in exclusions when `--skip-customer-data` is passed. Set `dump.skip_customer_data: true` to enable this mode by default, which also prevents using `--anonymize`.

For exclusions that apply to every dump, use `dump.nodata`, or pass `--no-data` repeatedly for one invocation. All these lists accept table names and glob patterns, for example `'payone_payment_*'`. Tables that are absent are skipped. Use `dump.ignore` only to omit both schema and data.

The preset covers known Shopware core tables. Plugin tables need explicit exclusions. Database dumps do not remove files such as invoices stored on disk, or secrets in shop configuration. Use `--anonymize` separately when you need to keep customer and order records with rewritten values.

## Adding a where clause

It is possible to add a where clause to the export of a table. So only rows matching the where clause will be exported.

```yaml
# .config/shopware-project.yml
dump:
  where:
    <table-name>: 'id > 5'
```

## Limiting the number of rows

Use the `--limit` flag to cap the number of rows exported for a table, for example, to keep only the newest orders:

```bash
shopware-cli project dump --limit order=100
```

Tables referencing the limited table via foreign keys (including transitively) are automatically filtered to contain only rows belonging to the kept rows. A second limit on a table that is already filtered this way is rejected. When the limited table references itself (for example, `product.parent_id`), the ancestors of the kept rows are also exported, so the dump remains importable. This requires the `CREATE` and `DROP` privileges, since the rows kept are frozen in staging tables.

The same behavior can be configured persistently in `.config/shopware-project.yml`:

```yaml
# .config/shopware-project.yml
dump:
  limit:
    <table-name>:
      rows: 100
      # Defaults to "created_at DESC" when the table has a created_at column
      order_by: 'created_at DESC'
```
