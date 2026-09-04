---
nav:
  title: Formatter
  position: 5001

---

# Formatter

Shopware CLI provides code formatting through two `format` commands:

- `extension format` to format a single extension
- `project format` to format extensions and configured bundles across a Shopware project

The formatter covers PHP and Administration Twig files, along with files supported by Prettier such as JavaScript, TypeScript, Vue, CSS, and SCSS. PHP formatting uses the Shopware [Coding Standard](https://developer.shopware.com/docs/resources/guidelines/code/).

A `--dry-run` mode is available to check formatting without rewriting the target files.

The Docker examples are recommended because the image already contains the required runtime dependencies. For local execution, the formatter tooling requires PHP 8.2 or later and Node.js 20 or later. Composer and npm are used when Shopware CLI initializes its local tool cache.

## Formatting tools

Without `--only`, a `format` command invokes every registered verifier tool. The following tools currently implement formatting in `Format()`:

| Tool | What it formats | Implementation |
|---|---|---|
| `php-cs-fixer` | PHP source files using the Shopware Coding Standard | [`phpcsfixer.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/phpcsfixer.go) |
| `prettier` | Prettier-supported files in source directories using the Shopware CLI bundled configuration | [`prettier.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/prettier.go) |
| `admin-twig` | Administration Twig templates | [`admin_twig.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/admin_twig.go) |

Other registered verifier tools do not modify files in `format` mode.

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

| Flag | Description |
|------|-------------|
| `--dry-run` | Check formatting without modifying files |
| `--only <tools>` | Run only the specified comma-separated tools |

The path argument is optional for `project format` but required for `extension format`.

Format only PHP:

```shell
shopware-cli project format /path/to/your/project --only php-cs-fixer
```

## Configuration

PHP-CS-Fixer uses a `.php-cs-fixer.dist.php` from the target root when one is present. Otherwise, Shopware CLI uses its bundled PHP-CS-Fixer configuration.

Prettier uses the configuration bundled with Shopware CLI. A project or extension `.prettierrc` is not used by the `format` commands.

Administration Twig formatting uses the Shopware CLI built-in formatter and has no separate configuration file.
