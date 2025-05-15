---
nav:
  title: Validation
  position: 5000

---

## Validation

Shopware CLI has a built-in validation for extensions. This is useful in your CI/CD pipeline to validate the extension before you release it.

## Validating an extension

To validate an extension, you can use the following command:

<Tabs>

<Tab title="Without Docker">

```shell
shopware-cli extension validate /path/to/your/extension
```

</Tab>

<Tab title="Docker">

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli extension validate /ext
```

</Tab>

</Tabs>

The path can be absolute or relative to the directory containing the extension or the zip file. The command exists with a non-zero exit code if the validation fails with an error level message.

## What is validated in basic mode?

- The `composer.json` has an `shopware/core` requirement and constraint is parsable
- The extension metadata is filled with:
  - `name`
  - `label` (German and English)
  - `description` (German and English) and longer than 150 characters and shorter than 185 characters
- Translations have equality translated in the given languages
- PHP can be correctly linted with the minimum PHP version
- The `theme.json` can be parsed and included assets can be found
- All translations are translated in all given languages

## Supported PHP versions for linting

The following PHP versions are supported for linting:

- 7.3
- 7.4
- 8.1
- 8.2

These versions don't need to be installed locally, they are downloaded on demand and executed using WebAssembly without any dependencies.

## Running all validation tools

By default, only few tools are run, but you can run all tools by using the `--full` option. This will run all available tools and check your extension against the latest Shopware version.

<Tabs>
<Tab title="Without Docker">

```shell
shopware-cli extension validate --full /path/to/your/extension
```

</Tab>

<Tab title="Docker">

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli extension validate --full /ext
```

</Tab>

</Tabs>

It will check by default to the latest allowed Shopware version by your constraints in `composer.json`. It's recommended to run the check against the lowest and highest allowed version, so you can be sure that your extension is compatible with all versions. You can do this by using the `--check-against` option:

<Tabs>

<Tab title="Without Docker">

```shell
shopware-cli extension validate --full /ext --check-against lowest
shopware-cli extension validate --full /ext --check-against highest
```

</Tab>

<Tab title="Docker">

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli extension validate --full /ext --check-against lowest
docker run --rm -v $(pwd):/ext shopware/shopware-cli extension validate --full /ext --check-against highest
```

</Tab>

</Tabs>

The check command has multiple reporting options, you can use `--reporter` to specify the output format. The following formats are supported:

| Format     | Description                             |
|------------|-----------------------------------------|
| `summary`  | default list of all errors and warnings |
| `json`     | json output                             |
| `junit`    | junit output                            |
| `github`   | GitHub Actions output                   |
| `markdown` | markdown output                         |

## Running Specific Tools

Instead of running all tools, you can choose to run specific tools using the `--only` flag. The following tools are available:

| Tool           | Description                    |
|----------------|--------------------------------|
| `phpstan`      | PHP static analysis            |
| `sw-cli`       | Shopware CLI validation checks |
| `stylelint`    | CSS/SCSS linting               |
| `admin-twig`   | Admin Twig template checks     |
| `php-cs-fixer` | PHP code style fixing          |
| `prettier`     | Code formatting                |
| `eslint`       | JavaScript/TypeScript linting  |
| `rector`       | PHP code refactoring           |

You can run a single tool:

<Tabs>

<Tab title="Without Docker">

```shell
shopware-cli extension validate --full /ext --only phpstan
```

Or run multiple tools by separating them with commas:

```shell
shopware-cli extension validate --full /ext --only "phpstan,eslint,stylelint"
```

</Tab>

<Tab title="Docker">

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli extension validate --full /ext --only phpstan
```

Or run multiple tools by separating them with commas:

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli extension validate --full /ext --only "phpstan,eslint,stylelint"
```

</Tab>

</Tabs>

This is particularly useful when:

- You want to focus on specific aspects of your code
- You want to run only the relevant tools for the files you've changed
- You want to fix issues one tool at a time

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

### Missing classes in Storefront/Elasticsearch bundle

Your plugin typically requires only `shopware/core`, but when you use classes from Storefront or Elasticsearch Bundle, and they are required, you have to add `shopware/storefront` or `shopware/elasticsearch` also to the `require` in the composer.json. If those features are optional with `class_exists` checks, you want to add them into `require-dev`, so the dependencies are installed only for development, and PHPStan can recognize the files.
