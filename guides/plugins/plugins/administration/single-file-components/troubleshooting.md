---
nav:
  title: Troubleshooting
  position: 80

---

# Troubleshooting

<!--@include: ../../../../../snippets/guide/administration_sfc_experimental.md-->

Every message the Shopware setup transform can produce, and what to do about it.

## One validator, three places

There is a single validator for `.vue` files in extensions. The build runs it, and the ESLint rule `sw-core-rules/valid-shopware-setup` runs the *same* code against the file in your editor. So a message below reaches you as you type, from `composer admin:check-extensions`, and from the build - always with the same wording and on the same line.

```text
custom/plugins/SwagProductMargin/src/.../swag-margin-hint.override.vue
  20:5  error  swDefineOverride() only supports shorthand bindings such as { a, b }. Renaming and
               string or computed keys (for example { a: b } or { 'a': b }) are not supported
               sw-core-rules/valid-shopware-setup
```

## Nothing happens at all

Your override compiles, the build is clean, and the page is unchanged. In order of likelihood:

1. **The block name is wrong.** It is a plain string and nothing checks it - a typo simply never matches. Copy the name from the component's template rather than typing it.
2. **The file is not named after the component.** `sw-product-detail-base.override.vue` overrides `sw-product-detail-base`. A file named after the wrong component, or missing the `.override` part, registers nothing.
3. **The file is outside your Administration source directory.** The build scans `src/Resources/app/administration/src/` for `*.override.vue`. A file above that directory is never found.
4. **You are looking at a stale bundle.** With a watcher running, check its output for an error. Without one, run a full build.

## The file itself

| Message | Cause | Fix |
| --- | --- | --- |
| `A Shopware setup component needs a <script setup> block. …` | The file has a plain `<script>` (Options API) or only a template | Every `.vue` file in an extension needs `<script setup>`. Keep Options API components as `index.js` + `.html.twig` |
| `A Shopware setup block cannot be combined with another <script> block.` | A second `<script>` next to `<script setup>` | Move that code into the setup block or into a separate module |
| `Unsupported <script setup lang="…"> …` | A language other than `js`, `jsx`, `ts` or `tsx` | Use one of the four |
| `Top-level await is not supported inside Shopware setup blocks.` | `await` at the top level of `<script setup>` | Move it into a function, or use `watchEffect` / `onMounted` |

## The macros

| Message | Cause | Fix |
| --- | --- | --- |
| `A base Shopware setup component must declare its extension surface. Add swDefinePublic({ … }) at the top level …` | No `swDefinePublic()`, or it is nested inside a function or block | Add it as a top-level statement. `swDefinePublic({})` is valid |
| `swDefineOverride() must be called exactly once at the top level of an override Shopware setup block.` | Same, for an `.override.vue` file | Add `swDefineOverride({})` |
| `Only one swDefinePublic() call is allowed in a base Shopware setup block.` | Two marker calls | Merge them into one |
| `swDefinePublic() only supports shorthand bindings such as { a, b }. …` | A renamed, string or computed key | Rename the binding itself so key and binding match |
| `Spread properties are not supported inside swDefinePublic().` | `swDefinePublic({ ...state })` | List the names explicitly |
| `swDefinePublic() is a compile-time marker and returns nothing. …` | `const x = swDefinePublic({})` | Call it as a statement |
| `swDefinePublic() is a Shopware setup compile-time macro for base components. …` | `swDefinePublic` used in an `.override.vue` file | Use `swDefineOverride()` |

## Right macro, wrong file

| Message | Cause | Fix |
| --- | --- | --- |
| `defineProps() is only supported in base Shopware setup blocks.` | A Vue macro in an override. Same for `withDefaults`, `defineEmits`, `defineExpose`, `defineSlots`, `defineOptions` | Use `useSwProps()` / `useSwContext()` instead |
| `useSwPreviousState() is only supported in override Shopware setup blocks.` | An override composable in a base component. Same for `useSwProps`, `useSwContext` | A base component reads its own props and context directly |
| `Vue macro defineModel() is not supported inside Shopware setup blocks.` | `defineModel()` in either mode | Declare the prop and the `update:` event by hand |

## Reserved names

