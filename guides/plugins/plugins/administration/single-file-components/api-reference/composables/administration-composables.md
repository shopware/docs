---
nav:
  title: Administration composables
  position: 60

---

# Administration composables

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

The composables the Administration is built from. All of them are experimental: names, options and
return values can still change without a deprecation, so pin down what you rely on and tell us when
one of them does not fit what you are building.

Each lives in its own module, named after the composable in `kebab-case`:

```ts
import { useNotification } from 'shopware:composables/use-notification';
import { useListing } from 'shopware:composables/use-listing';
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

## Notifications

### `useNotification()`

```ts
function useNotification(): {
    createNotification: (notification: NotificationType) => string | null;
    createNotificationSuccess: (config: NotificationType) => void;
    createNotificationInfo: (config: NotificationType) => void;
    createNotificationWarning: (config: NotificationType) => void;
    createNotificationError: (config: NotificationType) => void;
    createSystemNotification: (config: NotificationType) => void;
    createSystemNotificationSuccess: (config: NotificationType) => void;
    createSystemNotificationInfo: (config: NotificationType) => void;
    createSystemNotificationWarning: (config: NotificationType) => void;
    createSystemNotificationError: (config: NotificationType) => void;
};
```

Creates the notifications that appear in the top right of the Administration. The four `create*` variants
fill in the variant and a default title, so a message is all you have to pass; the `createSystem*` variants
mark the notification as a system notification, which is what the notification center keeps.

Replaces the `notification` mixin.

```ts
const { createNotificationSuccess } = useNotification();

