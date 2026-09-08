---
nav:
  title: Single File Components
  position: 10

---

# Single File Components

:::warning
Single File Component (SFC) support for Administration extensions is **experimental**. It is currently only available on the `trunk` branch of [shopware/shopware](https://github.com/shopware/shopware) and is not part of any 6.7 release. The APIs described in this chapter can still change without a deprecation.
:::

## Overview

Administration components have so far been registered through the component factory: an `index.js` with an Options API configuration and a separate `.html.twig` template that uses TwigJS blocks (`{% block %}`, `{% parent %}`) as extension points.

Shopware is moving towards native Vue. Components can now be written as Vue [Single File Components](https://vuejs.org/guide/scaling-up/sfc.html) (`.vue` files) using `<script setup>`, and extension points are declared with the native `sw-block` component instead of TwigJS blocks. A build-time transform lowers these files onto the Composition API extension system before Vue compiles them. The transform runs in every extension build, so no configuration is needed in your plugin.

This chapter is the entry point for everything related to SFC-based Administration extensions. It explains what the new approach is, how it relates to the existing Twig and Options API approach, what its current limits are, and how you can try it out.

## Building blocks

| Concern | Twig / Options API | Single File Components |
| --- | --- | --- |
| Component file | `index.js` + `component.html.twig` | `sw-my-component.vue` |
| Registration | `Shopware.Component.register()` | Filename decides identity: `sw-my-component.vue` or `sw-my-component/index.vue` declares `sw-my-component` |
| Override | `Shopware.Component.override()` | Filename decides role: `sw-my-component.override.vue` overrides `sw-my-component` |
| Extension point in template | `{% block name %}...{% endblock %}` | `<sw-block name="...">...</sw-block>` |
| Extending a block | `{% block name %}...{% endblock %}` in an override template | `<sw-block extends="...">...</sw-block>` |
| Parent content | `{% parent %}` | `<sw-block-parent />` |
| Public state of a component | Everything on `this` | Only what is listed in `swDefinePublic({ ... })` |
| Overriding state | Redefine `data`, `computed`, `methods` | `swDefineOverride({ ... })` together with `useSwPreviousState()` |

The key concepts you will meet throughout this chapter:

* **Native blocks (`sw-block` and `sw-block-parent`)** replace TwigJS blocks with plain Vue components. A block is defined with the `name` prop, extended with the `extends` prop, and `<sw-block-parent />` renders the previous content of the chain.
* **`<script setup>` dialect.** Every `.vue` file needs a `<script setup>` block. The base component declares its public API with the `swDefinePublic()` macro, and an override declares which bindings it replaces with `swDefineOverride()`. Both macros are mandatory and accept only shorthand bindings, so pass an empty object when there is nothing to declare.
* **Override composables.** Inside an override, `useSwPreviousState()`, `useSwProps()` and `useSwContext()` give access to the base component's public state, props and setup context.
* **Build-time transform.** The transform runs in the extension build and in the ESLint rule `valid-shopware-setup`, so invalid files are rejected in your editor and in the build with the same error.

## Before and after

The same override, written once with the component factory and TwigJS, and once as a Single File Component.

<Tabs>
<Tab title="Twig / Options API">

```javascript
// sw-my-component/index.js
import template from './sw-my-component.html.twig';

Shopware.Component.override('sw-my-component', {
    template,

    computed: {
        count() {
            return this.$super('count') * 2;
        },
    },
});
```

```twig
{# sw-my-component.html.twig #}
{% block sw_my_component_count %}
    {% parent %}
    <p class="my-plugin-hint">Doubled by my plugin</p>
{% endblock %}
```

</Tab>
<Tab title="Single File Component">

```vue
<!-- sw-my-component.override.vue -->
<template>
    <sw-block extends="sw_my_component_count">
        <sw-block-parent />
        <p class="my-plugin-hint">Doubled by my plugin</p>
    </sw-block>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const previousState = useSwPreviousState();
const count = computed(() => previousState.count.value * 2);

swDefineOverride({ count });
</script>
```

</Tab>
</Tabs>

An override only works when the base component is itself a native setup SFC that declares `count` with `swDefinePublic({ count })`. Components registered through the component factory cannot be overridden with an `.override.vue` file yet.
