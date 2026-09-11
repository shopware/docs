---
nav:
  title: swDefinePublic()
  position: 10

---

# `swDefinePublic()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
function swDefinePublic<T extends Record<PropertyKey, unknown>>(bindings: T): void;
```

Base components only. Declares which of the file's top-level bindings other extensions may replace.

A compile-time macro: you do not import it, it produces no runtime code, and it is mandatory in every base component.

## What it does

A base component is **private by default**. Every top-level binding becomes ordinary component state that its own template can read, and only the names listed here become part of the override API.

```ts
const props = defineProps<{ name: string }>();
const clicks = ref(0);
const greeting = computed(() => `Hello ${props.name}`);

swDefinePublic({ greeting });
```

`greeting` is public: an override can replace it with [`swDefineOverride()`](sw-define-override). `clicks` and `props` stay private - still readable in this component's own template, not part of the contract.

Pass `{}` for a component that exposes nothing:

```ts
swDefinePublic({});
```

## Rules

**Shorthand bindings only.** The key always equals the local binding name. Renaming (`{ total: count }`), string keys, computed keys and spreads are rejected at build time.

**Once, at the top level.** Two calls, or a call nested inside a function or block, are rejected.

**Base files only.** In an `.override.vue` file this macro is rejected; use [`swDefineOverride()`](sw-define-override).

**A binding must not share a declared prop's name.** See [troubleshooting](../../troubleshooting#markup-that-silently-does-not-work).
