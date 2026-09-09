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

With the release of Shopware 6.7, the Vue migration build was removed. All plugins must be fully migrated to Vue 3 without relying on the migration build.

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

Vue 2 allowed access to child components using `$children`. In Vue 3, this is no longer supported; use template refs instead.

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

The methods `$on`, `$off`, and `$once` are removed in Vue 3, with no replacement. You can still use `$emit` to trigger event handlers declaratively attached by a parent component.

Alternatively, you can use inject/provide to pass down event handlers using a registration pattern.

It is not possible to give a general guide for this change. You need to adjust your code based on your specific use case. Here is an example of how you could adjust your code:

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

## Using native `.vue` overrides with legacy Twig-based administration components

During the administration migration, you can write native Vue single-file component overrides even when the targeted core administration component still renders its template through Twig.

Use this approach when you want to keep your extension in native `.vue` format instead of maintaining a Twig override.

### When to use this approach

Use a native `.vue` override if all of the following are true:

- your extension is already migrated to Vue 3
- the core administration component is still Twig-based
- you only need to replace or extend supported Twig blocks
- the override template renders a normal component structure without unsupported multi-slot Twig block layouts

If the target Twig block is not supported by the compatibility layer, keep using the legacy Twig override technique for that component.

### Basic override structure

Create your administration override component in `.vue` format and target the same component name you would use for other administration overrides.

Example registration:

```js
import template from './sw-product-list-override.vue';

Shopware.Component.override('sw-product-list', {
    template,
});
```

Example override template:

```vue
<template>
    {% block sw_product_list_grid %}
    <div class="my-product-list-grid">
        <sw-data-grid
            v-bind="$attrs"
            v-on="$attrs"
        />
    </div>
    {% endblock %}
</template>
```

### How block targeting works

When you use a native `.vue` override against a Twig-based core component, the override must still target Twig block names that exist in the original core template.

Use the original Twig component template to identify the correct block name:

```twig
{% block sw_product_list_grid %}
    <sw-data-grid
        :data-source="products"
    />
{% endblock %}
```

Then reference that same block in your `.vue` override:

```vue
<template>
    {% block sw_product_list_grid %}
    <div class="my-product-list-grid">
        <sw-data-grid
            :data-source="products"
        />
    </div>
    {% endblock %}
</template>
```

If the block name does not match a block in the target Twig template, your override is not rendered.

### Recommended migration workflow

1. Check whether the target administration component is still Twig-based.
2. Inspect the core template and identify the block you want to override.
3. Create a native `.vue` override and wrap your replacement content in the matching Twig block.
4. Rebuild the administration.
5. Verify the rendered output in the browser.
6. If the override is not rendered, confirm that:
   - the component name in `Shopware.Component.override(...)` is correct
   - the Twig block name matches the core template exactly
   - the target block does not use an unsupported slot structure

### Unsupported Twig block structures

Some Twig blocks cannot be targeted reliably through a native `.vue` override.

In particular, avoid this approach for blocks that contain multiple named slot templates, for example:

```twig
{% block sw_order_list_content %}
    <template #content>
        ...
    </template>

    <template #sidebar>
        <sw-sidebar>
            ...
        </sw-sidebar>
    </template>
{% endblock %}
```

For blocks like this, continue using a Twig-based override.

### Troubleshooting native-to-Twig overrides

If your native override is not rendered:

- verify the override is registered with the correct component name
- verify the targeted Twig block exists in the core component
- verify the block is not one of the unsupported multi-slot structures
- rebuild the administration so the override template is processed again
- test with a minimal override first to confirm the block is reachable

Minimal test override:

```vue
<template>
    {% block sw_product_list_grid %}
    <div style="padding: 16px; background: #ffe9a8;">
        Override reached
    </div>
    {% endblock %}
</template>
```

If the test override renders, the block is supported and your original implementation should be reviewed for template or runtime errors.

## Build-time handling of override templates

Administration override templates are processed during the build.

For native `.vue` overrides that target Twig-based core components, the build step analyzes the override template for Twig block usage. To make this work reliably:

- keep the targeted Twig block names directly inside the override template
- avoid generating block names dynamically
- rebuild the administration after changing block names or moving override templates

A typical extension setup looks like this:

```js
import overrideTemplate from './sw-order-list-override.vue';

Shopware.Component.override('sw-order-list', {
    template: overrideTemplate,
});
```

```vue
<template>
    {% block sw_order_list_actions %}
    <div class="my-order-list-actions">
        <sw-button size="small" variant="primary">
            Custom action
        </sw-button>
    </div>
    {% endblock %}
</template>
```

Because block detection happens from the override template source, use explicit Twig block declarations in the file that you pass as `template`.

## Conclusion

In Shopware 6.7, the Vue migration build was removed entirely. To ensure compatibility, all plugins must be updated to Vue 3 following the official migration guide. If you encounter challenges during migration, refer to the official Vue 3 documentation or seek assistance from the Shopware developer community.
