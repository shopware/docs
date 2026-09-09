---
nav:
  title: Changing from Webpack to Vite
  position: 13
---

# Future Development Roadmap: Changing from Webpack to Vite

:::info
The information provided in this article, including timelines and specific implementations, is subject to change.
This document serves as a general guideline for our development direction.
:::

We are planning substantial changes to the way we build our Vue.js application.
The current Webpack build system has been in place for quite some time, but, like everything in tech, it becomes outdated sooner or later. In addition to Webpack being slow and outdated, we identified a security risk for our application's future. Many Webpack maintainers have moved on to other projects. Therefore, the Webpack project no longer receives significant updates. The same applies to the Webpack loaders we currently use.

## Introducing Vite

The Vue.js ecosystem has built its own bundler: Vite. Vite is fast, easier to configure, and the new standard for Vue.js applications. That's why we decided to switch to Vite with Shopware 6.7.

## Consequences for extensions

For apps, there are no consequences as your build process is already decoupled from Shopware. For plugins, you only need to get active if you currently extend the webpack config by providing your own `webpack.config.js` file.

### Migrate the custom webpack config to Vite

If you have a custom webpack config, you need to migrate it to Vite. You need to do the following steps:

  1. Create a new config file `vite.config.mts` in your plugin in the `YourApp/src/Resources/app/administration/src` directory. Previously, you had a `webpack.config.js` in the following directory: `YourApp/src/Resources/app/administration/build/`
  2. Remove the old `webpack.config.js` file
  3. Make sure to remove all webpack-related dependencies from your `package.json` file
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