| Message | Cause | Fix |
| --- | --- | --- |
| `"…" uses the reserved "__swSetup" prefix …` | A binding or import starting with `__swSetup` | Rename it |
| `"Shopware" is reserved …` | A top-level binding named `Shopware` | Rename it. Reading the global `Shopware` object is fine; declaring the name is not |
| Reserved: `__swOverride`, `__proto__` | Used internally by the override channel and the generated state map | Rename |

## Blocks

| Message | Cause | Fix |
| --- | --- | --- |
| `The data binding of <sw-block> is generated by the Shopware setup transform and must not be authored.` | You wrote `:data`, `v-bind` or `#default` on an `sw-block` | Write only `name` or `extends` |
| `Cannot assign to "…" inside <sw-block extends> content …` | A template write to one of your override's bindings inside block content | The binding arrives there as a copy. Change it in a function in your `<script setup>` and call that function |
| `Duplicate native setup base component name "…": "…" and "…" resolve to the same extendable component.` | Two base `.vue` files in one build resolve to the same name | Rename one file or its directory |

## In the browser console

| Message | Cause | Fix |
| --- | --- | --- |
| `[…] Override result value not working. Cannot override props. Following prop should be changed: "…"` | `swDefineOverride` returned a name that is a prop of the component | Props come from the parent and cannot be overridden. Read them with `useSwProps()` |
| `[sw-block] The "name" prop changed from "…" to "…" after mount.` | A dynamic `name` on an `sw-block` | Block names must be static |
| `[ComponentFactory] The component "…" needs a template to be functional.` | An SFC handed to `Shopware.Component.register()` without `_renderedBySfcTemplate: true` | Return `{ ...component, _renderedBySfcTemplate: true }` from the registration callback. A production build moves the render function inside `setup()`, where the component factory does not find it |

## Markup that silently does not work

Nothing warns about these. An `sw-block` is a real component and leaves a node in the tree, where a TwigJS `{% block %}` left nothing at all.

**Two top-level `sw-block`s make the component multi-root.** A component that renders one outermost element can be handed a `class` or a directive by its caller. With two, Vue has nowhere to put them, they are dropped, and `$el` becomes an invisible text marker - which breaks `v-tooltip`, `v-popover` and anything that measures the element.

```vue
<!-- ✗ two roots -->
<sw-block name="swag_thing_new"><mt-thing v-if="useMeteor" /></sw-block>
<sw-block name="swag_thing_old"><sw-thing-deprecated v-else /></sw-block>

<!-- ✓ one root -->
<sw-block name="swag_thing">
    <mt-thing v-if="useMeteor" />
    <sw-thing-deprecated v-else />
</sw-block>
```

**An `sw-block` between `v-if` and `v-else` breaks the chain**, because `v-else` must directly follow its `v-if` sibling. The same applies between a `<template #slot>` and the component it belongs to.

**`<sw-block extends>` inside `v-for`** registers one override per list item, so your content renders several times. A `v-if` on an `sw-block extends` is fine - it registers on mount and removes itself again when the component is unmounted.

**`<sw-block-parent />` must render unconditionally, exactly once** per extending block. It claims its position in the chain when it is created, so putting it in a `v-for`, in a `v-if`, or giving it a `v-if` / `v-else` of its own corrupts the chain.

**A binding named after a component tag replaces that component.** A `<script setup>` template prefers a setup binding over a registered component of the same name, in the plain, camel-case and capitalised spellings. Template refs are the usual victim:

```vue
<!-- ✗ `swSelectResultList` is a setup binding, so the tag renders its value -->
<sw-select-result-list ref="swSelectResultList" />

<!-- ✓ -->
<sw-select-result-list ref="resultList" />
```

**A binding must not share a declared prop's name.** In plain Vue the local binding shadows the prop in the template; here the opposite happens - the extension runtime strips declared prop keys from the returned state, the binding is deleted, and the template renders `undefined`:

```ts
const props = defineProps<{ count: number }>();
const count = ref(0);   // ✗ collides with the prop `count`
```

The standard `vue/no-dupe-keys` ESLint rule reports this for an inline prop object and for a type declared in the same file. It cannot see through an **imported** prop type, and neither can the build - so when your props come from an import, check the names against your top-level bindings yourself.

## Still stuck

The whole system is experimental so that it can still change based on what breaks for you. If something is impossible, surprising, or only works by accident, open an issue on [shopware/shopware](https://github.com/shopware/shopware/issues) and describe what you were trying to extend.
