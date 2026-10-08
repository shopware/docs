---
nav:
  title: Troubleshooting
  position: 80

---

# Troubleshooting

<!--@include: ../../../../../snippets/guide/administration_sfc_experimental.md-->

The messages the Shopware setup transform produces most often, and what to do about each.

## One validator, three places

There is a single validator for `.vue` files in extensions. The build runs it, and the ESLint rule `sw-core-rules/valid-shopware-setup` runs the *same* code against the file in your editor. So a message from the tables below reaches you as you type, from `shopware-cli project console administration:check-extensions -- --only=<YourPlugin>`, and from the build, always with the same wording and on the same line. The exceptions are marked: a build-only check, and the messages in the browser console.

```text
custom/plugins/SwagProductMargin/src/.../swag-margin-hint.override.vue
  20:5  error  swDefineOverride() only supports shorthand bindings such as { a, b }. Renaming and
               string or computed keys (for example { a: b } or { 'a': b }) are not supported
               sw-core-rules/valid-shopware-setup
```

## Nothing happens at all

Your override compiles, the build is clean, and the page is unchanged. The usual causes, most common first:

1. **The block name is wrong.** It is a plain string and nothing checks it - a typo simply never matches. Copy the name from the component's template rather than typing it.
2. **The file is not named after the component.** `sw-product-detail-base.override.vue` overrides `sw-product-detail-base`. A file named after the wrong component, or missing the `.override` part, registers nothing. Blocks are scoped per component, so name the file after the component whose template contains the block, not after the page around it.
3. **The file is outside your Administration source directory.** The build scans `src/Resources/app/administration/src/` for `*.override.vue`. A file above that directory is never found.
4. **You are looking at a stale bundle.** With `shopware-cli project admin-watch` running, check its output for an error. Without a watcher, run `shopware-cli project admin-build` and reload.

## The file itself

| Message                                                                                          | Cause                                                                                                             | Fix                                                                                                                |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `A Shopware setup component needs a <script setup> block. …`                                     | The file has a plain `<script>` (Options API) or only a template                                                  | Every `.vue` file in an extension needs `<script setup>`. Keep Options API components as `index.js` + `.html.twig` |
| `An override component needs a <script setup> block to register its override. …`                 | The same, in an `.override.vue` file, for example a template-only override                                        | Add `<script setup>` with `swDefineOverride({})`                                                                   |
| `A Shopware setup block cannot be combined with another <script> block.`                         | A second `<script>` next to `<script setup>`                                                                      | Move that code into the setup block or into a separate module                                                      |
| `Unsupported <script setup lang="…"> …`                                                          | A language other than `js`, `jsx`, `ts` or `tsx`                                                                  | Use one of the four                                                                                                |
| `Top-level await is not supported inside Shopware setup blocks.`                                 | `await` at the top level of `<script setup>`                                                                      | Move it into a function, or use `watchEffect` / `onMounted`                                                        |
| `Anonymous top-level declarations are not supported inside Shopware setup blocks.`               | A top-level `function` or `class` without a name                                                                  | Give it a name                                                                                                     |
| `"useSwProps" is reserved by the Shopware setup transform and must not be declared or imported.` | A binding named after a macro, such as `const useSwProps = …`, or a macro imported from a module other than `vue` | Rename the binding or remove the import. Importing a Vue macro such as `defineProps` from `vue` is fine            |

## The macros

| Message                                                                                                              | Cause                                                             | Fix                                                            |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `A base Shopware setup component must declare its extension surface. Add swDefinePublic({ ... }) at the top level …` | No `swDefinePublic()`, or it is nested inside a function or block | Add it as a top-level statement. `swDefinePublic({})` is valid |
| `swDefineOverride() must be called exactly once at the top level of an override Shopware setup block.`               | Same, for an `.override.vue` file                                 | Add `swDefineOverride({})`                                     |
| `Only one swDefinePublic() call is allowed in a base Shopware setup block.`                                          | Two marker calls                                                  | Merge them into one                                            |
| `swDefinePublic() only supports shorthand bindings such as { a, b }. …`                                              | A renamed, string or computed key                                 | Rename the binding itself so key and binding match             |
| `Spread properties are not supported inside swDefinePublic().`                                                       | `swDefinePublic({ ...state })`                                    | List the names explicitly                                      |
| `Imported binding "…" cannot be exposed with swDefinePublic().`                                                      | An import passed to the macro                                     | Only bindings declared in this file can be exposed             |
| `Duplicate … Shopware setup binding key "…".`                                                                        | The same name listed twice                                        | List it once                                                   |
| `swDefinePublic() is a compile-time marker and returns nothing. …`                                                   | `const x = swDefinePublic({})`                                    | Call it as a statement                                         |
| `swDefinePublic() is a Shopware setup compile-time macro for base components. …`                                     | `swDefinePublic` used in an `.override.vue` file                  | Use `swDefineOverride()`                                       |

