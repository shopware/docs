---
nav:
  title: Project overview
  position: 4

---

# Understanding your Shopware project

You’ve just installed Shopware. But what exactly did you get? This section guides you through fundamentals you'll use through the rest of your development workflow.

## Development tooling included

The Docker setup installs Shopware with development dependencies (`require-dev`) enabled, including:

- [`shopware/dev-tools`](https://github.com/shopware/dev-tools)
- Symfony profiler
- [Demo data](https://github.com/shopware/SwagPlatformDemoData)
- Linting and testing tools

Your local project is ready for debugging, profiling, and extension development out of the box.

In day-to-day development, you’ll mostly interact with:

- **Makefile**: shortcuts for Docker and Shopware commands (`make up`, `make setup`, etc.)
- **custom/**: where you build your own plugins and themes
- **bin/console**: the application CLI that ships with Shopware (Symfony console). It's used for tasks like running migrations, installing plugins, clearing caches, or managing configuration inside your project.

:::info
`bin/console` is different from the standalone [Shopware CLI](https://github.com/shopware/shopware-cli) tool used for extension builds and CI workflows. The Docker setup already includes the standalone Shopware CLI inside the container.
:::

Most other files in the project either configure the environment or support these core layers.

## Project template

All setups start from the Shopware Project Template - a Composer-based project that installs Shopware as a dependency. It serves as the foundation for new Shopware projects as well as for developing plugins, apps, or themes. This allows you to:

- Extend the project with plugins, apps, or themes
- Customize configuration and services
- Tailor the environment to your development needs

### Components explained

The following table explains the Docker-level components created when you start the project. Container names depend on your project folder name.

| Name                                  | Type                    | Purpose                                                                                                                       |
|---------------------------------------|-------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| **Network `my-project_default`**      | Docker network          | A private virtual network so all containers can communicate (for example, the web container connects to the database).        |
| **Volume `my-project_db-data`**       | Persistent storage      | Stores the MariaDB database files so your data isn’t lost when containers are stopped or rebuilt.                             |
| **Container `my-project-mailer-1`**   | Mailpit service         | Captures outgoing emails for local testing. View at [http://localhost:8025](http://localhost:8025).                           |
| **Container `my-project-database-1`** | MariaDB service         | Runs the Shopware database. Inside the Docker network its host name is `database`.                                            |
| **Container `my-project-web-1`**      | PHP + Caddy web service | Runs Shopware itself and serves the storefront and Admin UI at [http://localhost:8000](http://localhost:8000).                |
| **Container `my-project-adminer-1`**  | Adminer (DB UI)         | Lightweight web interface for viewing and editing your database. Available at [http://localhost:8080](http://localhost:8080). |

### Project structure

After installation, your Shopware project contains the following root-level directories and files:

```text
project-root/
├── bin/
├── config/
├── custom/
│   ├── plugins/
│   ├── apps/
│   └── static-plugins/
├── files/
├── public/
├── src/
├── var/
├── vendor/
├── compose.yaml
├── compose.override.yaml
├── composer.json
├── composer.lock
├── symfony.lock
├── Makefile
├── .env
└── README.md
```

This table outlines the key directories and files in your Shopware project and what they are used for.

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

With this understanding move to the next section to make changes.
