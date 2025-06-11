---
nav:
  title: Managing project
  position: 30
---

# Project

The project command enables you to manage and organize projects within Shopware PaaS Native. A project is a logical entity that encapsulates your application environments such as staging and production and is linked to a specific codebase repository.

Each project supports multiple application instances and shares infrastructure settings within the same organization.

Projects serve as the foundational unit for deployments. They define the application code source (Git repository), the project type and associated resources.

## Usage

```sh
sw-paas project [command]
```

:::info
To avoid repeatedly specifying `organization-id`, either use the `context` command to set them persistently, or run the CLI in interactive mode for guided input.
:::

## Commands

### Creating a New Project

Initialize a new project in your organization by specifying its name, repository, and type. To enable secure code fetching from private repositories during deployments, Shopware PaaS Native uses SSH deploy keys. [Here is a guide](./repository.md) on how you can configure deploy keys.

**Usage:**

```sh
sw-paas project create [flags]
```

**Flags:**

- `--name`: The name of the project.
- `--repository`: The repository URL associated with the project.
- `--type`: The type of the project (`shopware`, `blackbox`).

**Example:**

```sh
sw-paas project create --name "myproject" --repository "https://github.com/example/repo.git" --type shopware
```

This example creates a Shopware project named `myproject` linked to the specified Git repository.

### List All Projects

Displays all projects associated with your user or organization, along with key metadata such as project name, type, and repository.

**Usage:**

```sh
sw-paas project list
```