createNotificationSuccess({ message: 'Margin recalculated' });
```

### `useNotificationTranslation()`

```ts
function useNotificationTranslation(): {
    getTranslatedTitle: (notification: NotificationType) => string;
    getTranslatedMessage: (notification: NotificationType) => string;
};
```

The rendering helpers the notification components share: a snippet key is translated, a plain string passes
through, and the message is sanitized down to `a`, `b`, `i`, `u`, `strong`, `em` and `br`.

Replaces the `notification-translation` mixin.

### `useSnackbar()`

```ts
function useSnackbar(): {
    addSnackbar: (config: Omit<Snackbar, 'id'>) => Snackbar;
    removeSnackbar: (id: string) => void;
};
```

Snackbars, the short-lived bar at the bottom of the screen. Wraps the Meteor component library's own
`useSnackbar()`, so `config` is a Meteor `Snackbar` without its `id`, and `addSnackbar` returns the
snackbar it created, `id` included.

## Session and context

### `useSession()`

```ts
function useSession(): {
    currentUser: Ref<Entity<'user'> | null>;
    userPending: ComputedRef<boolean>;
    languageId: Ref<string>;
    currentLocale: Ref<string | null>;
    adminLocaleLanguage: ComputedRef<string | null>;
    adminLocaleRegion: ComputedRef<string | null>;
    userPrivileges: ComputedRef<string[]>;
    setAdminLocale: (locale: string) => Promise<void>;
    setCurrentUser: (user: Entity<'user'>) => void;
    removeCurrentUser: () => void;
    setAdminLocaleState: (state: { locales: string[]; locale: string; languageId: string }) => void;
};
```

The logged-in user and the locale the Administration is displayed in. `adminLocaleLanguage` and
`adminLocaleRegion` are the two halves of `currentLocale`, so `en-GB` gives `en` and `GB`.
`userPrivileges` is every privilege of every ACL role the user holds, flattened.

The state is app-wide, not per component: two callers get the same refs.

### `useSystem()`

```ts
function useSystem(): {
    locales: Ref<string[]>;
    registerAdminLocale: (locale: string) => void;
};
```

The locales the Administration has registered. `setAdminLocale()` refuses a locale that is not in this
list, so a plugin shipping a new one registers it here first.

### `useContext()`

```ts
function useContext(): ContextState['app'] & ContextState['api'] & {
    addAppValue: <K>(payload: { key: K; value: ContextState['app'][K] }) => void;
    addApiValue: <K>(payload: { key: K; value: ContextState['api'][K] }) => void;
    addAppConfigValue: <K>(payload: { key: K; value: ContextState['app']['config'][K] }) => void;
    setApiLanguageId: (languageId: EntityKey<'language'>) => void;
    resetLanguageToDefault: () => void;
    isSystemDefaultLanguage: ComputedRef<boolean>;
};
```

The application and API context: `app` carries the environment, the feature flags, the registered bundles,
the fallback locale and the system currency; `api` carries the API paths, the auth token and the language
and version the requests are made in. It is the same state as the global `Shopware.Context`.

### `useUserSettings()`

```ts
function useUserSettings(): {
    getUserSettingsEntity: (identifier: string, userId?: string | null) => Promise<UserSettingsEntity | null>;
    getUserSettings: (identifier: string, userId?: string | null) => Promise<unknown>;
    saveUserSettings: (identifier: string, entityValue: Record<string, any>, userId?: string | null) => Promise<unknown>;
    userGridSettingsCriteria: (identifier: string, userId?: string | null) => Criteria;
};
```

Reads and writes `user_config`, the per-user key-value store behind things like a data grid's column layout.
An identifier without a dot is namespaced to `custom.`, and every call is guarded by the `user_config` ACL
privileges - a caller without them gets a rejected promise.

Replaces the `user-settings` mixin.

### `useTheme()`

```ts
function useTheme(): {
    theme: Ref<'light' | 'dark' | 'system'>;
    resolvedTheme: ComputedRef<'light' | 'dark'>;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    stop: () => void;
    loadUserTheme: () => Promise<void>;
    saveUserTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
};
```

The light or dark appearance. `theme` is what the user picked and `resolvedTheme` is what is actually
rendered, with `system` already resolved against the operating system. `loadUserTheme()` and
`saveUserTheme()` are the Administration's addition: they read and write the preference server-side, in the
user's configuration.

### `useModuleIconColors()`

```ts
function useModuleIconColors(): {
    enabled: Ref<boolean>;
    loadUserModuleIconColors: () => Promise<void>;
    saveUserModuleIconColors: (enabled: boolean) => Promise<void>;
};
```

The opt-in preference that paints the menu icons, the search bar icons and the default media folders in the
color of their module - the `color` a module passes to `Module.register()`. Off by default.

## Text and formatting

### `useInlineSnippet()`

```ts
function useInlineSnippet(): {
    getInlineSnippet: (value: { [locale: string]: string }) => string | { [locale: string]: string };
};
```

Resolves an inline snippet - an object keyed by locale, as configuration fields store them - against the
current locale, then the fallback locale, then the first non-empty entry.

Replaces the `sw-inline-snippet` mixin.

### `useTranslateWithFallback()`

```ts
function useTranslateWithFallback(): {
    tWithFallback: (key: string) => string;
};
```

Translates a snippet key against the active locale and, when it has no entry there, against the fallback
locale. Plain `t()` only looks at the active locale, so a snippet that exists only in `en-GB` would
otherwise render its raw key.

Replaces the `translate-with-fallback` mixin.

### `usePlaceholder()`

```ts
function usePlaceholder(): {
    placeholder: (entity: Entity<EntityName>, field: string, fallbackSnippet: string) => string;
};
```

Reads a translatable field off an entity the way the Administration displays it: the field itself first,
then the parent language's translation, then the entity's `translated` object, and the snippet you passed
as the last resort.

Replaces the `placeholder` mixin.

### `useSalutation()`

```ts
function useSalutation(): {
    salutation: (entity: SalutationFilterEntityType, fallbackSnippet?: string) => string;
};
```

Formats the salutation of a customer-like entity, using the `salutation` filter and its fallback.

Replaces the `salutation` mixin.

## Lists and forms

### `useListing()`

```ts
function useListing(options: {
    getList: () => void | Promise<void>;
    filters?: () => ListingFilter[];
    page?: number;
    limit?: number;
    sortBy?: string | null;
    sortDirection?: string;
    naturalSorting?: boolean;
    term?: string;
    disableRouteParams?: boolean;
    searchConfigEntity?: string | null;
    storeKey?: string;
    filterCriteria?: unknown[];
    // …
}): UseListingReturn;
```

Everything a list page needs: pagination, sorting, the search term, the active filters and the current
selection, all kept in sync with the route query so a page survives a reload and a browser back.

`getList` is the only mandatory option - it is your own loader, and the composable calls it whenever the
listing state changes. `filters` is the second callback, returning the filters the page offers.

What comes back is the state as refs (`page`, `limit`, `total`, `sortBy`, `sortDirection`, `term`,
`selection`, …), the derived values (`maxPage`, `selectionCount`, `selectionArray`, `currentSortBy`), and
the handlers a data grid expects (`onPageChange`, `onSearch`, `onSort`, `onSortColumn`, `onSwitchFilter`,
`onRefresh`, `updateSelection`, `resetListing`).

One difference to the mixin: the first load runs in `onMounted()` rather than `created()`, because
`getList` is a callback that can only exist once the call has returned.

Replaces the `listing` mixin.

```ts
const { page, limit, total, onPageChange } = useListing({
    getList: () => loadProducts(),
});
```

### `usePosition()`

```ts
function usePosition(): {
    getNewPosition: (repository, criteria, context, field?) => Promise<number>;
    lowerPositionValue: (collection, selectedItem, field?) => EntityCollection;
    raisePositionValue: (collection, selectedItem, field?) => EntityCollection;
    changePosition: (collection, selectedItem, field?, direction?) => EntityCollection;
    getSiblingIndex: (collection, selectedItem, field?, direction?) => number;
    getSibling: (collection, selectedItem, field?, direction?) => Entity | null;
    renumberPositions: (collection, startIndex?, field?) => EntityCollection;
};
```

Helpers for the `position` integers that order an entity collection: find the next free one, swap an item
with its neighbour, or renumber the collection from scratch. `field` defaults to `'position'`.

Replaces the `position` mixin.

### `useValidation()`

```ts
function useValidation(options: { validation: () => ValidationRules }): {
    validationService: ValidationService;
    validate: (value: unknown) => boolean;
    validateRule: (value: unknown, rule: string) => boolean;
};
```

Runs a value against validation rules - a boolean, a rule name, a comma-separated list of them, or an array.
The rules arrive as a getter so they stay reactive.

Unlike the mixin there is no `isValid`: the mixin guessed the field's current value from `currentValue`,
`value` or `selections`, which a composable cannot do. Pass the value to `validate()` instead.

Replaces the `validation` mixin.

## Rule builder

### `useRuleContainer()`

```ts
function useRuleContainer(options: {
    condition: () => RuleConditionNode;
    level: () => number;
    disabled: () => boolean;
    onAddPlaceholder: () => void;
}): {
    conditionDataProviderService: ComputedRef<unknown>;
    childAssociationField: ComputedRef<string>;
    createCondition: (conditionData: unknown, parentId: string | null, position: number) => RuleConditionNode;
    insertNodeIntoTree: (parentCondition: RuleConditionNode, childToInsert: RuleConditionNode) => void;
    removeNodeFromTree: (parentCondition: RuleConditionNode, childToRemove: RuleConditionNode) => void;
    containerRowClass: ComputedRef<ContainerRowClass>;
    nextPosition: ComputedRef<number>;
};
```

The state a condition container inside `sw-condition-tree` works against. The tree provides the service and
the tree-editing functions; the composable injects them and adds the row class for the nesting level.
`onAddPlaceholder` is called when the container runs out of children.

Replaces the `ruleContainer` mixin.

### `useRuleBetweenOperator()`

```ts
function useRuleBetweenOperator(options: {
    condition: () => RuleCondition | null | undefined;
    ensureValueExist: () => void;
}): {
    isBetween: ComputedRef<boolean>;
    betweenValue: WritableComputedRef<{ from: string | null; to: string | null }>;
};
```

Renders a condition's `between` operator as a from/to pair on a date or datetime field. `betweenValue` is
writable, and writing calls `ensureValueExist()` first, the way the mixin did through its host.

Replaces the `rule-between-operator` mixin.

## Media

### `useMediaGridListener()`

```ts
function useMediaGridListener(options: {
    selectableItems: () => MediaGridItem[];
    onFolderChange: (folderId: string) => void;
}): {
    selectedItems: ShallowRef<MediaGridItem[]>;
    listSelectionStartItem: ShallowRef<MediaGridItem | null>;
    mediaItemSelectionHandler: ComputedRef<Record<string, (event: MediaGridItemEvent) => void>>;
    isListSelect: ComputedRef<boolean>;
    isItemSelected: (item: MediaGridItem) => boolean;
    showItemSelected: (item: MediaGridItem) => boolean;
    clearSelection: () => void;
    navigateToFolder: (event: { item: MediaGridItem }) => void;
    showDetails: (gridItem: MediaGridItem) => void;
    // plus the three raw event handlers
};
```

Turns the click and selection events of `sw-media-media-item` into a selection, `ctrl`/`cmd` toggling and
`shift` ranges included. Bind `mediaItemSelectionHandler` with `v-on` and the grid is wired up;
`selectableItems` is the order a `shift` range is resolved against.

Replaces the `media-grid-listener` mixin.

### `useMediaSidebarModal()`

```ts
function useMediaSidebarModal(options: {
    onItemsDelete: (ids: string[]) => void;
    onFolderItemsDissolve: (ids: string[]) => void;
    onItemsMove: (ids: string[]) => void;
}): {
    showModalReplace: Ref<boolean>;
    showModalDelete: Ref<boolean>;
    showFolderSettings: Ref<boolean>;
    showFolderDissolve: Ref<boolean>;
    showModalMove: Ref<boolean>;
    // an open*/close* pair per modal
    deleteSelectedItems: (ids: string[]) => void;
    onFolderDissolved: (ids: string[]) => void;
    onFolderMoved: (ids: string[]) => void;
};
```

The open and close state of the media sidebar's modals. Opening is guarded by the media ACL privileges, and
the three handlers close their modal and report what it did a tick later, so the caller's reload does not
race the teardown. Where the mixin emitted events, this takes callbacks.

Replaces the `media-sidebar-modal-mixin`.

### `useVideoCover()`

```ts
function useVideoCover(options: { item: () => VideoCoverMedia | null | undefined }): {
    showCoverSelectionModal: Ref<boolean>;
    isVideoMedia: ComputedRef<boolean>;
    hasVideoCover: ComputedRef<boolean>;
    openCoverSelectionModal: () => void;
    closeCoverSelectionModal: () => void;
    onCoverSelectionChange: (selection: VideoCoverMedia[]) => Promise<void>;
    persistCoverMedia: (coverMediaId: string | null) => Promise<void>;
    removeVideoCover: () => Promise<void>;
    isImage: (media?: VideoCoverMedia | null) => boolean;
    isVideo: (item?: VideoCoverMedia | null) => boolean;
    getCoverMediaId: (item?: VideoCoverMedia | null) => string | null;
};
```

Assigns and removes the poster image of a video media item, notifications included.

Replaces the `video-cover` mixin.

## CMS

### `useCmsState()`

```ts
function useCmsState(): {
    cmsPageState: ComputedRef<CmsPageStore>;
    selectedBlock: WritableComputedRef<Entity<'cms_block'> | null>;
    selectedSection: WritableComputedRef<Entity<'cms_section'> | null>;
    currentDeviceView: ComputedRef<'desktop' | 'tablet-landscape' | 'mobile'>;
    isSystemDefaultLanguage: ComputedRef<boolean>;
    category: ComputedRef<ContentEntity<'category'> | null>;
    product: ComputedRef<ContentEntity<'product'> | null>;
    landingPage: ComputedRef<ContentEntity<'landing_page'> | null>;
    contentEntity: ComputedRef<ContentEntity | null>;
    inheritedSlotConfig: ComputedRef<SlotConfigMap | null>;
    getSlotConfigForLanguage: (languageId?: string | null) => SlotConfigMap | null;
};
```

The CMS editor state a block, section or config panel works against: what is selected, which device view is
being previewed, and which entity the layout is being edited on. `selectedBlock` and `selectedSection` are
writable - assigning one selects it.

Replaces the `cms-state` mixin.

### `useCmsElement()`

```ts
function useCmsElement(options: {
    element: () => RuntimeSlot;
    defaultConfig?: () => Record<string, unknown> | null;
}): ReturnType<typeof useCmsState> & {
    cmsElements: ComputedRef<Record<string, CmsElementConfig | undefined>>;
    config: ComputedRef<CmsSlotConfig>;
    getConfigValue: (path: string) => unknown;
    setConfigValue: (path: string, value: unknown) => void;
    getDemoValue: (mappingPath: string) => unknown;
};
```

The API a CMS element's editor component works against. `config` is the element's config resolved against the
element type's defaults and the inherited slot config, without writing either back into the element;
`setConfigValue()` goes through the `cmsPage` store. Both paths are relative to the element's config, such as
`'media.value'`.

Everything `useCmsState()` returns comes back as well, because the mixin composed it and components relied on
that.

Replaces the `cms-element` mixin - though a component the codemod migrated lands on
[`useCmsElementDeprecated()`](#usecmselementdeprecated) first, and moves here in a second step.

### `useCmsElementDeprecated()`

```ts
function useCmsElementDeprecated(options: {
    element: () => RuntimeSlot;
    defaultConfig?: () => Record<string, unknown> | null;
}): ReturnType<typeof useCmsState> & {
    cmsElements: ComputedRef<Record<string, CmsElementConfig | undefined>>;
    initElementConfig: () => void;
    initBaseConfig: () => void;
    applyContentOverride: () => void;
    initElementData: (elementName: string) => void;
    getDemoValue: (mappingPath: string) => unknown;
};
```

Do not reach for this one in new code - `useCmsElement()` is the API. It exists so the migration codemod
has a target that behaves exactly like the `cms-element` mixin did: the defaults are written into the
`element` object you pass in, by an `initElementConfig()` you have to call yourself, and every config
write lands on that same object rather than going through the `cmsPage` store.

So you will meet it in a component the codemod has already migrated, and the step after that is moving it
to `useCmsElement()`.

#### Migrating to `useCmsElement()`

What the codemod leaves behind:

```ts
const props = defineProps<{
    element: RuntimeSlot;
    defaultConfig?: Record<string, unknown> | null;
}>();

