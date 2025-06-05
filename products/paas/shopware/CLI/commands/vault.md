---
nav:
  title: Manage secrets
  position: 30
---

# Vault

This is the root command for managing secrets in Shopware PaaS.
Secrets are sensitive data that should be kept secure, such as API keys, passwords, and other credentials.
The values are stored encrypted in the database and can be accessed by users with the according permissions.

## Usage

```sh
sw-paas vault [command]
```

## Commands

- `create`: Create a new secret.
- `delete`: Delete an existing secret.
- `list`: List all available secrets.

### `vault create`

- **Usage**
  `sh
sw-paas vault create [flags]
`
- **Flags**

  - `--key`: Key of the secret
  - `--organization-id`: Id of the organization
  - `--project-id`: Id of the project
  - `--application-id`: Id of the application
  - `--value`: Value of the secret (for all type except `ssh`)
  - `--help`: help for this command
  - `--password-stdin`: Read the secret value from stdin (only when type is `ssh`)
  - `--type`: Type of the secret (env, buildenv, ssh)

- **Example**

  ```sh
  sw-paas vault create --organization-id "f9f13f63-ec24-42e9-b679-a6d8c3ba9ba4" --project-id "a9f13f63-ec24-42e9-b679-a6d8c3baqwz7" --application-id "lk839f63-ec24-42e9-b679-a6d8c3baqwz7" --key "API_KEY" --value "my-api-key" --type env
  ```

  This example creates a new secret with the key `API_KEY` and the value `my-api-key` for the given application-id.
  The value of the secret from type `env` will be available as an environment variable in the application.

  ```sh
    cat private.pem | sw-paas vault create
  ```

  This example reads the secret value from stdin and creates a new secret with the value of the file `private.pem`.
  Missing flags will be prompted interactively.

### `vault delete`

- **Usage**

  ```sh
  sw-paas vault delete [flags]
  ```

- **Flags**

  - `--secret-id`: Id of the secret
  - `--help`: help for this command

- **Example**

  ```sh
  sw-paas vault delete --secret-id "f9f13f63-ec24-42e9-b679-a6d8c3ba9ba4"
  ```

  This example deletes the secret with the given secret-id.

### `vault list`

- **Usage**

  ```sh
  sw-paas vault list [flags]
  ```

- **Flags**

  - `--organization-id`: Id of the organization
  - `--project-id`: Id of the project
  - `--application-id`: Id of the application
  - `--with-metadata`: Include metadata in the output like project name
  - `--help`: help for this command

- **Example**

  ```sh
  sw-paas vault list --organization-id "f9f13f63-ec24-42e9-b679-a6d8c3ba9ba4" --project-id "a9f13f63-ec24-42e9-b679-a6d8c3baqwz7"
  ```

  This example lists all secrets for the given project-id.
  This includes also secrets that belong to applications in the project.
