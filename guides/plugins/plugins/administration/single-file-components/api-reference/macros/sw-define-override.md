---
nav:
  title: swDefineOverride()
  position: 20

---

# `swDefineOverride()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
function swDefineOverride<T extends Record<PropertyKey, unknown>>(bindings: T): void;
```

Override files only. Declares which bindings of the component being overridden this file replaces.

A compile-time macro: you do not import it, it produces no runtime code, and it is mandatory in every `.override.vue` file.

## What it does

Each name replaces the binding of that name in the component being overridden - a `computed`, a `ref` and a function alike. Read the original through [`useSwPreviousState()`](../composables/use-sw-previous-state) to build on it rather than discard it.

```ts
const previousState = useSwPreviousState();
const greeting = computed(() => `${previousState.greeting.value}!`);

swDefineOverride({ greeting });
```

A name the component does not have is added as new state.

Pass `{}` for an override that only contributes markup through [`sw-block`](../block-components/sw-block):

```ts
swDefineOverride({});
```

## Rules

**Props cannot be overridden.** A name that is one of the component's props is rejected with a console error - props come from whoever renders the component. Read them with [`useSwProps()`](../composables/use-sw-props).

**Shorthand bindings only.** The key always equals the local binding name. Renaming, string keys, computed keys and spreads are rejected at build time.

**Once, at the top level.** Two calls, or a call nested inside a function or block, are rejected.

**Override files only.** In a base component this macro is rejected; use [`swDefinePublic()`](sw-define-public).

## Order

Several overrides may target one component. They apply in registration order, and each sees the result of the ones before it, so they compose rather than compete.
