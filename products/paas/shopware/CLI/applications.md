---
nav:
  title: Manage Applications
  position: 40
---

# Applications

The `application` command manages deployments in Shopware PaaS. Each application represents a deployment of your codebase within a project. Projects can contain multiple applications (e.g., for staging, production).

## Usage

```sh
sw-paas application [command]
```

## Commands

### Creating an Application

Deploy a new application to a project.

**Usage:**

```sh
sw-paas application create [flags]
```

**Flags:**

- `--project-id`    ID of the target project. If not provided, the CLI will try to fetch it from the repository.
- `--name`        Name of the application. If not provided, the CLI will prompt for it.
- `--commit-sha`   Commit SHA to deploy. If not provided, the CLI will prompt for it.
- `--help`        Display help for the command.

**Example:**

```sh
sw-paas application create --project-id "proj-1" --name "my-app" --commit-sha "abcdef123456"
```

### Updating an Application

Update an existing application with a new commit SHA.

**Usage:**

```sh
sw-paas application update [flags]
```

**Flags:**

- `--project-id`    ID of the project.
- `--application-id` ID of the application.
- `--commit-sha`   Commit SHA to deploy.
- `--help`        Display help for the command.

**Example:**

```sh
sw-paas application update --project-id "proj-1" --application-id "app-1" --commit-sha "abcdef123456"
```

### Listing Applications

List all applications associated with a specific project.

**Usage:**

```sh
sw-paas application list [flags]
```

**Flags:**

- `--project-id`  ID of the project.
- `--help`     Display help for the command.

**Example:**

```sh
sw-paas application list --project-id "proj-1"
```

### Checking Applications

Check the status of applications.

**Usage:**

```sh
sw-paas application check [flags]
```

**Flags:**

- `--project-id`  ID of the project.
- `--application-id` ID of the application.
- `--help`     Display help for the command.

## Build Commands

### Listing Builds

List all builds for a specific application.

**Usage:**

```sh
sw-paas application build list [flags]
```

**Flags:**

- `--application-id`  ID of the application.
- `--organization-id` ID of the organization.
- `--project-id`    ID of the project.
- `--help`        Display help for the command.

**Example:**

```sh
sw-paas application build list --organization-id "org-1" --project-id "proj-1" --application-id "app-1"
```

### Viewing Build Logs

Display logs of a specific build.

**Usage:**

```sh
sw-paas application build logs [flags]
```

**Flags:**

- `--application-id`    ID of the application.
- `--application-build-id` ID of the build.
- `--organization-id`   ID of the organization.
- `--project-id`       ID of the project.
- `--help`            Display help for the command.

**Example:**

```sh
sw-paas application build logs --organization-id "org-1" --project-id "proj-1" --application-id "app-1" --application-build-id "build-1"
```

### Starting a Build

Trigger a new build for the specified application.

**Usage:**

```sh
sw-paas application build start [flags]
```

**Flags:**

- `--application-id`  ID of the application.
- `--organization-id` ID of the organization.
- `--project-id`    ID of the project.
- `--help`        Display help for the command.

**Example:**

```sh
sw-paas application build start --organization-id "org-1" --project-id "proj-1" --application-id "app-1"
```

### Deleting an Application

Delete an existing application from a project.

**Usage:**

```sh
sw-paas application delete [flags]
```

**Flags:**

- `--application-id`  ID of the application to be deleted (required).
- `--project-id`     ID of the project (optional, fetched if omitted).
- `--help`         Display help for the command.

**Example:**

```sh
sw-paas application delete --application-id "app-1" --project-id "proj-1"
```
