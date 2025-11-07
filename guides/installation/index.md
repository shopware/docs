---
nav:
  title: Installation
  position: 10

---

# Shopware 6 installation overview

Welcome! This guide helps you set up a **Shopware 6 development environment**—whether you're building a shop project; developing a plugin, app or theme, or contributing to the Shopware core.

We'll focus on three supported setups, each tailored for different developer needs and environments. All of them start from the **Shopware Project Template**.

## The Shopware project template

Every setup begins with the [Project template](./template.md), which creates a new Composer project that includes Shopware as a dependency. You can then extend your installation with additional extensions (plugins or custom apps), themes, or configurations, depending on your project goals.

## Setup options

The three setups we'll highlight here:

| Setup | Description | When to use |
|:------|:-------------|:------------|
| **[Docker Setup](./setups/docker.md)** | A complete, containerized environment with all required services (database, search, cache, etc.). | Recommended for most users, as it provides production-like conditions and consistency across teams and CI/CD. |
| **[Symfony CLI Setup](./setups/symfony-cli.md)** | A lightweight setup that runs directly on your host using your local PHP and Composer. | Best for quick plugin or theme development, or when Docker isn’t available. |
| **[Devenv Setup](./setups/devenv.md)** | A modern, reproducible setup based on Nix for cross-platform consistency. | Ideal for core contributors or advanced users managing multiple Shopware versions. |

If you’re unsure which to choose, start with the Docker setup. It offers the smoothest onboarding and most complete environment.

<PageRef page="./setups/" />
