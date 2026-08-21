---
nav:
  title: Troubleshoot JavaScript plugin initialization
  position: 50
---

# Troubleshoot JavaScript plugin initialization

A Storefront JavaScript feature is a chain of coordinated pieces. A successful asset build proves that the JavaScript compiled; it does not prove that the browser can find an initialization target or instantiate the plugin.

For the current Core scaffolding example, the chain is:

```text
plugin class
    ↓
Storefront main.js import
    ↓
PluginManager registration + selector
    ↓
Twig/template target
    ↓
Storefront build
    ↓
Shopware cache / rendered template
    ↓
PluginManager initializes the class
```

## Use the Storefront Plugin base class

The current Core scaffold imports the Storefront `Plugin` base class explicitly:

```js
import Plugin from 'src/plugin-system/plugin.class';

export default class ExamplePlugin extends Plugin {
    init() {
        // behavior
    }
}
```

Do not substitute an arbitrary global constructor such as `window.Plugin`. Code can compile successfully and still fail at runtime with an error such as `TypeError: Illegal constructor` when the wrong base class is used.

## Verify the registration and selector together

The current Core example registers the plugin in the Storefront entry point:

```js
import ExamplePlugin from './example-plugin/example-plugin.plugin';

const PluginManager = window.PluginManager;
PluginManager.register('ExamplePlugin', ExamplePlugin, '[data-example-plugin]');
```

The selector in the registration must match an element rendered by Twig. The current scaffold creates a template hook such as:

```twig
<template data-example-plugin></template>
```

If the selector and template disagree, the plugin can build without ever initializing.

## Build, clear cache, then verify runtime

Build the Storefront assets:

```bash
shopware-cli project storefront-build
```

When you also changed Twig, clear Shopware's cache before deciding that the template override failed:

```bash
shopware-cli project console cache:clear
```

A Storefront build and a Shopware/Twig cache clear prove different things. Building assets does not by itself guarantee that a changed Twig template is present in the next server-rendered response.

Check the server-rendered HTML first:

```bash
curl -s http://127.0.0.1:8000/ | grep -o 'data-example-plugin'
```

Then check the DOM in the browser console:

```js
document.querySelector('[data-example-plugin]')
```

Finally verify that `init()` runs. During development, a temporary `console.log()` in `init()` is a simple runtime check.

## Localize the failure before changing code

```text
selector absent from server-rendered HTML
    → template inheritance / cache / tested page

selector absent from DOM
    → rendered markup / client-side DOM changes

selector present, plugin not registered
    → main.js import / PluginManager registration

plugin registered, initialization error
    → plugin class / Storefront API / version-specific convention
```

This distinction is especially important for generated code: file existence and compilation are weaker checks than runtime initialization.

## Version-specific Storefront models

The current Core scaffolder uses the `PluginManager` model shown above. Storefront extension models can evolve. When generating or copying scaffolding, verify the convention against the Shopware version you target instead of assuming that a legacy registration pattern is version-neutral.
