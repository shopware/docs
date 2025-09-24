---
nav:
  title: Setups
  position: 3000

---

# Alternative Setup Options

::: tip Recommended Approach
We **strongly recommend** using our main [Development Setup](../setup) guide which provides a complete Docker-based environment with zero configuration.
:::

## Why Use Alternatives?

Our Docker setup covers 99% of use cases. Only consider alternatives if:
- Corporate policies prevent Docker usage
- You have specific infrastructure requirements
- You're working with legacy systems

## Alternative Setup

::: warning
Manual configuration required. Only use if Docker is not an option for your use case.
:::

* [Manual Setup](../requirements) - Full manual installation for specific requirements
* [Devenv (Legacy)](../devenv) - Nix-based setup (no longer recommended)

## Production Setup

### Managed hosting

Many hosting providers, especially Shopware certified ones, offer a fully pre-configured Hosting environment for Shopware. This is the easiest way to get started with Shopware. You can find a list of certified hosting partners on the [Shopware website](https://www.shopware.com/en/partner/hosting/). You will need to upload your Shopware project to the server and run the installation commands.

If you want to automate the installation process, consider using [Deployer](https://deployer.org/) to deploy the code changes. You can find here the [Deployer documentation](../../hosting/installation-updates/deployments/deployment-with-deployer.md).

### Container-based hosting

If you are using containers for your setup, check out the dedicated [Docker guide for production](../../hosting/installation-updates/docker.md). This guide will help you to set up a production ready Docker environment for Shopware 6.

If you are using Kubernetes, take a look at the [Shopware Kubernetes Operator](https://github.com/shopware/shopware-operator).
