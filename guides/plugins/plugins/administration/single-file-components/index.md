---
nav:
  title: Single File Components
  position: 20

---

# Single File Components

<!--@include: ../../../../../snippets/guide/administration_sfc_experimental.md-->

## Overview

Administration components have traditionally been registered through the component factory using an Options API configuration and a separate template with TwigJS blocks as extension points.

Shopware is now moving towards **native Vue**. This makes onboarding easier for developers who are already familiar with standard Vue 3 patterns and tooling such as Single File Components, the Composition API, and composables. The extension system will feel much closer to standard Vue, reducing the need to learn Shopware-specific abstractions and conventions.

Components can now be written as Vue [Single File Components](https://vuejs.org/guide/scaling-up/sfc.html) (`.vue` files) using `<script setup>`. Extension points are declared with the native [`sw-block`](api-reference/block-components) component instead of TwigJS blocks.

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

## Start here

The fastest way in is to build something. The tutorial takes you from an empty directory to a plugin that warns a merchant when a product's profit margin is too low, on the product detail page:

<PageRef page="tutorial/" title="Tutorial" sub="Five chapters, one plugin, from an empty directory to a working override" />

![The finished plugin on the product detail page](../../../../../assets/administration-sfc-tutorial-extended.png)

Four pages back it up:

<PageRef page="api-reference/" title="API reference" sub="The macros, the composables and the two components, in one place" />
<PageRef page="troubleshooting" title="Troubleshooting" sub="Every build error and console message, with its fix" />
<PageRef page="roadmap" title="Roadmap" sub="What works today, what is still coming, and where to give feedback" />
<PageRef page="internals" title="Internals" sub="What the build does to your file, and what the block components do at runtime" />
