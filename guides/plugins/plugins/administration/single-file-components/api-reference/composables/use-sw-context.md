---
nav:
  title: useSwContext()
  position: 50

---

# `useSwContext()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useSwContext } from 'shopware:composables/use-sw-context';

function useSwContext<T = SetupContext>(): T;
```

Override files only. Returns the overridden component's Vue `SetupContext`: `emit`, `attrs`, `slots` and `expose`.

```ts
import { useSwContext } from 'shopware:composables/use-sw-context';
import { useSwPreviousState } from 'shopware:composables/use-sw-previous-state';

const context = useSwContext();
const previousState = useSwPreviousState();

function onSave(): void {
    previousState.onSave();
    context.emit('saved');
}
```

Use it to emit the component's own events from an override, or to read the slots it was given.

A base component does not need this: it declares its events with `defineEmits()` and its slots with `defineSlots()`.
