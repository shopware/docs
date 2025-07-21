---
nav:
  title: Secrets
  position: 50
---

# Secrets

Shopware PaaS Native allows you to securely store and retrieve sensitive information like passwords or API tokens.

Secrets stored in Vault are reusable, which means that you can reuse a secret value in different applications. Secrets are global to the organization, so all applications can access the same values.

## Creating a New Secret

A secret is composed of a type, a key, and a value. 
Once created, it is assigned a unique `secret-id`, which is required for retrieving or deleting the secret.

The supported types are `env`, `buildenv`, and `ssh`. `env` is available at runtime in the application, `buildenv` is accessible during build processes, and `ssh` keys are for secure connections.

To create a secret:

```sh
sw-paas vault create
```

---

## Retrieving a Secret

To retrieve an existing secret from the Vault, you **must specify the secret ID** using the `--secret-id` flag:

```sh
sw-paas vault get --secret-id SECRET-ID
```

> ℹ️ You can obtain the `SECRET-ID` by running:
>
> ```sh
> sw-paas vault list
> ```

---

## Deleting a Secret

To delete a secret from the Vault, also use the `--secret-id` flag:

```sh
sw-paas vault delete --secret-id SECRET-ID
```

> ⚠️ **Warning:** Deleting a secret is permanent. Ensure the secret is no longer in use before removing it.

---

## Example Workflow

Below is a sample workflow using `sw-paas` CLI to manage SSH secrets:

### 1. Create a New SSH Secret

```sh
sw-paas vault create --type ssh
```

This command generates a new SSH key and stores it securely in the vault.

### 2. List All Secrets

```sh
sw-paas vault list
```

This displays all stored secrets along with their `secret-id`.

### 3. Retrieve a Secret

Use the ID obtained from the list command:

```sh
sw-paas vault get --secret-id ssh-abc123xyz
```

### 4. Delete a Secret

```sh
sw-paas vault delete --secret-id ssh-abc123xyz
```

This permanently removes the secret from the vault.
