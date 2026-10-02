---
nav:
  title: useSession()
  position: 70

---

# `useSession()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useSession } from 'shopware:composables/use-session';

function useSession(): {
    currentUser: Ref<Entity<'user'> | null>;
    userPending: ComputedRef<boolean>;
    languageId: Ref<string>;
    currentLocale: Ref<string | null>;
    adminLocaleLanguage: ComputedRef<string | null>;
    adminLocaleRegion: ComputedRef<string | null>;
    userPrivileges: ComputedRef<string[]>;
    setAdminLocale: (locale: string) => Promise<void>;
    setCurrentUser: (user: Entity<'user'>) => void;
    removeCurrentUser: () => void;
    setAdminLocaleState: (state: { locales: string[]; locale: string; languageId: string }) => void;
};
```

The logged-in user and the locale the Administration is displayed in.

```ts
const { currentUser, userPrivileges } = useSession();

const canEditProducts = computed(() => userPrivileges.value.includes('product:update'));
```

`adminLocaleLanguage` and `adminLocaleRegion` are the two halves of `currentLocale`, so `en-GB` gives
`en` and `GB`. `userPrivileges` is every privilege of every ACL role the user holds, flattened into one
array.

`setAdminLocale()` refuses a locale that [`useSystem()`](use-system) has not registered, and switches the
API language along with the display language.

The state is app-wide rather than per component: two callers get the same refs.
