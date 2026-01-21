---
nav:
  title: Prepare Shopware codebase
  position: 20
---

# Prepare Shopware codebase

## Prerequisite

**macOS** and **Linux** are the recommended environments for local development. On **Windows**, it's advisable to use [Docker](https://www.youtube.com/watch?v=5XYFRDlT9WI) or **WSL2** (Windows Subsystem for Linux) for a consistent development experience.

To develop and customize your Shopware project effectively, certain operations must be performed in a local environment. This is especially important for tasks that directly interact with the file system, such as Installing or upgrading plugins, adjusting system-level configuration (e.g., language, environment) or applying custom code changes.

Plugin management via the Shopware Administration interface is **not supported**. This is because the platform operates in a **high-availability (HA), clustered setup**, where all application instances must remain **stateless and identical**.

To ensure consistency and reproducibility across deployments, plugins must be installed or updated **via Composer** as part of the project’s codebase. Follow the official guidance on [managing extensions with Composer](https://developer.shopware.com/docs/guides/hosting/installation-updates/extension-managment.html#installing-extensions-with-composer).

Additionally, before installation, verify that each plugin supports **S3-based storage**, as not all extensions are compatible with external file systems.

## How to uninstall plugins

To uninstall plugins in the PaaS environment, use the [Deployment Helper](../../../../guides/hosting/installation-updates/deployments/deployment-helper.html#removal-of-extensions) which provides a streamlined process for extension management.

The uninstallation process involves two steps:

1. **Set the extension to remove**: Configure the extension state as `remove` in your `.shopware-project.yml` file and deploy the changes to uninstall the extension.

2. **Remove from source code**: After the deployment, remove the extension from your source code and deploy again.

For detailed instructions and configuration examples, refer to the [Removal of extensions](../../../../guides/hosting/installation-updates/deployments/deployment-helper.html#removal-of-extensions) section in the Deployment Helper documentation.

## Generating the required files

Whether you're starting from scratch or working with an existing Shopware project, the following steps will ensure your setup is ready for deployment on Shopware PaaS Native.

### For New Projects

To create a new Shopware project from the official production template, run:

```sh
composer create-project shopware/production <folder-name>
```

Then navigate into the project directory and proceed with the next steps.

### For Existing Projects

If you're working with an already created Shopware project, simply navigate into the project directory:

```sh
cd <your-project-folder>
```

Ensure the required Kubernetes metadata package is installed to enable compatibility with the [Shopware Operator](https://github.com/shopware/shopware-operator):

```sh
composer require shopware/k8s-meta --ignore-platform-reqs
```

:::info
The `--ignore-platform-reqs` flag ensures that all necessary recipes are installed, even if your local PHP version differs from the required platform version.
:::

This package installs essential configuration files, including those required for deploying your shop via the Shopware Operator. After installation, verify that the file `config/packages/operator.yaml` has been created.

### Create the `application.yaml` File

At the root of your project, create a file named `application.yaml`. This file defines key deployment parameters, such as the PHP version and any environment-specific configuration needed for your shop.

#### Basic Example

```yaml
app:
  php:
    version: "8.3"
  environment_variables: []
services:
  mysql:
    version: "8.0"
```

#### Advanced Example (with Custom Environment Variables)

```yaml
app:
  php:
    version: "8.3"
  environment_variables:
    - name: INSTALL_LOCALE
      value: fr-FR
      scope: RUN # Supports RUN or BUILD
services:
  mysql:
    version: "8.0"
```

## Hooks Configuration

Shopware PaaS Native uses the deployment helper to execute custom hooks for your application. To see how these hooks are configured, refer to the [Deployment Helper documentation](../../../../guides/hosting/installation-updates/deployments/deployment-helper.html#configuration).
