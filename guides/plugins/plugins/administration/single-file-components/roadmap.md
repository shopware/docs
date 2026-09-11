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

The system is available now. There is no feature flag to enable and nothing to opt into - a `.vue` file
in your plugin is compiled by the extension build as it is.

Experimental means the API can still change, at any time and without a deprecation. The plan is for it
to become a stable, deprecation-protected API in **6.9** - a plan rather than a promise, because how
much it still has to change depends on what you run into and on how the Administration's own migration
goes.

## Timeline

| When | What happens |
| --- | --- |
| Today | The extension system is available, and experimental. Build something with it and tell us what you find. |
| 6.8 | The Administration's private components are converted, and run in production for the first time. |
| 6.9 | Planned: the extension system becomes a stable API, and a first handful of public components are converted with it. |
| Later | The remaining components follow. The shims keep working for a while after that. |

Converting the Administration's own components is the larger half of the work, and it is why the
experimental phase lasts as long as it does: every component that changes shape is one more chance for
an extension to break, and we would rather find those now than in a major.

## What is supported today

### Vue's own macros

Base components compile as ordinary `<script setup>`, so Vue's macros behave as they do in any Vue 3
project. An override has no props or emits of its own, and reaches the overridden component's through
the override composables instead.

| Macro | Base | Override |
| --- | --- | --- |
| `defineProps()`, `withDefaults()` | ✅ | `useSwProps()` instead |
| `defineEmits()`, `defineSlots()`, `defineExpose()`, `defineOptions()` | ✅ | `useSwContext()` instead |
| `defineModel()` | ❌ | ❌ |

### Blocks

| Feature | Supported |
| --- | --- |
| `<sw-block name="...">` to declare an extension point | ✅ |
| `<sw-block extends="...">` to contribute to one | ✅ |
| `<sw-block-parent />` to render the previous content of the chain | ✅ |
| Several plugins extending the same block | ✅ |

### Reaching the component you override

| Feature | Supported |
| --- | --- |
| `useSwPreviousState()`, `useSwProps()`, `useSwContext()` | ✅ |
| Replacing a binding with `swDefineOverride()` | ✅ |
| Writing to the previous state | Read only; replace a binding with `swDefineOverride()` instead |
| Overriding a prop | Props are always declared by the base component |

### Alongside Twig

Both directions work, so a converted component and an unconverted one extend the same way from the
outside. Coverage is not complete, though: the shims handle the shapes components actually use, and an
unusual one can still fall through.

| What you write | What it extends | Supported |
| --- | --- | --- |
| A `.vue` override | A component that still ships a Twig template and an Options API configuration | ⚠️ in most cases |
| A Twig override | A component that has been converted to a Single File Component | ⚠️ in most cases |

### Tooling

| Feature | Supported |
| --- | --- |
| Type checking and editor support through the extension tooling | ✅ |
| Build-time validation, in the build and in your editor | ✅ |
| Importing stores, utilities, mixins and DAL helpers through `shopware:*` | ✅ |
| Testing an SFC extension | ❌ not yet |
| A codemod that converts a component for you | ❌ not yet |

## Composables replacing mixins

A Single File Component cannot use a mixin, so every mixin a plugin may reasonably use is getting a
composable counterpart:

| Mixin | Composable |
| --- | --- |
| `cart-notification` | ❌ being worked on |
| `cms-element` | ✅ [`useCmsElement()`](api-reference/composables/use-cms-element) |
| `cms-state` | ✅ [`useCmsState()`](api-reference/composables/use-cms-state) |
| `discard-detail-page-changes` | ❌ being worked on |
| `generic-condition` | ❌ being worked on |
| `listing` | ✅ [`useListing()`](api-reference/composables/use-listing) |
| `media-grid-listener` | ✅ [`useMediaGridListener()`](api-reference/composables/use-media-grid-listener) |
| `media-sidebar-modal-mixin` | ✅ [`useMediaSidebarModal()`](api-reference/composables/use-media-sidebar-modal) |
| `notification` | ✅ [`useNotification()`](api-reference/composables/use-notification) |
| `notification-translation` | ✅ [`useNotificationTranslation()`](api-reference/composables/use-notification-translation) |
| `placeholder` | ✅ [`usePlaceholder()`](api-reference/composables/use-placeholder) |
| `position` | ✅ [`usePosition()`](api-reference/composables/use-position) |
| `remove-api-error` | ❌ being worked on |
| `rule-between-operator` | ✅ [`useRuleBetweenOperator()`](api-reference/composables/use-rule-between-operator) |
| `ruleContainer` | ✅ [`useRuleContainer()`](api-reference/composables/use-rule-container) |
| `salutation` | ✅ [`useSalutation()`](api-reference/composables/use-salutation) |
| `sw-extension-error` | ❌ being worked on |
| `sw-form-field` | ❌ being worked on |
| `sw-inline-snippet` | ✅ [`useInlineSnippet()`](api-reference/composables/use-inline-snippet) |
| `translate-with-fallback` | ✅ [`useTranslateWithFallback()`](api-reference/composables/use-translate-with-fallback) |
| `user-settings` | ✅ [`useUserSettings()`](api-reference/composables/use-user-settings) |
| `validation` | ✅ [`useValidation()`](api-reference/composables/use-validation) |
| `video-cover` | ✅ [`useVideoCover()`](api-reference/composables/use-video-cover) |

Until a composable lands, a component that needs its mixin stays on the Options API. And nothing is
taken away when one arrives: an Options API component keeps using the mixin it always used.

## The Twig shims

The two directions above work through shims. They stay for as long as the migration needs, likely
across several majors, and are removed once everything has stabilized and everyone has had the chance
to migrate.

## The migration codemod

A codemod that converts an Options API component into a Single File Component is under development. It
is meant for plugin developers too, not only for the Administration's own components.

## Give us feedback

This is what the experimental phase is for. Tell us what you tried to extend and where the system got
in your way, what an API made awkward, and what you could not do at all.

`<insert link here>`

If you have a reproducible defect rather than feedback, an issue on
[shopware/shopware](https://github.com/shopware/shopware/issues) is the faster route.
