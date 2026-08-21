---
nav:
  title: Administration Migrations
  position: 5003

---

# Administration Migrations

Shopware CLI includes built-in checks and fixes for known Shopware Administration migration patterns.

These rules help identify source changes that are required when upgrading Administration extensions between supported Shopware versions. The rules are intentionally limited to patterns that can be identified deterministically.

## Check Administration code for migration issues

Run the project fixer to apply supported migration fixes automatically:

```shell
shopware-cli project fix /path/to/your/project
```

For a single extension:

```shell
shopware-cli extension fix /path/to/your/extension
```

The fixer includes custom rules for Administration Twig files in addition to the PHP and JavaScript tooling described in [Automatic refactoring](./automatic-refactoring.md).

::: warning
`project fix` and `extension fix` modify files in place. Run them on a Git branch or a copy of your project so that you can review the changes before committing them.
:::

## Administration Twig migrations

Shopware CLI contains a set of known Administration Twig migration rules.

The rules are intended for cases where the old pattern and its replacement are known and can be detected without ambiguity. They are not a general-purpose Administration migration engine and do not guarantee that an extension is fully compatible with a target Shopware version.

Supported rules may cover changes such as:

- Administration component migrations
- Component property or event changes
- Other deterministic Twig patterns with a known replacement

The exact set of rules is maintained by Shopware CLI and can change as new Shopware versions introduce additional migration requirements.

## When to use the fixer

Use the Administration migration rules as part of an upgrade workflow:

1. Update the Shopware version constraint in your project.
2. Run `shopware-cli project fix` or `shopware-cli extension fix`.
3. Review the generated changes.
4. Run your normal validation and tests.
5. Check any Administration code that was not covered by a deterministic fixer rule manually.

For extension validation, see [Validation](./validation.md).

## Limitations

The [Administration migration](../../../guides/upgrades-migrations/administration/index.md) rules are deliberately bounded.

The CLI does not attempt to:

- comprehensively analyse Administration compatibility
- modify arbitrary JavaScript or Vue code
- validate browser behaviour
- automatically resolve ambiguous migration patterns

Manual review is still required for Administration changes that are not covered by a deterministic rule.

