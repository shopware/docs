---
nav:
  title: Removing Vue Migration Build
  position: 14
---

# Future Development Roadmap: Removing Vue Migration Build

:::info
The information provided in this article, including timelines and specific implementations, is subject to change.
This document serves as a general guideline for our development direction.
:::

Prior to Shopware 6.7, we utilized the Vue migration build to facilitate the transition from Vue 2 to Vue 3 for plugin developers. This approach allowed most public APIs to behave similarly to Vue 2 while enabling gradual migration.

With the release of Shopware 6.7, the Vue migration build will be removed. All plugins must be fully migrated to Vue 3 without relying on the migration build.

## Why remove the Vue migration build?

The Vue migration build was a temporary solution to help transition from Vue 2 to Vue 3. However, maintaining it indefinitely would introduce complexity, potential performance bottlenecks, and incompatibility with future Vue versions. Removing it ensures that all plugins fully adopt Vue 3, leveraging its improved reactivity system, better TypeScript support, and performance enhancements.

## Migration guide

Shopware's administration is built using Vue 3, and all plugins should be updated accordingly. We recommend referring to the official [Vue 3 migration guide](https://v3-migration.vuejs.org/) for detailed information on breaking changes and deprecations.

Below are some of the most common changes observed in our codebase. This list is not exhaustive, so always consult the official guide for comprehensive migration steps.

### Common Migration Changes

#### `$listeners` removed

In Vue 2, `$listeners` was used to access event listeners passed to a component. In Vue 3, event listeners are now included in `$attrs`.

Before (Vue 2):

```vue
<template>
    <sw-button v-on="$listeners">Click me</sw-button>
</template>
```

After (Vue 3):

```vue
<template>
    <sw-button v-bind="$attrs">Click me</sw-button>
</template>
```

More detailed guide about [`$listeners` breaking changes](https://v3-migration.vuejs.org/breaking-changes/listeners-removed.html).

#### `$scopedSlots` removed

Previously, scoped slots were accessed using `$scopedSlots`. In Vue 3, `$slots` now unifies all slots and exposes them as functions.

Before (Vue 2):

```js
this.$scopedSlots.header
```

After (Vue 3):

```js
this.$slots.header()
```

More detailed guide about [`$slots` unification breaking changes](https://v3-migration.vuejs.org/breaking-changes/slots-unification.html).

#### `$children` removed

Vue 2 allowed access to child components using `$children`. In Vue 3, this is no longer supported, and you should use template refs instead.

Before (Vue 2):

```js
this.$children.childrenMethod();
```

After (Vue 3):

```js
// <sw-child ref="childrenRef" />

this.$refs.childrenRef.childrenMethod();
```

More detailed guide about [`$children` breaking changes](https://v3-migration.vuejs.org/breaking-changes/children).

#### Some Events API removed

The methods `$on`, `$off` and `$once` are removed in Vue 3 without a replacement. You can still use `$emit` to trigger event handlers declaratively attached by a parent component.

Alternatively you can use inject/provide to pass down event handlers using a registration pattern.

It is not possible to give a general guide for this change. You need to adjust your code based on your specific use case. Here is an example how you could adjust your code:

Before (Vue 2):

```js
created() {
  this.$parent.$on('doSomething', this.eventHandler);
},

beforeDestroy() {
  this.$parent.$off('doSomething', this.eventHandler);
}
```

After (Vue 3):

```js
// The parent component needs to provide the event handler
inject: ['registerDoSomething', 'unregisterDoSomething'],

created() {
  this.registerDoSomething(this.eventHandler);
},

beforeDestroy() {
  this.unregisterDoSomething(this.eventHandler);
}
```

More detailed guide about [Events API breaking changes](https://v3-migration.vuejs.org/breaking-changes/events-api.html).

#### `$set`, `$delete` removed

Vue 2 required `$set` and `$delete` for reactive property modifications. Vue 3’s new reactivity system, based on ES6 Proxies, removes the need for these methods.

Before (Vue 2):

```js
this.$set(this.myObject, 'key', 'value');
this.$delete(this.myObject, 'key');
```

After (Vue 3):

```js
this.myObject.key = 'value';
delete this.myObject.key;
```

## Conclusion

With Shopware 6.7, the Vue migration build will be fully removed. To ensure compatibility, all plugins must be updated to Vue 3 following the official migration guide. If you encounter challenges during migration, refer to the official Vue 3 documentation or seek assistance from the Shopware developer community.
