---
nav:
  title: useModuleIconColors()
  position: 120

---

# `useModuleIconColors()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useModuleIconColors } from 'shopware:composables/use-module-icon-colors';

function useModuleIconColors(): {
    enabled: Ref<boolean>;
    loadUserModuleIconColors: () => Promise<void>;
    saveUserModuleIconColors: (enabled: boolean) => Promise<void>;
};
```

The opt-in preference that paints the admin menu icons, the search bar icons and the default media
folders in the color of their module - the `color` a module passes to `Module.register()`.

Off by default, so the icons use the neutral icon token. The state is app-wide and the preference is
stored server-side, per user.
