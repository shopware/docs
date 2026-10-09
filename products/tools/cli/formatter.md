---
nav:
  title: Formatter
  position: 5001

---

# Formatter

Shopware CLI provides code formatting through two `format` commands:

- `extension format` to format a single extension
- `project format` to format extensions and configured bundles across a Shopware project

The formatter covers PHP files, along with files supported by Prettier such as JavaScript, TypeScript, Vue, CSS, and SCSS. PHP formatting uses the Shopware [Coding Standard](https://developer.shopware.com/docs/resources/guidelines/code/).

A `--dry-run` mode is available to check formatting without rewriting the target files. Shopware CLI propagates the formatter exit status, so a non-zero dry run can mean that formatting changes are required rather than that the formatter crashed.

The Docker examples are recommended because the image already contains the required runtime dependencies. For local execution, the formatter tooling requires PHP 8.2 or later and Node.js 20 or later. Composer and npm are used when Shopware CLI initializes its local tool cache.

## Formatting tools

By default, a `format` command invokes every registered formatter. The following tools support formatting:

| Tool           | What it formats                                                                             | Implementation                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `php-cs-fixer` | PHP source files using the Shopware Coding Standard                                         | [`phpcsfixer.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/phpcsfixer.go) |
| `prettier`     | Prettier-supported files in source directories using the Shopware CLI bundled configuration | [`prettier.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/prettier.go)     |

Tools without formatting support cannot be selected with `format --only`; the command reports an error and lists the available formatters.

`extension format` and `project format` print a `Formatters:` table after running. `invoked` means the formatter was called, but does not guarantee that it analyzed or changed files; `skipped` means it was not selected by `--only` or was removed by `--exclude`. The table is also printed when a formatter returns an execution error, and the command exits with a non-zero status.

## Format an extension

<Tabs>

<Tab title="With Docker (recommended)">

The command mounts your current directory to `/ext` inside the container and formats that mounted extension directory:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension format /ext
```

Dry run (check formatting without modifying files):

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension format /ext --dry-run
```

</Tab>

<Tab title="Without Docker">

Use the local path to your extension when running the command without Docker:

```shell
shopware-cli extension format /path/to/your/extension
```

Dry run (check formatting without modifying files):

```shell
shopware-cli extension format /path/to/your/extension --dry-run
```

</Tab>

</Tabs>

The extension path is required.

Use `--only` to select one or more formatters:

```shell
shopware-cli extension format /path/to/your/extension --only php-cs-fixer
shopware-cli extension format /path/to/your/extension --only "php-cs-fixer,prettier"
```

Use `--exclude` to skip formatters. It removes tools from the set selected by `--only`, or from all formatters when `--only` is omitted:

```shell
shopware-cli extension format /path/to/your/extension --exclude prettier
shopware-cli extension format /path/to/your/extension --only "prettier,php-cs-fixer" --exclude prettier
```

Both flags accept comma-separated names. An unknown name, an excluded formatter outside the selected set, or excluding every selected formatter is an error.

The following table summarizes the extension format options:

| Flag                | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| `--only <tools>`    | Run only the specified comma-separated formatters                |
| `--exclude <tools>` | Exclude formatters from all formatters or the `--only` selection |
| `--dry-run`         | Check formatting without modifying files                         |

## Format a project

<Tabs>

<Tab title="With Docker (recommended)">

The command mounts your current directory to `/project` inside the container and formats that mounted project directory:

```shell
docker run --rm -v "$(pwd)":/project ghcr.io/shopware/shopware-cli project format /project
```

Dry run (check formatting without modifying files):

```shell
docker run --rm -v "$(pwd)":/project ghcr.io/shopware/shopware-cli project format /project --dry-run
```

</Tab>

<Tab title="Without Docker">

Use the local path to your project when running the command without Docker:

```shell
shopware-cli project format /path/to/your/project
```

Dry run (check formatting without modifying files):

```shell
shopware-cli project format /path/to/your/project --dry-run
```

</Tab>

</Tabs>

### Project format behavior

The `project format` command applies formatting across local extensions and configured bundles in the project. Extensions resolved under `vendor/` and extensions listed in `validation.ignore_extensions` are skipped.

If you omit the path, `project format` discovers the nearest Shopware project by walking up from the current directory. A directory is recognized as a Shopware project when its Composer metadata references `shopware/core` and `bin/console` exists; `PROJECT_ROOT` overrides this discovery.

### Project format options

| Flag                | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| `--dry-run`         | Check formatting without modifying files                         |
| `--only <tools>`    | Run only the specified comma-separated formatters                |
| `--exclude <tools>` | Exclude formatters from all formatters or the `--only` selection |

The path argument is optional for `project format` but required for `extension format`.

Format only PHP:

```shell
shopware-cli project format /path/to/your/project --only php-cs-fixer
```

Use `--exclude` alone or with `--only`:

```shell
shopware-cli project format /path/to/your/project --exclude prettier
shopware-cli project format /path/to/your/project --only "prettier,php-cs-fixer" --exclude prettier
```

Unknown names, exclusions outside the selected set, and empty final selections fail before tool setup or file changes. Use `--verbose` with either `format` command to log source directories, extension names, and external tool commands and arguments.

## Configuration

PHP-CS-Fixer uses a `.php-cs-fixer.dist.php` from the target root when one is present. Otherwise, Shopware CLI uses its bundled PHP-CS-Fixer configuration.

Prettier uses the configuration bundled with Shopware CLI. A project or extension `.prettierrc` is not used by the `format` commands.
