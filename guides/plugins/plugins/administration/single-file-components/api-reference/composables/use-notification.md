---
nav:
  title: useNotification()
  position: 40

---

# `useNotification()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useNotification } from 'shopware:composables/use-notification';

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

The `createSystemNotification*` variants mark the notification as a system notification, which is what the
notification center keeps around after it has been dismissed.

`createNotification()` is the one they all call, and the only one that returns something: the id of the
notification it created.

Replaces the `notification` mixin.
