---
nav:
  title: useSwProps()
  position: 40

---

# `useSwProps()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useSwProps } from 'shopware:composables/use-sw-props';

function useSwProps<T extends Record<PropertyKey, any>>(): T;
```

Override files only. Returns the props the overridden component was given.

```ts
import { computed } from 'vue';
import { useSwProps } from 'shopware:composables/use-sw-props';

const props = useSwProps();

const label = computed(() => `Editing ${props.name}`);
```

Read only. Props come from whoever renders the component, so [`swDefineOverride()`](../macros/sw-define-override) rejects a prop name with a console error. To change what a prop-derived value produces, override the binding that derives it.

A base component does not need this: it declares its own props with `defineProps()`.
