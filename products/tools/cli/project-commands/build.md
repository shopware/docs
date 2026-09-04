---
nav:
  title: Build a Complete Project
  position: 3

---

# Build a Complete Project

Deploying a project usually requires running `composer install` and compiling the project's assets. Shopware CLI can prepare a project for deployment in one step by installing dependencies, compiling required assets, and removing files that are not needed in the final artifact:

```bash
shopware-cli project ci <path>
```

::: warning
This command modifies the target directory and deletes files. Make sure you have committed all changes before running it.
:::

After cloning a repository, you can use this command to create a artifact that you can deploy with its dependencies installed and assets compiled. It is commonly used in PaaS and SaaS deployment workflows.

## What the command does

- Runs `composer install`. By default, only production dependencies are installed; use `--with-dev-dependencies` to include development dependencies.
- Compiles missing extension assets to avoid unnecessary rebuilds.
- Removes unnecessary files such as `node_modules` to reduce the artifact size.
- Removes source files for compiled assets to reduce the artifact size.
- Merges extension snippets to speed up the Administration.
- Generates a CycloneDX 1.7 Software Bill of Materials (SBOM) (`sbom.cdx.json`) from `composer.lock`.

If you only need the SBOM and not a full CI build, use [`shopware-cli project sbom`](sbom.md) instead.

## Software Bill of Materials (SBOM)

The `project ci` command automatically generates an SBOM containing the dependencies recorded for your project. It can be used for:

- **Container scanning**: Identify dependencies in Docker images and check them for vulnerabilities.
- **Security scanning**: Track which package versions are deployed to production.
- **Compliance tracking**: Document the software components included in a deployment artifact.
- **Supply chain security**: Keep a record of the components included in each release.

The SBOM is included in the build artifact automatically and can be consumed by tools such as Grype and other container security scanners.

## CI environment detection

Shopware CLI detects the CI environment automatically, so no configuration is required in most cases.

To override the detected environment, for example to disable CI-specific output, pass `--ci`:

```bash
shopware-cli project ci <path> --ci none
```

Accepted values are `github`, `gitlab`, and `none`.

## Private Composer repositories

To use `packages.shopware.com` as a private Composer repository, set the `SHOPWARE_PACKAGES_TOKEN` environment variable to your Composer token. You can obtain this token from your Shopware Account.

For other private Composer repositories, add an `auth.json` file to the project root or set `COMPOSER_AUTH` to the contents of that file.

