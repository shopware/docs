---
nav:
  title: Installation
  position: 20
---

# Shopware 6 Community Edition Installation

:::info
The recommended way for developers to build Shopware is with the Docker setup, made simple by the [Shopware CLI](../../products/tools/cli/index.md) installation path. Docker provides a consistent, production-like environment for development. Previous installation methods are available in the [Legacy Setups](./legacy-setups/index.md) section.
:::

Welcome to the Installation Guide for Shopware 6 Community Edition (CE)! This guide will help you set up a local Shopware 6 development environment, whether you’re:

- Building a custom shop project
- Developing a plugin, app, or theme
- Contributing to the Shopware core

The Shopware 6 development environment is primarily supported and recommended for use with [Docker](https://www.docker.com/). This platform enables developers to develop, ship, and run applications inside containers: lightweight, standalone, and executable packages.

Docker enables production-like conditions consistent across teams and CI/CD, and makes it easy to reset or rebuild environments. Docker is beneficial when full service parity is required (e.g., caching, queues, search).

[Shopware CLI](https://github.com/shopware/shopware-cli) is the open-source command-line interface for working with Shopware 6. It is installed and configured separately from your Shopware instance.

**The Shopware CLI installation method is in Alpha**. If you try it and experience problems, please let us know by [filing an issue](https://github.com/shopware/shopware-cli/issues). You may still use our [Docker setup guide](../../guides/installation/legacy-setups/docker-setup.md) as a fallback.

## Prerequisites

- [Hardware requirements](./system-requirements.md): Ensure your system meets them (PHP, DB, memory, and so on) before you install
- [Shopware CLI](../../products/tools/cli/index.md)
- Docker installed (recommended)

:::info
The Shopware community has created related tooling that enables more automated or GUI-friendly ways to run Docker environments: [DDEV](https://ddev.com/) and [Dockware](https://www.dockware.io/). Both are **community-maintained** and not officially supported by Shopware.
:::

## Use the Shopware CLI to create a shop

This command uses the Shopware CLI and creates a shop. In this example, we create `my-shop`:

```bash
shopware-cli project create my-shop
```

Alternatively, you can run the CLI without a separate installation via:

```bash
npx @shopware-ag/shopware-cli project create my-shop
```

If you already have a target directory, see [Installing into an existing directory](./advanced-options.md#installing-into-an-existing-directory).

### Select Shopware version

The latest version will always be the top option. At the bottom of the terminal window are prompts for moving through and selecting menu options.

### Choose Docker or skip

This is a yes/no question about whether to run Shopware locally using Docker, our recommended setup option. Choosing `yes` lets you continue with optional customization, or you can complete the installation immediately for a quick start.

:::info
If you choose the Docker option, be sure that Docker is running. Otherwise, a "fatal error" message may appear.
:::

### Do you need a Shopware account?

To install Shopware, develop locally, build the Storefront or Administration, write your own extensions, or run a store, you do not need a Shopware account. Everything above works without signing in.

If you are just trying things out, you may skip the account and Store steps in the browser's `First Run Wizard` and continue from the terminal.

A Shopware account is needed when you:

- install extensions from the Shopware Store. This applies to free extensions too, because Store installations are tied to an account and a license.
- pull licensed or commercial packages from Shopware's private Composer registry; see [Shopware account and Composer](../development/start-developing.md#shopware-account-and-composer-private-packages).
- book or manage a commercial Shopware plan, or use account-bound Shopware-hosted services or commercial offerings; see [Shopware pricing](https://www.shopware.com/en/pricing/).

To use a specific extension without the Store, install it from source or via Composer instead.

### Customize options (optional)

The customization options currently offered by the CLI include:

- **Deployment Method**: none (default), PaaS powered by Shopware, PaaS powered by Platform.sh, or Deployer PHP (SSH-based zero-downtime, for users not working with Docker)
- **CI/CD System**: none (default), GitHub Actions, or GitLab CI; choosing an option triggers creation of boilerplate pipeline templates
- **Initialize Git repository**: yes/no, for version control (`yes` by default)
- **OpenSearch**: yes/no (`no` is default), choose yes for large product catalogues and advanced search
- **AMQP**: for queue support for background jobs and messaging (`yes` by default)

Before the installation runs, you will receive a summary of your choices so you can verify them. At this point, the menu lets you restart the installation process or cancel if you need to correct something.

If the summary looks good, choose `proceed` to start the process of setting up Shopware and installing dependencies. This process might take a while.

When it finishes, users who did not install with Docker will receive guidance to continue.

### Start your development environment

Once the project is created, start the development environment with:

```bash
cd my-shop
shopware-cli project dev
```

This launches the Development TUI. The dashboard starts your Docker containers, runs the Shopware installer (first time only), and gives you an overview of your environment - Shop URLs, credentials, watchers, logs, and service configuration - all in one place.

For details, see the [Development Environment guide](../development/dev-environment.md).

### Accessing your shop

When the environment is running, your shop is accessible at:

- Storefront: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Admin: [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)
- Default credentials: `admin` / `shopware`

Check container status anytime with:

```bash
docker compose ps
```

### Next steps

Continue with the [Development guide](../development/index.md).
