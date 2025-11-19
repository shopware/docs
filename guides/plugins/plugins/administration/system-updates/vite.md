---
nav:
  title: Changing from Webpack to Vite
  position: 260
---

# Future Development Roadmap: Changing from Webpack to Vite

> **Note:** The information provided in this article, including timelines and specific implementations, is subject to change.
> This document serves as a general guideline for our development direction.

## Introduction

We are planning substantial changes to the way we build our Vue.js application.
The current Webpack build system has been in place for quite some time now, but like everything in tech, it becomes outdated sooner than later. Additionally to Webpack being slow and outdated, we identified a security risk for the future of our application. Many Webpack maintainers have moved on to other projects. Therefore, the Webpack project no longer receives significant updates. The same applies to the Webpack loaders we currently use.

## Introducing Vite

The Vue.js ecosystem has built its own bundler: Vite. Vite is fast, easier to configure and the new standard for Vue.js applications. That's why we decided to switch to Vite with Shopware 6.7.

## Consequences for extensions

For apps there are no consequences as your build process is already decoupled from Shopware. For plugins you only need to get active if you currently extend the webpack config by providing your own `webpack.config.js` file.

### Migrate the custom webpack config to Vite

If you have a custom webpack config, you need to migrate it to Vite. You need to do the following steps:

  1. Create a new config file `vite.config.mts` to your plugin in the `YourApp/src/Resources/app/administration/src` directory. Previously you had a `webpack.config.js` in the following directory: `YourApp/src/Resources/app/administration/build/`
  2. Remove the old `webpack.config.js` file
  3. Make sure to remove all webpack related dependencies from your `package.json` file
  4. Make sure to add the Vite dependencies to your `package.json` file

A basic config migration could look like this:

```javascript
// Old Webpack config
module.exports = () => {
    return {
        resolve: {
            alias: {
                '@example': 'src/example',
            }
        }
    };
};
```

```typescript
// New Vite config
import { defineConfig } from 'vite';

export default defineConfig({
    resolve: {
        alias: {
            '@example': 'src/example',
        },
    },
});
```

Of course, this is a very basic example. The Vite config can be much more complex and powerful. You can find more information about the Vite config in the [Vite documentation](https://vite.dev/config/). Depending on your webpack config, the migration can be very individual.

## Implementation details

In this section we'll document the implementation details of the new Vite setup.

### Feature flag

The system is already in place and can be tested by activating the feature flag: `ADMIN_VITE`.

### Bundle information

The information about all active bundles/plugins is written to `<shopwareRoot>/var/plugins.json` by the `Shopware\Core\Framework\Plugin\Command\BundleDumpCommand`. This command can be triggered standalone by running `php bin/console bundle:dump`. It is also part of the composer commands `build:js:admin`, `build:js:storefront`, `watch:admin` and `watch:storefront`. This file is used to load all the Shopware Bundles and custom plugins.

### Building the Shopware Administration

The command responsible for building the Shopware Administration with all extensions remains `composer build:js:admin`.

### Building the core

The Vite config located under `<shopwareRoot>/src/Administration/Resources/app/administration/vite.config.mts` is only responsible for the core without extensions. Currently there are a few file duplications because Vite requires different module loading order. You can recognize these files, they look like this: `*.vite.ts`. So for example the entry file `<shopwareRoot>/src/Administration/Resources/app/administration/src/index.vite.ts`.

### Building extensions

The script responsible for building all extensions is located at `<shopwareRoot>/src/Administration/Resources/app/administration/build/plugins.vite.ts`. This script uses the JS API of Vite to build all extensions. As mentioned above, it's still part of the `composer build:js:admin` command and needs no manual execution.

The script will do the following:

1. Get all bundles/plugins from the `<shopwareRoot>/var/plugins.json`
2. Call `build` from Vite for each plugin
3. The `build` function of Vite will automatically load `vite.config` files from the path of the entry file.

### Dev mode/HMR server

The command responsible for serving the application in dev mode (HMR server) is still `composer watch:admin`. For the core it's just going to take the `vite.config.mts` again and this time the `plugins.vite.ts` script will call `createServer` for each plugin.

### Loading Vite assets

Once built the right assets need to be loaded somehow into the administration. For the core we use the `pentatrion_vite` Symfony bundle. Loading the correct file(s) based on the `entrypoints.json` file generated by its counterpart `vite-plugin-symfony`. For bundles and plugins the boot process inside the `application.ts` will load and inject the entry files based on the environment.

Production build:

- Information is taken from the `/api/_info/config` call

Dev mode/HMR server:

- Information is served by our own Vite plugin `shopware-vite-plugin-serve-multiple-static` in form of the `sw-plugin-dev.json` file requested by the `application.ts`

## Vite plugins

To accomplish all this, we created a few Vite plugins and in this section we'll take the time to explain what they do. All our Vite plugin names are prefixed with `shopware-vite-plugin-`. I'll leave this out of the headlines for better readability.

### asset-path

This plugin manipulates the chunk loading function of Vite, to prepend the `window.__sw__.assetPath` to the chunk path. This is needed for cluster setups, serving the assets from a S3 bucket.

### static-assets

Copies static admin assets from `static` to the output directory so they can get served.

### serve-multiple-static

Serves static assets in dev mode (HMR server).

### vue-globals

Replacing all Vue imports in bundles/plugins to destructure from `Shopware.Vue`. This solves the problem of having multiple Vue instances. It does this by creating a temporary file exporting the Shopware.Vue and adding an alias to point every Vue import to that temporary file. This way it will result in bundled code like this:

From this:

```vue
// From this
<script setup>
import { ref } from 'vue';
</script>

// To this
<script setup>
const { ref } = window['Shopware']['Vue'];
</script>
```

### override-component

Registering `*.override.vue` files automatically. It will search for all files matching the override pattern and automatically import them into the bundle/plugin entry file. Additionally, these imports will be registered as override components by calling `Shopware.Component.registerOverrideComponent`. This will make sure that all overrides are loaded at any time as soon as the bundle/plugin script is injected. To learn more about the new overrides take a look at the Vue native docs right next to this file.

### twigjs

Transforming all `*.html.twig` files in a way that they can be loaded by Vite.

## HMR reloading

A quick note on HMR (Hot Module Replacement). Vite is only capable of reloading `*.vue` files. This means that we can only leverage the HMR by the time we transitioned everything to SFC (Single File Components) but once we do the Vite setup will be able to distinguish between changes in a plugin or the core.

## Performance

Vite is able to build the core Administration in ~18s on my system. This is a saving of over 50% compared to Webpack. In dev mode it's similar but not directly comparable. The Vite dev server starts instantly and moves the loading time to the first request. Webpack on the other hand compiles a long time upfront until the server is ready.
