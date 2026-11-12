---
nav:
  title: Deprecations
  position: 6000

---

# Deprecations

Shopware CLI is often used non-interactively in CI pipelines and build scripts, where a removed command or flag can break a build without warning. To keep changes predictable, every deprecation in Shopware CLI follows a fixed process with a known removal date.

All current deprecations and their removal dates are tracked in the [Deprecations issue](https://github.com/shopware/shopware-cli/issues/1859) on GitHub.

## Scope

The deprecation policy covers the public interface of Shopware CLI:

- Commands and subcommands
- Flags
- Environment variables (`SHOPWARE_CLI_*`)
- Keys in the project and extension [configuration files](configuration.md)

## Deprecation window

Every deprecation has a removal date. The date is set when the deprecation is merged and is three months after the merge date, moved to a working day if necessary. This gives you one quarter to adapt your scripts, pipelines, and configuration files.

This policy applies even while Shopware CLI is below version 1.0.0. We may revisit it if we move away from the 0.y.z versioning scheme.

## How you are notified

- **Runtime warnings:** When you use a deprecated item, Shopware CLI prints a warning to stderr. The warning states that the item is deprecated, its removal date, and its replacement, if one exists. Because the warning goes to stderr, stdout and JSON output stay clean and can still be parsed by your tools.
- **Hidden from help:** Deprecated commands and flags are no longer listed in the `--help` output. They keep working until their removal date.
- **Changelog:** Each [release](https://github.com/shopware/shopware-cli/releases) lists new deprecations and removals in a separate *Deprecations* section, linking to the tracking issue.
- **Tracking issue:** The pinned [Deprecations issue](https://github.com/shopware/shopware-cli/issues/1859) contains a sub-issue for each deprecation, with the removal date set as its due date.

## Extended removal dates

Shopware CLI reports the usage of deprecated items via [telemetry](../../../resources/references/telemetry.md#shopware-cli). If a deprecated item is still widely used and users need more time, its removal date can be extended. Each case is assessed individually based on telemetry, user feedback, and the maintainers' knowledge.

A removal date extension ships in a new release with the updated date in the runtime warning, and the due date of the related sub-issue is updated accordingly. If you depend on a deprecated item and need more time, leave a comment on its sub-issue.

## Catching deprecations in CI

Deprecation warnings are easy to miss in non-interactive runs. To spot them before an item is removed:

- Regularly review the stderr output of the Shopware CLI steps in your CI pipelines for deprecation warnings.
- Read the *Deprecations* section of the changelog when you update Shopware CLI, especially if you pin a specific version.
- Watch the [Deprecations issue](https://github.com/shopware/shopware-cli/issues/1859) to be notified about new deprecations.
