---
nav:
  title: useInlineSnippet()
  position: 130

---

# `useInlineSnippet()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useInlineSnippet } from 'shopware:composables/use-inline-snippet';

function useInlineSnippet(): {
    getInlineSnippet: (value: { [locale: string]: string }) => string | { [locale: string]: string };
};
```

Resolves an inline snippet: an object keyed by locale, the way a configuration field stores a label a
merchant translated themselves.

```ts
const { getInlineSnippet } = useInlineSnippet();

// { 'de-DE': 'Marge', 'en-GB': 'Margin' } -> 'Margin' in an English Administration
const label = computed(() => getInlineSnippet(props.element.config.label.value));
```

It tries the current locale, then the fallback locale, then the first entry that is not empty. When the
value is not an object at all it comes back unchanged, so a plain string passes through.

Replaces the `sw-inline-snippet` mixin.
