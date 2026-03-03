---
nav:
  title: Automatic refactoring
  position: 5002

---

# Automatic refactoring

Shopware CLI includes a built-in automatic refactoring tool that helps you automatically update and clean up code in your Shopware projects and extensions.

Use this tool to modernize your codebase when upgrading to a new Shopware version or to apply best-practice changes automatically.

- [Rector](https://getrector.com/) for PHP
- [ESLint](https://eslint.org/) for JavaScript
- Custom rules for Admin Twig files

## Refactoring an extension

::: warning
Before you start, make sure you work on a copy or Git-versioned branch, because this command will modify your files in place!
:::

<Tabs>

<Tab title="With Docker (recommended)">

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension fix /ext
```

</Tab>

<Tab title="Without Docker">

```shell
shopware-cli extension fix /path/to/your/extension
```

</Tab>

</Tabs>

## Refactoring an entire project

You can also refactor a full Shopware project instead of a single extension.

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

The CLI runs Rector and ESLint automatically. After completion, review all changes and commit or revert them as needed.

Make sure the `shopware/core` requirement in your `composer.json` file reflects the version you're targeting. Shopware CLI determines which upgrade rules to apply based on that version constraint.

## After running refactoring

Use Git or your diff tool to review the changes.

Test your extension or project thoroughly.

Commit the accepted changes and discard any unwanted ones.

You can combine automatic refactoring with other Shopware CLI commands (e.g., `project build` or `extension validate`) as part of your upgrade workflow.
