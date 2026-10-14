---
nav:
  title: Composables
  position: 20

---

# Composables

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

All composables the Administration offers are experimental. Their names, options and return values can
still change without a deprecation, so note which ones you rely on and tell us when one of them does not
fit what you are building.

## Override composables

Three of them are provided by the build in every `.override.vue` file. Like the macros, you never import
them, and they exist only inside an override file. They are how an override reaches the component it overrides.

<PageRef page="use-sw-previous-state" title="useSwPreviousState()" sub="The state of the component you override" />
<PageRef page="use-sw-props" title="useSwProps()" sub="That component's props, read only" />
<PageRef page="use-sw-context" title="useSwContext()" sub="That component's emit, attrs, slots and expose" />

A base component needs none of them: it declares its own props with `defineProps()` and its own events
with `defineEmits()`.

## Administration composables

Everything else is imported by name from the `shopware:composables` virtual module:

```ts
import { useNotification } from 'shopware:composables';
```

Each composable is also available as a default export of its own import path, named after it in `camelCase`
(`import useNotification from 'shopware:composables/useNotification'`).

Each of them is the Composition API side of a mixin. A mixin declared its own props and read them off
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

### User settings

<PageRef page="use-user-settings" title="useUserSettings()" sub="Read and write per-user config" />

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
