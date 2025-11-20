---
nav:
  title: Docker
  position: 5

---

# Docker

::: info
This setup is intended for development. If you want to use Docker for production, please check out this [guide](../../hosting/installation-updates/docker.md).
:::

Docker is a platform that enables developers to develop, ship, and run applications inside containers. These containers are lightweight, standalone, and executable packages that include everything needed to run an application: code, runtime, system tools, libraries, and settings. To get started with Docker, you can follow the official [Docker installation guide](https://docs.docker.com/get-started/get-docker/).

The Docker setup automatically provides all backend services (PHP, MySQL, Elasticsearch, Redis, Mailhog, etc.) so you don’t need to install anything else manually.

In this guide, we will run PHP, Node, and all required services in Docker containers. If you just want to run the services (MySQL/OpenSearch/Redis/...) in Docker, check out the [Docker](./docker.md) guide.

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) or [OrbStack](https://docs.orbstack.dev/quick-start) (macOS) is installed and running. OrbStack is a fast, free (for personal use) alternative to Docker.
- `make` is installed on your machine (`apt install make` on Ubuntu, `brew install make` on macOS)
- `Docker Compose` is installed on your machine. Docker Desktop provides it automatically. If you're using OrbStack or something else, you can follow the official [Docker Compose installation guide](https://docs.docker.com/compose/install/).
- Enough disk and network capacity to pull images (~500MB+ per image depending on tags)

## Pre-pull the image (optional)

If you haven’t yet downloaded the Shopware Docker image, pull it now:

```bash
docker pull ghcr.io/shopware/docker-dev:php8.3-node24-caddy
```

If you skip this step, Docker will automatically download the image during project creation. That’s normal, but pre-pulling makes the process cleaner and enables you to avoid waiting for large image downloads.

## Create a new project

Create a new empty directory and navigate to it:

```bash
mkdir my-project && cd my-project
```

Then create a new project (required):

```bash
docker run --rm -it -v $PWD:/var/www/html ghcr.io/shopware/docker-dev:php8.3-node24-caddy new-shopware-setup
```

Or you can use a specific version of Shopware (optional), like so:

```bash
docker run --rm -it -v $PWD:/var/www/html ghcr.io/shopware/docker-dev:php8.3-node24-caddy new-shopware-setup 6.6.10.0
```

This step creates your new Shopware project in the current directory, along with a `compose.yaml` and a `Makefile`. The difference from regular `composer create-project` is that we run PHP and Composer from within the Docker image. This means you don’t need to have PHP or Composer installed on your local machine.

The project creation currently takes several minutes to complete.

During the process, this prompt will appear: `Do you want to use Elasticsearch? (y/N)`. Elasticsearch improves search performance for large catalogs. We recommend:

- answering "yes" if you expect thousands of products or use Shopware's advanced search features. You'll need an `elasticsearch` container/service. [Go here](https://developer.shopware.com/docs/guides/hosting/infrastructure/elasticsearch/elasticsearch-setup.html) to learn more about Elasticsearch setup.
- answering "no" if you’re just testing locally or have a small dataset. In this case, Shopware will use the MariaDB database for search.

Shopware projects include files that use a combination of Symfony, Composer, Docker, and Shopware-specific conventions.

<details>
<summary>Project structure explained (click to expand)</summary>

| Item                      | Type                        | Purpose / what it contains                                                                 | Notes                                                                                             |
|---------------------------|-----------------------------|--------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| **bin/**                  | Directory                   | Executable scripts (e.g., `bin/console` — the main CLI for Shopware/Symfony).              | Think of it like `npm run` or `go run` scripts. Use `bin/console` to run commands inside the app. |
| **compose.yaml**          | Docker                      | Defines the Docker services (web, database, mailpit, etc.).                                | Equivalent to your project’s “infrastructure recipe.”                                             |
| **compose.override.yaml** | Docker                      | Local overrides for the default Docker Compose stack (e.g., port mappings, extra volumes). | Optional; used to customize or extend services locally.                                           |
| **composer.json**         | PHP dependency manifest     | Lists PHP dependencies and metadata (like `package.json`).                                 | `composer install` reads this.                                                                    |
| **composer.lock**         | Dependency lock file        | Locks exact versions of PHP packages.                                                      | Don’t edit manually; committed to git.                                                            |
| **config/**               | Directory                   | Symfony configuration files (framework, database, mail, etc.).                             | Similar to `config/` in many web frameworks.                                                      |
| **custom/**               | Directory                   | Your plugins, themes, or app customizations.                                               | This is where you add new extensions — your “src” for Shopware plugins.                           |
| **files/**                | Directory                   | Uploaded media and temporary files.                                                        | Ignored by git; generated at runtime.                                                             |
| **Makefile**              | Build helper                | Shortcuts for Docker tasks (`make up`, `make setup`, etc.).                                | Replaces long Docker commands with memorable aliases.                                             |
| **public/**               | Web root                    | The actual web-server-accessible directory (contains `index.php`, assets, etc.).           | Like `/dist` in JS frameworks or `/public_html`.                                                  |
| **src/**                  | Source code                 | Shopware’s core application source.                                                        | Where the main PHP codebase lives; not usually edited in a project clone.                         |
| **symfony.lock**          | Symfony dependency snapshot | Records Symfony recipes applied during setup.                                              | Used internally by Symfony Flex; no manual editing.                                               |
| **var/**                  | Runtime data                | Cache, logs, temporary files.                                                              | Can safely be deleted (Shopware rebuilds it).                                                     |
| **vendor/**               | Dependency code             | All installed PHP libraries from Composer.                                                 | Analogous to `node_modules/`.                                                                     |

</details>

You’ll mostly interact with these:

- **Makefile**, which provides convenient shortcuts for common Docker and Shopware commands. It acts as a lightweight wrapper around standard `docker compose` commands. You can still use the underlying Docker commands directly, but it’s recommended to stick with the `make` targets where possible, as they ensure consistent behavior across setups.
- **`custom/`**, to build your own plugins.
- **`bin/console`**, to run Shopware CLI tasks.

Everything else in your project either supports or configures those layers.

## Initial setup

After creating your project, you still need to install Shopware inside the containers. Run the setup commands below to initialize the database, generate configuration files, and create the default admin user.

First, start the containers:

```bash
make up
```

This command builds (if needed) and starts all required Docker services (web server, database, Mailpit, etc.) in the background. More details about what each component does:

<details>
<summary>Components explained (click to expand)</summary>

| Name                                  | Type                    | Purpose                                                                                                                       |
|---------------------------------------|-------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| **Network `my-project_default`**      | Docker network          | A private virtual network so all containers can communicate (for example, the web container connects to the database).        |
| **Volume `my-project_db-data`**       | Persistent storage      | Stores the MariaDB database files so your data isn’t lost when containers are stopped or rebuilt.                             |
| **Container `my-project-mailer-1`**   | Mailpit service         | Captures outgoing emails for local testing. View at [http://localhost:8025](http://localhost:8025).                           |
| **Container `my-project-database-1`** | MariaDB service         | Runs the Shopware database. Inside the Docker network its host name is `database`.                                            |
| **Container `my-project-web-1`**      | PHP + Caddy web service | Runs Shopware itself and serves the storefront and Admin UI at [http://localhost:8000](http://localhost:8000).                |
| **Container `my-project-adminer-1`**  | Adminer (DB UI)         | Lightweight web interface for viewing and editing your database. Available at [http://localhost:8080](http://localhost:8080). |

</details>

**Tip:** You can check container status anytime with:

```bash
docker compose ps
```

“Healthy” means the service passed its internal health check and is ready to use.

Once the containers are running, you can install Shopware in one of two ways:

- **Browser installer**: open <http://localhost:8000> to walk through the installation wizard.
- **CLI**: run the following command to perform a quick, non-interactive setup:

```bash
make setup
```

Both methods install Shopware and prepare your environment. The CLI setup automatically creates the database and an admin user with username `admin`, password `shopware`.

:::info
If you are installing inside the Docker containers (the default when using `make up` and `make setup`), set the database host to `database`. This is the internal service name of the MariaDB container on the Docker network. Inside the containers, `localhost` would refer only to the container itself, not to the database.

If you connect to the database from your host machine (for example, via Adminer or a local MySQL client), use 127.0.0.1 or `localhost` and the exposed port shown in `docker compose ps`.
:::

<details>
<summary>Access key explained (click to expand)</summary>

During setup, you’ll see an output similar to this:

```bash
Access tokens:
+------------+----------------------------+
| Key | Value |
+------------+----------------------------+
| Access key | `string of capital letters` |
```

This access key is automatically generated for your default Sales Channel (usually *Storefront*). It's used for authenticating requests to the [Store API](../../resources/references/store-api-reference.md)—for example, when fetching product or category data from an external app, headless storefront, or API client.

Example usage:

```bash
curl -H "sw-access-key: YOUR_ACCESS_KEY" \
     http://localhost:8000/store-api/product
```

You can view or regenerate this key later in the Admin under Sales Channels → [Your Channel] → API Access.

:::info
The access key is not for logging in to the Admin. It’s for programmatic access to your storefront’s data via the Store API.
:::
</details>

If you want to stop the setup, run `make stop`.

To start it again, use `make up`.

To stop and remove all containers, run:

```bash
make down
```

This command removes all containers and associated networks.

If you also want to remove all data and volumes (for example, to perform a full reset of your environment), run:

```bash
docker compose down -v
```

The `-v` flag will delete the containers, networks, and volumes, meaning all stored data will be lost.

### Known issue on Linux hosts

If you are using Docker on Linux, your host user id (UID) must be **1000** for file permissions to work correctly inside the containers. You can check your user ID with:

```bash
id -u
```

If it’s not `1000`, you may encounter permission errors when running `make up` or writing to project files.

## Development

To run Shopware CLI commands, first open a shell inside the web container:

```bash
make shell
```

This command drops you into the container’s terminal (you’ll see the prompt change). From there, you can execute any Shopware CLI command using `bin/console`. For example, to clear the application cache (not required right now):

```bash
docker compose exec web bin/console cache:clear
```

**Tip**: When you’re inside the container, you only need `bin/console …`. If you prefer to run commands from your host machine instead, use the full Docker prefix: `docker compose exec web bin/console cache:clear`.

You’ll use the following Makefile commands later on, when you modify frontend or admin code, or develop plugins that affect the UI:

```bash
# Build the administration (admin panel)
make build-administration

# Build the storefront (shop frontend)
make build-storefront

# Start a watcher to rebuild the Administration automatically when files change
make watch-admin

# Start a watcher for Storefront
make watch-storefront
```

These will become part of your everyday development workflow.

## Verify your installation in the browser (optional)

Now that Shopware is installed, you can confirm the storefront is working by visiting [http://localhost:8000](http://localhost:8000).

Shopware’s CLI setup automatically installs a complete, preconfigured demo storefront with sample products and categories. It includes local, disposable demo data so you can explore features or test plugins immediately.

You can also check out the Shopware Admin dashboard to verify that the Admin is accessible:

- Log in to the **Admin** at [http://localhost:8000/admin](http://localhost:8000/admin) using `admin / shopware` (default credentials).
- Once logged in, you’ll see the Shopware Admin dashboard and merchant setup wizard.

As a developer, you can skip the wizard and use the Admin to:

- confirm your installation and database are running correctly.
- manage extensions or themes you install later.
- inspect system settings and logs.
- verify that changes from your code (for example, new entities or configuration options) appear in the UI.

## Services

With Shopware running, here are the services in your local stack and how to access them. Understanding what each one does helps you troubleshoot issues and connect external tools if needed:

- **Web service (Caddy + PHP-FPM by default, or Nginx + PHP-FPM)**: serves both the storefront and the admin interface. The default image uses Caddy; you can choose Nginx in image variations.
- Storefront: [http://localhost:8000](http://localhost:8000)
- Admin: [http://localhost:8000/admin](http://localhost:8000/admin) *(default credentials: `admin` / `shopware`)*

- **Database (MariaDB)**: runs on port **3306** inside Docker. The internal hostname is `database`. You can connect from your host using `localhost:3306` if you want to inspect the database directly.

- **Mailpit**: local mail testing tool, available at [http://localhost:8025](http://localhost:8025). Use this to view emails sent by Shopware (e.g., registration or order confirmations) without needing an external mail server.

### Changing environment variables

You can create a `.env` file in the project root to override default environment variables. Changes take effect automatically without restarting containers **except for** the `APP_ENV` variable, which requires:

```bash
make up
```

This command restarts the containers so that the updated environment variable takes effect.
