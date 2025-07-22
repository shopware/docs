---
nav:
  title: Setting environment variables
  position: 30
---

# Guide: Setting environment variables

This guide explains how to configure environment variables in Shopware PaaS Native.

## Configure environment variables

Environment variables are defined in the `application.yaml` file, in the following array `app.environment_variables`.

Environment variables need to be scoped, they can be configured either for `RUN` or `BUILD`

| Scope      | Description                                           |
|------------|-------------------------------------------------------|
| `RUN`      | The value is passed to Shopware application (runtime) |
| `BUILD`    | Build-time environment variables                      |

Once the `application.yaml` is updated as usual, run the following:

```sh
sw-paas application update
```

## Configure an environment variable for runtime

Update the `application.yaml` file like this:

```yaml
app:
  environment_variables:
    - name: MY_RUNTIME_VARIABLE
      value: my-value
      scope: RUN
```

## Configure an environment variable for buildtime

Update the `application.yaml` file like this:

```yaml
app:
  environment_variables:
    - name: MY_BUILDTIME_VARIABLE
      value: my-value
      scope: BUILD
```

## Complete example

Update the `application.yaml` file like this:

```yaml
app:
  ...
  environment_variables:
    - name: MY_BUILDTIME_VARIABLE
      value: bar
      scope: BUILD
    - name: MY_RUNTIME_VARIABLE
      value: foo
      scope: RUN
    - name: MY_VARIABLE
      value: my-value
      scope: RUN
    - name: MY_VARIABLE
      value: my-value
      scope: BUILD
...
```