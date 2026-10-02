---
nav:
  title: Validation
  position: 5000

---

## Validation

Shopware CLI has built-in validation for extensions. Run it during development and in CI/CD pipelines to find technical problems before uploading an extension version to the [Shopware Store](https://store.shopware.com/de/).

Validation covers technical criteria that can be automated, such as metadata, packaging, static analysis, and linting. It is not a one-to-one replica of the complete Shopware Store review, which also includes functional testing, Store page content, and manual review. A successful validation run is a strong technical pre-upload signal, but it does not guarantee Store approval or mean that the CLI and Store review use an identical rule set.

By default, `extension validate` runs every checker:

- The built-in `builtin` checks cover metadata, icon, snippets, PHP linting, and packaging-related checks. The legacy name `sw-cli` remains accepted as an input alias.
- PHPStan, ESLint, Stylelint, and the Administration and Storefront Twig linters provide additional checks.

Use `--only` to select specific checkers. For example, `extension validate /ext --only phpstan` runs PHPStan without the built-in `builtin` checks. To run only the built-in checks, use `--only builtin`; `--only sw-cli` remains supported for backwards compatibility and emits a deprecation warning. The deprecated `--full` flag is still accepted, but has no effect because all checkers run by default.

Existing scripts and CI jobs that previously omitted `--full` now also run PHPStan, ESLint, Stylelint, and the Twig checkers. They can report additional findings and require external runtime dependencies. To preserve the previous default, select the built-in checker explicitly:

```shell
shopware-cli extension validate /path/to/your/extension --only builtin
```

The legacy name `sw-cli` is accepted in both `--only` and `--exclude` for extension and project validation, with a deprecation warning. Use `builtin` in new configurations. Reports, tool statuses, and selection errors use the canonical name `builtin`.

### Recommended setup: Docker

Run Shopware CLI through the `ghcr.io/shopware/shopware-cli` Docker image for a consistent validation environment without managing the required runtimes on the host. The primary examples on this page use Docker.

If you already run Shopware CLI directly in an existing development or CI environment, the same CLI commands continue to work. Default validation, or selecting PHPStan, ESLint, or Stylelint with `--only`, requires PHP 8.2 or newer, Node.js 20 or newer, Composer, and npm on the host.

## Validating an extension

From the extension directory, mount the current directory into the Shopware CLI container and validate it:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate /ext
```

If you run Shopware CLI directly on the host, use the corresponding local path:

```shell
shopware-cli extension validate /path/to/your/extension
```

For direct CLI execution, relative paths are resolved from the current working directory. The command exits with a non-zero exit code if validation reports an error-level finding. Warnings are reported but do not fail the command.

### Validating a directory or a zip file

`extension validate` accepts both a source directory and a built zip file, and the two are not equivalent:

| Input     | Behavior                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Directory | Development input. Ignores `zip.disallowed_file`; copied to a temporary directory when PHPStan, ESLint, or Stylelint is selected, unless `--no-copy` is used. |
| Zip file  | Validates the packaged artifact. Packaging-related validation is not automatically suppressed.                                                                |

For day-to-day development, validate the source directory. Before uploading a release, validate the packaged zip so the checks run against the artifact you intend to submit.

## What does the built-in checker validate?

The built-in `builtin` checker is included by default and can be run alone with `--only builtin` (`--only sw-cli` remains a backwards-compatible alias). It includes checks such as the following; this list is not exhaustive. The identifier in brackets is the value you can use in [validation ignores](#validation-ignores).

Metadata and extension structure checks include:

- The extension version and name are present and valid (`metadata.version`, `metadata.name`)
- The Shopware version constraint can be determined (`metadata.shopware_version`)
- Plugin Composer metadata such as type, description, authors, requirements, autoloading, labels, descriptions, manufacturer links, and support links is validated
- App metadata such as author, copyright, license, and development-only setup secrets is validated
- The extension icon exists and meets the supported size and dimension requirements (`metadata.icon`, `metadata.icon.size`)
- `theme.json` can be parsed and referenced assets can be found
- Administration and Storefront snippet files contain matching translation keys
- PHP source files are linted (`php.linter`)
- Deprecated `Resources/config/services.xml` and `Resources/config/routes.xml` are reported as warnings. `shopware-cli extension fix` can convert them to YAML
- Apps are checked for disallowed PHP and Twig files (`zip.disallowed_php_file`, `zip.disallowed_twig_file`)

Zip validation also runs packaging-related checks that are suppressed for directory input.

### Supported PHP versions for linting

Shopware CLI uses an embedded Go-based PHP linter. It does not download or execute PHP runtimes for the built-in PHP linting check.

The underlying linter supports PHP language profiles from PHP 7.2 through PHP 8.5, with PHP 8.6 available as a preview profile. Shopware CLI currently normalizes a derived PHP 7.2 profile to PHP 7.3 for linting.

By default, Shopware CLI derives the PHP language profile from the extension's Shopware version constraint. To select a specific profile instead, set `validation.php_version` in `.config/shopware-extension.yml`. See the [Shopware CLI configuration file lookup priority](./configuration.md) for the preferred path and legacy fallbacks:

```yaml
validation:
  php_version: '8.4'
```

## Running all checkers

All checkers run by default:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate /ext
```

If you run Shopware CLI directly on the host, the equivalent command is:

```shell
shopware-cli extension validate /path/to/your/extension
```

For direct execution with PHPStan, ESLint, or Stylelint selected, Shopware CLI prepares a cached tool directory for the CLI version. On first use it installs the PHP tool dependencies with Composer and the JavaScript tool dependencies with npm. If the validated extension has no `vendor` directory, PHPStan also resolves its Composer dependencies; packages listed under `suggest` are included so optional integrations can be analyzed. Private Composer packages require appropriate Composer authentication.

On a clean validation run, dependency resolution can take some time. Composer progress is not streamed while this step runs, so the command can remain quiet until dependency resolution completes.

`--check-against` controls Composer dependency resolution within the extension's declared constraints; it is not an arbitrary target-version selector. By default, Composer dependency resolution uses the highest versions allowed by the extension constraints. To test the other end of the supported range, use `--check-against lowest`:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate /ext --check-against lowest
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate /ext --check-against highest
```

If you run Shopware CLI directly:

```shell
shopware-cli extension validate /path/to/your/extension --check-against lowest
shopware-cli extension validate /path/to/your/extension --check-against highest
```

With `--check-against lowest`, Composer adds `--prefer-lowest` when it resolves the extension dependencies.

:::warning
Dependency resolution only runs when the validated copy does not already contain a `vendor` directory. If `vendor` is present, both `lowest` and `highest` reuse those installed dependencies instead of resolving a new dependency set. Use a clean validation input when you want the two commands to exercise both ends of the supported dependency range.
:::

### Output formats

Use `--format` to specify the output format (the older `--reporter` flag is deprecated; use `--format` instead):

| Format     | Description                 |
| ---------- | --------------------------- |
| `summary`  | List of errors and warnings |
| `json`     | JSON output                 |
| `junit`    | JUnit output                |
| `github`   | GitHub Actions output       |
| `gitlab`   | GitLab Code Quality output  |
| `markdown` | Markdown output             |

If `--format` is not set, the format is detected automatically: `github` in GitHub Actions, `gitlab` in GitLab CI, and `summary` otherwise.

`extension validate` also reports which checkers were `invoked` or `skipped`. `Invoked` means the checker was called, not that it analyzed files or produced findings; a checker can have no applicable files. Summary and GitHub logs show a checker table before the closing summary. Markdown includes the table, JSON includes a `tools` array, and JUnit includes checker test cases. GitLab and JUnit write the human-readable table to stderr so stdout remains machine-readable. If a checker returns an execution error, the report is still emitted and the command fails.

## Running specific validation tools

By default, `extension validate` calls every registered checker. Use `--only` or `--exclude` to narrow the selection. The available tool capabilities are:

| Tool              | Reports in `validate` | Rewrites in `fix` | Formats in `format` | Notes                                                                                                                                                                     |
| ----------------- | --------------------- | ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `builtin`         | ✅ (extensions only)  | —                 | —                   | Extension metadata, snippets, structure, packaging. `sw-cli` is accepted as a legacy alias. Returns immediately for a project, so **projects get no metadata validation** |
| `phpstan`         | ✅                    | —                 | —                   | PHP static analysis; returns without analyzing apps (no `composer.json`)                                                                                                  |
| `eslint`          | ✅                    | ✅                | —                   | JavaScript, Vue, TypeScript with Shopware-specific rules                                                                                                                  |
| `stylelint`       | ✅                    | ✅                | —                   | CSS/SCSS with Shopware standards                                                                                                                                          |
| `admin-twig`      | ✅                    | ✅                | ✅                  | Administration Twig component checks and migrations                                                                                                                       |
| `storefront-twig` | ✅                    | —                 | —                   | Storefront Twig checks (accessibility, inline styles); reports only                                                                                                       |
| `rector`          | —                     | ✅                | —                   | PHP breaking-change and upgrade rules. **Rewrites without reporting** — nothing appears in `validate`                                                                     |
| `symfony-xml`     | —                     | ✅                | —                   | Converts deprecated `services.xml` / `routes.xml` to YAML                                                                                                                 |
| `php-cs-fixer`    | —                     | —                 | ✅                  | PHP code style (Shopware Coding Standard)                                                                                                                                 |
| `prettier`        | —                     | —                 | ✅                  | JavaScript, Vue, TypeScript, CSS, SCSS formatting                                                                                                                         |

Each command selects only tools that support its operation. An unsupported `--only` name is an error that lists the available tools for that command; for example, `validate --only prettier` and `fix --only phpstan` are errors.

### Shopware-specific validation rules

ESLint and Stylelint include Shopware-curated packages that enforce best practices for extensions:

- **`@shopware-ag/admin-eslint-rules`**: Administration JavaScript/Vue patterns, component conventions, and API usage
- **`@shopware-ag/storefront-eslint-rules`**: Storefront JavaScript patterns and plugin standards
- **`@shopware-ag/admin-stylelint-rules`**: SCSS/CSS standards for the Administration UI

Additional plugins enforce accessibility (`eslint-plugin-vuejs-accessibility`), inclusive language (`eslint-plugin-inclusive-language`), and TypeScript/Vue support.

You can run only selected validation tools:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate /ext --only phpstan
```

Or run multiple validation tools by separating them with commas:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate /ext --only "phpstan,eslint,stylelint"
```

If you run Shopware CLI directly, use the same flags with the local extension path.

Use `--exclude` to remove tools from the selected set. Without `--only`, that set contains every checker:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate /ext --exclude "eslint,stylelint"
```

Both flags accept a comma-separated list. `--only` fails if a name is not a checker; `--exclude` fails if a name is not in the selected set.

When combined, `--only` selects the checkers first and `--exclude` removes checkers from that selection:

```shell
shopware-cli extension validate /path/to/your/extension --only "builtin,phpstan,eslint" --exclude eslint
```

This runs only `builtin` and `phpstan`. Excluding every selected checker is an error for `extension validate`.

### Running without copying the sources

When PHPStan, ESLint, or Stylelint is selected, a directory input is copied to a temporary directory before the tools run. Selecting only `builtin` and/or Twig checkers skips copying and external tool setup. Use `--no-copy` to run directly in the mounted source directory instead:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate --no-copy /ext
```

For direct CLI execution, the equivalent option is:

```shell
shopware-cli extension validate --no-copy /path/to/your/extension
```

This can be faster on large extensions and keeps generated dependency or cache files, such as `vendor/` and `composer.lock`, in the source directory, but it also means validation tools can modify or add files there.

## Checking a release before uploading it to the Store

For the strongest pre-upload signal available from Shopware CLI, validate the same package that you intend to upload. This runs the full validator set used by the CLI against the packaged artifact. It does not guarantee that every Store-review criterion is represented in the CLI or that passing validation guarantees Store approval.

`extension package` is the current packaging command. `extension zip` remains available as a deprecated alias.

From the extension root, create a release package with a predictable filename:

```shell
mkdir -p dist
docker run --rm -v "$(pwd)":/ext -w /ext ghcr.io/shopware/shopware-cli extension package /ext --release --output-directory /ext/dist --filename extension.zip
```

Then validate the packaged artifact:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension validate /ext/dist/extension.zip
```

If you already run Shopware CLI directly, the corresponding workflow is:

```shell
shopware-cli extension package /path/to/your/extension --release --output-directory dist --filename extension.zip
shopware-cli extension validate dist/extension.zip
```

See [Building Extensions and Creating Archives](./extension-commands/build.md) for packaging options and [Releasing an extension to the Shopware Store](./shopware-account-commands/releasing-extension-to-shopware-store.md) for the upload itself.

In GitHub Actions, you can use the same Docker image rather than maintaining PHP and Node.js setup steps on the runner:

```yaml
name: Validate extension
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate extension
        run: docker run --rm -v "$GITHUB_WORKSPACE":/ext ghcr.io/shopware/shopware-cli extension validate /ext

  validate-release:
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Create release package
        run: |
          mkdir -p dist
          docker run --rm -v "$GITHUB_WORKSPACE":/ext -w /ext ghcr.io/shopware/shopware-cli extension package /ext --release --output-directory /ext/dist --filename extension.zip
      - name: Validate release package
        run: docker run --rm -v "$GITHUB_WORKSPACE":/ext ghcr.io/shopware/shopware-cli extension validate /ext/dist/extension.zip
```

The `github` format is selected automatically in GitHub Actions, so findings are emitted as GitHub annotations.

:::warning
Local or CI validation cannot replace the Store review completely. It does not install and functionally test the extension in a shop, verify all Store listing content, or cover manual review criteria. A version that passes validation can still be rejected for those reasons.
:::

## Validation ignores

To ignore selected errors or warnings for an extension, create a `.config/shopware-extension.yml` file in the extension root:

```yaml
validation:
  ignore:
    # Ignore all findings with this identifier
    - identifier: 'Shopware.XXXXXX'
    # Ignore findings with this identifier and path
    - identifier: 'Shopware.XXXXXX'
      path: 'path/to/file.php'
    # Ignore findings containing this message and matching this path
    - message: 'Some error message'
      path: 'path/to/file.php'
    # Ignore findings containing this message
    - message: 'Some error message'
```

The identifier of a finding is shown in the validation output.

Validation ignores are applied by the `validate` command. `extension fix` does not use `validation.ignore` to decide which fixes to apply.

Ignored findings are removed from the reported result; they do not make the underlying condition valid. A run can therefore report `0 problems` when all relevant findings are intentionally suppressed.

When a directory rather than a zip file is validated, `zip.disallowed_file` findings are automatically ignored independently of your configuration.

## Scanning a project

Use the dedicated project validation command to scan a Shopware project instead of a single extension:

```shell
docker run --rm -v "$(pwd)":/project -w /project ghcr.io/shopware/shopware-cli project validate /project
```

If you run Shopware CLI directly:

```shell
shopware-cli project validate /path/to/your/project
```

`project validate` gathers local extension source directories and configured bundles and runs the registered validation tools against them. Composer-managed extensions resolved under `vendor/` are skipped. Project-level validation settings are read from `.config/shopware-project.yml` under `validation`.

:::warning
`project validate` does not run extension metadata and packaging validation for every contained extension. The `builtin` verifier only runs with a single-extension context. Run `extension validate` for an individual extension when you also need its Composer or manifest metadata, icon, snippet, and package checks.
:::

If you omit the path, `project validate` discovers the nearest Shopware project by walking up from the current directory. A directory is recognized when its Composer metadata references `shopware/core` and `bin/console` exists; `PROJECT_ROOT` overrides this discovery.

### Project validation options

| Flag                | Description                                                                       |
| ------------------- | --------------------------------------------------------------------------------- |
| `--local-only`      | Only discover extensions from `custom/*` folders                                  |
| `--only <tools>`    | Run only selected tools (comma-separated)                                         |
| `--exclude <tools>` | Remove the listed checkers from the selection after applying `--only`             |
| `--no-copy`         | Analyze the project in place instead of copying it to a temporary directory first |
| `--format`          | Reporting format (`summary`, `json`, `github`, `gitlab`, `junit`, `markdown`)     |

`project validate` also runs its registered checkers by default. It has no `--full` flag. `builtin` is included in that registry but returns immediately without a single-extension context; `--only builtin` therefore reports no metadata findings. The legacy `--only sw-cli` alias is also accepted. Use `extension validate` to check an individual extension. `project validate` also has no `--check-against`; that flag exists only on `extension validate`.

Project validation uses the same checker names and applies `--exclude` after `--only`, rejecting names outside the selected set. It does not include checker invocation statuses in its reports. Unlike extension validation, it initializes external tooling even when only native checkers are selected.

Use `--local-only` when you want extension discovery limited to the `custom/*` folders:

```shell
shopware-cli project validate /path/to/your/project --local-only
```

For example, project validation ignores using the same identifier, path, and message fields:

```yaml
validation:
  ignore:
    - identifier: 'phpstan/some.identifier'
      path: 'custom/plugins/MyPlugin/src/Example.php'
```

You can also exclude extensions from project validation with `validation.ignore_extensions` in `.config/shopware-project.yml`.

### Detecting breaking changes before upgrading {#detecting-breaking-changes-before-upgrading}

`project validate` runs the registered validation tools against the project, including PHPStan. PHPStan can detect references to Shopware classes, interfaces, and traits that were removed or renamed. The output identifies the affected files and provides migration guidance where available.

To check custom code against a Shopware version you have not upgraded to yet, temporarily point the `shopware/core` requirement in `composer.json` at the target version and validate a clean input without a `vendor` directory. `project validate` normally copies the project to a temporary directory, but that copy includes `vendor/` when it exists. PHPStan only runs Composer dependency resolution when `vendor/` is absent; otherwise it reuses the already installed dependencies, even if you changed the constraint. A clean checkout or worktree without `vendor/` lets the temporary copy resolve the dependency set required by the target constraint without changing the original installed project.

**Note:** Building the project verifier configuration resolves the `shopware/core` constraint against the published Shopware versions before individual validation tools run. That version resolution requires network access, including when you select only one validation tool.

```shell
docker run --rm -v "$(pwd)":/project -w /project ghcr.io/shopware/shopware-cli project validate /project
```

If you run Shopware CLI directly:

```shell
shopware-cli project validate /path/to/your/project
```

To run only the PHPStan validation:

```shell
shopware-cli project validate --only phpstan /path/to/your/project
```

Run this before the [Upgrade wizard](./project-commands/upgrade.md) so that custom code needing fixes is known in advance. Address the reported breaking changes or confirm they are acceptable for the target version before starting the upgrade. [Automatic Refactoring](./automatic-refactoring.md) can then apply the available Rector, ESLint, Stylelint, Twig, and Symfony XML refactorings.

## Common issues

### Missing classes in a Storefront/Elasticsearch bundle

Your plugin typically requires only `shopware/core`, but when you use classes from Storefront or the Elasticsearch Bundle, and they are required, add `shopware/storefront` or `shopware/elasticsearch` to `require` in `composer.json`. If those integrations are optional and guarded by checks such as `class_exists`, add the packages to `require-dev` so PHPStan can resolve the classes during development.

### PHPStan uses my own configuration instead of the Shopware one

If `phpstan.neon`, `phpstan.neon.dist`, or `phpstan.dist.neon` exists in the validated root directory, PHPStan uses it instead of the default configuration shipped with Shopware CLI. Remove or rename the file if you want to validate with the default rule set.