For more information, see the [Composer authentication documentation](https://getcomposer.org/doc/articles/authentication-for-private-packages.md).

## Build configuration

Configure the build in `.shopware-project.yml`. The following sections cover commonly used build settings.

### Reducing JavaScript in the Storefront

Shopware's default Browserslist configuration supports a broad range of browsers. To reduce JavaScript polyfills and CSS prefixes, set a narrower `browserslist` query in `.shopware-project.yml`:

```yaml
build:
  # Browserslist configuration for the Storefront
  browserslist: 'defaults'
```

Use the [Browserslist query tool](https://browsersl.ist/#q=defaults) to see which browsers a query targets.

### MJML email template compilation

The [FroshPlatformTemplateMail](https://github.com/FriendsOfShopware/FroshPlatformTemplateMail) plugin stores email templates as source files in the project. For projects using it, `project ci` can compile [MJML](https://mjml.io) email templates at build time. This requires the `mjml` package to be installed through npm in the build environment.

By default, FroshPlatformTemplateMail compiles MJML templates at runtime when emails are sent. Compiling them during CI instead:

- Catches MJML syntax errors before deployment.
- Avoids runtime compilation overhead and failures.
- Removes the need for MJML compilation services in production.

#### Configuration

Enable MJML compilation in `.shopware-project.yml`:

```yaml
build:
  mjml:
    # Enable MJML compilation at build time
    enabled: true
    # Directories to search for MJML templates
    search_paths:
      - custom/plugins
      - custom/static-plugins
```

If `search_paths` is omitted, Shopware CLI searches `custom/plugins` and `custom/static-plugins` by default.

#### How it works

When MJML compilation is enabled:

1. Shopware CLI searches for `html.mjml` files in the configured search paths.
2. Each `html.mjml` file is compiled to HTML and saved as `html.twig`.
3. The original `html.mjml` file is removed after successful compilation to prevent runtime recompilation.
4. Compilation errors cause the build to fail so broken templates do not reach production.

### Build hooks

Build hooks let you run custom shell commands at specific stages of the CI build. Use them to generate configuration files, run custom build steps, or integrate external tools.

#### Available hooks

| Hook | Execution point |
|------|-----------------|
| `pre` | Before the build starts |
| `pre-composer` | Before `composer install` runs |
| `post-composer` | After `composer install` completes |
| `pre-assets` | Before asset building begins |
| `post-assets` | After asset building completes |
| `post` | After the entire build completes |

#### Configuration

Define hooks in `.shopware-project.yml`:

```yaml
build:
  hooks:
    pre:
      - 'echo "Starting build"'
    pre-composer:
      - 'cp .env.ci .env'
    post-composer:
      - 'bin/console secrets:decrypt-to-local --force'
    pre-assets:
      - 'npm install --prefix custom/plugins/MyPlugin'
    post-assets:
      - 'rm -rf node_modules'
    post:
      - 'echo "Build complete"'
```

Each hook accepts an array of shell commands. Commands are executed sequentially using `sh -c`, and the build fails immediately if a command exits with a non-zero status.

#### Environment variables

The following environment variable is available in all hooks:

| Variable | Description |
|----------|-------------|
| `PROJECT_ROOT` | Absolute path to the project root directory |

Hooks also inherit environment variables from the parent process, so CI/CD variables such as `SHOPWARE_PACKAGES_TOKEN` remain available.

### Compatibility date

You can define a `compatibility_date` in `.shopware-project.yml`:

```yaml
compatibility_date: '2026-02-11'
```

The `compatibility_date` lets Shopware CLI introduce behavior changes without changing existing projects by default. New or potentially breaking behavior is activated only for configurations that opt in with a date at or after the feature's rollout date.

- Format: `YYYY-MM-DD`
- If the field is missing, Shopware CLI uses `2026-02-11` as a fallback.
- When the field is missing, Shopware CLI logs a warning while loading the configuration.

### Supporting bundles

Shopware CLI automatically detects plugins and apps. Custom bundles (classes that extend Shopware's bundle class) cannot be detected automatically because Shopware CLI does not execute PHP code.

Declare custom bundles in `.shopware-project.yml`. The older `extra.shopware-bundles` configuration in the project's `composer.json` is deprecated but remains supported for compatibility.

#### Declaring bundles in `.shopware-project.yml`

The recommended approach is to declare bundles in the `build` section of `.shopware-project.yml`:

```yaml
build:
  bundles:
    - path: src/MyBundle
    - path: src/MyFancyBundle
      name: MyGreatFancyBundle  # optional: defaults to the directory name
```

The `path` is relative to the project root. The `name` field is optional; when omitted, the bundle name defaults to the directory basename.

#### Legacy `composer.json` configuration

::: warning
Declaring bundles through `extra.shopware-bundles` in `composer.json` is deprecated. Existing configurations continue to work, but Shopware CLI emits a deprecation warning when they are loaded. Migrate bundle declarations to `build.bundles` in `.shopware-project.yml`.
:::

A legacy bundle declaration in `composer.json` looks like this:

```json5
{
  "extra": {
    "shopware-bundles": {
      // The key is the path relative to the project root
      "src/MyBundle": {}
    }
  }
}
```

If the bundle directory name does not match the bundle name, set `name` explicitly:

```json
{
  "extra": {
    "shopware-bundles": {
      "src/MyBundle": {
        "name": "MyFancyBundle"
      }
    }
  }
}
```

Both configuration sources are merged. If the same bundle path appears in both, it is processed only once.

#### Bundle packaged in its own Composer package

If a bundle is distributed as its own Composer package, set its Composer type to `shopware-bundle` and define `shopware-bundle-name` under `extra`:

```json
{
  "name": "my-vendor/my-bundle",
  "type": "shopware-bundle",
  "extra": {
    "shopware-bundle-name": "MyBundle"
  }
}
```

With this Composer type, you can also use `shopware-cli extension build` to build assets for the bundle.

### Configuration example

The following example combines several commonly used project build settings. It is not an exhaustive list of all available options.

```yaml
compatibility_date: '2026-02-11'

build:
  # Browserslist configuration for the Storefront
  browserslist: 'defaults'
  # Paths to delete from the final artifact
  cleanup_paths:
    - 'node_modules'
  # Disable copying assets with bin/console asset:install at the end of the build
  disable_asset_copy: false
  # Extensions to exclude from the build
  exclude_extensions:
    - 'SwagExample'
  # Keep Administration and Storefront source code for extensions
  keep_extension_source: false
  # Keep source maps for compiled assets
  keep_source_maps: false
  # Remove extension asset files after bin/console asset:install so assets remain only in public/
  remove_extension_assets: false
  # Force selected extensions to build even when compiled assets already exist
  force_extension_build:
    - name: 'SomePlugin'
  # Custom Shopware bundles to include in the build
  bundles:
    - path: src/MyBundle
    - path: src/MyFancyBundle
      name: MyGreatFancyBundle
  # MJML compilation configuration
  mjml:
    enabled: false
    search_paths:
      - custom/plugins
      - custom/static-plugins
  # Build hooks
  hooks:
    pre: []
    post: []
    pre-composer: []
    post-composer: []
    pre-assets: []
    post-assets: []
```

## Example Docker image

The following Dockerfile builds a Shopware project and copies the resulting artifact to `/var/www/html`:

```dockerfile
#syntax=docker/dockerfile:1.4

# Pin versions
FROM ghcr.io/shopware/docker-base:8.3 AS base-image
FROM ghcr.io/shopware/shopware-cli:latest-php-8.3 AS shopware-cli

# Build
FROM shopware-cli AS build

ARG SHOPWARE_PACKAGES_TOKEN

ADD . /src
WORKDIR /src

RUN --mount=type=secret,id=composer_auth,dst=/src/auth.json \
 --mount=type=cache,target=/root/.composer \
 --mount=type=cache,target=/root/.npm \
 /usr/local/bin/entrypoint.sh shopware-cli project ci /src

FROM base-image

COPY --from=build --chown=82 --link /src /var/www/html
```

The same build command can also be used in non-Docker deployment workflows.
