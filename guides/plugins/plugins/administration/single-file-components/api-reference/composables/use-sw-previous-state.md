---
nav:
  title: useSwPreviousState()
  position: 10

---

# `useSwPreviousState()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
function useSwPreviousState<T extends Record<PropertyKey, any>>(): T;
```

Auto-imported, override files only. Returns the state of the component being overridden.

## What you get

Everything that component exposes: its `data`, `computed`, `methods` and `props` while it is still an Options API component, or the names it passed to [`swDefinePublic()`](../macros/sw-define-public) once it has been migrated.

```ts
const previousState = useSwPreviousState();

previousState.product.value;   // read a value
previousState.save();          // run the original implementation of a method
```

Calling a method is how an override builds on behaviour instead of discarding it - the equivalent of `this.$super()` in the Options API.

## Reading values

Entries are refs. Read them with `.value` in your script; a template unwraps them as it does any ref.

```ts
const name = previousState.product.value?.name;
```

## With several overrides

Each override sees the state as the ones registered before it left it, so a chain of overrides composes:

```ts
// second override in the chain
const greeting = computed(() => `${previousState.greeting.value} and again`);
```
