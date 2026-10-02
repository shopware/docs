---
nav:
  title: SQL Shell
  position: 8

---

# SQL Shell

Shopware CLI can connect to the project database using the connection details of the current environment (local, Docker, ...), so you don't need to know the host or credentials.

## Interactive shell

Run without arguments to open an interactive SQL shell:

```bash
shopware-cli project sql
```

Type `exit` or press <kbd>Ctrl</kbd>+<kbd>D</kbd> to quit.

## Running a single query

Pass the query as an argument:

```bash
shopware-cli project sql "SELECT id, tax_rate FROM tax"
```

## Providing a script via stdin

A SQL script can also be provided via stdin:

    shopware-cli project sql < script.sql

## Running a script from a file

Use the `--file` flag to execute a SQL script from disk:

```bash
shopware-cli project sql --file script.sql
```

`--file` cannot be combined with a query argument. A missing file is reported before the database connection opens.

## Output format

Use the `--format` flag to control the output format: `table`, `tsv`, or `json`.

```bash
shopware-cli project sql --format json "SELECT * FROM sales_channel" | jq
```

By default, the output is rendered as a `table` when stdout is a terminal, and as `tsv` otherwise.
