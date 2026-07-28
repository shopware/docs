---
nav:
  title: Automatic refactoring
  position: 5002

---

# Automatic refactoring

Shopware CLI includes a built-in automatic refactoring tool with pre-configured rules for Shopware projects. Instead of manually configuring and managing multiple linters and fixers, this tool automatically handles breaking changes and code modernization when you upgrade Shopware versions.

Use this tool to:

- Automatically fix breaking changes between Shopware versions
- Apply Shopware-idiomatic code fixes
- Modernize your codebase without manual linter configuration

The tool uses:

- [Rector](https://getrector.com/) for PHP
- [ESLint](https://eslint.org/) for JavaScript
- Custom rules for Admin Twig files

The refactoring command runs PHP and Node.js tooling under the hood. The Docker examples are recommended because the image already contains the required runtime dependencies. If PHP and Node.js are available locally, you can run the `shopware-cli` commands directly instead.

## Refactoring an extension

::: warning
Before you start, make sure you work on a copy or Git-versioned branch, because this command will modify your files in place!
:::

<Tabs>

<Tab title="With Docker (recommended)">

The command mounts your current directory to `/ext` inside the container and refactors that mounted extension directory:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension fix /ext
```

</Tab>

<Tab title="Without Docker">

Use the local path to your extension when running the command without Docker:

```shell
shopware-cli extension fix /path/to/your/extension
```

</Tab>

</Tabs>

## Refactoring an entire project

You can also refactor a full Shopware project instead of a single extension.

<Tabs>

<Tab title="With Docker (recommended)">

The command mounts your current directory to `/project` inside the container and refactors that mounted project directory:

```shell
docker run --rm -v "$(pwd)":/project ghcr.io/shopware/shopware-cli project fix /project
```

</Tab>

<Tab title="Without Docker">

Use the local path to your project when running the command without Docker:

```shell
shopware-cli project fix /path/to/your/project
```

</Tab>

</Tabs>

The CLI runs Rector and ESLint automatically. After completion, review all changes and commit or revert them as needed.

Make sure the `shopware/core` requirement in your `composer.json` file reflects the version you're targeting. Shopware CLI determines which upgrade rules to apply based on that version constraint.

### Project fix options

Run only specific tools:

```shell
shopware-cli project fix /path/to/your/project --only phpstan
shopware-cli project fix /path/to/your/project --only "phpstan,eslint"
```

Allow running on non-Git repositories:

```shell
shopware-cli project fix /path/to/your/project --allow-non-git
```

By default, `project fix` requires a Git repository to safely track changes.

## After running refactoring

Use Git or your diff tool to review the changes.

Test your extension or project thoroughly.

Commit the accepted changes and discard any unwanted ones.

You can combine automatic refactoring with other Shopware CLI commands (e.g., `project build` or `extension validate`) as part of your upgrade workflow.
