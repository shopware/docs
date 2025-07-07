---
nav:
  title: Secrets
  position: 50
---

# Secrets

Shopware PaaS Native allows you to securely store and retrieve sensitive information like passwords or API tokens.

Secrets stored in Vault are reusable, which means that you can easily reuse a secret value in different applications. Secrets are global to the organization, so all applications can access the same values.

## Creating a New Secret

A secret is composed of a type, a key, and a value. The supported types are `env`, `buildenv`, and `ssh`. `env` is available at runtime in the application, `buildenv` is accessible during build processes, and `ssh` keys are for secure connections.

To create a secret:

```sh
sw-paas vault create
```

### Deleting a Secret

To delete an existing secret:

**Usage:**

```sh
sw-paas vault delete
```
