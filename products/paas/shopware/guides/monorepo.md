---
nav:
  title: Deploy from a monorepo
  position: 90
---

# Deploy from a monorepo

By default, Shopware PaaS Native expects an `application.yaml` at the root of the repository connected to your project. In a monorepo, that does not work: several applications share one repository, and each of them needs its own configuration.

Two settings make this possible:

- The `--application-yaml-path` flag of `sw-paas application create` tells the platform where the `application.yaml` of that application lives.
- The `app.build.context` option in `application.yaml` tells the build which directory to build the image from, if that is not the directory holding the `application.yaml`.

## The application root

The directory containing the `application.yaml` is the **application root**. Every path an application configuration references is resolved relative to it, so an application in a monorepo sub-directory addresses its files without repeating that prefix:

| Setting                        | Resolved relative to  |
| ------------------------------ | --------------------- |
| `app.build.context`            | The application root  |
| `app.build.dockerfile_path`    | The application root  |
| `services.fastly.snippets_path`| The application root  |
| `composer.lock`                | The build context     |

When no `--application-yaml-path` is given, the application root is the repository root and everything behaves exactly as you put your application.yaml to the root of your repository.

All resolved paths must stay inside the repository. `..` segments are allowed as long as the result does not leave it.

## Point an application at its `application.yaml`

Pass the repository-relative path of the file — including the file name — when you create the application:

```sh
sw-paas application create --application-yaml-path apps/shopware/application.yaml
```

For a repository laid out like this:

```text
.
├── apps
│   ├── shopware
│   │   ├── application.yaml
│   │   ├── composer.json
│   │   └── composer.lock
│   └── frontend
│       ├── application.yaml
│       └── package.json
└── packages
```

create one application per sub-directory, each pointing at its own file:

```sh
sw-paas application create --name storefront --application-yaml-path apps/shopware/application.yaml
sw-paas application create --name frontend   --application-yaml-path apps/frontend/application.yaml
```

::: info
The path is stored on the application when it is created. Later runs of `sw-paas application update` reuse it, so the flag is only needed once. To move the `application.yaml` to a different directory, create a new application.
:::

## Choose the build context

The build context is the directory the container image is built from. By default it is the application root, which is enough when the application is self-contained.

If your application needs files from outside its own directory — a shared package, a workspace lock file — widen the context with `app.build.context`:

```yaml
app:
  build:
    context: ".."
  php:
    version: "8.3"
```

With the layout above and an `application.yaml` in `apps/storefront/`, `context: ".."` builds from `apps/`.

Keep in mind when choosing a context:

- The generated Shopware Dockerfile copies the root of its context, so for a shop the context must be the directory that holds the shop.
- `composer.lock` is read from the build context, not from the application root. If you widen the context, the lock file has to be in the new context directory.
- The build reads `.dockerignore` from the root of the context, not from the repository root.
- Everything in the context is sent to the build. A context that covers the whole monorepo makes every build slower.

The context is validated when you create or update the application. If it does not exist, is not a directory, or points outside the repository, the command fails with the resolved path in the error message.

## Fastly snippets

`services.fastly.snippets_path` resolves against the application root as well:

```yaml
services:
  fastly:
    snippets_path: config/fastly
```

For an application rooted at `apps/shopware/`, this reads `apps/shopware/config/fastly`. See [Fastly snippets](../cdn/fastly-snippets.md) for the required folder layout.