This is a very basic example. The Vite config can be much more complex and powerful. You can find more information about the Vite config in the [Vite documentation](https://vite.dev/config/). Depending on your webpack config, the migration can vary greatly.

### Use native Vue overrides with legacy Twig components

During the Administration migration, a plugin can use native Vue `*.override.vue` files even when the targeted core component still uses a Twig template.

Use this approach when:

- your extension is written as native Vue SFCs
- the core Administration component you want to override is still Twig-based
- a plain `*.override.vue` file would otherwise render nothing

#### How to create the override

1. Create an override component that targets the existing component name.
2. Implement the desired block override in the SFC template.
3. Build or watch the Administration as usual.

Example structure:

```text
src/Resources/app/administration/src/
├── component/
│   └── sw-product-list/
│       └── sw-product-list.override.vue
└── main.ts
```

Example override:

```vue
<template>
    <sw-block name="sw_product_list_smart_bar_actions">
        <template #default="{ blockProps }">
            <mt-button variant="primary">
                My custom action
            </mt-button>
        </template>
    </sw-block>
</template>
```

Build the Administration:

```bash
composer build:js:admin
```

Or run the watcher:

```bash
composer watch:admin
```

If the targeted Twig block is supported, the override is injected into the legacy Twig component automatically.

#### When to use Twig overrides instead

Keep using legacy Twig-based overrides if your target block structure cannot be mapped safely into a native `sw-block` host.

A known unsupported pattern is a Twig block that contains multiple named slot templates:

```twig
{% block sw_order_list_content %}
    <template #content>
        ...
    </template>

    <template #sidebar>
        <sw-sidebar>
            ...
        </sw-sidebar>
    </template>
{% endblock %}
```

For structures like this, continue using the legacy Twig extension technique for that component.

#### Troubleshooting native overrides against Twig components

If your `*.override.vue` file is loaded but nothing is rendered:

1. Confirm that the core target component is still Twig-based.
2. Confirm that your override uses the correct Twig block name.
3. Rebuild the Administration to ensure block detection runs again.
4. Check whether the target block contains multiple named slot templates. If so, use a Twig-based override instead.
5. Test with `composer watch:admin` and reload the Administration to verify the override is registered in development mode.

## Implementation details

In this section, we'll document the implementation details of the new Vite setup.

### Feature flag

The system is already in place and can be tested by activating the feature flag: `ADMIN_VITE`.

### Bundle information

The information about all active bundles/plugins is written to `<shopwareRoot>/var/plugins.json` by the `Shopware\Core\Framework\Plugin\Command\BundleDumpCommand`. This command can be triggered standalone by running `php bin/console bundle:dump`. It is also part of the composer commands `build:js:admin`, `build:js:storefront`, `watch:admin`, and `watch:storefront`. This file loads all Shopware Bundles and custom plugins.

### Building the Shopware Administration

The command responsible for building the Shopware Administration with all extensions remains `composer build:js:admin`.

### Building the core

The Vite config located at `<shopwareRoot>/src/Administration/Resources/app/administration/vite.config.mts` is only responsible for the core, not extensions. Currently, there are a few file duplications because Vite requires a different module loading order. You can recognize these files; they look like this: `*.vite.ts`. So, for example, the entry file `<shopwareRoot>/src/Administration/Resources/app/administration/src/index.vite.ts`.

### Building extensions

The script responsible for building all extensions is located at `<shopwareRoot>/src/Administration/Resources/app/administration/build/plugins.vite.ts`. This script uses Vite's JS API to build all extensions. As mentioned above, it's still part of the `composer build:js:admin` command and needs no manual execution.

The script will do the following:

1. Get all bundles/plugins from the `<shopwareRoot>/var/plugins.json`
2. Call `build` from Vite for each plugin
3. The `build` function of Vite will automatically load `vite.config` files from the path of the entry file.
4. During override processing, `*.override.vue` files are scanned for target block usage so mixed native-Vue-to-Twig override scenarios can be prepared before runtime template resolution.

### Dev mode/HMR server

The command responsible for serving the application in dev mode (HMR server) is still `composer watch:admin`. For the core, it's just going to take the `vite.config.mts` again, and this time the `plugins.vite.ts` script will call `createServer` for each plugin.

### Loading Vite assets

Once built, the right assets need to be loaded somehow into the administration. For the core, we use the `pentatrion_vite` Symfony bundle. Loading the correct file(s) based on the `entrypoints.json` file generated by its counterpart `vite-plugin-symfony`. For bundles and plugins, the boot process in `application.ts` loads and injects the entry files based on the environment.

Production build:

- Information is taken from the `/api/_info/config` call

Dev mode/HMR server:

- Information is served by our own Vite plugin `shopware-vite-plugin-serve-multiple-static` in the form of the `sw-plugin-dev.json` file requested by the `application.ts`

## Vite plugins

To accomplish all this, we created a few Vite plugins, and in this section, we'll explain what they do. All our Vite plugin names are prefixed with `shopware-vite-plugin-`. I'll leave this out of the headlines for better readability.

### asset-path

This plugin manipulates Vite's chunk-loading function to prepend `window.__sw__.assetPath` to the chunk path. This is needed for cluster setups that serve assets from an S3 bucket.

### static-assets

Copies static admin assets from `static` to the output directory so they can get served.

### serve-multiple-static

Serves static assets in dev mode (HMR server).

### vue-globals

Replacing all Vue imports in bundles/plugins to destructure from `Shopware.Vue`. This solves the problem of having multiple Vue instances. It does this by creating a temporary file and exporting the Shopware. Vue and adding an alias to point every Vue import to that temporary file. This way it will result in bundled code like this:

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

Registering `*.override.vue` files automatically. It will search for all files matching the override pattern and automatically import them into the bundle/plugin entry file. Additionally, these imports will be registered as override components by calling `Shopware.Component.registerOverrideComponent`. This ensures that all overrides are loaded immediately when the bundle/plugin script is injected.

When an override targets a legacy Twig-based component, the build step also analyzes the override template for referenced block names. Those targets are registered before runtime so the Twig template system can attach `sw-block` hosts where supported.

Use this behavior as follows:

1. Create a `*.override.vue` file for the component you want to extend.
2. Reference the intended block explicitly in the template.
3. Run `composer build:js:admin` or `composer watch:admin`.
4. Verify the block is rendered in Administration.

Example:

```vue
<template>
    <sw-block name="sw_dashboard_index_content_intro_content_headline">
        <template #default>
            <h1>Custom headline</h1>
        </template>
    </sw-block>
</template>
```

If the target is unsupported by the Twig compatibility layer, use the legacy Twig override approach for that specific component. To learn more about the new overrides, take a look at the Vue native docs right next to this file.

### twigjs

Transforming all `*.html.twig` files in a way that Vite can load them.

## HMR reloading

A quick note on HMR (Hot Module Replacement). Vite is only capable of reloading `*.vue` files. This means we can only leverage HMR until we transition everything to SFC (Single File Components), but once we do, the Vite setup will be able to distinguish between changes in a plugin or the core.

## Performance

Vite can build the core Administration in ~18s on my system. This is a saving of over 50% compared to Webpack. In dev mode, it's similar but not directly comparable. The Vite dev server starts instantly, moving the loading time to the first request. Webpack, on the other hand, compiles ahead of time until the server is ready.
