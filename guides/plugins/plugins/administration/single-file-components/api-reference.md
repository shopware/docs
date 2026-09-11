---
nav:
  title: API reference
  position: 70

---

# API reference

<!--@include: ../../../../../snippets/guide/administration_sfc_experimental.md-->

Everything a Single File Component in an extension can use: the two macros, the three composables, and the two components. The [tutorial](set-up-your-environment) introduces them in the order you need them; this page is for looking one up.

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

Every `.vue` file in an extension is compiled by the Shopware setup transform. It must have a `<script setup>` block, and that block must declare its role with one of the two macros below.

## Macros

Both are compile-time markers. They are auto-imported, produce no runtime code, and are mandatory in their mode.

Both accept **shorthand bindings only** - the key always equals the local binding name. Renaming (`{ total: count }`), string keys, computed keys and spreads are rejected.

### `swDefinePublic(bindings)`

```ts
function swDefinePublic<T extends Record<PropertyKey, unknown>>(bindings: T): void;
```

Base components only. Declares which of the file's top-level bindings other extensions may replace.

A base component is **private by default**: every top-level binding becomes ordinary component state that its own template can read, and only the names listed here become part of the override API. Pass `{}` for a component that exposes nothing.

```ts
const count = ref(0);
const greeting = computed(() => `Hello ${props.name}`);

swDefinePublic({ count, greeting });
```

### `swDefineOverride(bindings)`

```ts
function swDefineOverride<T extends Record<PropertyKey, unknown>>(bindings: T): void;
```

Override files only. Each name replaces the binding of that name in the component being overridden - a `computed`, a `ref` and a function alike. A name the component does not have is added as new state. Pass `{}` for an override that only contributes markup.

A name that is one of the component's **props** is rejected with a console error: props come from whoever renders the component.

```ts
const previousState = useSwPreviousState();
const greeting = computed(() => `${previousState.greeting.value}!`);

swDefineOverride({ greeting });
```

## Composables

All three exist **only inside an override file**. A base component reads its props from `defineProps()` and its context from Vue directly.

```ts
import { useSwPreviousState } from 'shopware:composables/use-sw-previous-state';
import { useSwProps } from 'shopware:composables/use-sw-props';
import { useSwContext } from 'shopware:composables/use-sw-context';
```

| Composable | Returns |
| --- | --- |
| `useSwPreviousState()` | The state of the component being overridden |
| `useSwProps()` | That component's current props, read only |
| `useSwContext()` | That component's Vue `SetupContext`: `emit`, `attrs`, `slots`, `expose` |

### `useSwPreviousState()`

```ts
function useSwPreviousState<T extends Record<PropertyKey, any>>(): T;
```

Gives you everything the component you override exposes: its `data`, `computed`, `methods` and `props` when it is still an Options API component, or the names it passed to `swDefinePublic()` once it has been migrated.

With several overrides on one component, each sees the result of the ones registered before it, so overrides compose rather than compete.

```ts
import { useSwPreviousState } from 'shopware:composables/use-sw-previous-state';

const previousState = useSwPreviousState();

previousState.product.value;   // read a value: .value in your script
previousState.save();          // run the original implementation of a method
```

Entries are refs. Read them with `.value` in your script; a template unwraps them as it does any ref.

### `useSwProps()`

```ts
function useSwProps<T extends Record<PropertyKey, any>>(): T;
```

The props the overridden component was given. Read only - to change what a prop-derived value produces, override the binding that derives it.

```ts
import { useSwProps } from 'shopware:composables/use-sw-props';

const props = useSwProps();

const label = computed(() => `Editing ${props.name}`);
```

### `useSwContext()`

```ts
function useSwContext<T = SetupContext>(): T;
```

The overridden component's setup context, so an override can emit its events or read its slots.

```ts
import { useSwContext } from 'shopware:composables/use-sw-context';

const context = useSwContext();

function onSave(): void {
    context.emit('save');
}
```

## Components

### `sw-block`

The extension point. Which prop you pass decides what it does.

| Prop | Type | Meaning |
| --- | --- | --- |
| `name` | `string` | **Declares** an extension point. Its children are the default content |
| `extends` | `string` | **Contributes** to the extension point of that name. Renders nothing where it stands |

`name` and `extends` are the only props you write. The component has others - your editor may offer them - and they are internal: the build rejects an authored `data`, `v-bind` or `#default` on an `sw-block`.

Block names are strings and nothing validates them, so a typo silently matches nothing. They must be unique per component. The convention is an owner prefix and then the path through the component, in `snake_case`: core uses `sw_`, a plugin uses its own.

```html
<!-- in the component that owns the extension point -->
<sw-block name="swag_greeting_card_body">
    <p>Default content</p>
</sw-block>

<!-- in an override of that component -->
<sw-block extends="swag_greeting_card_body">
    <sw-block-parent />
    <p>Mine, underneath</p>
</sw-block>
```

An `<sw-block extends>` belongs at the root of an override's template and cannot be nested inside another element. Where it sits does not affect where its content renders: it registers the content, and the matching `<sw-block name>` renders it.

### `sw-block-parent`

```html
<sw-block-parent />
```

Takes no props. Renders whatever the extension point held before this override: the default content, or the previous override in the chain. Leave it out and the original markup is replaced.

It has to render unconditionally, exactly once per extending block. It claims its position in the chain when it is created, so a `v-if` on it, or a `v-for` around it, corrupts that chain.

## Vue's own macros

Base components are compiled as ordinary `<script setup>`, so Vue's macros behave exactly as in any Vue 3 project - including prop defaults, reactive destructuring and `withDefaults`.

| Macro | Base | Override |
| --- | --- | --- |
| `defineProps`, `withDefaults` | yes | use `useSwProps()` |
| `defineEmits`, `defineSlots`, `defineExpose`, `defineOptions` | yes | use `useSwContext()` |
| `defineModel` | no | no |

One Shopware-specific rule in base components: a top-level binding must not share a declared prop's name. The extension runtime strips declared prop keys from the returned state, so the binding is deleted and the template renders `undefined`. See [troubleshooting](troubleshooting#markup-that-silently-does-not-work).

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

## See also

<PageRef page="set-up-your-environment" title="Tutorial" sub="These APIs in the order you need them, on a real page" />
<PageRef page="troubleshooting" title="Troubleshooting" sub="Every message these rules can produce, with its fix" />
