---
nav:
  title: Extension Verifier
  position: 30

---

# Extension Verifier

Extension Verifier is a self-contained tool to check, format and refactor extensions (Plugins / Apps) or a complete project. The Verifier uses various tools to perform the checks and combine the result into one unified output.
The following tools are included with the Verifier:

- ESLint
- PHPStan
- Rector
- Stylelint
- PHP-CS-Fixer

All of these tools are pre-configured if no config was provided.

## Installation

The Extension Verifier is only available as Docker Image as it contains all Tools pre-installed with correct dependencies. So it can be used with a single Docker command:

```shell
docker run --rm ghcr.io/shopwarelabs/extension-verifier:latest
```

::: info
The tag latest points always to the most recent version, you may want to pin the Docker Image to a specific version and update it from time to time.
:::

Additionally, we provide a ready to use GitHub Action:

```yaml
jobs:
    check:
        runs-on: ubuntu-24.04
        strategy:
            fail-fast: false
            matrix:
                version-selection: [ 'lowest', 'highest']
        steps:
            - name: Checkout
              uses: actions/checkout@v4

            - name: Check extension
              uses: shopware/github-actions/extension-verifier@main
              with:
                   action: check
                   check-against: ${{ matrix.version-selection }}
```

## Formatting

To run the formatter, you can use the following command:

```shell
docker run --rm -v $(pwd):/ext ghcr.io/shopwarelabs/extension-verifier:latest format /ext
```

You can run it also in dry mode, just show the changes instead of editing the files

```shell
docker run --rm -v $(pwd):/ext ghcr.io/shopwarelabs/extension-verifier:latest format /ext --dry-run
```

By default, the formatting is done by Shopware Coding Standard. You can configure the formatting by creating a `.php-cs-fixer.dist.php` in your extension root.

## Check

To run the checks, you can use the following command:

```shell
docker run --rm -v $(pwd):/ext ghcr.io/shopwarelabs/extension-verifier:latest check /ext
```

It will check by default to the latest allowed Shopware version by your constraints in `composer.json`. It's recommended to run the check against the lowest and highest allowed version, so you can be sure that your extension is compatible with all versions. You can do this by using the `--check-against` option:

```shell
docker run --rm -v $(pwd):/ext ghcr.io/shopwarelabs/extension-verifier:latest check /ext --check-against lowest
docker run --rm -v $(pwd):/ext ghcr.io/shopwarelabs/extension-verifier:latest check /ext --check-against highest
```

The check command has multiple reporting options, you can use `--reporter` to specify the output format. The following formats are supported:

- `summary` - default list of all errors and warnings
- `json` - json output
- `junit` - junit output
- `github` - GitHub Actions output
- `markdown` - markdown output

## Refactoring

To run the refactoring, you can use the following command:

::: warning
Make sure you have a copy of your extension before running the command, as it will change your files!
:::

```shell
docker run --rm -v $(pwd):/ext ghcr.io/shopwarelabs/extension-verifier:latest fix /ext
```

This will execute Rector and ESLint to refactor your code. You should review the changes made and decide if you want to keep them or not.

## Validation ignores

In case you want to ignore errors or warnings, you can create a `.shopware-extension.yaml` file in your extension root with the following content:

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

## Scanning a project

It's possible to scan an entire project instead of just a single extension. This is useful if you want to check all extensions in your project at once. You can do this by passing a path to the project root instead of the extension path.

All config files like `phpstan.neon`, and `.php-cs-fixer.dist.php` should be placed in the project root for proper configuration for overriding the default settings. The Verifier will automatically detect the config files and use them for the checks.

Ignoring errors works similar to extensions, in that case you can create a `.shopware-project.yaml` file in your project root with the same syntax.

## Common issues

### Missing classes in Storefront/Elasticsearch bundle

Your plugin typically requires only `shopware/core`, but when you use classes from Storefront or Elasticsearch Bundle, and they are required, you have to add `shopware/storefront` or `shopware/elasticsearch` also to the `require` in the composer.json. If those features are optional with `class_exists` checks, you want to add them into `require-dev`, so the dependencies are installed only for development, and PHPStan can recognize the files.
