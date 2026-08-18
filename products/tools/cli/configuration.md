---
nav:
  title: Configuration
  position: 30

---

# Configuration

You can configure Shopware CLI to match your workflow. This page explains how to customize CLI behavior using command flags and environment variables.

## Update notifications

Shopware CLI displays update notifications when a newer version is available. You can silence these notifications for a single command by adding the `--no-update-hint` flag:

```bash
shopware-cli --no-update-hint <command>
```

:::info CI environments
Shopware CLI automatically detects CI environments and suppresses update notifications there. You do not need to add the `--no-update-hint` flag or set an environment variable when running the CLI in CI.
:::

To silence update notifications for the current shell session, set the `SHOPWARE_CLI_NO_UPDATE_NOTIFICATION` environment variable:

```bash
export SHOPWARE_CLI_NO_UPDATE_NOTIFICATION=true
```

To make this setting persistent, add the `export` command to your shell profile, such as `~/.bashrc` or `~/.zshrc`.
