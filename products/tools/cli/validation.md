---
nav:
  title: Validation
  position: 5000

---

## Validation

Shopware CLI has built-in validation for extensions. It is meant to be run locally and in CI/CD pipelines, so that you can find technical problems in an extension version before you upload it to the [Shopware Store](https://store.shopware.com/de/).

Validation has two modes:

- **Basic (default)**: The built-in `sw-cli` checks: metadata, icon, license, snippets, PHP lint, packaging. Does not need PHP or Node.js.
- **Full (`--full`)**: Involves everything from basic, plus PHPStan, ESLint, Stylelint, Prettier, PHP-CS-Fixer, Rector, Twig linters. **_Does_** need PHP and Node.js.

Some validation tools, especially when using `--full`, run PHP and Node.js tooling under the hood. The Docker examples are recommended because the image already contains the required runtime dependencies. If PHP and Node.js are available locally, you can run the `shopware-cli` commands directly instead.

:::info
Validation covers the automatable technical criteria of an extension: metadata, packaging, static analysis, and code style. It is not a one-to-one replica of the complete Shopware Store review, which also includes checks that cannot be automated locally (for example functional testing, store page content, and manual review). Treat a green local run as "the automatable technical criteria pass", not as a guaranteed Store approval. See [Checking a release before uploading it to the Store](#checking-a-release-before-uploading-it-to-the-store).
:::

## Validating an extension

To validate an extension, you can use the following command:

<Tabs>

<Tab title="With Docker (recommended)">

The command mounts your current directory to `/ext` inside the container and validates that mounted extension directory:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate /ext
```

</Tab>

<Tab title="Without Docker">

Use the local path to your extension when running the command without Docker:

```shell
shopware-cli extension validate /path/to/your/extension
```

</Tab>

</Tabs>

The path can be absolute or relative to the directory containing the extension or the zip file. The command exits with a non-zero exit code if the validation fails with an error-level message. Warnings are reported but do not fail the command.

### Validating a directory or a zip file

`extension validate` accepts both a source directory and a built zip file, and the two are not equivalent:

| Input          | Behavior                                                                                                                                                                                 |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Directory      | Fast feedback loop during development. Packaging checks (`zip.disallowed_file`) are automatically ignored, because development files like `tests` or `phpstan.neon` are expected to be there. With `--full`, the files are copied to a temporary directory first (see [`--no-copy`](#running-without-copying-the-sources)). |
| zip file       | Validates exactly the artifact the Store receives. Packaging checks are active: disallowed files and directories, and path traversal inside the archive.                                   |

For this reason, validate the zip file as the final gate before uploading a version to the Store, and validate the directory during day-to-day development.

## What is validated in basic mode?

Basic mode runs the `sw-cli` tool, which performs the following checks. The identifier in brackets is the value you can use in [validation ignores](#validation-ignores).

Metadata in `composer.json` (plugins/themes) or `manifest.xml` (apps):

- The version is present and parsable (`metadata.version`)
- The extension name is present and non-empty (`metadata.name`)
- A `shopware/core` requirement exists and the constraint is parsable (`metadata.shopware_version`)
- `label` is translated in German and English (`metadata.label`)
- `description` is translated in German and English, and each is between 150 and 185 characters (`metadata.description`)
- The license is either `proprietary` or a valid SPDX license identifier (`metadata.license`)
- For apps: `meta:author`, `meta:copyright`, and `meta:license` are set (`metadata.author`, `metadata.copyright`, `metadata.license`)
- For apps: `setup:secret` is not committed, as it is only meant for local development (`metadata.setup`)

Extension icon:

- The icon file exists (`metadata.icon`)
- It is not larger than 30 KB (`metadata.icon.size`)
- Its dimensions are between 112x112 and 256x256 pixels (`metadata.icon.size`)

Code and structure:

- All PHP files can be linted with the minimum supported PHP version (`php.linter`)
- The `theme.json` can be parsed and included assets can be found
- All snippet files of the administration and the storefront contain the same set of translation keys
- Deprecated `Resources/config/services.xml` and `Resources/config/routes.xml` are reported as a warning, as Symfony XML configuration should be migrated to YAML (`config.services_xml.deprecated`, `config.routes_xml.deprecated`). `shopware-cli extension fix` can convert them automatically
- For apps: no `.php` files are contained (`zip.disallowed_php_file`), and `.twig` files only live in `Resources/views` or `Resources/scripts` (`zip.disallowed_twig_file`)

Packaging (only when a zip file is validated):

- No disallowed files or directories are contained, for example `.git`, `.github`, `tests`, `var`, `node_modules`, `phpstan.neon`, `.php-cs-fixer.dist.php`, `auth.json`, `Resources/store`, or CI configuration files (`zip.disallowed_file`)
- No path traversal is contained in the archive (`zip.path_travel`)

### Supported PHP versions for linting

The following PHP versions are supported for linting:

- 7.3
- 7.4
- 8.0
- 8.1
- 8.2
- 8.3
- 8.4
- 8.5
- 8.6 (preview)

A `composer.json` requiring PHP 7.2 is linted with 7.3, as 7.2 is not supported by the linter.

These versions don't need to be installed locally; they are downloaded on demand and executed using WebAssembly without any dependencies.

The version is derived from the Shopware version constraint of your extension. To lint against a specific version instead, set it in `.shopware-extension.yaml`:

```yaml
validation:
  php_version: '8.4'
```

## Running all validation tools

By default, validate runs basic checks: extension metadata, some linting, and common mistakes. Use the `--full` option to run comprehensive checks with all available tools: phpstan for PHP static analysis, ESLint for JavaScript, and more. This will thoroughly validate your extension against the latest Shopware version.

<Tabs>

<Tab title="With Docker (recommended)">

The command mounts your current directory to `/ext` inside the container and validates that mounted extension directory:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate --full /ext
```

</Tab>

<Tab title="Without Docker">

Use the local path to your extension when running the command without Docker:

```shell
shopware-cli extension validate --full /path/to/your/extension
```

</Tab>

</Tabs>

With `--full`, the CLI downloads its bundled PHP and Node.js tooling on first use and installs the Composer dependencies of your extension if no `vendor` directory exists yet. Packages listed under `suggest` in your `composer.json` are installed as well, so that optional integrations can be analyzed. Private packages require an `auth.json` in the extension root.

By default, it will check against the latest allowed Shopware version according to your constraints in `composer.json`.

:::info
It's recommended to run the check against the lowest and highest allowed version, so you can be sure that your extension is compatible with all versions. This is critical because extensions often pass validation on the latest version but fail on the lowest supported version due to API changes and deprecations.
:::

You can do this by using the `--check-against` option:

<Tabs>

<Tab title="With Docker (recommended)">

The command mounts your current directory to `/ext` inside the container and validates that mounted extension directory:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate --full /ext --check-against lowest
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate --full /ext --check-against highest
```

</Tab>

<Tab title="Without Docker">

Use the local path to your extension when running the command without Docker:

```shell
shopware-cli extension validate --full /path/to/your/extension --check-against lowest
shopware-cli extension validate --full /path/to/your/extension --check-against highest
```

</Tab>

</Tabs>

With `--check-against lowest`, the Composer dependencies are resolved with `--prefer-lowest`, so the extension is analyzed against the oldest Shopware version your constraint allows.

The check command has multiple reporting options, you can use `--reporter` to specify the output format. The following formats are supported:

| Format     | Description                             |
|------------|-----------------------------------------|
| `summary`  | default list of all errors and warnings |
| `json`     | json output                             |
| `junit`    | junit output                            |
| `github`   | GitHub Actions output                   |
| `gitlab`   | GitLab Code Quality output              |
| `markdown` | markdown output                         |

If `--reporter` is not set, the format is detected automatically: `github` when running in GitHub Actions, `gitlab` when running in GitLab CI, and `summary` otherwise.

## Running Specific Tools

Instead of running all tools, you can choose to run specific tools using the `--only` flag. The following tools are available:

| Tool              | Description                                                       | Runs in basic mode |
|-------------------|-------------------------------------------------------------------|--------------------|
| `sw-cli`          | Shopware CLI validation checks (metadata, icon, snippets, packaging) | Yes                |
| `phpstan`         | PHP static analysis (skipped for apps, as they have no `composer.json`) | No                 |
| `php-cs-fixer`    | PHP code style                                                    | No                 |
| `rector`          | PHP code refactoring and deprecation detection                    | No                 |
| `eslint`          | JavaScript/TypeScript linting                                     | No                 |
| `stylelint`       | CSS/SCSS linting                                                  | No                 |
| `prettier`        | Code formatting                                                   | No                 |
| `admin-twig`      | Admin Twig template checks                                        | No                 |
| `storefront-twig` | Storefront Twig template checks                                   | No                 |
| `symfony-xml`     | Symfony XML configuration checks                                  | No                 |

You can run a single tool:

<Tabs>

<Tab title="With Docker (recommended)">

The command mounts your current directory to `/ext` inside the container and validates that mounted extension directory:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate --full /ext --only phpstan
```

Or run multiple tools by separating them with commas:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate --full /ext --only "phpstan,eslint,stylelint"
```

</Tab>

<Tab title="Without Docker">

Use the local path to your extension when running the command without Docker:

```shell
shopware-cli extension validate --full /path/to/your/extension --only phpstan
```

Or run multiple tools by separating them with commas:

```shell
shopware-cli extension validate --full /path/to/your/extension --only "phpstan,eslint,stylelint"
```

</Tab>

</Tabs>

This is particularly useful when:

- You want to focus on specific aspects of your code
- You want to run only the relevant tools for the files you've changed
- You want to fix issues one tool at a time

The inverse is `--exclude`, which runs everything except the listed tools:

```shell
shopware-cli extension validate --full /path/to/your/extension --exclude "prettier,php-cs-fixer"
```

Both flags accept a comma-separated list and fail with an error if a tool name does not exist.

### Running without copying the sources

With `--full`, the extension is copied to a temporary directory before the tools run, so that generated files do not end up in your working directory. Use `--no-copy` to run the tools directly in the source directory instead:

```shell
shopware-cli extension validate --full --no-copy /path/to/your/extension
```

This is faster on large extensions and keeps the installed `vendor` directory around for the next run, but the tools may write cache and dependency files into your extension directory.

## Store compliance checks

The `--store-compliance` flag enables additional checks that are relevant when an extension is distributed through the Shopware Store:

```shell
shopware-cli extension validate --store-compliance /path/to/your/extension.zip
```

It changes the behavior in two ways:

- Asset checks are enabled: built administration and storefront assets must be shipped together with their sources, and shipped sources must have their built assets. This catches both a zip with build artifacts that cannot be rebuilt and a zip that is missing the compiled assets.
- Your `validation.ignore` configuration is discarded, so no finding can be silenced.

Alternatively, set the environment variable `SHOPWARE_CLI_STORE_COMPLIANCE=1`, which is useful in a pipeline where the same command is shared between local and release runs.

The flag can be combined with `--full`.

## Checking a release before uploading it to the Store

To check a new version of an existing extension the same way you would check a first release, build the artifact and validate the artifact itself:

```shell
# 1. Build the assets and create the zip that will be uploaded
shopware-cli extension zip --release /path/to/your/extension

# 2. Validate the built zip against the lowest and the highest supported Shopware version
shopware-cli extension validate --full --store-compliance MyExtension-1.2.0.zip --check-against lowest
shopware-cli extension validate --full --store-compliance MyExtension-1.2.0.zip --check-against highest
```

Because this runs against the zip, the packaging checks are active and you get the same error-level findings that a wrongly packaged upload would produce. See [Creating a zip](./extension-commands/build.md) for the available `extension zip` options and [Releasing an extension to the Shopware Store](./shopware-account-commands/releasing-extension-to-shopware-store.md) for the upload itself.

In GitHub Actions, the source directory can be validated on every pull request, and the built zip on every tag:

```yaml
name: Validate extension
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shopware/shopware-cli-action@v3
      - name: Validate against the lowest supported version
        run: shopware-cli extension validate --full . --check-against lowest
      - name: Validate against the highest supported version
        run: shopware-cli extension validate --full . --check-against highest

  validate-release:
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shopware/shopware-cli-action@v3
      - name: Build the zip
        run: shopware-cli extension zip --release --output-directory dist .
      - name: Validate the zip
        run: shopware-cli extension validate --full --store-compliance dist/*.zip --check-against lowest
```

Use `--store-compliance` on the built zip rather than on a plain source checkout: its asset checks expect built administration and storefront assets to be present, which is only true after `extension zip` (or an explicit build) has run.

The `github` reporter is selected automatically in GitHub Actions, so findings are annotated on the changed lines.

:::warning
Local validation cannot replace the Store review completely. It does not verify the content of your store page, screenshots, or changelog, it does not install and functionally test your extension in a shop, and it does not cover parts of the review that are done manually. A version that passes locally can still be rejected for those reasons.
:::

## Validation ignores

If you want to ignore errors or warnings, you can create a `.shopware-extension.yaml` file in your extension root with the following content:

```yaml
validation:
  ignore:
    # Ignore all errors by identifier
    - identifier: 'Shopware.XXXXXX'
    # Ignore all errors by identifier and path
    - identifier: 'Shopware.XXXXXX'
      path: 'path/to/file.php'
    # Ignore all errors by message and path
    - message: 'Some error message'
      path: 'path/to/file.php'
    # Ignore all errors by message
    - message: 'Some error message'
```

The identifier of a finding is shown in the validation output and is listed for the built-in checks in [What is validated in basic mode?](#what-is-validated-in-basic-mode).

The `validation.ignore` rules have the following limitations:

- They are only applied to the `validate` command. The `fix` command does not respect them and will still apply fixes even when an ignore would match (by identifier or message). This is a known limitation.
- They are not applied when `--store-compliance` is used.
- When a directory instead of a zip file is validated, the packaging findings (`zip.disallowed_file`) are always ignored, regardless of the configuration.

## Scanning a project

It's possible to scan an entire project instead of just a single extension. This is useful if you want to check all extensions in your project at once. You can do this by passing the path to the project root instead of the extension path.

All config files like `phpstan.neon` and `.php-cs-fixer.dist.php` should be placed in the project root for proper configuration or to override the default settings. The Verifier will automatically detect the config files and use them for the checks.

Ignoring errors works similarly to extensions; in that case, you can create a `.shopware-project.yaml` file in your project root with the same syntax.

## Common issues

### Fixer does nothing for Shopware 6.7

The fixers are enabled by the supported Shopware Version in the plugins `composer.json` file. For 6.7, you should change the composer constraint to this:

```json
{
    "minimum-stability": "dev",
    "require": {
        "shopware/core": "~6.7.0"
    }
}
```

### Missing classes in a Storefront/Elasticsearch bundle

Your plugin typically requires only `shopware/core`, but when you use classes from Storefront or the Elasticsearch Bundle, and they are required, you have to add `shopware/storefront` or `shopware/elasticsearch` also to the `require` in the composer.json. If those features are optional with `class_exists` checks, you want to add them into `require-dev`, so the dependencies are installed only for development and PHPStan can recognize the files.

### PHPStan uses my own configuration instead of the Shopware one

If a `phpstan.neon`, `phpstan.neon.dist`, or `phpstan.dist.neon` exists in the validated root directory, it takes precedence over the configuration shipped with Shopware CLI. Remove or rename it to validate with the default rule set.
