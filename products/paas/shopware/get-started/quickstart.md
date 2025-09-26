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

## Step 2: Connect Your Git Repository

To connect your private git repository with our backend, you need to add an SSH key to your repository. This key is used to clone your repository and deploy your code to the cluster.

### 2.1 Generate and Store SSH Key

Run the following command to create an SSH key and store it securely in your organization's vault:

```sh
sw-paas vault create --type ssh
```

This command will generate a new SSH key pair and store the private key securely.

::: info
Organization vs Project Level

- **Organization level**: All projects can use the key
- **Project level**: Only a specific project can use the key (add `--project` flag)

Project-level keys override organization-level keys.
:::

### 2.2 Add Public Key to Repository

After running the command, the CLI will display the generated public key. Copy this public key and add it to your repository settings:

- **GitHub**: Go to `Settings` → `Deploy keys` → `Add deploy key`
- **GitLab**: Go to `Settings` → `Repository` → `Deploy Keys`
- **Bitbucket**: Go to `Repository settings` → `Access keys`

Ensure the key has **read access** to the repository.

## Step 3: Create Your First Project

Initialize a new PaaS project:

```sh
sw-paas project create --name "my-shopware-app" --repository "git@github.com:username/repo.git"
```

## Step 4: Create and deploy an Application Instance of the project

Create your application:

```sh
sw-paas application create
```

Then, deploy your application:

```sh
sw-paas application deploy
```

Monitor the deployment progress:

```sh
sw-paas watch
```
