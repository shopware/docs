---
nav:
  title: Docker Setup
  position: 3

---

# Docker Setup

This guide is for developing Shopware stores and extensions. By the end of this section, you will have an empty *running* Shopware instance and can immediately start developing.

:::info
For information about using Docker in production, see [Docker for production](../../hosting/installation-updates/docker.md). To contribute to the Shopware platform itself, visit the [Contributing.md guide](https://github.com/shopware/shopware/blob/trunk/CONTRIBUTING.md).
:::

## Prerequisites

- Install and run either [Docker](https://docs.docker.com/get-started/get-docker/) or [OrbStack](https://docs.orbstack.dev/quick-start). OrbStack is a fast, Docker-compatible alternative for macOS (free for personal use).
- Ensure Docker has permission to bind to local ports (typically `:80` or `:8080`) and that no conflicting services are already using these ports.
- Install `make`:

```bash
# Ubuntu
apt install make

# macOS
brew install make

This setup comes preinstalled with the [Shopware CLI](../../../products/cli/index.md), which helps with building, refactoring, validating, and managing Shopware projects and extensions. It works with all setups and is used in most Shopware upgrade, build, and CI workflows. The CLI is available in the container shell.

## Pre-pull the image (optional)

If you haven’t yet downloaded the Shopware Docker image, pull it now:

```bash
docker pull ghcr.io/shopware/docker-dev:php8.3-node24-caddy
```

If you skip this step, Docker will automatically download the image during project creation. That’s normal, but pre-pulling makes the process cleaner and enables you to avoid waiting for large image downloads.

## Create a new Shopware project

Create an empty directory for your project and navigate into it:

```bash
mkdir my-project && cd my-project
``

Now create a new project:

```bash
docker run --rm -it -v $PWD:/var/www/html ghcr.io/shopware/docker-dev:php8.3-node24-caddy new-shopware-setup
```

To use a specific version of Shopware (optional), run:

```bash
docker run --rm -it -v $PWD:/var/www/html ghcr.io/shopware/docker-dev:php8.3-node24-caddy new-shopware-setup 6.6.10.0
```

This step creates your Shopware project using PHP and Composer inside the Docker image. It generates a ready-to-use setup including `compose.yaml` and a `Makefile`, so you don’t need to locally install PHP or Composer yourself.

:::info
The Docker setup installs development dependencies (`require-dev`) and [`shopware/dev-tools`](https://github.com/shopware/dev-tools). This enables the Symfony profiler, [demo data](https://github.com/shopware/SwagPlatformDemoData), linting tools, and test tooling.
:::

Project creation takes a few minutes to complete. When prompted in the terminal, you will see:

`Do you want to use Elasticsearch? (y/N)`

Shopware supports an Elasticsearch-compatible search engine for improved performance with large catalogs and advanced search features.

If you choose `y`, the Docker setup starts an Elasticsearch-compatible search service (OpenSearch) as part of your stack.

If you choose `N`, Shopware will use MariaDB for search, which is sufficient for local testing or small datasets.

## Initial setup

After creating your project, you must install Shopware inside your containers. Run the setup commands below to initialize the database, generate configuration files, and create the default admin user.

First, start the containers:

```bash
make up
```

This command starts Shopware and all required services (web server, database, search, Mailpit, etc.) in the background. Docker images already include all required PHP extensions and services, so the system-check step of the installer is always fulfilled.

:::info
You can check the container status anytime with the below command:
:::

```bash
docker compose ps
```

“Healthy” means the service passed its internal health check and is ready to use.

Once the containers are running, install Shopware with this command:

```bash
make setup
```

:::info
What happens during `make setup`:

- The Makefile runs the Shopware installer inside the web container
- Shopware is installed automatically (no browser wizard required)
- A MariaDB database is created
- An admin user is created, with username `admin` and password `shopware`
- Required services (database, search, mail, etc.) are preconfigured and runs inside the Docker
- The Shopware project is configured to connect to the database via the Docker service name `database`
- Database credentials are defined in the `compose.yaml`
- If search was enabled during project creation, an Elasticsearch-compatible search service runs as part of the Docker stack
:::

Verify that the installation completed successfully by opening <http://localhost:8000>.

Use the following commands to manage the development environment:

```bash
# Start the environment
make up

# Stop the environment
make down

# Fully reset the environment ( "-v" flag removes containers, networks, and volumes - all stored data will be lost)
docker compose down -v
