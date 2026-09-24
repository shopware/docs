---
nav:
  title: useContext()
  position: 90

---

# `useContext()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useContext } from 'shopware:composables/use-context';

function useContext(): ContextState['app'] & ContextState['api'] & {
    addAppValue: <K>(payload: { key: K; value: ContextState['app'][K] }) => void;
    addApiValue: <K>(payload: { key: K; value: ContextState['api'][K] }) => void;
    addAppConfigValue: <K>(payload: { key: K; value: ContextState['app']['config'][K] }) => void;
    setApiLanguageId: (languageId: EntityKey<'language'>) => void;
    resetLanguageToDefault: () => void;
    isSystemDefaultLanguage: ComputedRef<boolean>;
};
```

The application and API context - the same state the global `Shopware.Context` holds.

`app` carries the environment, the feature flags, the registered bundles, the fallback locale and the
system currency. `api` carries the API paths, the auth token, and the language and version that requests
are made in.

```ts
const context = useContext();

const isDevelopment = context.app.environment === 'development';
const languageId = context.api.languageId;
```

`setApiLanguageId()` also persists the choice in `localStorage`, which is how the language survives a
reload.
