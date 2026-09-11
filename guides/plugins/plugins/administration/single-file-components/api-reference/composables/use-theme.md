---
nav:
  title: useTheme()
  position: 110

---

# `useTheme()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useTheme } from 'shopware:composables/use-theme';

function useTheme(): {
    theme: Ref<'light' | 'dark' | 'system'>;
    resolvedTheme: ComputedRef<'light' | 'dark'>;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    stop: () => void;
    loadUserTheme: () => Promise<void>;
    saveUserTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
};
```

The light or dark appearance of the Administration.

`theme` is what the user picked and `resolvedTheme` is what is actually rendered, with `system` already
resolved against the operating system. Read `resolvedTheme` when your component needs to know which one
it is drawing in:

```ts
const { resolvedTheme } = useTheme();

const logo = computed(() => (resolvedTheme.value === 'dark' ? darkLogo : lightLogo));
```

`loadUserTheme()` and `saveUserTheme()` are the Administration's addition to the Meteor composable this
wraps: they read and write the preference server-side, in the user's configuration, rather than in
`localStorage` alone.

The state is app-wide, created in a detached effect scope, so its watchers are not bound to whichever
component happened to call it first.
