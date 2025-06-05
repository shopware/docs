---
nav:
  title: Manage applications
  position: 30
---

# Applications

This is the root command for managing applications in Shopware PaaS. An application is a deployment of your codebase within a project. Each project can contain multiple applications, such as for different environments (e.g., staging, production).

## Usage

```sh
sw-paas application [command]
```

## Commands

- `build`: Command regarding application builds
- `check`: Check applications
- `create`: Create a new application.
- `delete`: Delete an existing application.
- `list`: List all available applications.
- `update`: Update applications

### `application build`

This command manages the build process for a given application. It has the following subcommands:

#### Sub commands

- `list`: List application builds
- `logs`: Get application build logs
- `start`: kick-off an application build

### `application build list`

- **Usage**:

  ```sh
  sw-paas application build list [flags]
  ```

- **Flags**:

  - `--application-id`: Id of the application
  - `--help`: help for this command
  - `--organization-id`: Id of the organization
  - `--project-id`: Id of the project

- **Example**:

  ```sh
  sw-paas application build list --organization-id "f9f13f63-ec24-42e9-b679-a6d8c3ba9ba4" --project-id "a9f13f63-ec24-42e9-b679-a6d8c3baqwz7" --application-id "lk839f63-ec24-42e9-b679-a6d8c3baqwz7"
  ```

This example lists all builds for the given application-id.

### `application build logs`

- **Usage**:

  ```sh
  sw-paas application build logs [flags]
  ```

- **Flags**:

  - `--application-id`: Id of the application
  - `--application-build-id`: Id of the build
  - `--help`: help for this command
  - `--organization-id`: Id of the organization
  - `--project-id`: Id of the project

- **Example**:

  ```sh
  sw-paas application build logs --organization-id "f9f13f63-ec24-42e9-b679-a6d8c3ba9ba4" --project-id "a9f13f63-ec24-42e9-b679-a6d8c3baqwz7" --application-id "lk839f63-ec24-42e9-b679-a6d8c3baqwz7" --application-build-id "vn634f63-ec24-42e9-b679-a6d8c3baqwz"
  ```

This example displays logs of a given build for the given application-id.

### `application build start`

- **Usage**:

  ```sh
  sw-paas application build start [flags]
  ```

- **Flags**:

  - `--application-id`: Id of the application
  - `--help`: help for this command
  - `--organization-id`: Id of the organization
  - `--project-id`: Id of the project

- **Example**:

  ```sh
  sw-paas application build start --organization-id "f9f13f63-ec24-42e9-b679-a6d8c3ba9ba4" --project-id "a9f13f63-ec24-42e9-b679-a6d8c3baqwz7" --application-id "lk839f63-ec24-42e9-b679-a6d8c3baqwz7"
  ```

This example starts a build for the application-id on the current commit SHA.

### `application create`

This command creates a new application in a specific project within Shopware PaaS. The codebase will be deployed based on a specific commit SHA from the associated repository.

- **Usage**:

  ```sh
  sw-paas application create [flags]
  ```

- **Flags**:

  - `--project-id`: The ID of the project where the application will be created. If not provided, the CLI will try to fetch it from the repository.
  - `--name`: The name of the application. If not provided, the CLI will prompt for it.
  - `--commit-sha`: The commit SHA to deploy. If not provided, the CLI will prompt for it.

- **Example**:

  ```sh
  sw-paas application create --project-id "f9f13f63-ec24-42e9-b679-a6d8c3ba9ba4" --name "my-app" --commit-sha "abcdef123456"
  ```

  This example creates an application called "my-app" in the project `123`, using the commit `abcdef123456`.

### `application list`

This command lists all applications associated with a specific project.

- **Usage**:

  ```sh
  sw-paas application list [flags]
  ```

- **Flags**:

  - `--project-id`: The ID of the project whose applications you want to list. If not provided, the CLI will try to fetch it from the repository.

- **Example**:

  ```sh
  sw-paas application list --project-id "f9f13f63-ec24-42e9-b679-a6d8c3ba9ba4"
  ```

  This example lists all applications for project `f9f13f63-ec24-42e9-b679-a6d8c3ba9ba4`.

### `application delete`

This command deletes an existing application in Shopware PaaS.

- **Usage**:

  ```sh
  sw-paas application delete [flags]
  ```

- **Flags**:

  - `--application-id`: The ID of the application to be deleted. This flag is required.
  - `--project-id`: The ID of the project containing the application. If not provided, the CLI will attempt to fetch it from the repository.

- **Example**:

  ```sh
  sw-paas application delete --application-id "8fd22617-9b7e-4d49-9d45-a2cfda7bb94c" --project-id "600c42c9-7df7-41ff-b396-92b61d57018c"
  ```

  This example deletes the application with ID `8fd22617-9b7e-4d49-9d45-a2cfda7bb94c` from project `600c42c9-7df7-41ff-b396-92b61d57018c`.

### `application update`

This command updates an existing application in a specific project within Shopware PaaS. The codebase will be deployed based on a specific commit SHA from the associated repository.

- **Usage**:

  ```sh
  sw-paas application update [flags]
  ```

- **Flags**:

  - `--project-id`: The ID of the project where the application will be created. If not provided, the CLI will try to fetch it from the repository.
  - `--application-id`: Id of the application
  - `--commit-sha`: The commit SHA to deploy. If not provided, the CLI will prompt for it.

- **Example**:

  ```sh
  sw-paas application update --project-id "f9f13f63-ec24-42e9-b679-a6d8c3ba9ba4"  --application-id "8fd22617-9b7e-4d49-9d45-a2cfda7bb94c" --commit-sha "abcdef123456"
  ```

This example updates the given application using the commit `abcdef123456`.
