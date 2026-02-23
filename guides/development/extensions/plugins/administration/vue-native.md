---
nav:
  title: Native Vue
  position: 260
---

# Future Development Roadmap: Moving Towards Vue Native

> **Note:** The information provided in this article, including timelines and specific implementations, is subject to change.
> This document serves as a general guideline for our development direction.

## Introduction

We are planning a significant shift in our development approach, moving towards a more native Vue.js implementation.
This document outlines the reasons for this change and provides an overview of our upgrade path.

## Current status

The Shopware 6 Administration is built around Vue.js with several custom systems on top to allow for extensions.

### Custom component registration

```javascript
Shopware.Component.register('sw-component', {
    template,

    //...
});
```

### Custom templates with Twig.Js

```html
{% block sw-component %}
    <sw-card></sw-card>
{% endblock %}
```

## Why go native?

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

#### Why make this change?

We aim to better align with Vue's ecosystem, to minimize the amount of specifications new Developers need to learn.

The Composition API has become the new standard for Vue's documentation and projects all over Github.

Renowned libraries like `vue-i18n` are dropping support of the Options API, as seen in their [migration guide](https://vue-i18n.intlify.dev/guide/migration/vue3#summary), and we expect similar transitions from other tools in the ecosystem.
This also aligns with Vue's best practices, as highlighted in the official [Composition API FAQ](https://vuejs.org/guide/extras/composition-api-faq.html#why-composition-api).

#### What will change?

We will gradually transform our components from Options API to Composition API. Together with native blocks, this builds the foundation to use Single File Components (SFC).

The transformation will be stretched over multiple major versions to offer enough time for all of us to adapt. Take a look at the estimated timeline below.

#### Upgrade path

| Shopware Version | Options API                     | Composition API              |
|:----------------:|---------------------------------|------------------------------|
|       6.7        | Standard                        | Experimental                 |
|       6.8        | Still supported for extensions* | Standard for Core components |
|       6.9        | Removed completely              | Standard                     |

*Extensions still can register components using the Options API; overwriting Core components needs the Composition API.

### 2. TwigJS to native blocks

#### Why make this change?

Vue has no native support for blocks like in Twig.js. Vue has slots, but slots don't work like blocks.

Implementing blocks with native Vue components allows using SFC and keeping the extendability of Twig.js. This lowerins the learning curve, as the Twig.js syntax is especially unfamiliar to Vue developers.

Standard tooling like VSCode, ESLint, and Prettier will work out of the box.

#### What will change?

We will gradually transform all component templates from external `*.html.twig` files with Twig.Js into `.vue` files using the native block implementation.

#### Upgrade path

| Shopware Version | Twig.Js                         | Native blocks                |
|:----------------:|---------------------------------|------------------------------|
|       6.7        | Standard                        | Experimental                 |
|       6.8        | Still supported for extensions* | Standard for Core components |
|       6.9        | Removed completely              | Standard                     |

*Extensions still can register components using Twig.Js templates; overwriting Core blocks needs the native block implementation.

### 3. Vuex to Pinia

#### Why make this change?

Vuex has been the default State management for Vue 2. For Vue 3 Pinia took its place.

#### What will change?

We will move all core Vuex states to Pinia stores. The public API will change from `Shopware.State` to `Shopware.Store`.

#### Upgrade Path

| Shopware Version | Vuex                            | Pinia                        |
|:----------------:|---------------------------------|------------------------------|
|       6.7        | Still supported for extensions* | Standard for Core components |
|       6.8        | Removed completely              | Standard                     |

*Extensions still can register Vuex states; Accessing core stores is done via Pinia

## Example: Component Evolution

Now let's take a look how core and extension components will evolve.

### Shopware 6.7

The current status is still compatible with Shopware 6.7.

#### Core component

In the core we register a component via `Shopware.Component.register`.

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

The extension adds additional component via `Shopware.Component.register`.

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

### Shopware 6.8

With Shopware 6.8 the core uses single file components with the composition API.

#### Core component

The core component is added via a single file component `*.vue` file.

```vue
<template>
   {# Notice native block comonent instead of twig blocks #}
   <sw-block name="sw-text-field">
    <input type=text v-model="value" @change="onChange">
   </sw-block>
</template>

<script setup>
// Notice Composition API imports
import { ref, defineEmits } from 'vue';

// Notice new extension system Shopware.Component.createExtendableSetup
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

For overrides we created a new convention. They must match the `*.override.vue` pattern.
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

#### Extension new component

```javascript

// For this you would also have the option to use a `*.vue` file but you don't have to
Shopware.Component.register('your-crazy-ai-field', {
   template: `
     {% block your-crazy-ai-field %}
       {# ... #}
     {% endblock %}
   `,

   // Options API implementation
})
```

### Shopware 6.9

Registering new components via `Shopware.Component.register` will no longer be possible.

## FAQ

**Will existing extensions built with Options API continue to work in Shopware 6.8?**

When you only use `Shopware.Component.register` yes. If you also use `Shopware.Component.extend/ override` you need to use the composition API extension approach for that.

**How can I prepare my development team for the transition to Composition API?**

I would recommend building a simple Vue application using the Composition API. You can do so by following [official guides](https://vuejs.org/guide/extras/composition-api-faq.html).

**What advantages does the native block implementation offer over the current Twig.js system?**

It works with native Vue.Js components, therefore is compatible with default tooling.

**Can I mix Composition API and Options API components during the transition period?**

Yes as long as you stick to the limitations from the upgrade paths.

**How will the migration from Twig.js templates to .vue files affect my existing component overrides?**

You need to migrate all your overrides with Shopware 6.8.

**What tools or resources will be available to help migrate existing components?**

We'll try to provide a code mod to transition your components into SFC. This will not work for all edge cases, so you need to manually check and transition them.

**Will there be any performance impact during the transition period when both systems are supported?**

During our tests we didn't experience any performance issues.

**How does the new `Shopware.Component.createExtendableSetup` function work with TypeScript?**

It has built in TypeScript support.

**What happens to existing extensions using Twig.js templates after version 6.9?**

They will stop working with Shopware version 6.9.

**Can I start using the native blocks and Composition API in my extensions before version 6.8?**

Yes! You can add new components using SFC and native blocks. But you can't extend core components using the old systems or vise versa.

**Which extensions are affected by these changes?**

- Apps aren't affected at all
- Plugins need to respect the discussed changes
