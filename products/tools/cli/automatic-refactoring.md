---
nav:
  title: Automatic Refactoring
  position: 5002

---

# Automatic Refactoring

Shopware CLI provides automatic refactoring through two `fix` commands:

- `extension fix` to apply fixes to a single extension
- `project fix` to apply fixes across a Shopware project

There is no separate refactoring command. Both `fix` commands use the shared [verifier tool registry](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/tool.go) and call the `Fix()` implementation of each selected tool.

The automatic refactoring tools cover migrations and fixes that Shopware CLI can apply without manual changes. They do not guarantee full compatibility with a target Shopware version. Use [validation](./validation.md) to find additional changes that require manual work.

::: warning
The `fix` commands modify files in place. Run them on a clean Git branch or another working copy so you can review and revert changes.
:::

## Automatic refactoring in an upgrade

Automatic refactoring is one part of an upgrade workflow rather than a complete compatibility check:

1. Run [validation](./validation.md) to identify compatibility problems and static-analysis findings.
2. Set the intended Shopware version constraint if you need to target a specific release.
3. Run `extension fix` or `project fix` to apply the available automatic migrations.
4. Review the changes with `git diff`.
5. Address validation findings that have no automatic fixer.
6. Run the relevant tests and validation again.
7. Use [formatting](./formatter.md) separately if you also want to format the resulting code.

## Automatic refactoring tools

Without `--only`, a `fix` command invokes every registered verifier tool. The following tools currently implement changes in `Fix()`:

| Tool | What it fixes | Version-aware | Implementation |
|---|---|---|---|
| `rector` | PHP breaking changes and modernization using Shopware Rector | Yes | [`rector.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/rector.go) |
| `eslint` | Auto-fixable JavaScript, TypeScript, and Vue rules for Administration and Storefront code | Yes | [`eslint.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/eslint.go) |
| `admin-twig` | Shopware-specific Administration Twig component migrations | Yes | [`admin_twig.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/admin_twig.go) |
| `stylelint` | Auto-fixable Administration and Storefront SCSS rules using bundled Stylelint configurations | No | [`stylelint.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/stylelint.go) |
| `symfony-xml` | Deprecated plugin `services.xml` and `routes.xml` configuration to YAML | No | [`symfony_xml.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/symfony_xml.go) |

The Administration Twig migrations are implemented as individual fixers under [`internal/verifier/twiglinter/admintwiglinter`](https://github.com/shopware/shopware-cli/tree/main/internal/verifier/twiglinter/admintwiglinter). They cover deterministic migrations such as replacing removed Administration components. For migration cases that require manual changes, see the [Administration migration guide](../../../guides/upgrades-migrations/administration/index.md).

Other registered tools do not modify files in `fix` mode:

- `php-cs-fixer` and `prettier` are used for [formatting](./formatter.md).
- `phpstan`, `storefront-twig`, and `sw-cli` report findings during [validation](./validation.md).

Selecting one of these tools with `fix --only` therefore does not modify anything.

::: warning
Rector applies PHP migrations during `fix`, but its `Check()` implementation does not report findings during validation. There is no Rector preview before files are rewritten, so always review the resulting `git diff`.
:::

## Refactor an extension

Use `extension fix` with the path to an extension:

<Tabs>

<Tab title="With Docker (recommended)">

The Docker image already contains the runtime dependencies required by the fixer tools:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension fix /ext
```

</Tab>

<Tab title="Without Docker">

If the required PHP and Node.js runtimes are available locally, run:

```shell
shopware-cli extension fix /path/to/your/extension
```

</Tab>

</Tabs>

The extension path is required.

### Select fixers

Use `--only` to run one or more specific fixers:

```shell
shopware-cli extension fix /path/to/your/extension --only rector
shopware-cli extension fix /path/to/your/extension --only "rector,eslint,admin-twig"
```

Available options:

| Flag | Description |
|---|---|
| `--only <tools>` | Run only the specified comma-separated tools |
| `--allow-non-git` | Allow the command to run when the extension directory is not a Git repository |

For `extension fix`, the extension directory itself must contain `.git`; being inside a parent Git-managed Shopware project is not sufficient. Use `--allow-non-git` when you intentionally want to fix such an extension. `project fix` checks the project root instead.

## Refactor a project

Use `project fix` to apply fixers across a Shopware project:

<Tabs>

<Tab title="With Docker (recommended)">

```shell
docker run --rm -v "$(pwd)":/project ghcr.io/shopware/shopware-cli project fix /project
```

</Tab>

<Tab title="Without Docker">

```shell
shopware-cli project fix /path/to/your/project
```

</Tab>

</Tabs>

The project path is optional. If you omit it, Shopware CLI searches upward from the current directory for the closest Shopware project:

```shell
shopware-cli project fix
```

For projects, Shopware CLI applies the selected fixers to local extensions and configured bundles. Extensions resolved under `vendor/` are skipped. Individual fixers can have a narrower scope; for example, `symfony-xml` only converts configuration belonging to platform plugins.

Use the same `--only` and `--allow-non-git` options as `extension fix`:

```shell
shopware-cli project fix --only rector
shopware-cli project fix --only "rector,eslint,admin-twig"
```

## Version-aware fixes

Some fixers select rules according to the Shopware version supported by the extension or project. `rector`, `eslint`, and `admin-twig` use the minimum Shopware version resolved by the verifier configuration. Stylelint and `symfony-xml` do not select rules based on a Shopware version.

For a Shopware project, the version range comes from the `shopware/core` constraint in `composer.json`. For an extension, it comes from the extension's declared Shopware compatibility. Shopware CLI retrieves the available Shopware releases and selects the **lowest released version matching that constraint**.

For example, a project constraint such as:

```json
{
  "require": {
    "shopware/core": "^6.7"
  }
}
```

selects the earliest released Shopware 6.7 version matching the constraint, not necessarily the version currently installed in `vendor/`.

### Target an exact version

For a project or plugin, temporarily pin the `shopware/core` constraint to the release you want to target before running `fix`, then restore the intended constraint after reviewing the changes.

Keep these details in mind:

1. **The lowest matching release is selected.** A broad constraint targets the oldest released version it allows.
2. **Rector selects rules by major and minor version.** Patch releases in the same minor line use the same Rector configuration.
3. **An unresolved constraint falls back to Shopware `6.7.0.0`.** The fallback currently happens without a warning.
4. **Version resolution requires network access.** Shopware CLI retrieves the published Shopware versions while building the verifier configuration.

The version-resolution logic is implemented in [`internal/verifier/extension.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/extension.go) and [`internal/verifier/project.go`](https://github.com/shopware/shopware-cli/blob/main/internal/verifier/project.go).

## Execution and safety

The selected tools run concurrently, and the command waits for them to finish before returning. If one tool fails, the others are not cancelled and may still write changes. A failed run can therefore leave partial modifications.

The `fix` commands also:

- rewrite files directly instead of working on a temporary copy,
- do not roll back changes after an error, and
- require the target root to contain a `.git` directory unless `--allow-non-git` is used.

After every run, inspect the working tree:

```shell
git diff
```

Then test the affected extension or project before committing the changes.
