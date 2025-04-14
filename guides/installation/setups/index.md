---
nav:
  title: Setups
  position: 3000

---

# Setups

### Set up your own environment

Head over to the [Requirements](../requirements) section to install and configure the necessary services like a database and a webserver to a Unix system like Linux, macOS, WSL etc.

### Development setup

::: info
Technically there is no real difference between a Development Setup and a Production Setup, they only differ on performance and security optimizations.
:::


* [Docker*](docker) - This is a Docker setup for Shopware 6. It is a lightweight and easy way to get started with Shopware. It uses Docker Compose to manage the services and is suitable for local development.

* [Symfony CLI*](docker+symfony-cli) - This setup uses the Symfony CLI to run the Shopware. It is the default way to run Symfony applications and is suitable also for Shopware.

* [Devenv*](devenv) installation manages all necessary services. A description file in the source code manages the versions of these services. This setup works for Linux, WSL and macOS.

* [Dockware](https://dockware.io/getstarted) - This is a managed docker setup for Shopware 6 by Shopware agency [dasistweb](https://www.dasistweb.de/).

* [DDEV](https://notebook.vanwittlaer.de/ddev-for-shopware/less-than-5-minutes-install-with-ddev-and-symfony-flex) - Docker-based PHP development environments, works on all platforms and is generic enough to be used for any PHP project. [Project Page](https://ddev.com/)

> \* These setups are provided and officially supported by shopware AG.

### Production setup

#### Managed hosting

Many hosting providers especially Shopware certified ones, offer a fully pre-configured Hosting environment for Shopware. This is the easiest way to get started with Shopware. You can find a list of certified hosting partners on the [Shopware website](https://www.shopware.com/en/partner/hosting/). You will just need to upload your [Shopware project template](./template.md) to the server and run the installation commands.

If you want to automate the installation process, consider using [Deployer](https://deployer.org/) to deploy the code changes. You can find here the [Deployer documentation](../hosting/installation-updates/deployments/deployment-with-deployer.md).

#### Container based hosting

If you are using containers for your setup, check out the dedicated [Docker guide for production](../hosting/installation-updates/docker.md). This guide will help you to set up a production ready Docker environment for Shopware 6.

If you are using Kubernetes, take a look at the [Shopware Kubernetes Operator](https://github.com/shopware/shopware-operator).
