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
To better understand the changes described in this article let's recap the current status.
The Shopware 6 Administration is built around Vue.Js with several custom systems on top to allow for extensions.

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

We aim to better align with Vue's ecosystem, to minimize the amount of specifications new Developers need to learn.
The Composition API has become the new standard for Vue's documentation and projects all over Github.
Renown libraries like `vue-i18n` are dropping support of the Options API, as seen in their [migration guide](https://vue-i18n.intlify.dev/guide/migration/vue3#summary), and we expect similar transitions from other tools in the ecosystem.
This also aligns with Vue's best practices, as highlighted in the official [Composition API FAQ](https://vuejs.org/guide/extras/composition-api-faq.html#why-composition-api).

#### What Will Change?

We will gradually transform our components from Options API to Composition API. Together with [native blocks](#2-twigjs-to-native-blocks), this builds the foundation to use SFC (Single File Components).
The transformation will be stretched over multiple major versions to offer enough time for all of us ot adapt. Take a look at the estimated [timeline](#upgrade-path).

#### Upgrade Path
| Shopware Version | Options API                     | Composition API              |
|:----------------:|---------------------------------|------------------------------|
|       6.7        | Standard                        | Experimental                 |
|       6.8        | Still supported for extensions* | Standard for Core components |
|       6.9        | Removed completely              | Standard                     |

* Extensions still can register components using the Options API, overwriting Core components needs the Composition API.

### 2. TwigJS to Native Blocks

#### Why Make This Change?

Vue has no native support for blocks like in Twig.js. Vue has slots, but slots don't work like blocks.
Recently, we accomplished the unthinkable and found a way to implement blocks with native Vue components.
This will allow us to finally use SFC (Single File Components) and keep the extendability of Twig.js.
Lowering the learning curve, as the Twig.js syntax is especially unfamiliar to Vue developers.
Standard tooling like VSCode, ESLint, and Prettier will work out of the box.

#### What Will Change?

We will gradually transform all component templates from external `*.html.twig` files with Twig.Js into `.vue` files using the native block implementation.


#### Upgrade Path
| Shopware Version | Twig.Js                         | Native blocks                |
|:----------------:|---------------------------------|------------------------------|
|       6.7        | Standard                        | Experimental                 |
|       6.8        | Still supported for extensions* | Standard for Core components |
|       6.9        | Removed completely              | Standard                     |

* Extensions still can register components using Twig.Js templates, overwriting Core blocks needs the native block implementation.

## Example: Component Evolution

### Shopware 6.7

#### Core component
```jsx
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
```jsx
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
```jsx
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

#### Core component
```vue
<template>
   <sw-block name="sw-text-field">
    <input type=text v-model="value" @change="onChange">
   </sw-block>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

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
```vue
<template>
<sw-block extends="sw-text-field">
   <sw-block-parent/>
   
   {{ helpText}}
</sw-block>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
   helpText: {
       type: String,
       required: false,
   }
});
</script>
```

#### Extension new component
```jsx
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

The only difference for 6.9

## FAQ

[This section would address common questions and concerns about the transition.]