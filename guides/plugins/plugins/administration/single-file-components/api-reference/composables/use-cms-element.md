---
nav:
  title: useCmsElement()
  position: 260

---

# `useCmsElement()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useCmsElement } from 'shopware:composables/use-cms-element';

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

The API a CMS element's editor component works against.

```ts
const { config, getConfigValue, setConfigValue } = useCmsElement({
    element: () => props.element,
    defaultConfig: () => props.defaultConfig ?? null,
});

function onMediaChange(mediaId: string): void {
    setConfigValue('media.value', mediaId);
}
```

`config` is the element's config resolved against the element type's `defaultConfig` and the inherited
slot config, resolved on every read rather than written back into the element. So there is no
initialization step, and no lifecycle hook to hang one on.

The element itself is read-only: `setConfigValue()` goes through the `cmsPage` store, which is what keeps
the rest of the editor in sync. Both config functions take a path relative to the element's config, so a
nested value is `'media.value'`, not `'config.media.value'`.

Everything [`useCmsState()`](use-cms-state) returns comes back as well, because the mixin composed it and
components relied on that.

`getDemoValue()` resolves a mapping path against the demo entity the editor is previewing with.

Replaces the `cms-element` mixin - though a component the codemod migrated lands on
[`useCmsElementDeprecated()`](use-cms-element-deprecated) first, and moves here in a second step.
