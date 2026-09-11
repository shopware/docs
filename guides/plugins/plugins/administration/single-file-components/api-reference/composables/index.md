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

Most of them are the Composition API side of a mixin. A mixin declared its own props and read them off
`this`; a composable has neither, so whatever the mixin used to take from its host is passed in, and
getters keep it reactive:

```ts
const { isBetween, betweenValue } = useRuleBetweenOperator({
    condition: () => props.condition,
    ensureValueExist: () => emit('ensure-value-exist'),
});
```

The mixins stay where they are, so an Options API component that has not been migrated keeps working.

<PageRef page="../../../mixins-directives/using-mixins" title="Using mixins" sub="The Options API side, and what each mixin does" />

### Notifications

<PageRef page="use-notification" title="useNotification()" sub="The notifications in the top right, and the system ones" />
<PageRef page="use-notification-translation" title="useNotificationTranslation()" sub="Translate and sanitize a notification for rendering" />
<PageRef page="use-snackbar" title="useSnackbar()" sub="Add and remove snackbars" />

### Session and context

<PageRef page="use-session" title="useSession()" sub="The logged-in user, their privileges and the admin locale" />
<PageRef page="use-system" title="useSystem()" sub="The locales the Administration has registered" />
<PageRef page="use-context" title="useContext()" sub="The app and API context behind Shopware.Context" />
<PageRef page="use-user-settings" title="useUserSettings()" sub="Read and write per-user config" />
<PageRef page="use-theme" title="useTheme()" sub="The light or dark appearance, and the user's preference" />
<PageRef page="use-module-icon-colors" title="useModuleIconColors()" sub="The opt-in colored module icons" />

### Text and formatting

<PageRef page="use-inline-snippet" title="useInlineSnippet()" sub="Resolve a snippet a merchant translated themselves" />
<PageRef page="use-translate-with-fallback" title="useTranslateWithFallback()" sub="Translate against the active locale, then the fallback" />
<PageRef page="use-placeholder" title="usePlaceholder()" sub="Read a translatable field the way the Administration displays it" />
<PageRef page="use-salutation" title="useSalutation()" sub="Format a salutation, with its fallback" />

### Lists and forms

<PageRef page="use-listing" title="useListing()" sub="Pagination, sorting, search and selection, kept in the route" />
<PageRef page="use-position" title="usePosition()" sub="The position integers of an entity collection" />
<PageRef page="use-validation" title="useValidation()" sub="Run a value against the rules of the validation prop" />

### Rule builder

<PageRef page="use-rule-container" title="useRuleContainer()" sub="The state of a condition container in sw-condition-tree" />
<PageRef page="use-rule-between-operator" title="useRuleBetweenOperator()" sub="Render a between operator as a from/to pair" />

### Media

<PageRef page="use-media-grid-listener" title="useMediaGridListener()" sub="Turn media grid events into a selection" />
<PageRef page="use-media-sidebar-modal" title="useMediaSidebarModal()" sub="The media sidebar's modals, and what they report" />
<PageRef page="use-video-cover" title="useVideoCover()" sub="Assign and remove a video's poster image" />

### CMS

<PageRef page="use-cms-state" title="useCmsState()" sub="The CMS editor state a block or config panel works against" />
<PageRef page="use-cms-element" title="useCmsElement()" sub="An element's resolved config, and the writes that change it" />
<PageRef page="use-cms-element-deprecated" title="useCmsElementDeprecated()" sub="What the codemod targets, and how to move off it" />

### Block system

<PageRef page="use-block-context" title="useBlockContext()" sub="The registry behind sw-block" />

## Vue's own composables

`ref`, `computed`, `watch`, `onMounted` and the rest come from `vue` and behave exactly as they do in any
Vue 3 project:

```ts
import { computed, ref } from 'vue';
```
