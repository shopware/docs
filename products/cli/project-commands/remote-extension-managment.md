---
nav:
  title: Remote Extension Management
  position: 4

---

# Remote extension management

Shopware CLI has an extension manager to install and manage extensions in your Shopware project through the Shopware API like the Extension Manager in the Shopware 6 Administration panel, but for the CLI.

::: info
This functionality was designed for Shopware SaaS and should not be used for self-hosted installations. [The recommendation is to use the Deployment Helper and install all plugins via Composer](../../../guides/hosting/installation-updates/deployments/deployment-helper.md)
:::

To use the extension manager, you need a `.shopware-project.yml` or set environment variables. See here for more information about the [Project Configuration](./project-config-sync.md#setup).

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
