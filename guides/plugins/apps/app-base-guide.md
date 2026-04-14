---
nav:
  title: App Base Guide
  position: 20

---

# App Base Guide

This guide covers the common foundation that every Shopware app starts with, then shows you where the implementation diverges. For general context, read the [App concept](../../../concepts/extensions/apps-concept.md).

There are multiple ways to begin building a Shopware app, but not all of them fit every use case. This guide focuses on the shared foundation that applies to all apps:

- create an app folder in `custom/apps`
- add a valid `manifest.xml`
- refresh the app registry
- install and activate the app

From there, continue with the path that matches your goal:

- **Apps requiring a backend:** apps that need registration, authenticated server-to-server communication, webhooks, signing, Admin API credentials and permissions, payment methods, tax providers, or other backend-driven features. See [App registration & backend setup](../apps/lifecycle/app-registration-setup.md) after you have a valid manifest.
- **Admin UI apps:** apps whose immediate goal is to add an Administration UI and iterate locally first with Vite and [Admin Extension SDK](https://www.npmjs.com/package/@shopware-ag/admin-extension-sdk). No app backend is required to see a module in the Administration. Continue with [Build an Admin UI app](create-admin-extension.md).

## Prerequisites

- Shopware running locally.
- Access to the Administration: `http://localhost:8000/admin`.
- Shell access to the PHP container for `bin/console`.

A Shopware app is defined by a `manifest.xml`, discovered from `custom/apps`, and managed through the CLI and the Administration.

## Name your app

Choose a technical name in UpperCamelCase, for example `MyExampleApp`, that reflects what the app does, for example `PaymentGatewayApp`.

## File structure

Apps live in `custom/apps` inside your Shopware project. Each app lives in its own folder and includes a manifest file. Example:

```text
└── custom
    ├── apps
    │   └── MyExampleApp
    │       └── manifest.xml
    └── plugins
```

## Manifest file

::: warning
The folder name and the `<meta><name>` in `manifest.xml` must match.
:::

The manifest is the contract between Shopware and your app. See [Manifest reference](../../../resources/references/app-reference/manifest-reference.md) for more details.

A typical meta block:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <name>MyExampleApp</name>
        <label>Label</label>
        <label lang="de-DE">Name</label>
        <description>A description</description>
        <description lang="de-DE">Eine Beschreibung</description>
        <author>Your Company Ltd.</author>
        <copyright>(c) by Your Company Ltd.</copyright>
        <version>1.0.0</version>
        <icon>Resources/config/plugin.png</icon>
        <license>MIT</license>
    </meta>
</manifest>
```

::: warning
`<author>` and `<copyright>` are required. If they are missing or empty, `bin/console app:refresh` fails.
:::

## Install and refresh (CLI)

Run commands from the project root inside the PHP container, for example `/var/www/html`.

For any app you create manually under `custom/apps/<Name>/`, refresh the registry first:

```bash
bin/console app:refresh
```

If `app:refresh` reports validation errors, fix them and run the command again.

Install the app using its technical name (`<meta><name>`), not a filesystem path:

```bash
bin/console app:install --activate MyExampleApp
```

If the app does not appear as expected, check the current app list:

```bash
bin/console app:list
```

::: info
Without the `--activate` flag, the app is installed inactive. Activate it in the Administration (**Extensions → My Extensions → Apps**) or run `bin/console app:activate MyExampleApp`.
:::

## Cache

After activating an app, you might need to clear the cache for the changes to take effect:

```bash
bin/console cache:clear
```

If needed, also run `bin/console cache:clear:http` or `bin/console cache:clear:all`.

Apps are [validated](./lifecycle/app-registration-setup.md#validation) during installation. To skip validation only while debugging, use `--no-validate` with `app:install`. Run `bin/console app:validate` to identify configuration issues.
