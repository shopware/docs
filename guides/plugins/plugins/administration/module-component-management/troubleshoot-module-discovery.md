---
nav:
  title: Troubleshoot module discovery
  position: 50
---

# Troubleshoot Administration module discovery

An Administration module is not a single JavaScript file. A minimal module normally coordinates an Administration entry point, module registration, route, page component or template, and snippets.

```text
Administration main.js
    ↓
module import and registration
    ↓
route
    ↓
page component / template
    ↓
localized snippets
    ↓
Administration build
    ↓
module appears in the UI
    ↓
initial route opens
```

A successful Administration build proves compilation, not UI discovery. After changing Administration source, run the project Administration build and then verify the result in the Administration itself:

```bash
shopware-cli project admin-build
```

If the build succeeds but the module is missing, check that the module is imported from the extension's Administration entry point, that the registered navigation path matches the route, and that snippet keys referenced by the module exist. Refresh the Administration after rebuilding.

Treat “module appears” and “initial route opens” as separate checks. The first proves registration/discovery; the second catches broken route-to-component wiring.

When adding generated Administration code to an existing plugin, preserve existing entry-point imports, routes, snippets, and unrelated modules. A generator has to merge with this existing graph rather than replace it.
