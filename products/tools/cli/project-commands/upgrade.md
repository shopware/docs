---
nav:
  title: Guided Upgrade
  position: 9

---

# Guided Upgrade

The `project upgrade` command guides you through a local Shopware upgrade: readiness checks, version selection, extension compatibility, and the guided execution.

```bash
shopware-cli project upgrade
```

In a terminal, this runs as an interactive wizard.

## Headless mode

With `--no-interaction` (or without a terminal, e.g. CI), the upgrade runs headless. In this mode, `--target` is required:

```bash
shopware-cli project upgrade --no-interaction --target 6.6.10.3
```

`--target` also accepts `recommended` or `latest-patch` to let the CLI pick a version for you.

Available flags for headless mode:

- `--target`: version to upgrade to (required with `--no-interaction`; also accepts `recommended` or `latest-patch`)
- `--dry-run`: stop after the read-only preflight without modifying the project
- `--no-audit`: continue when dependencies are blocked by known security advisories
