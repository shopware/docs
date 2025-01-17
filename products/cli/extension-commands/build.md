---
nav:
  title: Building extensions and creating archives
  position: 2

---

# Building extensions and creating archives

Extensions consists of PHP Changes, JavaScript and CSS. To release an extension to the Shopware Store or upload it to a Shopware 6 instance without having to rebuild Storefront and Administration your extension needs to provide the compiled assets.

## Building an extension

Shopware-CLI allows you to easily build the assets of an extension. To build an extension, you can use the following command:

```bash
shopware-cli extension build <path>
```

Shopware-CLI reads the `shopware/core` requirement in `composer.json` or `manifest.xml` and uses the lowest possible Shopware Version to build the assets. This allows that the extension can be used in multiple Shopware versions. If this version is not correct, you can override it in a `.shopware-extension.yml`

```yaml
# .shopware-extension.yml
build:
  shopwareVersionConstraint: '6.6.9.0'
```

This has only affect on the build process and not on the installation of the extension, for full control you can specify also the environment variable `SHOPWARE_PROJECT_ROOT` pointing to a Shopware 6 project and it will use that Shopware to build the extension assets.

## Additional bundles

If your plugin consists of multiple bundles, usually when you have implemented `getAdditionalBundles` in your `Plugin` class, you have to provide the path to the bundle you want to build in the config:

```yaml
# .shopware-extension.yml
build:
  extraBundles:
    # Assumes the bundle name is the same as the directory name
    - path: src/Foo
    # Explictly specify the bundle name
    - path: src/Foo
      name: Foo
```

## Using ESBuild for JavaScript Bundling

::: warning
Building with ESBuild works completely standalone without the Shopware Codebase. This means if you import files from Shopware, you have to copy it to your extension.
:::

It's possible to use ESBuild for JavaScript bundling. This is way faster than the usual Shopware bundling as Shopware itself is not necessary to build the assets.

```yaml
# .shopware-extension.yml
build:
  zip:
    assets:
      # Use ESBuild for Administration
      enable_es_build_for_admin: true
      # Use ESBuild for Storefront
      enable_es_build_for_storefront: true
```

## Creating an archive

To create an archive of an extension, you can use the following command:

```bash
shopware-cli extension zip <path>
```

The command copies the extension to a temporary directory, builds the assets, deletes unnecessary files and creates a zip archive of the extension. The archive is placed in the current working directory.

**By default the command picks the latest released git tag**, use `--disable-git` as flag to disable this behavior and use the current source code. Besides disabling it completely, you can also specify a specific tag or commit using `--git-commit`.

### Bundling composer dependencies

Prior to Shopware 6.5, it's required to bundle the composer dependencies into the zip file. So Shopware-CLI runs automatically `composer install` for you and strips duplicate composer dependencies to avoid conflicts.

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

Shopware-CLI deletes a lot of known files before zipping the extension. If you want to delete more files, you can adjust the configuration:

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

### Release mode

If you are building an archive for distribution, you can enable the release mode with the flag `--release`. This will remove the App secret from the `manifest.xml` and generate changelog files if enabled.

The changelog generation can be enabled with the configuration:

```yaml
# .shopware-extension.yml
changelog:
  enabled: true
```

and uses the commits between the last tag and the current commit to generate the changelog. It can be further configured to filter commits and build the changelog differently.

```yaml
changelog:
  enabled: true
  # only the commits matching to this regex will be used
  pattern: '^NEXT-\d+'
  # variables allows to extract metadata out of the commit message
  variables:
    ticket: '^(NEXT-\d+)\s'
  # go template for the changelog, it loops over all commits
  template: |
    {{range .Commits}}- [{{ .Message }}](https://issues.shopware.com/issues/{{ .Variables.ticket }})
    {{end}}
```

This example checks that all commits in the changelog needs to start with `NEXT-` in the beginning. The `variables` section allows to extract metadata out of the commit message. The `template` is a go template which loops over all commits and generates the changelog.
With the combination of `pattern`, `variables` and `template` we link the commit message to the Shopware ticket system.

### Overwrites

It's possible to overwrite extension configuration while zipping like to change the version and app related things

```yaml
shopware-cli extension zip --overwrite-version=1.0.0 <path>
```

replaces the version in `composer.json` or `manifest.xml` with the given version.

```yaml
shopware-cli extension zip --overwrite-app-backend-url=https://example.com <path>
```

replaces all external URLs in `manifest.xml` to that given URL.

```yaml
shopware-cli extension zip --overwrite-app-backend-secret=MySecret <path>
```

replaces the App secret in `manifest.xml` with the given secret.
