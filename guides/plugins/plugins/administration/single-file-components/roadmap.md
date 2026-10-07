---
nav:
  title: Roadmap
  position: 90

---

# Roadmap

<!--@include: ../../../../../snippets/guide/administration_sfc_experimental.md-->

Where the Single File Component extension system stands: what you can build with it today, what is
still being worked on, and where to tell us when something does not fit.

## What experimental means here

The system is available since Shopware 6.7.16.0. There is no feature flag to enable and nothing to opt into - a `.vue` file
in your plugin is compiled by the extension build as it is.

Experimental means the API can still change, at any time and without a deprecation. The plan is for it
to become a stable, deprecation-protected API in **6.9**. How much it still has to change depends on
what you run into and on how the Administration's own migration goes.

Until the API is declared stable, an SFC extension written today may need changes with every Shopware
update.

## Timeline

| When   | What happens                                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.7.16 | The extension system is available, and experimental.                                                                                                     |
| 6.8    | The Administration's `@private` components, which are not part of the public extension contract, are converted and run in production for the first time. |
| 6.9    | Planned: the extension system becomes a stable API, and a first handful of public components are converted with it.                                      |
| Later  | The remaining components follow. The shims keep working for a while after that.                                                                          |

Most of the work is converting the Administration's own components, and that is why the experimental
phase lasts as long as it does: every converted component can break an existing extension, and those
breaks should surface during the experimental phase rather than after the API is declared stable.

## What is supported today

### Vue's own macros

Base components compile as ordinary `<script setup>`, so Vue's macros behave as they do in any Vue 3
project. An override has no props or emits of its own, and reaches the overridden component's through
the override composables instead.

| Macro                                               | Base                                 | Override                 |
| --------------------------------------------------- | ------------------------------------ | ------------------------ |
| `defineProps()`, `withDefaults()`                   | ✅                                   | `useSwProps()` instead   |
| `defineEmits()`, `defineSlots()`, `defineOptions()` | ✅                                   | `useSwContext()` instead |
| `defineExpose()`                                    | ❌ generated from `swDefinePublic()` | ❌                       |
| `defineModel()`                                     | ❌                                   | ❌                       |

### Blocks

| Feature                                                           | Supported |
| ----------------------------------------------------------------- | --------- |
| `<sw-block name="...">` to declare an extension point             | ✅        |
| `<sw-block extends="...">` to contribute to one                   | ✅        |
| `<sw-block-parent />` to render the previous content of the chain | ✅        |
| Several plugins extending the same block                          | ✅        |

### Reaching the component you override

| Feature                                                  | Supported                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| `useSwPreviousState()`, `useSwProps()`, `useSwContext()` | ✅                                                             |
| Replacing a binding with `swDefineOverride()`            | ✅                                                             |
| Writing to the previous state                            | Read only; replace a binding with `swDefineOverride()` instead |
| Overriding a prop                                        | Props are always declared by the base component                |

### Alongside Twig

Both directions work, so a converted component and an unconverted one extend the same way from the
outside. Coverage is not complete, though: the shims handle the shapes components actually use, and an
unusual one can still fall through.

| What you write    | What it extends                                                               | Supported        |
| ----------------- | ----------------------------------------------------------------------------- | ---------------- |
| A `.vue` override | A component that still ships a Twig template and an Options API configuration | ⚠️ in most cases |
| A Twig override   | A component that has been converted to a Single File Component                | ⚠️ in most cases |

### Tooling

| Feature                                                                  | Supported  |
| ------------------------------------------------------------------------ | ---------- |
| Type checking and editor support through the extension tooling           | ✅         |
| Build-time validation, in the build and in your editor                   | ✅         |
| Importing stores, utilities, mixins and DAL helpers through `shopware:*` | ✅         |
| Testing an SFC extension                                                 | ❌ not yet |
| A codemod that converts a component for you                              | ❌ not yet |

## Composables replacing mixins

A Single File Component cannot use a mixin, so the mixins a plugin is likely to use are getting a
composable counterpart:

| Mixin                         | Composable                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `cart-notification`           | ❌ being worked on                                                                          |
| `cms-element`                 | ✅ [`useCmsElement()`](api-reference/composables/use-cms-element)                           |
| `cms-state`                   | ✅ [`useCmsState()`](api-reference/composables/use-cms-state)                               |
| `discard-detail-page-changes` | ❌ being worked on                                                                          |
| `generic-condition`           | ❌ being worked on                                                                          |
| `listing`                     | ✅ [`useListing()`](api-reference/composables/use-listing)                                  |
| `media-grid-listener`         | ✅ [`useMediaGridListener()`](api-reference/composables/use-media-grid-listener)            |
| `media-sidebar-modal-mixin`   | ✅ [`useMediaSidebarModal()`](api-reference/composables/use-media-sidebar-modal)            |
| `notification`                | ✅ [`useNotification()`](api-reference/composables/use-notification)                        |
| `notification-translation`    | ✅ [`useNotificationTranslation()`](api-reference/composables/use-notification-translation) |
| `placeholder`                 | ✅ [`usePlaceholder()`](api-reference/composables/use-placeholder)                          |
| `position`                    | ✅ [`usePosition()`](api-reference/composables/use-position)                                |
| `remove-api-error`            | ❌ being worked on                                                                          |
| `rule-between-operator`       | ✅ [`useRuleBetweenOperator()`](api-reference/composables/use-rule-between-operator)        |
| `ruleContainer`               | ✅ [`useRuleContainer()`](api-reference/composables/use-rule-container)                     |
| `salutation`                  | ✅ [`useSalutation()`](api-reference/composables/use-salutation)                            |
| `sw-extension-error`          | ❌ being worked on                                                                          |
| `sw-form-field`               | ❌ being worked on                                                                          |
| `sw-inline-snippet`           | ✅ [`useInlineSnippet()`](api-reference/composables/use-inline-snippet)                     |
| `translate-with-fallback`     | ✅ [`useTranslateWithFallback()`](api-reference/composables/use-translate-with-fallback)    |
| `user-settings`               | ✅ [`useUserSettings()`](api-reference/composables/use-user-settings)                       |
| `validation`                  | ✅ [`useValidation()`](api-reference/composables/use-validation)                            |
| `video-cover`                 | ✅ [`useVideoCover()`](api-reference/composables/use-video-cover)                           |

Until a composable lands, a component that needs its mixin stays on the Options API. And nothing is
taken away when one arrives: an Options API component keeps using the mixin it always used.

## The Twig shims

The two directions above work through shims. They stay while the Administration's components are being
converted. Like the rest of the system they are experimental, and their removal will be announced on
this roadmap.

## The migration codemod

A codemod that converts an Options API component into a Single File Component is under development. It
is meant for plugin developers too, not only for the Administration's own components.

## Give us feedback

Tell us what you tried to extend and where the system got in your way, what an API made awkward, and
what you could not do at all.

Share your feedback in the
[GitHub discussion on Single File Components](https://github.com/shopware/shopware/discussions/21162).

If you have a reproducible defect, open an issue on
[shopware/shopware](https://github.com/shopware/shopware/issues) and start the title with `[Admin SFC]`.
