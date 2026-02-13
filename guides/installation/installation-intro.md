---
nav:
  title: Shopware 6 Installation
  position: 1

---

# Overview of Shopware 6 Installation

Welcome to the Shopware 6 Developer Installation Guide, which will help you set up a local Shopware 6 development environment whether you’re:

- building a custom shop project
- developing a plugin, app, or theme
- contributing to the Shopware core

The Shopware 6 development environment is primarily supported and recommended to be used with [Docker](https://www.docker.com/). This platform enables developers to develop, ship, and run applications inside containers: lightweight, standalone, and executable packages. Docker enables production-like conditions consistent across teams and CI/CD, and makes it easy to reset or rebuild environments. Docker is especially useful when full service parity is required (e.g., caching, queues, search).

The [Docker-based setup](./docker-setup.md) aims to provide a smooth onboarding experience aligned with modern development practices. It runs your entire Shopware environment in containers, including all backend services (PHP, MySQL, Node, an Elasticsearch-compatible search engine, Redis, Mailhog, etc.). No manual installation is required.

The pages that follow assume that you're using Docker itself. That said, the Shopware community has produced some related tooling for developers who prefer more automated or GUI-friendly ways to run Docker environments: DDEV and Dockware. Both are **community-maintained** and not officially supported by Shopware.

## DDEV

[DDEV](https://ddev.com/) is a developer-friendly wrapper around Docker that automates environment setup using simple CLI commands. Key features include:

- Simplifies Docker configuration: no manual `docker-compose.yml` needed.
- One command (`ddev start`) to start your Shopware environment.
- Easy to switch PHP/MySQL/Node versions per project.
- Integrates well with VS Code and PHPStorm.

[DDEV with Shopware example →](https://github.com/ddev/test-shopware6)

### Dockware setup

[Dockware](https://www.dockware.io/) provides ready-to-run Docker images for quickly spinning up demo stores or full local environments in seconds. It emphasizes minimal setup over full customization. Community members enjoy these features:

- Pre-built images for Shopware 5, 6, and nightly builds.
- Includes all key services: PHP, DB, Elasticsearch, Mailhog, Adminer, etc.
- Great for testing specific versions or quick evaluation.
- Can be used standalone or integrated into CI pipelines.

[Dockware documentation →](https://docs.dockware.io/)

:::info
Looking for older installation methods that are no longer recommended? See our [Legacy Installation Guides](./legacy-setups/).
:::
