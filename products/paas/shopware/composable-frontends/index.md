---
nav:
  title: Composable Frontends
  position: 42
---

# Composable Frontends

Composable frontends can be deployed on Shopware PaaS Native in a similar way to Shopware applications.
They use the same project and application lifecycle, the same deployment commands, and the same environment variable and Vault secret handling.

Use this page for the configuration that is specific to composable frontends.
For the general platform workflow, see [Applications](../fundamentals/applications.md), [Application YAML Configuration](../fundamentals/application-yaml.md), and the [Quickstart](../get-started/quickstart.md).

## Prerequisites

Before deploying a composable frontend, make sure you have:

- A Git repository that contains your composable frontend source code
- Access to Shopware PaaS Native and the [`sw-paas` CLI](../get-started/cli.md)
- A project that is connected to your Git repository
- An `application.yaml` file in the root of your repository

If you have not connected a repository yet, follow the repository setup steps in the [Quickstart](../get-started/quickstart.md).

## Application YAML

Composable frontends require an `application.yaml` file in the root of the repository.
The main difference compared to a Shopware application is the application kind and the Node.js runtime configuration.

A minimal configuration looks like this:

```yaml
kind: cfe

app:
  node:
    version: 24
```

The supported Node.js versions are:

- `22`
- `24`
- `26`

Choose the version that matches the runtime requirements of your frontend project and commit the `application.yaml` to your repository.

## Runtime requirements

Composable frontend applications must listen on port `3000`.

They must also expose a health endpoint at `/api/healthz`.
Shopware PaaS Native uses this endpoint for liveness and readiness checks.
The endpoint should return a successful response when the application is ready to receive traffic.

The container filesystem is read-only for security reasons.
If your application needs to write temporary files at runtime, write them to `/app/tmp`.

## Environment variables

Composable frontends use the same environment variable configuration as Shopware applications.
You can define non-sensitive values in `application.yaml`:

```yaml
kind: cfe

app:
  node:
    version: 24
  environment_variables:
    - name: FOO
      value: BAR
      scope: RUN
```

Use `RUN` for variables that must be available when the frontend runs.
Use `BUILD` for variables that are only needed during the build step.

For sensitive values such as API tokens, use [Vault secrets](../fundamentals/secrets.md) instead of committing them to `application.yaml`.
Secrets are handled in the same way as for Shopware applications:

- `env` secrets are available at runtime
- `buildenv` secrets are available during builds

For the full precedence rules and configuration details, see [Environment variables](../fundamentals/environment-variables.md).

## Deployment

Composable frontends use the same deployment workflow as Shopware applications.
Shopware builds the container image for you with the managed PaaS build system, so you do not need to provide or publish your own image.
If your repository contains a Dockerfile, it is not used for composable frontend deployments.
The deployed image is built by the PaaS build system based on the composable frontend configuration.

After changing the frontend source code or the `application.yaml`, update the application with:

```sh
sw-paas application update
```

To create and deploy a specific build, use:

```sh
sw-paas application deploy create
```

You can monitor the deployment with:

```sh
sw-paas watch
```

Build logs and runtime logs are available through the same commands documented for Shopware applications:

```sh
sw-paas application build logs
sw-paas application logs
```

For more details about builds, deployments and logs, see [Applications](../fundamentals/applications.md) and [Logs](../monitoring/logs.md).

## Fastly

Fastly is configured automatically for composable frontends.
This includes common edge behavior such as redirecting HTTP traffic to HTTPS.
After each deployment, Shopware PaaS Native performs a full cache purge.

If you only want to purge the Fastly cache, create a new deployment without updating the application commit SHA:

```sh
sw-paas application deploy create
```

This redeploys the application using the same application build and runs the CDN purge action.

## Caching and ISR

Shopware PaaS Native supports and encourages Incremental Static Regeneration (ISR) for composable frontends.
To cache a page at the CDN level, configure your frontend to send the following response header:

```http
Surrogate-Control: max-age=86400, stale-while-revalidate=86400
```

For routes that must not be cached, configure your frontend to send:

```http
Cache-Control: no-cache, no-store, must-revalidate
Surrogate-Control: no-store
```

For Nuxt projects, configure these headers with `routeRules` in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  routeRules: {
    "/": {
      isr: 60 * 60 * 24,
      headers: {
        "Surrogate-Control": "max-age=86400, stale-while-revalidate=86400",
      },
    },
    "/account/**": {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Surrogate-Control": "no-store",
      },
    },
  },
});
```

For more details about the CDN setup, see [CDN](../cdn/index.md).
