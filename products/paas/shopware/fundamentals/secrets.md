---
nav:
  title: Secrets
  position: 50
---

# Secrets

Shopware PaaS Native allows you to securely store and retrieve sensitive information like passwords or API tokens.

Secrets stored in Vault are reusable, which means that you can reuse a secret value in different applications. Secrets are global to the organization, so all applications can access the same values.

## Creating a New Secret

A secret is composed of a type, a key, and a value. Once created, it is assigned a unique `secret-id`, which is required for retrieving or deleting the secret.

The supported types are `env`, `buildenv`, and `ssh`. `env` is available at runtime in the application, `buildenv` is accessible during build processes, and `ssh` keys are for secure connections.

To create a secret, use the following command:

```sh
sw-paas vault create
```

## Listing all Vault secrets

```sh
sw-paas vault list
```

## Retrieving a Secret

To retrieve an existing secret from the Vault, you **must specify the secret ID** using the `--secret-id` flag:

```sh
sw-paas vault get --secret-id SECRET-ID
```

---

## Deleting a Secret

To delete a secret from the Vault, also use the `--secret-id` flag:

```sh
sw-paas vault delete --secret-id SECRET-ID
```

::: warning
Deleting a secret is permanent. Ensure the secret is no longer in use before removing it.
:::
