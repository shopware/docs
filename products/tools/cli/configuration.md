---
nav:
  title: Configuration files
  position: 4

---

# Configuration files

Shopware CLI uses separate configuration files for projects and extensions. The preferred location for both is the `.config/` directory next to the checkout they describe:

```text
.config/shopware-project.yml
.config/shopware-extension.yml
```

## Lookup priority

When no explicit project-config path is supplied, Shopware CLI looks for project configuration in this order:

1. `.config/shopware-project.yml`
2. `.shopware-project.yaml`
3. `.shopware-project.yml`

For extension configuration, it looks relative to the extension directory in this order:

1. `.config/shopware-extension.yml`
2. `.shopware-extension.yml`
3. `.shopware-extension.yaml`

The root-level files are legacy locations and remain supported. If both the preferred and a legacy file exist, the preferred file wins and Shopware CLI warns that the legacy file is ignored for that run.

The `--project-config <path>` option always takes precedence over project-config discovery. Extension configuration has no equivalent option.

Project configuration also supports a local override. Its path is derived from the resolved base file: the preferred file uses `.config/shopware-project.local.yml`; a legacy base file keeps its corresponding root-level local override. The local override is deep-merged and should not be committed.

New configuration files created by `project config init`, `project create`, the development-environment TUI, or `extension config init` are written to the preferred `.config/` paths. Existing files are updated in their resolved location.

For migration instructions, see the [Shopware CLI project-config ADR](https://github.com/shopware/shopware-cli/blob/main/docs/adr/0002-project-config-dot-config.md#migration).
