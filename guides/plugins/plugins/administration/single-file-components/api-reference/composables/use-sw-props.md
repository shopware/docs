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

Auto-imported, override files only. Returns the props the overridden component was given.

```ts
import { computed } from 'vue';

const props = useSwProps();

const label = computed(() => `Editing ${props.name}`);
```

Read only. Props come from whoever renders the component, so [`swDefineOverride()`](../macros/sw-define-override) rejects a prop name with a console error. To change what a prop-derived value produces, override the binding that derives it.

A base component does not need this: it declares its own props with `defineProps()`.
