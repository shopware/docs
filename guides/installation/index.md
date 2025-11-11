---
nav:
  title: Installation
  position: 10

---

# Overview — Shopware 6 Installation

Welcome to the Shopware 6 Developer Installation Guide.
This guide will help you set up a local Shopware 6 development environment - whether you’re:

- Building a custom shop project
- Developing a plugin, app, or theme
- Contributing to the Shopware core

You can choose from three supported setup options, each designed for specific use cases and development workflows. All setups start from the [Shopware Project Template](./template.md).

## Shopware Project Template

Every setup begins with the Project Template. It creates a new Composer project that includes Shopware as a dependency, allowing you to:

- Extend the project with plugins, apps, or themes
- Customize configurations and services
- Align the environment with your development goals

## Supported Setups

| Setup | Description | Recommended For |
|:------|:-------------|:----------------|
| [Docker Setup](./setups/docker.md) | A complete, containerized environment including all required services (database, search engine, cache, etc.). | Most developers — provides production-like conditions, consistent across teams and CI/CD. |
| [Symfony CLI Setup](./setups/symfony-cli.md) | Runs directly on your host system using local PHP and Composer. Lightweight and fast to start. | Quick plugin or theme development, or environments where Docker isn’t available. |
| [Devenv Setup](./setups/devenv.md) | A reproducible, Nix-based setup offering deterministic builds and cross-platform consistency. | Core contributors and advanced users managing multiple Shopware versions. |

::: info
If you’re unsure which setup to choose, start with the Docker setup — it provides the smoothest onboarding experience.
:::
