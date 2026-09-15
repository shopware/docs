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

## What an override looks like

This is the new syntax:

```vue
<!-- sw-product-detail-base.override.vue -->
<script setup lang="ts">
import { computed } from 'vue';

const previousState = useSwPreviousState();

const productName = computed(() => `${previousState.productName.value} (needs review)`);

swDefineOverride({ productName });
</script>
```

From now on the component renders your `productName` everywhere it rendered its own.

Two things are doing the work, and neither needs an import or a registration call:

* **`useSwPreviousState()`** hands you the state of the component you are overriding - here, its own `productName`.
* **`swDefineOverride()`** names which of your bindings replace the original ones. Anything you do not name is left alone.

Markup works the same way: `<sw-block ...>` hooks take the place of the `{% block ... %}` ones. [Before and after](#before-and-after) puts the same override next to the Twig and Options API version of itself.

## Timeline

| When | What happens |
| --- | --- |
| Today | The extension system is available, and experimental. Build something with it and tell us what you find. |
| 6.8 | The Administration's private components are converted, and run in production for the first time. |
| 6.9 | Planned: the extension system becomes a stable API, and a first handful of public components are converted with it. |
| Later | The remaining components follow. The shims keep working for a while after that. |

Converting the Administration's own components is the larger half of the work, and it is why the
experimental phase lasts as long as it does: every component that changes shape is one more chance for
an extension to break, and we would rather find those now than in a major.

See the full roadmap [here](./roadmap.md)

## Start here

The fastest way in is to build something. The tutorial takes you from an empty directory to a plugin that warns a merchant when a product's profit margin is too low, on the product detail page:

<PageRef page="tutorial/" title="Tutorial" sub="Five chapters, one plugin, from an empty directory to a working override" />

![The finished plugin on the product detail page](../../../../../assets/administration-sfc-tutorial-extended.png)

Four pages back it up:

<PageRef page="api-reference/" title="API reference" sub="The macros, the composables and the two components, in one place" />
<PageRef page="troubleshooting" title="Troubleshooting" sub="Every build error and console message, with its fix" />
<PageRef page="roadmap" title="Roadmap" sub="What works today, what is still coming, and where to give feedback" />
<PageRef page="internals" title="Internals" sub="What the build does to your file, and what the block components do at runtime" />

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
