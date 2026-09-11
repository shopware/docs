---
nav:
  title: Macros
  position: 10

---

# Macros

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

Two compile-time markers. They are not imported, they produce no runtime code, and each is mandatory in its mode: a base component declares its public surface, an override declares what it replaces.

<PageRef page="sw-define-public" title="swDefinePublic()" sub="Base components: declare what an override may replace" />
<PageRef page="sw-define-override" title="swDefineOverride()" sub="Override files: declare what this file replaces" />

## Rules that apply to both

**Shorthand bindings only.** The key always equals the local binding name:

```ts
swDefinePublic({ count });          // ✓
swDefinePublic({ total: count });   // ✗ renamed
swDefinePublic({ 'count': count }); // ✗ string key
swDefinePublic({ ...state });       // ✗ spread
```

The build, the lint rule and the type layer all need a key that is stable at compile time, and a renamed key could silently shadow another binding.

**Once, at the top level.** Two calls in one file, or a call nested inside a function or block, are rejected.

**Mandatory, even when empty.** Pass `{}` when there is nothing to declare. Writing the call is what marks the file as a base component or an override on purpose, rather than because it happens to have a `<script setup>` block.

**One per mode.** `swDefinePublic()` in an override file is rejected, and so is `swDefineOverride()` in a base component.

Every one of these is reported by the build and by the `sw-core-rules/valid-shopware-setup` ESLint rule, on the offending line. See [troubleshooting](../../troubleshooting#the-macros).
