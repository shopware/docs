---
nav:
  title: usePlaceholder()
  position: 150

---

# `usePlaceholder()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { usePlaceholder } from 'shopware:composables';

function usePlaceholder(): {
    placeholder: (entity: Entity<EntityName>, field: keyof Entity<EntityName>, fallbackSnippet: string) => string;
};
```

Reads a translatable field off an entity the way the Administration displays it everywhere else - mostly
as the `placeholder` attribute of a translatable input.

```ts
const { placeholder } = usePlaceholder();
const { tWithFallback } = useTranslateWithFallback();

const namePlaceholder = computed(() =>
    placeholder(product.value, 'name', tWithFallback('sw-product.detail.placeholderName')),
);
```

Four steps, in order: the field on the entity itself, then the parent language's translation, then the
entity's `translated` object, and the fallback you passed as the last resort. That is what makes an
inherited name show up greyed out in a child language instead of showing nothing.

The fallback is returned as it is, so pass translated text, not a snippet key.

Replaces the `placeholder` mixin.
