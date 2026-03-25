---
nav:
  title: Build an Admin UI App Locally
  position: 30
---

# Build an Admin UI App Locally

This guide shows how to create a Shopware app that adds an Administration module backed by a local frontend development server. Use this setup when you want to:

- add a custom module to the Administration
- build an app-based Admin UI locally
- iterate on the frontend without setting up an app backend first

If you need app registration, signing, webhooks, or Admin API credentials, continue with [App registration & backend setup](app-registration-setup.md).

## What this guide covers

In this setup:

- the app is defined through `manifest.xml`
- Shopware discovers the app from `custom/apps`
- the Administration module loads from a local dev server such as [Vite](https://vite.dev/)
- no app backend is required just to render the Admin UI module in this local setup

## Prerequisites

- a local Shopware instance
- access to the Administration at `http://localhost:8000/admin`
- shell access to the PHP container for `bin/console`
- Node.js 20 on the host system

Use Node 20:

```bash
nvm install 20
nvm use 20
node -v
```

::: info
If you are on a newer Node version, switch to Node 20 before creating the frontend project.
:::

## 1. Create the app folder

From the Shopware project root, create the app directory under `custom/apps`:

```bash
mkdir -p custom/apps/MyAdminTestApp
```

The folder name must match the app name defined in the manifest.

Scaffolding via `npm init @shopware/app` may not work in all environments. Creating the app manually avoids registry login issues and is sufficient for this local Admin UI setup.

## 2. Create the manifest

Create `custom/apps/MyAdminTestApp/manifest.xml` with a valid `<meta>` block and an `<admin>` block. `<author>` and `<copyright>` are **required**. If either is missing, `bin/console app:refresh` fails.

Example (adjust names if you use a different folder):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <name>MyAdminTestApp</name>
        <label>My Admin Test App</label>
        <version>1.0.0</version>
        <author>Your Name</author>
        <copyright>(c) Your Name</copyright>
    </meta>
    <admin>
        <module name="my-admin-test-app"
                source="http://host.docker.internal:5173"
                parent="sw-extension">
            <label>Admin Test</label>
        </module>
    </admin>
</manifest>
```

## 3. Refresh and install the app

Run the following commands from the Shopware project root inside the PHP container:

```bash
bin/console app:refresh
bin/console app:install --activate MyAdminTestApp
bin/console app:list
```

If Shopware asks whether the app may communicate with external hosts such as `host.docker.internal`, confirm this when you intend to load the Admin module from your local development server.

::: info
If the app appears in `app:list` as inactive, activate it in the Administration under **Extensions → My Extensions → Apps**, or run `bin/console app:activate MyAdminTestApp`.
:::

## 4. Create the frontend project

From the Shopware project root on the host, create a frontend project for the Admin UI:

```bash
mkdir -p admin-frontend
cd admin-frontend
npm create vite@latest .
```

At the prompt, provide these choices during setup:

- framework: `Vanilla`
- variant: `JavaScript`
- Vite 8 beta: `no` (unless you need it)

Then install the Shopware Admin Extension SDK:

```bash
npm install
npm install @shopware-ag/admin-extension-sdk
```

## 5. Start the development server

Start the Vite development server with host binding enabled so the Docker container can reach it:

```bash
npm run dev -- --host
```

By default, Vite uses `port 5173`. Keep that port in sync with the `source` URL in the manifest:

```xml
source="http://host.docker.internal:5173"
```

::: info
Keep the frontend project inside the Shopware project directory if your Docker setup relies on bind mounts.
:::

## 6. Open the app in Administration

Sign in to the Administration at [http://localhost:8000/admin](http://localhost:8000/admin). Then:

- go to **Extensions → My Extensions → Apps**
- make sure `MyAdminTestApp` is active
- open the module from **Extensions**

At this point, Shopware loads the Admin module from your local Vite server.

## Troubleshooting

| Issue | What to check |
|-------|---------------|
| `app:list` shows no apps | Run `bin/console app:refresh`. Confirm `custom/apps/<Name>` exists inside the container. |
| `app:refresh` fails | Check that `<author>` and `<copyright>` are present and not empty. |
| App does not appear in **My Extensions** | Confirm the folder name matches `<meta><name>` and refresh the app registry again. |
| App appears but is inactive | Activate it in **Extensions → My Extensions → Apps** or run `bin/console app:activate MyAdminTestApp`. |
| Blank iframe | Make sure Vite is running, exposed with `--host`, and using the same port as the `source` URL in `manifest.xml`. From the container, test access to `http://host.docker.internal:5173`. |
| `host.docker.internal` does not work on Linux | Your Docker setup may require additional host mapping or network configuration. |

## Next steps

- [App registration & backend setup](app-registration-setup.md)
- [App signature verification](app-signature-verification.md)
- [Webhooks](webhook.md)
