---
nav:
  title: useCmsElementDeprecated()
  position: 270

---

# `useCmsElementDeprecated()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useCmsElementDeprecated } from 'shopware:composables/use-cms-element-deprecated';

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

Do not reach for this one in new code - [`useCmsElement()`](use-cms-element) is the API.

It exists so the migration codemod has a target that behaves exactly like the `cms-element` mixin did: the
defaults are written into the `element` object you pass in, by an `initElementConfig()` you have to call
yourself, and every config write lands on that same object rather than going through the `cmsPage` store.
Migrating the shape of a component and its behaviour in one step is how a CMS element quietly stops
syncing, so the codemod does one and leaves you the other.

So you will meet it in a component the codemod has already migrated, and the step after that is moving it
to `useCmsElement()`.

## Migrating to `useCmsElement()`

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
  every time it is read, so there is no initialization step left.
* **Reading `element.config.someKey`** becomes `getConfigValue('someKey')`, or `config.value.someKey`. Both
  give you the resolved value, defaults included, which the raw element only held after `initElementConfig()`
  had run.
* **Writing `element.config.someKey`** becomes `setConfigValue('someKey', value)`, which goes through the
  `cmsPage` store. The element itself is read-only now.
* **`initElementData()`** has no counterpart either. It merged an element type's `defaultData` into
  `element.data`; drop the call.
* **`cmsElements`, `getDemoValue()` and everything from [`useCmsState()`](use-cms-state)** are unchanged.

Replaces the `cms-element` mixin, one-to-one.
