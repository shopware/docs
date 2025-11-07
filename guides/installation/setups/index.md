---
nav:
  title: Setups
  position: 3000

---

# Setups

Once your system meets the [requirements](../requirements.md), you can choose how you want to run your Shopware 6 development environment. This page helps you understand how each setup works in practice: What it’s best at, what to expect in daily use, and how to switch between them.

## Docker setup (recommended)

Docker runs your entire Shopware environment in containers, including PHP, MySQL, Redis, Elasticsearch, and Mailhog. It gives you a **production-like stack** with minimal manual setup.

**What to expect**

- All services run inside containers managed by Docker Compose.
- Great parity between development, CI, and production.
- Easy to reset or rebuild environments (`docker compose down -v`).
- Higher resource usage, but consistent results on any machine.

**When it shines**

- You want zero “works on my machine” issues.
- You collaborate with others or use CI/CD pipelines.
- You need full service parity (e.g. caching, queues, search).

**Start here:** [Docker setup guide →](./docker.md)

## Symfony CLI setup

Symfony CLI runs Shopware locally using your host system’s PHP and Composer installation.  
It’s **lightweight, fast, and easy to debug** using your local toolchain.

**What to expect**

- Uses your installed PHP, MySQL, and Node.js directly.
- Minimal overhead and startup time.
- Ideal for plugin, theme, or app developers who want rapid iteration.
- You manage local dependencies (e.g. PHP extensions, database) yourself.

**When it shines**

- You’re building or testing extensions, not full stacks.
- You prefer editing and debugging locally.
- You’re on a resource-limited machine.

**Start here:** [Symfony CLI setup guide →](./symfony-cli.md)

## Devenv setup

Devenv uses [Nix](https://nixos.org/) to define a reproducible Shopware development environment.  
It ensures everyone — across macOS, Linux, and CI — gets **the same dependency versions** and behavior.

**What to expect**

- You define all tools and services in `devenv.yaml`.
- Nix handles installation and version consistency automatically.
- Works well in multi-version or multi-project contexts.
- Slightly steeper learning curve but high reliability.

**When it shines**

- You contribute to Shopware core or maintain multiple versions.
- You want reproducibility between developers and CI.
- You value a declarative, version-controlled environment.

**Start here:** [Devenv setup guide →](./devenv.md)

## Community and alternative Docker tooling

If you prefer a more automated or GUI-friendly way to run Docker environments, DDEV and Dockware are both popular within the Shopware community. **Note:** DDEV and Dockware are community-maintained and not officially supported by Shopware.

### DDEV setup

[DDEV](https://ddev.com/) is a developer-friendly wrapper around Docker that automates environment setup using simple CLI commands.

**Why use DDEV**

- Simplifies Docker configuration: no manual `docker-compose.yml` needed.
- One command (`ddev start`) to start your Shopware environment.
- Easy to switch PHP/MySQL/Node versions per project.
- Integrates well with VS Code and PhpStorm.

**Use it when**

- You want a pre-configured, easy-to-use Docker experience.
- You prefer to focus on code, not container details.

[Shopware + DDEV example on GitHub](https://github.com/ddev/ddev-shopware6)

### Dockware setup

[Dockware](https://www.dockware.io/) provides ready-to-run Docker images for quickly spinning up demo stores or full local environments.

**Why use Dockware**

- Pre-built images for Shopware 5, 6, and nightly builds.
- Includes all key services: PHP, DB, Elasticsearch, Mailhog, Adminer, etc.
- Great for testing specific versions or quick evaluation.
- Can be used standalone or integrated into CI pipelines.

**Use it when**

- You need a running Shopware instance in seconds.
- You’re testing multiple Shopware versions or demos.
- You prefer minimal setup over full customization.

[Dockware documentation →](https://docs.dockware.io/)

## Switching between setups

You can use more than one setup on the same machine, just not at the same time.

| Scenario | Recommended Setup |
|:----------|:------------------|
| Quick testing, plugin/theme work | **Symfony CLI** |
| Team or CI/CD environment | **Docker** |
| Multi-version core contributions | **Devenv** |
| Simplified Docker workflow | **DDEV** |
| Instant Shopware demo/store | **Dockware** |

To switch setups safely:

1. Stop running services (e.g., `docker compose down`, or `symfony server:stop`).
2. Use separate directories for each setup.
3. Reuse the same project template if needed — each setup has its own configuration files.

## Tips for choosing

- New to Shopware? Start with **Docker**: consistent, documented, and closest to production.  
- Need speed and simplicity? Go for **Symfony CLI**.  
- Care about reproducibility and advanced workflows? Pick **Devenv**.  

You can always migrate between setups later. Your Shopware project remains the same.

## Next step

Choose your preferred setup and follow its related guide:

- [Docker Setup](./docker.md)  
- [Symfony CLI Setup](./symfony-cli.md)  
- [Devenv Setup](./devenv.md)
- [DDEV Documentation](https://ddev.readthedocs.io/en/stable/)  
- [Dockware Documentation](https://docs.dockware.io/)

Once your setup is running, you can start developing your **shop**, **app**, **plugin**, or **theme**.

::: info 
Each setup uses the same Shopware Project Template at its core. Only the runtime environment differs. You can safely switch between setups as long as you keep separate environment configurations.
:::
