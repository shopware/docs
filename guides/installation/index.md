---
nav:
  title: Shopware 6 Installation
  position: 1
---

# Overview of Shopware 6 Installation

:::info
The installation workflow has been streamlined to focus on a CLI-based installation as the primary approach. Previous installation methods are available in the [Legacy Setups](./legacy-setups/index.md) section.
:::

Welcome to the Shopware 6 Developer Installation Guide, which will help you set up a local Shopware 6 development environment, whether you’re:

- Building a custom shop project
- Developing a plugin, app, or theme
- Contributing to the Shopware core

The Shopware 6 development environment is primarily supported and recommended for use with [Docker](https://www.docker.com/). This platform enables developers to develop, ship, and run applications inside containers: lightweight, standalone, and executable packages.

Docker enables production-like conditions consistent across teams and CI/CD, and makes it easy to reset or rebuild environments. Docker is beneficial when full service parity is required (e.g., caching, queues, search).

**As of March 2026**, The recommended way for developers to build Shopware is with the [Shopware CLI](./../../products/cli/index.md), which supports local Docker setup. This provides a consistent, production-like environment for development.

[Shopware CLI](https://github.com/shopware/shopware-cli) is the open-source command-line interface for working with Shopware 6. It is installed and configured separately from your Shopware instance.

**The Shopware CLI installation method is in Alpha**. If you try it and experience issues, please let us know by [filing an issue](https://github.com/shopware/shopware-cli/issues). You may still use our [Docker setup guide](/guides/installation/legacy-setups/docker-setup.md) as a fallback.

## Prerequisites

- [Hardware requirements](./system-requirements.md) to prepare your system for installation (PHP, DB, memory, etc.) fulfilled.
- [Shopware CLI](./../../products/cli/index.md).
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

### Select Shopware version

The latest version will always be the top option. At the bottom of the terminal window are prompts for moving through and selecting menu options.

### Choose Docker or skip

This is a yes/no question about whether to run Shopware locally using Docker, our recommended setup option. Choosing `yes` enables you to decide whether to either pursue other customization options or, for a quick start, conclude the installation immediately.

:::info
If you choose the Docker option, be sure that Docker is running. Otherwise, a "fatal error" message may appear.
:::

### Customize options (optional)

The customization options currently offered by the CLI include:

- **Deployment Method**: none (default), PaaS powered by Shopware, PaaS powered by Platform.sh, or Deployer PHP (SSH-based zero-downtime, for users not working with Docker)
- **CI/CD System**: none (default), GitHub Actions, or GitLab CI; choosing an option triggers creation of boilerplate pipeline templates
- **Initialize Git repository**: yes/no, for version control (`yes` by default)
- **OpenSearch**: yes/no (`no` is default), choose yes for large product catalogues and advanced search
- **AMQP**: for queue support for background jobs and messaging (`yes` by default)

Before implementing your installation, you'll receive a summary of your installation choices that you can check for accuracy. At this point, the menu enables you to either restart the installation process or cancel if you need to correct an error.

If the summary looks good, choose `proceed` to start the process of setting up Shopware and installing dependencies. This process might take a while.

When it finishes, users who did not install with Docker will receive guidance to continue.

### Finish Docker setup (optional)

When setup finishes, users who installed with Docker will see this prompt:

- Start containers:  `cd <project name> && make up`
- Set up Shopware:  `make setup`
- Stop containers:  `make down` (do this later)

Running `make up` starts Shopware and all required services (web server, database, search, Mailpit, etc.) in the background. Docker images already include all required PHP extensions and services, so the system-check step of the installer is always fulfilled.

Running `make setup` is necessary to access the new shop.

:::info
What happens during `make setup`:

- The Makefile runs the Shopware installer inside the web container
- Shopware is installed automatically (no browser wizard required)
- A MariaDB database is created
- An admin user is created, with username `admin` and password `shopware`
- Required services (database, search, mail, etc.) are preconfigured and run inside the Docker
- The Shopware project is configured to connect to the database via the Docker service name `database`
- Database credentials are defined in the `compose.yaml`
- If Elasticsearch was enabled during project creation, a compatible search service runs as part of the Docker stack.
:::

Check the container status anytime with the following command:

```bash
docker compose ps
```

### Accessing the new shop (all setups)

The prompt also provides the links to access the new shop in the browser:

- Storefront: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Admin: [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)
- Credentials: `admin` / `shopware`

Users who do not install with Docker can also use the Storefront and Administration URLs to continue.

If you're setting up Shopware for the very first time, you may prefer to complete Shopware installation from the Administration UI using the First Run Wizard:

- Sign in or create a Shopware account; this is necessary when you want to install Store extensions
- Connect to the **Shopware Store**
- Install plugins or themes from the Store
- Configure payment methods; not necessary for local development

Basic shop settings such as shop name, default language, and currency can be changed later in the Admin under **`Settings > Shop > Basic information`**.

However, most developers will wish to continue from the terminal.

### Next steps

Continue with the [Development guide](../development/index.md)!
