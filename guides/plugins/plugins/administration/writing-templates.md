# Writing templates

## Overview

The Shopware 6 Administration uses a combination of [twig](https://twig.symfony.com/) and [Vue](https://vuejs.org/) templates in its Administration to provide easy extensibility. This guide will teach you how to use templates to extend the Administration with twig and Vue and how import them into a component.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a registered module. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Writing a template

Templates in Shopware are usually defined in a separate `.twig` file, named after the component, in the component's directory. Each module's page should start with the `sw-page` component, because it provides a search bar, a page header and a `content` slot for your content. Components in general should also include twig blocks, in order to be extendable by other plugins.

Let's look at all of this in practice, with the example of a component statically printing `'Hello World'`:

```html
{% block swag_basic_example_page %}
    <sw-page class="swag-example-list">
        <template slot="content">
            <h2>Hello world!</h2>
        </template>
    </sw-page>
{% endblock %}
```

## Setting the Template

Each component has a template property, which is used to set the template. To use the previously created template file, import it and assign it to the `template` property of the component.

```javascript
import template from './swag-basic-example.html.twig';

Shopware.Component.register('swag-basic-example', {
    template, // ES6 shorthand for: 'template: template'  

    metaInfo() {
        return {
            title: this.$createTitle()
        };
    },
});
```

Note: The meta info is part of [vue-meta](https://vue-meta.nuxtjs.org/) and is used to set the title of the whole page. The `this.$createTitle()` generates a title.

## Theory: Vue vs Twig

The Shopware 6 Administration mixes, as mentioned in the beginning, [twig](https://twig.symfony.com/) and [Vue](https://vuejs.org/) to provide extensibility. But for what is twig used and for what is Vue used?

Generally speaking, twig is used for **extending** from another template and adjusting it to your needs. For example overriding a twig block could provide a hook to place your own markup. But be careful overrides apply to all occurrences of this template.

Vue is used to link the data and the DOM in order to make them reactive. Learn about Vue and its capabilities [here](https://vuejs.org/v2/guide/index.html).

## More interesting topics

* [Add custom styling](add-custom-styles.md)
* [Adding shortcuts](https://github.com/shopware/docs/tree/575c2fa12ef272dc25744975e2f1e4d44721f0f1/guides/plugins/plugins/administration/add-shortcuts.md)
