---
nav:
  title: Storefront JavaScript scaffolding runtime wiring
  position: 26

---

# Storefront JavaScript scaffolding runtime wiring

A Storefront JavaScript example is not just a JavaScript class. The current Core scaffolder coordinates a plugin class, the Storefront `main.js` registration, and a Twig template containing the matching initialization target. A successful Storefront build is not sufficient to prove that the plugin runs.

The current Core example uses the legacy Storefront `PluginManager` model. The generated plugin class imports the Storefront `Plugin` base class from `src/plugin-system/plugin.class`, and `main.js` registers the class with `window.PluginManager`. The Twig example provides the corresponding selector target. Verify the exact convention against the Shopware version you target before copying this pattern.

## Runtime chain

Think of the generated feature as one chain:

```text
plugin class
    ↓
Storefront main.js import
    ↓
PluginManager registration + selector
    ↓
Twig/template target
    ↓
storefront-build
    ↓
cache clear when templates change
    ↓
rendered DOM contains the selector
    ↓
PluginManager initializes the class
```

A failure anywhere in this chain can look like a JavaScript problem even though the JavaScript class itself is valid.

## Verify in layers

Build first:

```bash
shopware-cli project storefront-build
```

Then clear the Shopware cache after changing Twig or other runtime-discovered template configuration:

```bash
shopware-cli project console cache:clear
```

Verify that the selector is actually in the server-rendered page:

```bash
curl -s http://127.0.0.1:8000/ | grep -o 'data-example-plugin'
```

Then verify it in the browser:

```js
document.querySelector('[data-example-plugin]')
```

Finally verify runtime initialization in the browser console. A useful minimal test is to log from the plugin's `init()` method.

## Common failure: `Illegal constructor`

A JavaScript class can compile and be registered but still fail during initialization if it extends the wrong base class. The current Core scaffold imports the Storefront `Plugin` class explicitly:

```js
import Plugin from 'src/plugin-system/plugin.class';

export default class ExamplePlugin extends Plugin {
    init() {
        // behavior
    }
}
```

Do not replace that with an arbitrary browser or global constructor simply because a similarly named object exists on `window`.

## Common failure: the selector is missing

If this returns `null`:

```js
document.querySelector('[data-example-plugin]')
```

check the Twig layer before changing JavaScript. The current Core scaffold's Twig stub extends the Storefront content template and places the matching selector inside the `base_main_inner` block.

If the template file is correct but the selector is still absent from the rendered HTML, clear the Shopware cache and test the actual page that renders the overridden template. A successful asset build does not refresh server-rendered Twig output by itself.

## Common failure: build succeeds but the plugin never runs

If the Storefront build succeeds but there is no initialization log, separate the failure into:

```text
selector absent from DOM
    → template/cache problem

selector present, no registration
    → main.js / registration problem

registration present, initialization error
    → plugin class / Storefront API problem
```

This avoids changing the JavaScript class when the actual problem is that the template was never rendered.

## Why the generator needs context

The current Core generator writes all of the coordinating pieces together. The proposed `shopware-cli extension create storefront-js-plugin` story goes further: it must account for the supported Storefront extension model, the plugin's existing entry points, selectors, template hooks, build paths, and collisions, and it needs a runtime-oriented acceptance check.

That means this generator should be considered a coordinated feature generator, not a single-file template generator.
