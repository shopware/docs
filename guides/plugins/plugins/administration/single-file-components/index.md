---
nav:
  title: Single File Components
  position: 20

---

# Single File Components

<!--@include: ../../../../../snippets/guide/administration_sfc_experimental.md-->

## Overview

Administration components have so far been registered through the component factory: an `index.js` with an Options API configuration and a separate `.html.twig` template that uses TwigJS blocks (`{% block %}`, `{% parent %}`) as extension points.

Shopware is moving towards native Vue. Components can now be written as Vue [Single File Components](https://vuejs.org/guide/scaling-up/sfc.html) (`.vue` files) using `<script setup>`, and extension points are declared with the native `sw-block` component instead of TwigJS blocks. A build-time transform lowers these files onto the Composition API extension system before Vue compiles them. The transform runs in every extension build, so no configuration is needed in your plugin.

You do not have to wait for core to be migrated. A `.vue` override works against components that still ship a Twig template and an Options API configuration, which is most of the Administration today.

## Start here

The fastest way in is to build something. The tutorial takes you from an empty directory to a plugin that warns a merchant when a product's profit margin is too low, on the product detail page:

<PageRef page="tutorial/" title="Tutorial" sub="Five chapters, one plugin, from an empty directory to a working override" />

![The finished plugin on the product detail page](../../../../../assets/administration-sfc-tutorial-extended.png)

Three pages back it up:

<PageRef page="api-reference/" title="API reference" sub="The macros, the composables and the two components, in one place" />
<PageRef page="troubleshooting" title="Troubleshooting" sub="Every build error and console message, with its fix" />
<PageRef page="roadmap" title="Roadmap" sub="What works today, what is still coming, and where to give feedback" />

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
* **`<script setup>` dialect.** Every `.vue` file needs a `<script setup>` block. The base component declares its public API with the `swDefinePublic()` macro, and an override declares which bindings it replaces with `swDefineOverride()`. Both macros are mandatory - pass an empty object when there is nothing to declare.
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

## Reference pages

The rest of this chapter is still being written. These pages are planned as part of the [SFC documentation epic](https://github.com/shopware/shopware/issues/20186):

| Page | Covers | Issue |
| --- | --- | --- |
| Introduction to SFC extensions | The high-level before and after, and why `sw-block` exists | [#20192](https://github.com/shopware/shopware/issues/20192) |
| Migration guide | Converting an existing Twig and Options API extension, block by block | [#20186](https://github.com/shopware/shopware/issues/20186) |
| Timeline and roadmap | What is supported today, what is planned, what is still experimental and why | [#20198](https://github.com/shopware/shopware/issues/20198) |
| Internals | How `sw-block` and the setup transform work | [#20199](https://github.com/shopware/shopware/issues/20199) |
