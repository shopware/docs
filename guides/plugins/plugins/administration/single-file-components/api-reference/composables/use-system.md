---
nav:
  title: useSystem()
  position: 80

---

# `useSystem()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useSystem } from 'shopware:composables/use-system';

function useSystem(): {
    locales: Ref<string[]>;
    registerAdminLocale: (locale: string) => void;
};
```

The locales the Administration has registered.

[`setAdminLocale()`](use-session) refuses a locale that is not in this list, so a plugin shipping a new
one registers it here first. Registering the same locale twice is a no-op.
