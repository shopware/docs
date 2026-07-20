---
nav:
  title: Quickstart
  position: 40
---

# Quickstart

Get started with Shopware PaaS Native in just a few minutes. This guide will walk you through the essential steps to deploy your first Shopware application.

## Prerequisites

Before you begin, ensure you have:

- A Git repository with your Shopware application prepared for PaaS. You can follow [this guide](./index.md) for preparation.
- Access to the terminal / command line
- Git installed on your local machine. You can follow [this guide](https://github.com/git-guides/install-git).

## Step 1: Install the PaaS CLI

First, install the Shopware PaaS Native CLI tool:

```sh
curl -L https://install.sw-paas-cli.shopware.systems | sh
```

Verify the installation:

```sh
sw-paas version
```

## Step 2: Create Your First Project and Connect Your Git Repository

Start the project creation wizard:

```sh
sw-paas project create
```

The wizard prompts you for the organization, project name, and Git repository. When asked whether to create a project SSH key for the repository, answer `y`. The CLI creates the key, displays its public key, and waits for you to add it to your repository settings:

- **GitHub**: Go to `Settings` → `Deploy keys` → `Add deploy key`
- **GitLab**: Go to `Settings` → `Repository` → `Deploy Keys`
- **Bitbucket**: Go to `Repository settings` → `Access keys`

Ensure the key has **read access** to the repository, then confirm in the wizard that you added the key. The CLI then completes the project creation.

## Step 3: Create and deploy an Application Instance of the project

Create your application:

```sh
sw-paas application create
```

Then, deploy your application:

```sh
sw-paas application deploy create
```

Monitor the deployment progress:

```sh
sw-paas watch
```
