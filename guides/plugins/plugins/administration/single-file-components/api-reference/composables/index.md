---
nav:
  title: Composables
  position: 20

---

# Composables

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

The Administration publishes its composables as `shopware:composables/*` modules, one module per composable, named after it in `kebab-case`:

```ts
import { useNotification } from 'shopware:composables/use-notification';
import { useListing } from 'shopware:composables/use-listing';
```

## Override composables

Three composables are not on that list. They are injected by the build like the macros are, so you never import them, and they exist only inside an `.override.vue` file. They are how an override reaches the component it overrides.

<PageRef page="use-sw-previous-state" title="useSwPreviousState()" sub="The state of the component you override" />
<PageRef page="use-sw-props" title="useSwProps()" sub="That component's props, read only" />
<PageRef page="use-sw-context" title="useSwContext()" sub="That component's emit, attrs, slots and expose" />

A base component needs none of them: it declares its own props with `defineProps()` and its own events with `defineEmits()`.

## Replacing a mixin

The Administration's mixins have composable counterparts. In a Single File Component you cannot use a mixin, so these are what you reach for instead - and each one behaves as its mixin did, minus the `this`.

| Composable | Replaces the mixin | What it gives you |
| --- | --- | --- |
| `useInlineSnippet()` | `sw-inline-snippet` | Resolve an inline snippet against the current and fallback locale |
| `useListing()` | `listing` | Pagination, sorting, search and selection state of a list page, kept in sync with the route |
| `useMediaGridListener()` | `media-grid-listener` | Turn the click and selection events of `sw-media-media-item` into a selection |
| `useMediaSidebarModal()` | `media-sidebar-modal-mixin` | Open and close state of the media sidebar's modals |
| `useNotification()` | `notification` | Create notifications |
| `useNotificationTranslation()` | `notification-translation` | Rendering helpers shared by the notification components |
| `usePlaceholder()` | `placeholder` | Resolve an entity field through the parent language's translation before falling back |
| `usePosition()` | `position` | Helpers for the position integers of an entity collection |
| `useRuleBetweenOperator()` | `rule-between-operator` | Render a condition's `between` operator as a from/to pair |
| `useRuleContainer()` | `ruleContainer` | Shared state of a condition container inside `sw-condition-tree` |
| `useSalutation()` | `salutation` | Format a salutation, with the fallback the filter applied |
| `useTranslateWithFallback()` | `translate-with-fallback` | Resolve a snippet key against the active locale, then the fallback |
| `useUserSettings()` | `user-settings` | Read and write per-user config |
| `useValidation()` | `validation` | Run a field value against the rules of the `validation` prop |
| `useVideoCover()` | `video-cover` | Assign and remove the poster image of a video media item |
| `useCmsState()` | `cms-state` | The CMS editor state a block, section or config panel works against |
| `useCmsElement()` | `cms-element` | The config of the CMS element an editor component renders, resolved against defaults and inherited slot config |

<PageRef page="../../../mixins-directives/using-mixins" title="Using mixins" sub="The Options API side, and what each mixin does" />

## Administration state

| Composable | What it gives you |
| --- | --- |
| `useSession()` | The logged-in user, the admin locale and the current language |
| `useSystem()` | The locales the Administration has registered |
| `useSnackbar()` | Add and remove snackbars |
| `useTheme()` | The active light or dark theme |

## Vue's own composables

`ref`, `computed`, `watch`, `onMounted` and the rest come from `vue` and behave exactly as they do in any Vue 3 project:

```ts
import { computed, ref } from 'vue';
```
