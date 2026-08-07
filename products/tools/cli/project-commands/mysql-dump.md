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

## Anonymizing data

The `--anonymize` flag will anonymize known user data tables. This is widely used to make production database dumps safe for local development:

```bash
shopware-cli project dump --anonymize
```

Production databases can be very large (100GB+ of MySQL data), making it impractical to use complete unmodified production data locally. The `--anonymize` flag removes sensitive customer information while preserving database structure and relationships for realistic local testing.

The following tables are anonymized:

[Find the complete list here](https://github.com/shopware/shopware-cli/blob/main/internal/shop/config.go#L246)

It is possible to customize the anonymization process by using the `dump.rewrite` configuration in the `.shopware-project.yml` file.

```yaml
# .shopware-project.yml
dump:
  rewrite:
    <table-name>:
      # Rewrite column content to new value
      <column-name>: "'new-value'"
      # Use go-faker to generate data
      <column-name>: "faker.Internet().Email()" # See https://github.com/jaswdr/faker for all available functions
```

## Ignoring table content

Some tables are not relevant for dumps, like log tables. To ignore some default tables, use the `--clean` flag. This will ignore the content of the following tables:

- `cart`
- `customer_recovery`
- `dead_message`
- `enqueue`
- `messenger_messages`
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

To ignore additional tables, use the `dump.ignore` configuration in the `shopware-project.yml` file.

```yaml
# .shopware-project.yml
dump:
  nodata:
    - <table-name>
```

## Ignoring entire tables

It is also possible to completely ignore a table **not only the content**.

```yaml
# .shopware-project.yml
dump:
  ignore:
    - <table-name>
```

## Adding a where clause

It is possible to add a where clause to the export of a table. So only rows matching the where clause will be exported.

```yaml
# .shopware-project.yml
dump:
  where:
    <table-name>: 'id > 5'
```
