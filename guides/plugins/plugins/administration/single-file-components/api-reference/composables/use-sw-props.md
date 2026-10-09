---
nav:
  title: useSwProps()
  position: 20

---

# `useSwProps()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
function useSwProps<T extends Record<PropertyKey, any>>(): T;
```

Provided by the build in every `.override.vue` file; you never import it. Returns the props the overridden component was given.

```ts
const props = useSwProps();

const label = computed(() => `Editing ${props.name}`);
```

Read only. Props come from whoever renders the component, so [`swDefineOverride()`](../macros/sw-define-override) rejects a prop name with a console error. To change what a prop-derived value produces, override the binding that derives it.

A base component does not need this: it declares its own props with `defineProps()`.
