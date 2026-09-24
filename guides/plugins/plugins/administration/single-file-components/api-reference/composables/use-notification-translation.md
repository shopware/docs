---
nav:
  title: useNotificationTranslation()
  position: 50

---

# `useNotificationTranslation()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useNotificationTranslation } from 'shopware:composables/use-notification-translation';

function useNotificationTranslation(): {
    getTranslatedTitle: (notification: NotificationType) => string;
    getTranslatedMessage: (notification: NotificationType) => string;
};
```

The rendering helpers the notification components share. A snippet key is translated and a plain string
passes through, so the same notification works either way.

`getTranslatedMessage()` also sanitizes what it returns, down to `a`, `b`, `i`, `u`, `strong`, `em` and
`br`, with `href` and `target` as the only attributes. A notification message may therefore carry a link,
but nothing else.

Replaces the `notification-translation` mixin.
