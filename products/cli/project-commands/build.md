---
nav:
  title: Build a complete Project
  position: 3

---

# Build a complete Project

Usually when you want to deploy your Project you want to run `composer install` and want to compile the assets of the project. Shopware-CLI provides a single command which does all of this for you.

::: warning
This command modifies the given directory and deletes files. Make sure you have committed all your changes before running this command.
:::

```bash
shopware-cli project ci <path>
```

## What it does?

- It runs `composer install` (by default only installs the production dependencies, use `--with-dev-dependencies` to install also the dev dependencies)
- Looks for missing assets of extensions and only compiles the missing assets to speed up the build process
- Deletes unnecessary files like `node_modules` and many more to save disk space
- Deletes source code of compiled assets to save disk space
- Merges snippets of extensions to speed up Administration

## Using private Composer repositories

If you want to use packages.shopware.com as a private Composer repository, make sure you have set `SHOPWARE_PACKAGES_TOKEN` environment variable to your Composer token. This can be found in your Shopware Account.

For other private Composer repositories, you can use the `auth.json` file in the root of your project or set `COMPOSER_AUTH` environment variable with the content of the `auth.json` file.

For more information, see the [Composer documentation](https://getcomposer.org/doc/articles/authentication-for-private-packages.md).

## Reducing JavaScript in Storefront

Shopware's default Browserlist still supports older Browsers like Internet Explorer 11. If you want to reduce JavaScript polyfill and CSS prefixes, you can adjust the Browserlist configuration in the `.shopware-project.yml` file.

```yaml
build:
  # Browserlist configuration for Storefront
  browserslist: 'defaults'
```

You can check [here which Browsers would be affected](https://browsersl.ist/#q=defaults).

## Configuration options

You can configure the build process with a `.shopware-project.yml` file. The following options are available:

```yaml
build:
  # Browserlist configuration for Storefront
  browserslist: 'defaults'
  # Which paths should be deleted
  cleanup_paths:
    - 'node_modules'
  # At the end of the process, bin/console asset:install is executed, this can be disabled here
  disable_asset_copy: false
  # Exclude following extensions from the build process
  exclude_extensions:
    - 'SwagExample'
  # Keep the extension Administration and Storefront source code
  keep_extension_source: false
  # Keep the source maps of the compiled assets
  keep_source_maps: false
  # Delete after bin/console asset:install all assets in the extensions, so only live in public folder.
  # This only works when the assets are served directly from the public folder.
  remove_extension_assets: false 
```

## Supporting bundles

Plugins and Apps are automatically detected by Shopware-CLI. Custom Bundles (classes that extend Bundle class from Shopware) cannot be automatically detected as Shopware-CLI does not execute any PHP code. 
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

If your bundle folder names does not match your Bundle name, you can use the `name` key to map the folder to the bundle name.

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

This is an example Dockerfile which builds a Shopware Project and copies the source code to the `/var/www/html` folder.

```dockerfile
#syntax=docker/dockerfile:1.4

# pin versions
FROM shopware/docker-base:8.3 AS base-image
FROM shopware/shopware-cli:latest-php-8.3 AS shopware-cli

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

Besides Docker, it's also an perfect fit for any deployment variant.
