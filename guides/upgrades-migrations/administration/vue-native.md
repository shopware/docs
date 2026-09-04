---
nav:
  title: Native Vue
  position: 15
---

# Moving Towards Native Vue

:::info
This article was updated. It previously described the migration as a fixed roadmap tied to specific Shopware versions.
Those version-based timelines have been removed because the new systems are still experimental and no release version is committed yet.
The article now describes the direction of the migration rather than when each step will happen.
:::

:::warning
The Composition API extension system and the native block system (`sw-block`) described in this article are **experimental**.
Their APIs can still change, and there is no committed timeline or release version for when they will become the standard.
:::

## Introduction

We are planning a significant shift in our development approach, moving towards a more native Vue.js implementation.
This document outlines the reasons for this change and provides an overview of the migration path. It serves as a general guideline for our development direction.

## Current status

To better understand the changes described in this article, let's recap the current status.
The Shopware 6 Administration is built on Vue.js, with several custom systems on top to enable extensions.

### Custom component registration

```javascript
Shopware.Component.register('sw-component', {
    template,

    //...
});
```

### Custom templates with Twig.js

```html
{% block sw-component %}
    <sw-card></sw-card>
{% endblock %}
```

## Why Go Native?

Our transition to a more native Vue.js approach is driven by several key factors:

1. **Improved Developer Experience**
    - Devtool enhancements
    - Easier maintenance

2. **Future-Proofing**
    - Aligning with Vue 3 and potential future versions
    - Preparing for upcoming industry standards

3. **Performance Optimization**
    - Leveraging native Vue.js capabilities for better performance

## Major Changes

### 1. Moving from Options API to Composition API

#### Why Make This Change?

