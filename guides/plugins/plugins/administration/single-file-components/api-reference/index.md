---
nav:
  title: API reference
  position: 70

---

# API reference

<!--@include: ../../../../../../snippets/guide/administration_sfc_experimental.md-->

Everything a Single File Component in an extension can use. The [tutorial](../tutorial/) introduces these in the order you need them; this section is for looking one up.

## Filenames

A `.vue` file needs no registration call. Its name decides both what the component is called and whether it is a base component or an override.

**A base component** declares the name. Either layout works:

| File | Declares |
| --- | --- |
| `sw-my-component.vue` | `sw-my-component` |
| `sw-my-component/index.vue` | `sw-my-component` |

**An override** targets the name, with `.override` before the extension:

| File | Overrides |
| --- | --- |
| `sw-my-component.override.vue` | `sw-my-component` |
| `sw-my-component/index.override.vue` | `sw-my-component` |

Two base files declaring the same name fail the build. Any number of overrides may target the same component, from any number of plugins; within one plugin they need separate directories, because the filename is the whole identity.

Every `.vue` file in an extension is compiled by the Shopware setup transform. It must have a `<script setup>` block, and that block must declare its role with one of the two macros.

## Macros

Compile-time markers. They produce no runtime code, they are not imported, and each is mandatory in its mode.

<PageRef page="sw-define-public" title="swDefinePublic()" sub="Base components: declare what an override may replace" />
<PageRef page="sw-define-override" title="swDefineOverride()" sub="Override files: declare what this file replaces" />

## Composables

All three exist only inside an override file, and come from `shopware:composables/*`.

<PageRef page="use-sw-previous-state" title="useSwPreviousState()" sub="The state of the component you override" />
<PageRef page="use-sw-props" title="useSwProps()" sub="That component's props, read only" />
<PageRef page="use-sw-context" title="useSwContext()" sub="That component's emit, attrs, slots and expose" />

## Components

Globally registered, resolved by tag name.

<PageRef page="sw-block" title="sw-block" sub="Declare an extension point, or contribute to one" />
<PageRef page="sw-block-parent" title="sw-block-parent" sub="Render what the extension point held before you" />

## Vue's own macros

Base components are compiled as ordinary `<script setup>`, so Vue's macros behave exactly as in any Vue 3 project - including prop defaults, reactive destructuring and `withDefaults`.

| Macro | Base | Override |
| --- | --- | --- |
| `defineProps`, `withDefaults` | yes | use [`useSwProps()`](use-sw-props) |
| `defineEmits`, `defineSlots`, `defineExpose`, `defineOptions` | yes | use [`useSwContext()`](use-sw-context) |
| `defineModel` | no | no |

One Shopware-specific rule in base components: a top-level binding must not share a declared prop's name. The extension runtime strips declared prop keys from the returned state, so the binding is deleted and the template renders `undefined`. See [troubleshooting](../troubleshooting#markup-that-silently-does-not-work).

## What you never import

| Name | Where it comes from |
| --- | --- |
| `swDefinePublic`, `swDefineOverride` | Compile-time macros, like Vue's own `defineProps` |
| `sw-block`, `sw-block-parent` | Globally registered components, resolved by tag name |
| `Shopware` | The Administration's global object. Read it freely; `Shopware` is a reserved binding name |

Everything else comes from a `shopware:*` virtual module - the composables above, plus stores, utilities, mixins and DAL helpers:

```ts
import { useSwPreviousState } from 'shopware:composables/use-sw-previous-state';
import useSwProductDetailStore from 'shopware:stores/swProductDetail';
import { Criteria } from 'shopware:data';
import { createId } from 'shopware:utils';
```