## Right macro, wrong file

| Message                                                                     | Cause                                                                                              | Fix                                                                                                                      |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `defineProps() is only supported in base Shopware setup blocks.`            | A Vue macro in an override. Same for `withDefaults`, `defineEmits`, `defineSlots`, `defineOptions` | Use `useSwProps()` / `useSwContext()` instead                                                                            |
| `defineExpose() is not supported inside Shopware setup blocks. …`           | `defineExpose()` in a base component or an override                                                | Base: list the bindings in `swDefinePublic()`, which generates the `defineExpose()` call. Override: `swDefineOverride()` |
| `useSwPreviousState() is only supported in override Shopware setup blocks.` | An override composable in a base component. Same for `useSwProps`, `useSwContext`                  | A base component reads its own props and context directly                                                                |
| `Vue macro defineModel() is not supported inside Shopware setup blocks.`    | `defineModel()` in either mode                                                                     | Declare the prop and the `update:` event by hand                                                                         |

## Reserved names

| Message                                                                                                | Cause                                         | Fix                                                                                |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `"…" uses the reserved "__swSetup" prefix …`                                                           | A binding or import starting with `__swSetup` | Rename it                                                                          |
| `"Shopware" is reserved …`                                                                             | A top-level binding named `Shopware`          | Rename it. Reading the global `Shopware` object is fine; declaring the name is not |
| `"__swOverride" is reserved for Shopware override-private state and must not be declared or imported.` | A binding or import named `__swOverride`      | Rename it                                                                          |
| `"__proto__" cannot be a Shopware setup binding: …`                                                    | A binding named `__proto__`                   | Rename it                                                                          |

## Blocks

| Message                                                                                                         | Cause                                                                                                  | Fix                                                                                                          |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `The data binding of <sw-block> is generated by the Shopware setup transform and must not be authored.`         | You wrote `data` or `:data` on an `sw-block`                                                           | Write only `name` or `extends`                                                                               |
| `The default slot scope of <sw-block> is generated by the Shopware setup transform and must not be authored. …` | `#default` on an `sw-block`, or a `<template #default>` directly inside it                             | Reference your bindings directly                                                                             |
| `<sw-block extends="..."> is only valid in an override component. …`                                            | `extends` in a base component                                                                          | A base component declares blocks with `<sw-block name>`                                                      |
| `<sw-block name="..."> is only valid in a base component. …`                                                    | `name` in an override                                                                                  | An override contributes to a block with `<sw-block extends>`                                                 |
| `Cannot assign to "…" inside <sw-block extends> content …`                                                      | A template write to one of your override's bindings inside block content                               | The binding arrives there as a copy. Change it in a function in your `<script setup>` and call that function |
| `Duplicate native setup base component name "…": "…" and "…" resolve to the same extendable component.`         | Two base `.vue` files in one build resolve to the same name. Reported by the build only, not by ESLint | Rename one file or its directory                                                                             |
| `Only a static "extends" attribute is allowed on <sw-block>; "v-if" is not supported. …`                        | A directive, `class` or other attribute on an `sw-block`                                               | Move the condition or attribute inside the block; `sw-block` renders a fragment and ignores attributes       |
| `An override template may only contain <sw-block extends="..."> blocks at its top level. …`                     | Markup outside a block in an override template                                                         | Move it into an `<sw-block extends>` block; an override renders only inside the blocks it extends            |
| `A direct non-default named slot below <sw-block> is not supported. …`                                          | `<template #name>` directly inside an `sw-block`                                                       | Move the `sw-block` inside the named-slot template                                                           |

## In the browser console

