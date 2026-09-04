---
nav:
  title: Administration
  position: 10

---

# Administration

These guides cover architectural changes and migration paths affecting Administration extensions, helping you prepare plugins for major system transitions. Depending on the migration stage of the component you work with, you may use native Vue extensions against fully migrated components and, for many cases, against legacy Twig-based core components through the compatibility guidance in the native Vue migration guide.

Use these guides for the corresponding extension strategy:

* [Vue 3 migration](./vue3)
* [Meteor components](./meteor-components)
* [Pinia migration](./pinia)
* [Vite migration](./vite)
* [Vue migration build removal](./vue-migration-build)
* [Native Vue implementation](./vue-native)

If you want to override Administration components with `.vue` files, start with [Native Vue implementation](./vue-native). That guide explains when a native override can target a legacy Twig-based core component, how Twig blocks are matched, and which Twig structures still require legacy Twig overrides.

For automated detection and fixing of supported Administration migration patterns, see the [Shopware CLI automatic refactoring](../../../products/tools/cli/automatic-refactoring.md) guide.