# Using Mixins

## Overview

This documentation chapter will cover how to use an existing Administration mixin in your plugin. Generally, mixins behave the same as they do in Vue normally, differing only in the registration and the way mixins are included in a component.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. As stated before mixins in Shopware are basically the same as in Vue, so you should have read their [documentation](https://vuejs.org/v2/guide/mixins.html) on them first.

## Finding a mixin

The Shopware 6 Administration comes with a few predefined mixins, you can find a list of all of them [here](../../../../resources/references/core-reference/administration-reference/mixins.md)

If you want to learn how to create your own mixin look at this guide: [Creating mixins](add-mixins.md)

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
