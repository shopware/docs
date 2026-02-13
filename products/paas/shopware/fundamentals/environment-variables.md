---
nav:
  title: Environment variables
  position: 50
---

# Setting environment variables

This page explains how to configure environment variables in Shopware PaaS Native.

## Sources

There are three ways to define environment variables, listed here from lowest to highest priority:

| Source                                          | Description                                      |
|-------------------------------------------------|--------------------------------------------------|
| `.env` file                                     | Committed to your repository, lowest priority    |
| [`application.yaml`](./application_yaml.md)     | Defined in `app.environment_variables`            |
| [Vault secrets](./secrets.md)                   | Created via `sw-paas vault create`, highest priority |

When the same variable is defined in multiple sources, the higher-priority source wins. For example, a variable set in `application.yaml` overwrites the same variable from `.env`, and a vault secret overwrites both.

Use the `.env` file for defaults, `application.yaml` for non-sensitive per-environment configuration, and vault secrets for sensitive values like passwords or API tokens. There is a detailed guide for secrets [here](../guides/secrets-vault-guide.md).

## Configure environment variables

Environment variables are defined in the `app.environment_variables` array of your [`application.yaml`](./application_yaml.md) file.

Each variable needs a `name`, `value`, and `scope`:

| Scope      | Description                                           |
|------------|-------------------------------------------------------|
| `RUN`      | The value is passed to Shopware application (runtime) |
| `BUILD`    | Build-time environment variables                      |

You can define the same variable name with different scopes to use different values at build-time and runtime.

Once the `application.yaml` is updated, apply the changes:

```sh
sw-paas application update
```

## Example

```yaml
app:
  environment_variables:
    - name: MY_BUILDTIME_VARIABLE
      value: bar
      scope: BUILD
    - name: MY_RUNTIME_VARIABLE
      value: foo
      scope: RUN
```
