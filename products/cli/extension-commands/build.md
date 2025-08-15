---
nav:
  title: Building extensions and creating archives
  position: 2

---

# Building extensions and creating archives

Extensions consist of PHP Changes, JavaScript and CSS. To release an extension to the Shopware Store or upload it to a Shopware 6 instance without having to rebuild Storefront and Administration, your extension needs to provide the compiled assets.

## Building an extension

Shopware CLI allows you to easily build the assets of an extension. To build an extension, you can use the following command:

```bash
shopware-cli extension build <path>
```

Shopware CLI reads the `shopware/core` requirement from `composer.json` or `manifest.xml` and builds the assets using the lowest compatible Shopware version. This ensures the extension remains usable across multiple Shopware versions. If the selected version is incorrect, you can override it using a `.shopware-extension.yml` file.

```yaml
# .shopware-extension.yml
build:
  shopwareVersionConstraint: '6.6.9.0'
```

This only affects the build process and not on the installation of the extension. For full control you can also specify the environment variable `SHOPWARE_PROJECT_ROOT` pointing to a Shopware 6 project, and it will use that Shopware to build the extension assets.

## Additional bundles

If your plugin consists of multiple bundles, usually when you have implemented `getAdditionalBundles` in your `Plugin` class, you have to provide the path to the bundle you want to build in the config:

```yaml
# .shopware-extension.yml
build:
  extraBundles:
    # Assumes the bundle name is the same as the directory name
    - path: src/Foo
    # Explicitly specify the bundle name
    - path: src/Foo
      name: Foo
```

## Extension as bundle

If your extension is not a plugin but itself a bundle, make sure your composer type is `shopware-bundle` and that you have set a `shopware-bundle-name` in the `extra` part of the composer definition like this:

```json
{
    "name": "my-vendor/my-bundle",
    "type": "shopware-bundle",
    "extra": {
        "shopware-bundle-name": "MyBundle"
    }
}
```

Now you can use `shopware-cli extension build <path>` to build the assets and distribute them together with your bundle.
Also `shopware-cli project ci` detects know automatically this bundle and builds the assets for it.

## Using esbuild for JavaScript Bundling

::: warning
Building with esbuild works completely standalone without the Shopware codebase. This means if you import files from Shopware, you have to copy it to your extension.
:::

Esbuild can be used for JavaScript bundling, offering a significantly faster alternative to the standard Shopware bundling process, as it eliminates the need to involve Shopware for asset building.

```yaml
# .shopware-extension.yml
build:
  zip:
    assets:
      # Use esbuild for Administration
      enable_es_build_for_admin: true
      # Use esbuild for Storefront
      enable_es_build_for_storefront: true
```

## Creating an archive

To create an archive of an extension, you can use the following command:

```bash
shopware-cli extension zip <path>
```

The command copies the extension to a temporary directory, builds the assets, deletes unnecessary files and creates a zip archive of the extension. The archive is placed in the current working directory.

**By default, the command picks the latest released git tag**, use the `--disable-git` flag to disable this behavior and use the current source code. Besides disabling it completely, you can also specify a specific tag or commit using `--git-commit`.

### Bundling composer dependencies

Before Shopware 6.5, bundling the composer dependencies into the zip file is required. Shopware CLI automatically runs `composer install` and removes duplicate composer dependencies to avoid conflicts.

To disable this behavior, you can adjust the configuration:

```yaml
# .shopware-extension.yml
build:
  zip:
    composer:
      enabled: false
```

This is automatically disabled for plugins targeting Shopware 6.5 and above and `executeComposerCommands` should be used instead.

### Delete files before zipping

Shopware CLI deletes a lot of known files before zipping the extension. If you want to delete more files, you can adjust the configuration:

```yaml
# .shopware-extension.yml
build:
  zip:
    pack:
      excludes:
        paths:
          - <path>
```

### JavaScript Build optimization

If you bring additional NPM packages, make sure that you added only runtime dependencies to `dependencies` inside `package.json` and tooling to `devDependencies` and enabled `npm_strict` in the configuration:

```yaml
# .shopware-extension.yml
build:
  zip:
    assets:
      npm_strict: true
```

This skips unnecessary `npm install` and `npm ci` commands and only installs the runtime dependencies.

### Checksums

When creating an archive using `shopware-cli extension zip`, a `checksum.json` file is automatically generated. This file contains checksums for all files in the extension, which can be used to verify the integrity of the extension after installation.

If you want to exclude certain files or paths from the checksum calculation, you can configure this in your `.shopware-extension.yml` file:

```yaml
# .shopware-extension.yml
build:
  zip:
    checksum:
      ignore:
        - <path>
        - <another_path>
```

For example, to exclude the `src/Resources/config/services.xml` file from checksum calculation:

```yaml
# .shopware-extension.yml
build:
  zip:
    checksum:
      ignore:
        - src/Resources/config/services.xml
```

To verify the checksum of installed extensions, you can use the [FroshTools](https://github.com/FriendsOfShopware/FroshTools) plugin which provides a checksum verification feature for all extensions.

### Release mode

If you are building an archive for distribution, you can enable the release mode with the flag `--release`. This will remove the App secret from the `manifest.xml` and generate changelog files if enabled.

The changelog generation can be enabled with the configuration:

```yaml
# .shopware-extension.yml
changelog:
  enabled: true
```

It generates the changelog by utilizing the commits between the last tag and the current commit. Additionally, it can be configured to filter commits and build the changelog differently.

```yaml
changelog:
  enabled: true
  # only the commits matching to this regex will be used
  pattern: '^NEXT-\d+'
  # variables allow extracting metadata out of the commit message
  variables:
    ticket: '^(NEXT-\d+)\s'
  # go template for the changelog, it loops over all commits
  template: |
    {{range .Commits}}- [{{ .Message }}](https://issues.shopware.com/issues/{{ .Variables.ticket }})
    {{end}}
```

This example checks that all commits in the changelog needs to start with `NEXT-` in the beginning. The `variables` section allows extracting metadata out of the commit message. The `template` is a go template which loops over all commits and generates the changelog.
With the combination of `pattern`, `variables` and `template` we link the commit message to the Shopware ticket system.

### Overwrites

Extension configuration can be overwritten during the zipping process, allowing changes to aspects such as the version and app-related settings.

Replaces the version in `composer.json` or `manifest.xml` with the given version:

```yaml
shopware-cli extension zip --overwrite-version=1.0.0 <path>
```

Replaces all external URLs in `manifest.xml` to that given URL:

```yaml
shopware-cli extension zip --overwrite-app-backend-url=https://example.com <path>
```

Replaces the App secret in `manifest.xml` with the given secret:

```yaml
shopware-cli extension zip --overwrite-app-backend-secret=MySecret <path>
```