const { initElementConfig, initElementData, getDemoValue } = useCmsElementDeprecated({
    element: () => props.element,
    defaultConfig: () => props.defaultConfig ?? null,
});

onMounted(() => {
    initElementConfig();
    initElementData('swag-margin-element');
});

function onMediaChange(mediaId: string): void {
    props.element.config.media.value = mediaId;
}
```

The same component on `useCmsElement()`:

```ts
const props = defineProps<{
    element: RuntimeSlot;
    defaultConfig?: Record<string, unknown> | null;
}>();

const { config, getConfigValue, setConfigValue, getDemoValue } = useCmsElement({
    element: () => props.element,
    defaultConfig: () => props.defaultConfig ?? null,
});

function onMediaChange(mediaId: string): void {
    setConfigValue('media.value', mediaId);
}
```

Member by member:

* **`initElementConfig()`, `initBaseConfig()`, `applyContentOverride()`** have no counterpart, and there is
  nothing to replace them with. `config` resolves the element type's defaults and the inherited slot config
  every time it is read, so there is no initialization step and no lifecycle hook to hang it on.
* **Reading `element.config.someKey`** becomes `getConfigValue('someKey')`, or `config.value.someKey`. Both
  give you the resolved value, defaults included, which the raw element only held after `initElementConfig()`
  had run.
* **Writing `element.config.someKey`** becomes `setConfigValue('someKey', value)`, which goes through the
  `cmsPage` store. The element itself is read-only now.
* **`initElementData()`** has no counterpart either. It merged an element type's `defaultData` into
  `element.data`; drop the call.
* **`cmsElements`, `getDemoValue()` and everything from [`useCmsState()`](#usecmsstate)** are unchanged.

The paths both config functions take are relative to the element's config, so a nested value is
`'media.value'`, not `'config.media.value'`.

## Block system

### `useBlockContext()`

```ts
function useBlockContext(): {
    blockContext: Record<string, Slot[]>;
    getBlocks: (blockName: string) => Slot[];
    addBlock: (blockName: string, block?: Slot) => void;
    removeBlock: (blockName: string, block?: Slot) => void;
};
```

The registry behind the block components: which extensions have contributed content to which block name.
`<sw-block>` reads and writes it for you, so an extension normally never touches this - reach for it only to
inspect what is registered.

<PageRef page="../block-components/" title="Block components" sub="sw-block and sw-block-parent, the API you actually write" />
