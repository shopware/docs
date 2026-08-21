---
nav:
  title: Storefront JavaScript Plugin Lifecycle
  position: 55

---

# Storefront JavaScript Plugin Lifecycle

A Storefront JavaScript plugin connects a plugin class, the Storefront entry point, `PluginManager`, a DOM selector, a Twig hook, the asset build, and runtime initialization.

```text
plugin class → main.js → PluginManager + selector → Twig target → build/cache → DOM → init()
```

For the step-by-step implementation, see [Add Custom JavaScript](./add-custom-javascript.md).

## Base class and entry point

The current Core scaffolding example imports the Storefront base class explicitly:

```js
import Plugin from 'src/plugin-system/plugin.class';

export default class ExamplePlugin extends Plugin {
    init() {}
}
```

A plausible alternative can compile and still fail at runtime. Use the convention supported by the Shopware version you target.

Register the plugin from `main.js` with a selector when it should initialize on specific elements:

```js
import ExamplePlugin from './example-plugin/example-plugin.plugin';

window.PluginManager.register('ExamplePlugin', ExamplePlugin, '[data-example-plugin]');
```

## Template target

The selector is part of the feature contract. The page must render a matching target, for example:

```twig
<template data-example-plugin></template>
```

## Build, cache, and runtime

Build assets with:

```bash
shopware-cli project storefront-build
```

When Twig changed, also clear Shopware's cache:

```bash
bin/console cache:clear
```

Then verify the rendered HTML or DOM before debugging the class:

```js
document.querySelector('[data-example-plugin]')
```

A successful asset build proves compilation, not initialization.

## Troubleshooting by boundary

```text
selector absent from HTML → template inheritance / cache / tested page
selector present, no registration → main.js / PluginManager
registration present, init error → plugin class / Storefront API / version mismatch
```

A temporary `console.log()` in `init()` is a simple final runtime check during development.
