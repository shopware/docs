---
nav:
  title: Manage secrets
  position: 80
---

# Vault

The `vault` command manages secrets in Shopware PaaS native. Secrets are encrypted pieces of sensitive data such as API keys, credentials, or SSH private keys. These secrets are securely stored and only accessible to users with the required permissions.

## Usage

```sh
sw-paas vault [command]
```

## Commands

### Creating a New Secret

Use this command to create and securely store a new secret.

**Usage:**

```sh
sw-paas vault create [flags]
```

**Flags:**

- `--key`: Key name for the secret.
- `--organization-id`: ID of the organization.
- `--project-id`: ID of the project.
- `--application-id`: ID of the application.
- `--value`: Value of the secret (used for all types except `ssh`).
- `--password-stdin`: Read the secret value from stdin (only valid when type is `ssh`).
- `--type`: Type of secret. Accepted values: `env`, `buildenv`, `ssh`.
- `--help`: Display help for the command.

**Type of secret and scope of use**
`env`: Available at runtime in the environment.
`buildenv`: Used during build processes.
`ssh`: SSH keys for secure connections.

**Examples:**

Create a standard environment secret:

```sh
sw-paas vault create --organization-id "org-123" --project-id "proj-456" --application-id "app-789" --key "API_KEY" --value "my-api-key" --type env
```

Create an SSH secret from stdin:

```sh
cat private.pem | sw-paas vault create --key "SSH_KEY" --type ssh --password-stdin
```

### Deleting a Secret

Use this command to delete an existing secret.

**Usage:**

```sh
sw-paas vault delete --secret-id [id]
```

**Flags:**

- `--secret-id`: ID of the secret to delete.
- `--help`: Display help for the command.

**Example:**

```sh
sw-paas vault delete --secret-id "secret-abc123"
```

This example deletes the secret identified by `secret-abc123`.

---

### Listing Available Secrets

Use this command to list all secrets associated with a specific scope.

**Usage:**

```sh
sw-paas vault list [flags]
```

**Flags:**

- `--organization-id`: ID of the organization.
- `--project-id`: ID of the project.
- `--application-id`: ID of the application.
- `--with-metadata`: Include metadata such as project name.
- `--help`: Display help for the command.

**Example:**

```sh
sw-paas vault list --organization-id "org-123" --project-id "proj-456"
```

This command lists all secrets for the specified project. Secrets scoped to applications within the project are also included.
