---
nav:
  title: Adding NPM Dependencies
  position: 120

---

# Adding NPM Dependencies

In this guide, you'll learn how to add NPM dependencies to your plugin.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course, you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. Further, a basic understanding of Node and NPM is required.

## Installing an npm package

Presuming you have `npm` installed, run `npm init -y` in the `<plugin root>/src/Resources/app/administration/` folder or the `<plugin root>/src/Resources/app/storefront/` folder. This command creates a `package.json` file in the respective folder, depending on the environment you're working in.

To add a package to the `package.json` file, run the `npm install` command. In this example we will be installing [`missionlog`](https://www.npmjs.com/package/missionlog):

```bash
npm install missionlog
```

## Administration (Shopware 6.7+ with Vite)

Since Shopware 6.7, the Administration build system has been migrated from Webpack to [Vite](https://vite.dev/). With Vite, you no longer need a custom `webpack.config.js` file to use npm packages. Vite resolves npm packages from your plugin's `node_modules` directory automatically using standard Node.js module resolution.

You can import npm packages directly in your code without any additional build configuration:

::: code-group

```javascript [PLUGIN_ROOT/src/Resources/app/administration/src/example-component.js]
import { log } from 'missionlog';

// Initializing the logger
log.init({ initializer: 'INFO' }, (level, tag, msg, params) => {
    console.log(`${level}: [${tag}] `, msg, ...params);
});
```

:::

If you need custom Vite configuration (for example, path aliases), create a `vite.config.mts` file in the `<plugin root>/src/Resources/app/administration/src/` directory (alongside your entry file, e.g., `main.js`). Note that `package.json` stays in `<plugin root>/src/Resources/app/administration/`:

::: code-group

```typescript [PLUGIN_ROOT/src/Resources/app/administration/src/vite.config.mts]
import { defineConfig } from 'vite';

export default defineConfig({
    resolve: {
        alias: {
            '@my-module': 'src/my-module',
        },
    },
});
```

:::

Build the Administration using:

```bash
composer build:js:admin
```

For more information on migrating from Webpack to Vite, see the [Webpack to Vite migration guide](../../../upgrades-migrations/administration/vite.md).

## Storefront (Webpack)

The Storefront build system continues to use [Webpack](https://webpack.js.org/). To make Webpack aware of the npm packages installed in your plugin, create a `webpack.config.js` file in the `<plugin root>/src/Resources/app/storefront/build/` directory:

::: code-group

```javascript [PLUGIN_ROOT/src/Resources/app/storefront/build/webpack.config.js]
module.exports = (params) => {
    return {
        resolve: {
            modules: [
                `${params.basePath}/Resources/app/storefront/node_modules`,
            ],
        }
    };
}
```

:::

This tells Webpack to also search for modules in your plugin's `node_modules` folder, in addition to Shopware's own `node_modules`.

### Using the dependency in the Storefront

Once you have installed all the dependencies and registered the plugin's `node_modules` path in the build system, you can import and use the package in your code:

::: code-group

```javascript [PLUGIN_ROOT/src/Resources/app/storefront/src/example.plugin.js]
const { PluginBaseClass } = window;

// Import logger
import { log } from 'missionlog';

// Initializing the logger
log.init({ initializer: 'INFO' }, (level, tag, msg, params) => {
    console.log(`${level}: [${tag}] `, msg, ...params);
});

// The plugin skeleton
export default class ExamplePlugin extends PluginBaseClass {
    init() {
        console.log('init');

        // Use logger
        log.info('initializer', 'example plugin got started', this);
    }
}
```

:::

Register the plugin in your `main.js` file so it can be loaded by the plugin system:

::: code-group

```javascript [PLUGIN_ROOT/src/Resources/app/storefront/src/main.js]
import ExamplePlugin from './example.plugin';

PluginManager.register(
    'ExamplePlugin',
    ExamplePlugin
);
```

:::

Build the Storefront using:

```bash
shopware-cli project storefront-build
```

## Using npm packages in a pure-SCSS theme (no JS entry point)

If your plugin is a **theme** and only consumes npm packages from SCSS (for example `@fortawesome/fontawesome-free` or any other package referenced via `@import` in your `theme.json` `style` entries), you will run into a chicken-and-egg problem with `shopware-cli project storefront-build`:

* `shopware-cli` only runs `npm install` for a storefront extension when it has a JavaScript entry point (`src/Resources/app/storefront/src/main.js`).
* Even when a `main.js` is present, `shopware-cli` runs the asset build (webpack) first and **then deletes the storefront-root `node_modules` directory** before `theme:compile` runs.

The result is that a `theme.json`/`SCSS` `@import` like `app/storefront/node_modules/@fortawesome/fontawesome-free/scss/fontawesome` cannot be resolved, and `theme:compile` aborts with:

```text
Unable to compile the theme "MyTheme". Unable to resolve file
"Resources/app/storefront/node_modules/@fortawesome/fontawesome-free/scss/fontawesome.scss".
```

### Workaround: copy required assets out via `postinstall`

Because the `postinstall` script of a storefront extension's `package.json` runs **before** the root `node_modules` directory is deleted, you can copy the parts of the package that `theme:compile` needs into a persistent (git-ignored) folder inside the theme. After that, the SCSS imports and `theme.json` `style` entries must point at that folder instead of `node_modules`.

The nested folder must contain a `node_modules` path segment, because `shopware-cli project format` / `validate` only ignore the storefront-**root** `node_modules` and `shopware-cli` only deletes that one level. A nested copy survives both steps.

#### 1. Provide an empty JS entry point

Add an empty `src/Resources/app/storefront/src/main.js` so `shopware-cli` installs the theme's npm dependencies and runs its lifecycle scripts:

::: code-group

```javascript [PLUGIN_ROOT/src/Resources/app/storefront/src/main.js]
// Intentionally empty. Present so shopware-cli installs this theme's npm
// dependencies and runs the package.json "postinstall" below.
```

:::

#### 2. Copy the necessary files out of `node_modules` in `postinstall`

::: code-group

```json [PLUGIN_ROOT/src/Resources/app/storefront/package.json]
{
    "dependencies": {
        "@fortawesome/fontawesome-free": "^6.1.1"
    },
    "scripts": {
        "postinstall": "rm -rf .vendor && mkdir -p .vendor/node_modules/@fortawesome/fontawesome-free && cp -R node_modules/@fortawesome/fontawesome-free/scss .vendor/node_modules/@fortawesome/fontawesome-free/ && mkdir -p ../../public/static/fonts && cp node_modules/@fortawesome/fontawesome-free/webfonts/fa-* ../../public/static/fonts/"
    }
}
```

:::

The script does three things:

* Copies the package's **SCSS** into `.vendor/node_modules/@fortawesome/fontawesome-free/scss/` so `theme:compile` can still resolve it after the root `node_modules` is removed.
* Copies the package's **webfonts** into `public/static/fonts/` so the compiled theme can serve the font files at runtime.
* Keeps the copy nested under a `node_modules` path segment so the format/validate check does not flag the copied files.

#### 3. Update the theme to reference the copied files

::: code-group

```json [PLUGIN_ROOT/src/Resources/theme.json]
{
    "style": [
        "app/storefront/.vendor/node_modules/@fortawesome/fontawesome-free/scss/fontawesome.scss",
        "app/storefront/src/scss/base.scss"
    ]
}
```

```scss [PLUGIN_ROOT/src/Resources/app/storefront/src/scss/base.scss]
@import '../../.vendor/node_modules/@fortawesome/fontawesome-free/scss/fontawesome';
```

:::

If the package ships runtime assets (webfonts, images, …) that you previously exposed through the `asset` block in `theme.json` via a `node_modules/...` path, point those entries at the `public/static/...` copy instead.

#### 4. Ignore the generated files

Add the generated folders to your `.gitignore`:

::: code-group

```gitignore [PLUGIN_ROOT/.gitignore]
/.vendor/
/public/static/fonts/fa-*
```

:::

### Why this works and what to expect

* `shopware-cli project storefront-build` runs `npm install` for the theme (because `main.js` exists), which triggers `postinstall` and copies the files into `.vendor/` and `public/static/fonts/`.
* The webpack build runs, the storefront-root `node_modules` is deleted, and then `theme:compile` runs against the persistent `.vendor/node_modules/...` copy. The build exits 0.
* `shopware-cli project format` / `validate` do not flag the copied files because they live under a nested `node_modules/` path.
* The webfonts end up under `public/bundles/<theme>/static/fonts/` after compilation, which is what the SCSS expects at runtime.

This workaround is known to be fragile: it depends on `shopware-cli` running npm lifecycle scripts and on the cleanup deleting only the storefront-root `node_modules`. If you do not need npm packages in your theme, prefer keeping the theme free of `node_modules` imports. A longer-term fix (installing npm dependencies for a JS-less theme and deferring the `node_modules` cleanup until after `theme:compile`) is being discussed in [shopware/shopware-cli#1466](https://github.com/shopware/shopware-cli/issues/1466).

## Next steps

Now that you know how to include new `npm` dependencies you might want to create a service with them. Learn how to do that in this guide: [How to add a custom-service](../administration/services-utilities/add-custom-service.md)

If you want to add [Composer dependencies](using-composer-dependencies.md), or even other [plugin dependencies](add-plugin-dependencies.md), we've got you covered as well.
