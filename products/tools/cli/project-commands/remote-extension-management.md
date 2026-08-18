---
nav:
  title: Remote Extension Management
  position: 4

---

# Remote Extension Management

Shopware CLI provides a CLI wrapper around Shopware's built-in extension management commands. It lets you install, manage, and control extensions in your Shopware project through the Shopware API—with the same capabilities as the Extension Manager in the Shopware 6 Administration panel, but automation-friendly from the CLI.

This is one of the most commonly used command families in Shopware CLI, especially with Shopware SaaS customers who use it to automate extension uploads and lifecycle management directly to their hosted shops without needing the Admin UI.

::: info
This functionality was designed for Shopware SaaS and should not be used for self-hosted installations. [The recommendation is to use the Deployment Helper and install all plugins via Composer](../../../../guides/hosting/installation-updates/deployments/deployment-helper.md)
:::

To use the extension manager, you need a `.shopware-project.yml` or set environment variables. See here for more information about the [Fixture Bundle](../../../../guides/development/tooling/fixture-bundle.md).

::: warning
Make sure you log in using your username and password to the CLI. The extension API can be used **only by users**.
:::

## Commands

### List all extensions

```bash
shopware-cli project extension list
```

### Install an extension

```bash
shopware-cli project extension install <extension-name>
```

### Uninstall an extension

```bash
shopware-cli project extension uninstall <extension-name>
```

### Update an extension

```bash
shopware-cli project extension update <extension-name>
```

### Outdated extensions

Shows all extensions that have an update available.

```bash
shopware-cli project extension outdated
```

### Upload extension

Uploads an extension to the Shopware instance.

```bash
shopware-cli project extension upload <path-to-extension-zip>
```

### Delete extension

Deletes an extension from the Shopware instance.

```bash
shopware-cli project extension delete <extension-name>
```

### Activate extension

Activates an installed extension in the Shopware instance.

```bash
shopware-cli project extension activate <extension-name>
```

### Deactivate extension

Deactivates an installed extension in the Shopware instance.

```bash
shopware-cli project extension deactivate <extension-name>
```
