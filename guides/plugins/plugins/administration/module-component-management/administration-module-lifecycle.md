---
nav:
  title: Administration module lifecycle
  position: 15
---

# Administration module lifecycle

An Administration module connects an entry point, module registration, routes, page components or templates, snippets, the Administration build, and the UI.

```text
main.js → module import/registration → route → component/template → snippets → build → UI → initial route
```

For implementation, see [Add Custom Module](./add-custom-module.md).

## What each stage proves

The plugin Administration `main.js` must import the module. The module then registers through `Shopware.Module.register()`. A valid module file remains invisible if the entry point never imports it.

Routes used by navigation must resolve to registered page components, and snippet keys used by labels and titles must exist.

Build the Administration with:

```bash
shopware-cli project admin-build
```

A successful build proves compilation. After rebuilding, refresh the Administration and separately verify that the module appears and that its initial route opens.

## Troubleshooting by boundary

If the build succeeds but the module is missing, inspect the `main.js` import, module registration, navigation path, and snippets before changing the page component.

If the module appears but its route fails, inspect route-to-component wiring.

When adding generated code to an existing plugin, preserve existing imports, routes, snippets, and unrelated modules rather than replacing the module graph.
