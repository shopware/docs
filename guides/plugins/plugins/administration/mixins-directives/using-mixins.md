---
nav:
  title: Using Mixins
  position: 80

---

# Using Mixins

## Overview

This guide covers how to use an existing Administration mixin in a plugin. Generally, mixins behave the same as they do in Vue normally, differing only in the registration and the way mixins are included in a component.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. As stated before mixins in Shopware are basically the same as in Vue, so you should have read their [documentation](https://v2.vuejs.org/v2/guide/mixins.html?redirect=true) on them first.

## Finding a mixin

The Shopware 6 Administration comes with a few predefined [mixins](../administration-reference/mixins.md).

To create your own mixin, review the [Adding mixins](./add-mixins.md) guide.

## Using the Mixin

After we've found the mixin we need, we can get it from the registry with the `Mixin.getByName` function and inject it into our component as seen below. In this example we'll use the notification mixin, which is useful for creating notifications visible to the user in the Administration.

```javascript
// <administration root>/components/swag-basic-example/index.js
const { Component, Mixin } = Shopware;

Component.register('swag-basic-example', {

    mixins: [
        Mixin.getByName('notification')
    ],

    methods: {
        greet: function () {
            this.createNotificationSuccess({ title: 'Greetings' })
        }
    }
});
```

## Using snackbars for brief feedback

::: info
The snackbar service is available from Shopware 6.7.14.0.
:::

For brief feedback such as confirming that a plugin action completed, use the global Meteor snackbar instead of the notification mixin:

```javascript
Shopware.Service('snackbarService').addSnackbar({
    id: 'my-plugin-saved',
    message: 'The settings have been saved.',
    variant: 'info',
});
```

To dismiss a snackbar before its duration expires, pass the same ID to `removeSnackbar()`:

```javascript
Shopware.Service('snackbarService').removeSnackbar('my-plugin-saved');
```

The snackbar service is separate from the legacy notification system. Continue using the notification mixin when you need its title, actions, or system-notification behavior.
