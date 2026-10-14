---
nav:
  title: useNotification()
  position: 40

---

# `useNotification()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useNotification } from 'shopware:composables';

function useNotification(): {
    createNotification: (notification: NotificationType) => string | null;
    createNotificationSuccess: (config: NotificationType) => void;
    createNotificationInfo: (config: NotificationType) => void;
    createNotificationWarning: (config: NotificationType) => void;
    createNotificationError: (config: NotificationType) => void;
    createSystemNotification: (config: NotificationType) => void;
    createSystemNotificationSuccess: (config: NotificationType) => void;
    createSystemNotificationInfo: (config: NotificationType) => void;
    createSystemNotificationWarning: (config: NotificationType) => void;
    createSystemNotificationError: (config: NotificationType) => void;
};
```

Creates the notifications that appear in the top right of the Administration.

The four `createNotification*` variants fill in the variant and a default title, so a message is all you
have to pass:

```ts
const { createNotificationSuccess } = useNotification();

createNotificationSuccess({ message: 'Margin recalculated' });
```

The `createSystemNotification*` variants set `system: true` and the variant, but no default title.

`createNotification()` is the one they all call, and the only one that returns something: the id of the
notification it created, or `null` for a success notification or one without a `message`. Every
notification except a success one is also kept in the notification center.

Replaces the `notification` mixin.
