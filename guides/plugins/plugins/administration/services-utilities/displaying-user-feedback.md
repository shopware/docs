---
nav:
  title: Displaying User Feedback
  position: 120

---

# Displaying user feedback

Use notifications and snackbars to provide feedback after a plugin action. Choose the feedback mechanism based on how much information the user needs and whether they need to act on it.

| Use | When to use it |
| --- | --- |
| Notification | The feedback needs a title, actions, or should be kept as a system notification. |
| Snackbar | The feedback is a brief, non-blocking confirmation of a completed action. |

## Notifications

Use the notification mixin when the user needs more context or an action:

```javascript
const { Component, Mixin } = Shopware;

Component.register('swag-basic-example', {
    mixins: [
        Mixin.getByName('notification'),
    ],

    methods: {
        greet() {
            this.createNotificationSuccess({ title: 'Settings saved' });
        },
    },
});
```

For more information about using mixins, see [Using Mixins](../mixins-directives/using-mixins.md).

## Snackbars

::: info
The snackbar service is available from Shopware 6.7.14.0.
:::

Use the global Meteor snackbar for brief feedback, such as confirming that a plugin action completed. To dismiss a snackbar before its duration expires, pass its generated ID to `removeSnackbar()`:

```javascript
const snackbarService = Shopware.Service('snackbarService');
const snackbar = snackbarService.addSnackbar({
    message: 'The settings have been saved.',
    variant: 'success',
});

// when you want to remove it later
snackbarService.removeSnackbar(snackbar.id);
```
