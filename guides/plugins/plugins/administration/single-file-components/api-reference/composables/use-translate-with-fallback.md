---
nav:
  title: useTranslateWithFallback()
  position: 140

---

# `useTranslateWithFallback()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useTranslateWithFallback } from 'shopware:composables/use-translate-with-fallback';

function useTranslateWithFallback(): {
    tWithFallback: (key: string) => string;
};
```

Translates a snippet key against the active locale and, when there is no entry there, against the
fallback locale.

Plain `t()` only looks at the active locale, so a snippet that exists only in `en-GB` would otherwise
render its raw key into the UI. Reach for this wherever a plugin's snippets may be incomplete for the
locale a merchant is using.

```ts
const { tWithFallback } = useTranslateWithFallback();

const title = computed(() => tWithFallback('swag-margin.detail.title'));
```

A key that exists in neither locale comes back as the key itself.

Replaces the `translate-with-fallback` mixin.
