---
nav:
  title: useUserSettings()
  position: 100

---

# `useUserSettings()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useUserSettings } from 'shopware:composables';

function useUserSettings(): {
    getUserSettingsEntity: (identifier: string, userId?: string | null) => Promise<UserSettingsEntity | null>;
    getUserSettings: (identifier: string, userId?: string | null) => Promise<unknown>;
    saveUserSettings: (identifier: string, entityValue: Record<string, any>, userId?: string | null) => Promise<unknown>;
    userGridSettingsCriteria: (identifier: string, userId?: string | null) => Criteria;
};
```

Reads and writes `user_config`, the per-user key-value store behind things like a data grid's column
layout or a collapsed sidebar.

```ts
const { getUserSettings, saveUserSettings } = useUserSettings();

const columns = await getUserSettings('swag-margin.columns');
await saveUserSettings('swag-margin.columns', { hidden: ['purchasePrice'] });
```

`saveUserSettings()` stores an identifier without a dot under `custom.<identifier>`, but the read
functions do not add that prefix. Always use an identifier with a dot, and keep it yours.

The three async functions are guarded by the `user_config` ACL privileges - a caller without `user_config:read`, or
without `user_config:create` and `user_config:update` for a write, gets a rejected promise rather than a
thrown error.

Omit `userId` for the logged-in user, which is the fast path; passing another user's id goes through the
repository instead.

Replaces the `user-settings` mixin.
