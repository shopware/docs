---
nav:
  title: usePlaceholder()
  position: 150

---

# `usePlaceholder()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { usePlaceholder } from 'shopware:composables/use-placeholder';

function usePlaceholder(): {
    placeholder: (entity: Entity<EntityName>, field: keyof Entity<EntityName>, fallbackSnippet: string) => string;
};
```

Reads a translatable field off an entity the way the Administration displays it everywhere else.

```ts
const { placeholder } = usePlaceholder();

const name = computed(() => placeholder(product.value, 'name', 'sw-product.detail.placeholderName'));
```

Four steps, in order: the field on the entity itself, then the parent language's translation, then the
entity's `translated` object, and the snippet you passed as the last resort. That is what makes an
inherited name show up greyed out in a child language instead of showing nothing.

Replaces the `placeholder` mixin.
