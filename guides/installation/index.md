---
nav:
  title: Shopware 6 Installation
  position: 1

---

# Overview of Shopware 6 Installation

:::info
The installation workflow has been streamlined to focus on a Docker-based setup as the primary approach. Previous installation methods are available in the [Legacy Setups](./legacy-setups/index.md) section.
:::

Welcome to the Shopware 6 Developer Installation Guide, which will help you set up a local Shopware 6 development environment, whether you’re:

- Building a custom shop project
- Developing a plugin, app, or theme
- Contributing to the Shopware core

The Shopware 6 development environment is primarily supported and recommended for use with [Docker](https://www.docker.com/). This platform enables developers to develop, ship, and run applications inside containers: lightweight, standalone, and executable packages. Docker enables production-like conditions consistent across teams and CI/CD, and makes it easy to reset or rebuild environments. Docker is beneficial when full service parity is required (e.g., caching, queues, search).

The [Docker-based setup](./docker-setup.md) aims to provide a smooth onboarding experience aligned with modern development practices. It runs your entire Shopware environment in containers, including all backend services (PHP, MySQL, Node, an Elasticsearch-compatible search engine, Redis, Mailhog, etc.). No manual installation is required.

The pages that follow assume that you're using Docker itself.

The Shopware community has produced some related tooling for developers who prefer more automated or GUI-friendly ways to run Docker environments: [DDEV](https://ddev.com/) and [Dockware](https://www.dockware.io/). Both are **community-maintained** and not officially supported by Shopware.

Next, check the [hardware requirements](./system-requirements.md) to prepare your system for installation.