We aim to better align with Vue's ecosystem to minimize the number of specifications new Developers need to learn.
The Composition API has become the new standard for Vue documentation and projects across GitHub.
Renowned libraries like `vue-i18n` are dropping support of the Options API, as seen in their [migration guide](https://vue-i18n.intlify.dev/guide/migration/vue3#summary), and we expect similar transitions from other tools in the ecosystem.
This also aligns with Vue's best practices, as highlighted in the official [Composition API FAQ](https://vuejs.org/guide/extras/composition-api-faq.html#why-composition-api).

#### What Will Change?

We will gradually transform our components from Options API to Composition API. Together with native blocks, this lays the foundation for using Single File Components (SFCs).
The transformation will happen gradually to give all of us enough time to adapt. Breaking changes, like removing the Options API, will only happen in a future major version. There is no committed timeline or release version for this transition.

#### Migration Path

The following table shows the current status of both systems and the direction they are heading in:

| System                           | Status today | Long-term direction                                                                  |
|----------------------------------|--------------|--------------------------------------------------------------------------------------|
| Options API                      | Standard     | Will be deprecated and removed once the migration to the Composition API is complete |
| Composition API extension system | Experimental | Will become the standard for core components and extensions                          |

### 2. TwigJS to Native Blocks

#### Why Make This Change?

Vue has no native support for blocks like in Twig.js. Vue has slots, but slots don't work like blocks.
Recently, we accomplished the unthinkable and found a way to implement blocks with native Vue components.
This will allow us to finally use SFC and keep the extendability of Twig.js.
Lowering the learning curve, as the Twig.js syntax is especially unfamiliar to Vue developers.
Standard tooling like VSCode, ESLint, and Prettier will work out of the box.

#### What Will Change?

We will gradually transform all component templates from external `*.html.twig` files with Twig.js into `.vue` files using the native block implementation.

#### Migration Path

The following table shows the current status of both systems and the direction they are heading in:

| System                     | Status today | Long-term direction                                                            |
|----------------------------|--------------|--------------------------------------------------------------------------------|
| Twig.js blocks             | Standard     | Will be deprecated and removed once the migration to native blocks is complete |
| Native blocks (`sw-block`) | Experimental | Will become the standard for core components and extensions                    |

#### Overriding Twig-based core components from native `.vue` files

During the migration period, you can write Administration overrides as native `.vue` files even when the core component you target still uses Twig.js.

Use this approach when:

- your plugin already uses native Vue SFC overrides
- the core component has not yet been migrated to native blocks
- you want to keep your extension on the native override path where possible

A native override still follows the same `*.override.vue` convention:

```vue
<template>
    <sw-block extends="sw-text-field">
        <sw-block-parent />

        <span class="my-help-text">{{ helpText }}</span>
    </sw-block>
</template>

<script setup>
defineProps({
    helpText: {
        type: String,
        required: false,
        default: '',
    },
});
</script>
```

If the targeted Twig component contains a matching block, the override is mounted into that block during template resolution.

#### How to choose the correct target block

For Twig-based core components, the `extends` value must match the original Twig block name you want to replace or extend.

Example Twig core template:

```twig
{% block sw-text-field %}
    <input type="text" v-model="value" @change="onChange">
{% endblock %}
```

Matching native override:

```vue
<template>
    <sw-block extends="sw-text-field">
        <sw-block-parent />
        <span class="my-help-text">Extra content</span>
    </sw-block>
</template>
```

If your override does not render, verify the following first:

1. The file name matches `*.override.vue`
2. The block name in `extends` matches the Twig block name exactly
3. Your override file is part of the Administration build
4. The target block structure is supported by the compatibility bridge described below

#### Supported migration scenario

This hybrid setup is intended for the migration period:

- **Core component:** Twig.js template
- **Plugin override:** native `*.override.vue`

You can use this to migrate plugin overrides incrementally instead of waiting until every core component has been converted to native Vue blocks.

#### Limitations of native overrides against Twig templates

This bridge does not provide full parity with native-to-native overrides.

Use a legacy Twig override instead if the target Twig block uses a structure that cannot host a single `sw-block` insertion point.

In particular, blocks that contain multiple named slot templates are not supported.

Example of an unsupported Twig block structure:

```twig
{% block sw_order_list_content %}
    <template #content>
        ...the whole order list
    </template>

    <template #sidebar>
        <sw-sidebar>
            ... filter-panel ...
        </sw-sidebar>
    </template>
{% endblock %}
```

For blocks like this, keep using the legacy Twig-based extension technique until the core component is migrated.

#### Troubleshooting native overrides for Twig components

If your native override renders nothing, work through this checklist:

1. **Check the file name**
   - Use the `*.override.vue` suffix

2. **Check the block name**
   - `extends="..."` must match the Twig block exactly

3. **Check whether the target is Twig or native**
   - For native core components, use the native override path as usual
   - For Twig core components, only supported block structures can be bridged

4. **Inspect the original Twig template**
   - Look for a single block content area
   - If the block contains several sibling `<template #...>` slot templates, use a Twig override instead

5. **Rebuild the Administration**
   - Override target detection happens during the Administration build process

### 3. Vuex to Pinia

#### Why Make This Change?

Vuex has been the default State management for Vue 2. For Vue 3, Pinia took its place.

#### What Will Change?

We will move all core Vuex states to Pinia stores. The public API will change from `Shopware.State` to `Shopware.Store`.

#### Upgrade Path

| Shopware Version | Vuex                            | Pinia                        |
|:----------------:|---------------------------------|------------------------------|
|       6.7        | Still supported for extensions* | Standard for Core components |
|       6.8        | Removed completely              | Standard                     |

*Extensions still can register Vuex states; Accessing core stores is done via Pinia

## Example: Component Evolution

Now let's take a look at how core and extension components will evolve.

### Today: The stable extension system

First, we start with the current status: components are registered with the Options API and use Twig.js templates.

#### Core component

In the core, we register a component via `Shopware.Component.register`.

```javascript
Shopware.Component.register('sw-text-field', {
   template: `
 {% block sw-text-field %}
 <input type=text v-model="value" @change="onChange">
 {% endblock %}
 `,

   data() {
       return {
           value: null,
 }
 },

   methods: {
       onChange() {
           this.$emit('update:value', this.value);
 }
 },
});
```

#### Extension override

The extension overrides the component via `Shopware.Component.override`.

```javascript
Shopware.Component.override('sw-text-field', {
   template: `
 {% block sw-text-field %}
 {% parent %}

 {{ helpText }}
 {% endblock %}
 `,

   props: {
       helpText: {
           type: String,
           required: false,
 }
 }
})
```

#### Extension new component

The extension adds an additional component via `Shopware.Component.register`.

```javascript
Shopware.Component.register('your-crazy-ai-field', {
   template: `
 {% block your-crazy-ai-field %}
 {# ... #}
 {% endblock %}
 `,

   // Options API implementation
})
```

### Experimental: The native extension system

:::warning
The APIs shown in this example are experimental and can still change.
:::

Once components are migrated, the core will use single-file components with the Composition API. You can already try out this system today as an experimental feature.

#### Core component

The core component is added via a single-file component `*.vue` file.

```vue
<template>
 {# Notice native block component instead of twig blocks #}
 <sw-block name="sw-text-field">
 <input type=text v-model="value" @change="onChange">
 </sw-block>
</template>

<script setup>
// Notice Composition API imports
import { ref, defineEmits } from 'vue';

// Notice the new Shopware extension system.Component.createExtendableSetup
const {value, onChange, privateExample} = Shopware.Component.createExtendableSetup({
 props,
 context,
 name: 'originalComponent',
}, () => {
 const emit = defineEmits(['update:value']);

 const value = ref(null);
 const onChange = () => {
 emit('update:value', value.value)
 }

 const privateExample = ref('This is a private property');

 return {
 public: {
 value,
 onChange,
 },
 private: {
 privateExample,
 }
 };
});
</script>
```

#### Extension override

For overrides, we created a new convention. They must match the `*.override.vue` pattern.
`*.override.vue` files will be loaded automatically in your main entry file.

```vue
<template>
{# Notice the native block components #}
<sw-block extends="sw-text-field">
 <sw-block-parent/>

 {{ helpText}}
</sw-block>
</template>

<script setup>
// Notice Composition API imports
import { defineProps } from 'vue';

// This file would also use Shopware.Component.overrideComponentSetup
// if it would change the existing public API
const props = defineProps({
 helpText: {
 type: String,
 required: false,
 },
});
</script>
```

#### Extension override against a legacy Twig core component

If the core component still uses Twig.js, you can still keep the native override file format as long as the targeted Twig block is supported by the bridge.

```vue
<template>
    <sw-block extends="sw-text-field">
        <sw-block-parent />

        <span class="my-help-text">{{ helpText }}</span>
    </sw-block>
</template>

<script setup>
const props = defineProps({
    helpText: {
        type: String,
        required: false,
        default: '',
    },
});
</script>
```

Use this pattern when you want to migrate extension overrides to SFCs before the corresponding core component has been migrated.

If the target Twig block uses unsupported structures, fall back to a classic Twig override.

#### Extension new component

```javascript

// For this, you would also have the option to use a `*.vue` file, but you don't have to
Shopware.Component.register('your-crazy-ai-field', {
   template: `
 {% block your-crazy-ai-field %}
 {# ... #}
 {% endblock %}
 `,

   // Options API implementation
})
```

### Long-term direction

Once the migration is complete and the new systems have left the experimental state, registering components via `Shopware.Component.register` with the Options API or Twig.js templates will no longer be possible. This will only happen in a future major version.

## Build behavior for native override files

Administration override files following the `*.override.vue` naming convention are processed during the Administration build.

For native overrides that target Twig-based core components, the build scans the override template for referenced block targets and registers those targets before runtime template resolution.

You do not need to register those targets manually.
Your task as an extension author is to:

1. create the override as `*.override.vue`
2. reference the target block through `<sw-block extends="...">`
3. rebuild the Administration so the override target is detected

Example:

```vue
<template>
    <sw-block extends="sw-product-detail-base__advanced-prices">
        <sw-block-parent />
        <div class="my-plugin-extra-content">...</div>
    </sw-block>
</template>
```

Because target detection is build-time based, keep these recommendations in mind:

- use explicit `extends="block-name"` values
- avoid patterns that hide the target block name from template analysis
- rebuild after renaming override files or changing block targets

## FAQ

**Will existing extensions built with the Options API continue to work?**

When you only use `Shopware.Component.register`, yes. If you use `Shopware.Component.extend`/`Shopware.Component.override` on components that have been migrated to the Composition API, you need to use the Composition API extension approach for those.

**Can I write a native `*.override.vue` file for a core component that still uses Twig?**

Yes, for supported Twig block structures. Use `<sw-block extends="...">` with the original Twig block name. If the block structure is unsupported, use a legacy Twig override.

**How can I prepare my development team for the transition to Composition API?**

I would recommend building a simple Vue application using the Composition API. You can do so by following [official guides](https://vuejs.org/guide/extras/composition-api-faq.html).

**What advantages does the native block implementation offer over the current Twig.js system?**

It works with native Vue.js components; therefore, it is compatible with default tooling.

**Can I mix Composition API and Options API components during the transition period?**

Yes, as long as you stick to the limitations from the migration paths above.

**How will the migration from Twig.js templates to .vue files affect my existing component overrides?**

You will need to migrate your overrides to the native block implementation once the components you are overriding have been migrated to `.vue` files. During the migration period, supported Twig core components can also be targeted by native `*.override.vue` files.

**What tools or resources will be available to help migrate existing components?**

We'll try to provide a code mod to transition your components into SFC. This will not work for all edge cases, so you need to check and transition them manually.

**Will there be any performance impact during the transition period when both systems are supported?**

During our tests, we didn't experience any performance issues.

**How does the new `Shopware.Component.createExtendableSetup` function work with TypeScript?**

It has built-in TypeScript support.

**What happens to existing extensions using Twig.js templates once the migration is complete?**

They will stop working once Twig.js support is removed. This will only happen in a future major version.

**Can I already use the native blocks and Composition API in my extensions today?**

Yes. You can add new components using SFC and native blocks. You can also use native `*.override.vue` files for migrated core components and for many legacy Twig-based core components with supported block structures. Keep in mind that experimental APIs can still change.

**Which Twig blocks are not good candidates for native overrides yet?**

Blocks containing multiple named slot templates, or similar structures without a single safe insertion point, should still be overridden through legacy Twig techniques.

**Which extensions are affected by these changes?**

- Apps aren't affected at all
- Plugins need to respect the discussed changes
