---
nav:
  title: useCmsState()
  position: 250

---

# `useCmsState()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useCmsState } from 'shopware:composables/use-cms-state';

function useCmsState(): {
    cmsPageState: ComputedRef<CmsPageStore>;
    selectedBlock: WritableComputedRef<Entity<'cms_block'> | null>;
    selectedSection: WritableComputedRef<Entity<'cms_section'> | null>;
    currentDeviceView: ComputedRef<string>;
    isSystemDefaultLanguage: ComputedRef<boolean>;
    category: ComputedRef<ContentEntity<'category'> | null>;
    product: ComputedRef<ContentEntity<'product'> | null>;
    landingPage: ComputedRef<ContentEntity<'landing_page'> | null>;
    contentEntity: ComputedRef<ContentEntity | null>;
    inheritedSlotConfig: ComputedRef<SlotConfigMap | null>;
    getSlotConfigForLanguage: (languageId?: string | null) => SlotConfigMap | null;
};
```

The CMS editor state a block, section or config panel works against: what is selected, which device view
is being previewed, and which entity the layout is being edited on.

`selectedBlock` and `selectedSection` are writable - assigning one selects it, the same way the store
action does:

```ts
const { selectedBlock, currentDeviceView } = useCmsState();

function select(): void {
    selectedBlock.value = props.block;
}
```

`contentEntity` resolves to the category, product or landing page the layout belongs to, decided by the
current route. The three are also available individually, and each reads `null` rather than throwing when
its detail module is not loaded.

`inheritedSlotConfig` is the slot config of the parent language merged field by field with the current
one, which is what makes a partly translated layout inherit the rest instead of shadowing it.

Replaces the `cms-state` mixin.
