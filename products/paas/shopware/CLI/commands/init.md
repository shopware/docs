---
nav:
  title: Initialise project
  position: 20
---

# Initialise

This command initializes a new Shopware PaaS project. It creates a directory with a Shopware PaaS project template, which you can use as a starting point for development and deployment.

## Usage

```sh
sw-paas init [flags] [directory]
```

If a directory is not provided, the project is initialized in the current working directory.

## Flags

- `--application-type`: Specifies the type of application to deploy (e.g., `storefront`, `headless`, `frontends`). If it is not provided, the CLI will prompt you to select one.
- `--repository`: The remote repository URL where the project will be stored. Currently, only GitHub repositories are supported. If it is not provided, the CLI will prompt for it.

- **Examples**:

  - Initialize a project in the current directory:

    ```sh
    sw-paas init --application-type storefront --repository "https://github.com/example/repo.git"
    ```

  - Initialize a project in a specific directory:

    ```sh
    sw-paas init ./my-project --application-type headless
    ```

## Application types

- **storefront**: A Shopware PaaS project for a storefront-based application.
- **headless**: A headless version of Shopware.
- **frontends**: A project focused on frontends for Shopware.

Once the initialization is complete, the command provides a starting point for deployment and further configuration.

### Repository setup

During initialization, the command will prompt for a remote repository URL, which must be a GitHub URL. If no valid GitHub URL is provided, an error will be thrown.

### Git operations

The `init` command also initializes a Git repository in the project directory and sets up the provided GitHub repository as the remote origin.

### Composer setup

During project initialization, the following Composer tasks are performed:

- A Shopware project template is created using `shopware/production`.
- Required dependencies such as `shopware/k8s-meta` and others are installed based on the selected application type (`storefront`, `frontends`, etc.).

### Project configuration

After setting up the project, the command generates a `application.yaml` file with default configurations, including PHP and MySQL versions. You can modify this configuration file according to your project needs.
