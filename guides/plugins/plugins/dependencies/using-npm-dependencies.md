---
nav:
  title: Adding NPM dependencies
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

```javascript
// <plugin root>/src/Resources/app/administration/src/example-component.js
import { log } from 'missionlog';

// Initializing the logger
log.init({ initializer: 'INFO' }, (level, tag, msg, params) => {
    console.log(`${level}: [${tag}] `, msg, ...params);
});
```

If you need custom Vite configuration (for example, path aliases), create a `vite.config.mts` file in the `<plugin root>/src/Resources/app/administration/src/` directory:

```typescript
// <plugin root>/src/Resources/app/administration/src/vite.config.mts
import { defineConfig } from 'vite';

export default defineConfig({
    resolve: {
        alias: {
            '@my-alias': '/path/to/module',
        },
    },
});
```

Build the Administration using:

```bash
composer build:js:admin
```

For more information on migrating from Webpack to Vite, see the [Webpack to Vite migration guide](/guides/upgrades-migrations/administration/vite).

## Storefront (Webpack)

The Storefront build system continues to use [Webpack](https://webpack.js.org/). To make Webpack aware of the npm packages installed in your plugin, create a `webpack.config.js` file in the `<plugin root>/src/Resources/app/storefront/build/` directory:

```javascript
// <plugin root>/src/Resources/app/storefront/build/webpack.config.js
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

This tells Webpack to also search for modules in your plugin's `node_modules` folder, in addition to Shopware's own `node_modules`.

### Using the dependency in the Storefront

Once you have installed all the dependencies and registered the plugin's `node_modules` path in the build system, you can import and use the package in your code:

```javascript
// <plugin root>/src/Resources/app/storefront/src/example.plugin.js
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

Register the plugin in your `main.js` file so it can be loaded by the plugin system:

```javascript
// <plugin root>/src/Resources/app/storefront/src/main.js
import ExamplePlugin from './example.plugin';

PluginManager.register(
    'ExamplePlugin',
    ExamplePlugin
);
```

Build the Storefront using:

```bash
./bin/build-storefront.sh
```

## Next steps

Now that you know how to include new `npm` dependencies you might want to create a service with them. Learn how to do that in this guide: [How to add a custom-service](../administration/services-utilities/add-custom-service)

If you want to add [Composer dependencies](using-composer-dependencies), or even other [plugin dependencies](add-plugin-dependencies), we've got you covered as well.
