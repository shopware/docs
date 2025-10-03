---
nav:
  title: Build a complete Project
  position: 3

---

# Build a complete Project

Usually, when you want to deploy your project, you have to run `composer install` and compile the assets of the project. Shopware CLI provides a single command which does all of this for you.

::: warning
This command modifies the given directory and deletes files. Make sure you have committed all your changes before running this command.
:::

```bash
shopware-cli project ci <path>
```

## What does it do?

- It runs `composer install` (by default, only installs the production dependencies, use `--with-dev-dependencies` to install the dev dependencies as well)
- Looks for missing assets of extensions and only compiles the missing assets to speed up the build process
- Deletes unnecessary files like `node_modules` and many more to save disk space
- Deletes source code of compiled assets to save disk space
- Merges snippets of extensions to speed up Administration

## Using private Composer repositories

If you want to use `packages.shopware.com` as a private Composer repository, make sure you have set `SHOPWARE_PACKAGES_TOKEN` environment variable to your Composer token. This can be found in your Shopware Account.

For other private Composer repositories, you can use the `auth.json` file in the root of your project or set `COMPOSER_AUTH` environment variable with the content of the `auth.json` file.

For more information, see the [Composer documentation](https://getcomposer.org/doc/articles/authentication-for-private-packages.md).

## Reducing JavaScript in Storefront

Shopware's default `browserlist` still supports older browsers like Internet Explorer 11. If you want to reduce JavaScript polyfill and CSS prefixes, you can adjust the `browserlist` configuration in the `.shopware-project.yml` file.

```yaml
build:
  # Browserlist configuration for Storefront
  browserslist: 'defaults'
```

You can check [here which browsers would be affected](https://browsersl.ist/#q=defaults).

## MJML Email Template Compilation

Starting with Shopware CLI 0.6.32, the `project ci` command can compile MJML email templates during the build process
for projects using the [FroshPlatformTemplateMail](https://github.com/FriendsOfShopware/FroshPlatformTemplateMail) plugin.
[MJML](https://mjml.io) is a markup language designed to reduce the pain of coding responsive emails by providing
semantic components that compile to responsive HTML.

### Prerequisites

This feature is specifically designed for projects using the **FroshPlatformTemplateMail** plugin. The primary purpose of this plugin is to manage email templates as source files in your codebase, rather than storing them in the database. This approach enables:

- **Version control**: Email templates can be tracked in Git alongside your code
- **Deployment consistency**: Templates are deployed with your code, ensuring consistency across environments
- **MJML support**: Optionally write templates in MJML (Mailjet Markup Language) format for responsive emails
- **Build-time compilation**: Since templates are in source files, they can be compiled during the build process

Having email templates in source files is essential for the shopware-cli MJML compilation feature to work, as it processes these files during the build phase.

### Why compile MJML during build?

By default, FroshPlatformTemplateMail compiles MJML templates at runtime when emails are sent. The shopware-cli build-time compilation offers several advantages:

- **Early error detection**: Catch MJML syntax errors during CI/CD instead of when sending emails
- **Better performance**: Eliminate runtime compilation overhead
- **Improved reliability**: Remove potential runtime failures in production
- **Reduced dependencies**: No need for MJML compilation services in production

### Configuration

Enable MJML compilation in your `.shopware-project.yml` file:

```yaml
build:
  mjml:
    # Enable MJML compilation during build
    enabled: true
    # Directories to search for MJML templates (defaults to custom/plugins and custom/static-plugins if not specified)
    searchPaths:
      - custom/plugins
      - custom/static-plugins
```

### How it works

When MJML compilation is enabled:

1. The CLI searches for `html.mjml` files in the configured search paths (defaults to `custom/plugins` and `custom/static-plugins`)
2. Each `html.mjml` file is compiled to HTML and saved as `html.twig`
3. The original `html.mjml` files are removed after successful compilation to prevent runtime re-compilation attempts
4. Any compilation errors are reported and cause the build to fail, ensuring broken templates don't reach production

### Requirements

MJML compilation requires the `mjml` package to be installed via NPM in your build environment. The CLI uses local compilation to convert MJML templates to HTML.

## Configuration options

You can configure the build process with a `.shopware-project.yml` file. The following options are available:

```yaml
build:
  # Browserlist configuration for Storefront
  browserslist: 'defaults'
  # Paths that should be deleted
  cleanup_paths:
    - 'node_modules'
  # At the end of the process, bin/console asset:install is executed, this can be disabled here
  disable_asset_copy: false
  # Exclude the following extensions from the build process
  exclude_extensions:
    - 'SwagExample'
  # Keep the extension Administration and Storefront source code
  keep_extension_source: false
  # Keep the source maps of the compiled assets
  keep_source_maps: false
  # Delete after bin/console asset:install all assets in the extensions, so only live in public folder.
  # This only works when the assets are served directly from the public folder.
  remove_extension_assets: false
  # Allows to force building an extension even when the assets existing. A use-case could be if you used composer patches for a specific extension.
  force_extension_build:
    - name: 'SomePlugin'
  # MJML compilation configuration (see MJML section above for details)
  mjml:
    enabled: false
    searchPaths:
      - custom/plugins
      - custom/static-plugins
```

## Supporting bundles

Plugins and Apps are automatically detected by Shopware CLI. Custom bundles (classes that extend bundle class from Shopware) cannot be automatically detected as Shopware CLI does not execute any PHP code.
Therefore you need to add the path of the custom bundle to your project `composer.json`:

```json
{
    "extra": {
        "shopware-bundles": {
            // The key is the relative path from project root to the bundle
            "src/MyBundle": {}
        }
    }
}
```

If your bundle folder names does not match your bundle name, you can use the `name` key to map the folder to the bundle name.

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

### Bundle packaged in own composer package

If your bundle is a own composer package, make sure your composer type is `shopware-bundle` and that you have set a `shopware-bundle-name` in the extra part of the config like this:

```json
{
    "name": "my-vendor/my-bundle",
    "type": "shopware-bundle",
    "extra": {
        "shopware-bundle-name": "MyBundle"
    }
}
```

With this Composer type, `shopware-cli extension build` also works for your bundle, if you want to distribute compiled assets.

## Example Docker Image

This is an example Dockerfile which builds a Shopware project and copies the source code to the `/var/www/html` folder.

```dockerfile
#syntax=docker/dockerfile:1.4

# pin versions
FROM ghcr.io/shopware/docker-base:8.3 AS base-image
FROM ghcr.io/shopware/shopware-cli:latest-php-8.3 AS shopware-cli

# build

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

Besides Docker, it is also a perfect fit for any deployment variant.
