---
nav:
  title: useTranslateWithFallback()
  position: 140

---

# `useTranslateWithFallback()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useTranslateWithFallback } from 'shopware:composables';

function useTranslateWithFallback(): {
    tWithFallback: (key: string) => string;
};
```

Translates a snippet key against the active locale and, when there is no entry there, against the
fallback locale.

A plugin cannot import `vue-i18n`, so `<script setup>` has no `t()` of its own. This is how a script
translates a key.

```ts
const { tWithFallback } = useTranslateWithFallback();

const title = computed(() => tWithFallback('swag-margin.detail.title'));
```

A key that exists in neither locale comes back as the key itself.

Replaces the `translate-with-fallback` mixin.
