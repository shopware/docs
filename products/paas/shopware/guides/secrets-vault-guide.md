---
nav:
  title: Using the Vault
  position: 30
---

# Guide: Using the Shopware PaaS Vault

This guide explains how to securely manage secrets using the Shopware PaaS CLI Vault. You’ll learn how to create, retrieve, and delete secrets — including SSH keys — with practical examples.

## What is the Vault?

The Vault is a secure, centralized location to store sensitive data such as:

- Environment variables
- Build-time secrets
- SSH keys for accessing private Git repositories

Secrets stored in the Vault are reusable across all applications in your organization.

---

## Secret Types

| Type       | Description                                      |
|------------|--------------------------------------------------|
| `env`      | Runtime environment variables for your app       |
| `buildenv` | Build-time environment variables                 |
| `ssh`      | SSH keys for secure Git access                   |

---

## Creating a Secret

To create a secret interactively:

```sh
sw-paas vault create
```

You will be prompted to select a secret type, key, and value.

### Creating an SSH Key Secret

To generate and store an SSH key for deployments:

```sh
sw-paas vault create --type ssh
```

After generation, the CLI will output the public key. Add this to your Git hosting provider (e.g., GitHub under **Deploy Keys**).

---

## Retrieving a Secret

Secrets are accessed by their unique `secret-id`. You can retrieve a secret using:

```sh
sw-paas vault get --secret-id SECRET-ID
```

To list all secrets and find their IDs:

```sh
sw-paas vault list
```

---

## Deleting a Secret

To delete a secret from the Vault:

```sh
sw-paas vault delete --secret-id SECRET-ID
```

::: warning
This action is permanent. Ensure the secret is not in use before deleting it.
:::

---

## Example Workflow: Using SSH Keys

### Step 1: Generate and store an SSH key
```sh
sw-paas vault create --type ssh
```

### Step 2: Add the public key to GitHub as a deploy key

Navigate to your GitHub repository → Settings → Deploy Keys → Add Key.

### Step 3: List all secrets to verify
```sh
sw-paas vault list
```

### Step 4: Retrieve a specific secret
```sh
sw-paas vault get --secret-id ssh-abc123xyz
```

### Step 5: Delete a secret (when no longer needed)
```sh
sw-paas vault delete --secret-id ssh-abc123xyz
```
