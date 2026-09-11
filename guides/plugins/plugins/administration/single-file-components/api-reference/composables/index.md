---
nav:
  title: Composables
  position: 20

---

# Composables

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

All composables the Administration offers are experimental. Their names, options and return values can
still change without a deprecation, so pin down what you rely on and tell us when one of them does not
fit what you are building.

## Override composables

Three of them are injected by the build like the macros are, so you never import them, and they exist
only inside an `.override.vue` file. They are how an override reaches the component it overrides.

<PageRef page="use-sw-previous-state" title="useSwPreviousState()" sub="The state of the component you override" />
<PageRef page="use-sw-props" title="useSwProps()" sub="That component's props, read only" />
<PageRef page="use-sw-context" title="useSwContext()" sub="That component's emit, attrs, slots and expose" />

A base component needs none of them: it declares its own props with `defineProps()` and its own events
with `defineEmits()`.

## Administration composables

Everything else is imported, one module per composable, named after it in `kebab-case`:

```ts
import { useNotification } from 'shopware:composables/use-notification';
```

<PageRef page="administration-composables" title="Administration composables" sub="Notifications, session, listings, media, CMS and the rest" />

## Vue's own composables

`ref`, `computed`, `watch`, `onMounted` and the rest come from `vue` and behave exactly as they do in any
Vue 3 project:

```ts
import { computed, ref } from 'vue';
```
