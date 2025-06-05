---
nav:
  title: Managing project
  position: 20
---

# Projects

This is the root command for managing projects in the Shopware PaaS. A project groups together applications, which are deployments of your codebase. Each project is associated with a repository and may contain multiple applications, such as staging and production environments.

## Usage

```sh
sw-paas project [command]
```

## Commands

- `create`: Creates a new project.
- `list`: Lists all available projects.

### `project create`

This command creates a new project in Shopware PaaS. A project consists of a name, a repository URL, and a project type.

- **Usage**:

  ```sh
  sw-paas project create [flags]
  ```

- **Flags**:

  - `--name`: The name of the project. If its not provided, the CLI will prompt for it.
  - `--repository`: The repository URL of the project. If its not provided, the CLI attempts to auto-detect from the current working directory.
  - `--type`: The type of the project (e.g., `shopware`, `blackbox`). If its not provided, the CLI will prompt for it.

- **Example**:

  ```sh
  sw-paas project create --name "myproject" --repository "https://github.com/example/repo.git" --type shopware
  ```

  This example creates a project named "myproject" with a specified repository and project type.

### `project list`

This command lists all projects associated with the current user or organization. It displays project details such as the project name, type, and associated repository.

- **Usage**:

  ```sh
  sw-paas project list
  ```

- **Example**:

  ```sh
  sw-paas project list
  ```

  This example lists all projects and their details.
