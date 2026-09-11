---
nav:
  title: useSnackbar()
  position: 60

---

# `useSnackbar()`

<!--@include: ../../../../../../../snippets/guide/administration_sfc_experimental.md-->

```ts
import { useSnackbar } from 'shopware:composables/use-snackbar';

function useSnackbar(): {
    addSnackbar: (config: Omit<Snackbar, 'id'>) => Snackbar;
    removeSnackbar: (id: string) => void;
};
```

Snackbars: the short-lived bar at the bottom of the screen, for something that happened rather than
something that needs attention. Use [`useNotification()`](use-notification) when the message should stay.

It wraps the Meteor component library's own `useSnackbar()`, so `config` is a Meteor `Snackbar` without
its `id`, and `addSnackbar()` returns the snackbar it created, `id` included - keep it if you want to
remove the snackbar before it disappears on its own.