| Message                                                                                                                                                                            | Cause                                                                                                                                 | Fix                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[…] Override result value not working. Cannot override props. Following prop should be changed: "…"`                                                                              | `swDefineOverride` returned a name that is a prop of the component                                                                    | Props come from the parent and cannot be overridden. Read them with `useSwProps()`                                                                                                                  |
| `[sw-block] The "name" prop changed from "…" to "…" after mount.`                                                                                                                  | A dynamic `name` on an `sw-block`                                                                                                     | Block names must be static                                                                                                                                                                          |
| `[TemplateFactory] The block "…" cannot host a native extension point: its content mixes a named slot template with other content. The native override for this block is ignored.` | Your `.vue` override extends a Twig block whose content is a `<template #slot>` plus other markup. Only a development build logs this | Extend a different block                                                                                                                                                                            |
| `[ComponentFactory] The component "…" needs a template to be functional.`                                                                                                          | An SFC handed to `Shopware.Component.register()` without `_renderedBySfcTemplate: true`                                               | Return `{ ...component, _renderedBySfcTemplate: true }` from the registration callback. A production build moves the render function inside `setup()`, where the component factory does not find it |

## Markup that silently does not work

Most of these produce no warning. An `sw-block` is a real component and leaves a node in the tree, where a TwigJS `{% block %}` left nothing at all.

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

**`<sw-block extends>` inside `v-for`** registers one override per list item, so your content renders several times.

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

## A snippet key shows instead of the text

The banner reads `swag-margin.hint.tooLow` rather than "Margin too low". Two causes, the first far more common:

1. **The snippet cache is stale.** The Administration caches the snippet files it collected, and only activating a plugin starts a fresh cache. After you add or change a snippet file in an active plugin, run `shopware-cli project console cache:clear` and reload.
2. **The key does not match.** `$t()` and `tWithFallback()` return the key itself when no snippet file has an entry for it. Compare the key with the nesting in your `en-GB.json`.

## `useI18n()` does not work in a plugin

```ts
import { useI18n } from 'vue-i18n';   // ✗ not available to an extension
```

The extension build aliases only `vue` to the Administration's own copy. `vue-i18n` is not aliased, so this import either fails to resolve when you build - or, if your plugin declares `vue-i18n` as a dependency of its own, pulls in a second copy of the library that was never installed on the Administration's Vue app. The second case fails at runtime, inside `setup()`, with ``Need to install with `app.use` function``.

Read snippets through the Administration instead:

| Where                                 | Use                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| A template                            | `$t('key')` and `$t('key', n)`, a Vue global property with nothing to import   |
| A `<script setup>` block              | `tWithFallback('key')` from `useTranslateWithFallback()`                       |
| A key with a placeholder, in a script | `Shopware.Snippet.t('key', { … })`, because `tWithFallback()` takes only a key |

See [Chapter 4](tutorial/build-your-own-component#where-the-strings-come-from) for the snippet files themselves.

## `previousState.<name>` is `undefined` after a Shopware update

Your override read a value out of the component it extends, it worked, and after an update the binding is gone. Two causes:

1. **The component was converted to a Single File Component.** A Twig component puts everything on `this`, so `previousState` sees all of it. A converted component exposes only the names core lists in `swDefinePublic()`, and that list is decided component by component during the experimental phase - a value that was readable before the conversion is not automatically part of it.
2. **The binding was renamed.** Unlike a block name, the internal state of a component is not covered by the backwards-compatibility promise, so a `computed` can change its name in a minor release.

The fix in both cases is to stop reading the value from the component: take it from a store or from the DAL instead, the way [Chapter 4](tutorial/build-your-own-component#where-the-data-comes-from) takes the product from `shopware:stores/swProductDetail`.

If there is no other source and you think the value belongs in the component's public surface, open an issue on [shopware/shopware](https://github.com/shopware/shopware/issues) with `[Admin SFC]` in front of the title, naming the component and the binding. See [Give us feedback](roadmap#give-us-feedback).

## Still stuck

If something is impossible, surprising, or only works by accident, open an issue on [shopware/shopware](https://github.com/shopware/shopware/issues) with `[Admin SFC]` in front of the title and describe what you were trying to extend. For feedback that is not a defect, use the [GitHub discussion on Single File Components](https://github.com/shopware/shopware/discussions/21162).
