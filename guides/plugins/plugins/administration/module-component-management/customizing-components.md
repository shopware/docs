---
nav:
  title: Customizing Components
  position: 170
---

# Customizing Components

::: info
`Component.override()` with TwigJS blocks, as shown on this page, is the stable way to customize a component today. Its counterpart in the experimental Single File Component system, available since Shopware 6.7.16.0, is an `.override.vue` file using `<sw-block extends>`. See [Chapter 2: Your first override](../single-file-components/tutorial/your-first-override.md).
:::

## Overview

The Shopware 6 Administration allows you to override and extend components to change its content and its behavior.

## Prerequisites

All you need for this guide is a running Shopware 6 instance, the files and preferably a registered module.
Of course, you will have to understand JavaScript, Vue and have a basic familiarity with TwigJS block system, and the templating engine used in the Administration. It is just used for the block extending and overriding. Every other feature of TwigJS is not used in the Administration.
However, that is a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## General

To add new functionality or change the behavior of an existing component, you can either override or extend the component.

The difference between the two methods is that with `Component.extend()` a new component is created. With `Component.override()`, on the other hand, the previous behavior of the component is simply overwritten.

## Override a component

The following example shows how you can override the template of the `sw-text-field` component.

```JS
// import the new twig-template file
import template from './sw-text-field-new.html.twig';

// override the existing component `sw-text-field` by passing the new configuration
Shopware.Component.override('sw-text-field', {
    template
});
```

## Extending a component

To create your custom text-field `sw-custom-field` based on the existing `sw-text-field` you can implement it like the following:

```JS
// import the custom twig-template file
import template from './sw-custom-field.html.twig';

// extend the existing component `sw-text-field` by passing
// a new component name and the new configuration
Shopware.Component.extend('sw-custom-field', 'sw-text-field', {
    template
});
```

Now you can render your new component `sw-custom-field` in any template like this:

```twig
    <sw-custom-field></sw-custom-field>
```

## Customize a component template

To extend a given template you can use the Twig `block` feature.

Imagine, the component you want to extend/override has the following template:

```twig
{% block card %}
    <div class="sw-card">
        {% block card_header %}
            <div class="sw-card--header">
                {{ header }}
            </div>
        {% endblock %}

        {% block card_content %}
            <div class="sw-card--content">
                {{ content }}
            </div>
        {% endblock %}
    </div>
{% endblock %}
```

Maybe you want to replace the markup of the header section and add an extra block to the content.
With the Twig `block` feature you can implement a solution like this:

```twig
{# override/replace an existing block #}
{% block card_header %}
    <h1 class="custom-header">
        {{ header }}
    </h1>
{% endblock %}

{% block card_content %}

    {# render the original block #}
    {% parent %}

    <div class="card-custom-content">
        ...
    </div>
{% endblock %}
```

Summarized with the `block` feature you will be able to replace blocks inside a template.
Additionally, you can render the original markup of a block by using `{% parent %}`

## Extending methods and computed properties

Sometimes you need to change the logic of a method or a computed property while you are extending/overriding a component.
In the following example we extend the `sw-text-field` component and change the `onInput()` method, which gets called after the value of the input field changes.

```JS
// extend the existing component `sw-text-field` by passing
// a new component name and the new configuration
Shopware.Component.extend('sw-custom-field', 'sw-text-field', {

    // override the logic of the onInput() method
    methods: {
        onInput() {
            // add your custom logic in here
            // ...
        }
    }
});
```

In the previous example, the inherited logic of `onInput()` will be replaced completely.
But sometimes, you will only be able to add additional logic to the method. You can achieve this by using `this.$super()` call.

```JS
// extend the existing component `sw-text-field` by passing
// a new component name and the new configuration
Shopware.Component.extend('sw-custom-field', 'sw-text-field', {

    // extend the logic of the onInput() method
    methods: {
        onInput() {
            // call the original implementation of `onInput()`
            const superCallResult = this.$super('onInput');

            // add your custom logic in here
            // ...
        }
    }
});
```

This technique also works for `computed` properties, for example:

```JS
// extend the existing component `sw-text-field` by passing
// a new component name and the new configuration
Shopware.Component.extend('sw-custom-field', 'sw-text-field', {

    // extend the logic of the computed property `stringRepresentation`
    computed: {
        stringRepresentation() {
            // call the original implementation of `onInput()`
            const superCallResult = this.$super('stringRepresentation');

            // add your custom logic in here
            // ...
        }
    }
});
```

## Real world example for block overriding

### Finding the block to override

In this guide we want to change the heading of the Shopware 6 dashboard to be `Welcome to a customized Administration` instead of `Welcome to Shopware 6`.
To do this, we first need to find an appropriate twig block to override.
We don't want to replace too much but also to not override too little of the Administration.
In this case, we only want to override the headline and not links or anything else on the page.
Looking at the twig markup for the dashboard [here](https://github.com/shopware/shopware/blob/trunk/src/Administration/Resources/app/administration/src/module/sw-dashboard/page/sw-dashboard-index/sw-dashboard-index.html.twig),
suggests that we only need to override the twig block with the name `sw_dashboard_index_content_intro_content_headline` to achieve our goal.

### Preparing the override

Now that we know where to place our override, we need to decide what to override it with.
In this very simple example it suffices to create a twig file, declare a block with the name we previously found and to insert our new header into the block.

```text
<!-- <plugin root>/src/Resources/app/administration/src/sw-dashboard-index-override/sw-dashboard-index.html.twig -->
{% block sw_dashboard_index_content_intro_content_headline %}
    <h1>
        Welcome to a customized component
    </h1>
{% endblock %}
```

This overrides the entire twig block with our new markup.
However, if we want to retain the original content of the twig block and just add our markup to the existing one, we can do that by including a <code v-pre>{% parent %}</code> somewhere in the twig block.
Learn more about the capabilities of twig.js [here](https://github.com/twigjs/twig.js/wiki).

As you might have noticed the heading we just replaced had a `{ $tc() }` [string interpolation](https://vuejs.org/v2/guide/syntax.html#Text) which is used to make it multilingual.
Learn more about internationalization in the Shopware 6 Administration and about adding your own snippets to the Administration [here](../templates-styling/adding-snippets.md).

### Applying the override

Registering the override of the Vue component is done by using the override method of our ComponentFactory.
This could be done in any `.js` file, which then has to be later imported, but we'll place it in `<plugin root>/src/Resources/app/administration/src/sw-dashboard-index-override/index.js`.

```javascript
import template from './sw-dashboard-index.html.twig';

Shopware.Component.override('sw-dashboard-index', {
    template
});
```

The first parameter matches the component to override, the second parameter has to be an object containing the actually overridden properties for example, the new twig template extension for this component.

### Loading the JavaScript File

The main entry point to customize the Administration via a plugin is the `main.js` file.
It has to be placed into the `<plugin root>/src/Resources/app/administration/src` directory in order to be automatically found by Shopware 6.

The only thing now left to just add an import for our previously created `./sw-dashboard-index-override/index.js` in the `main.js`:

```javascript
import './sw-dashboard-index-override/';
```

## Experimental: Composition API extension system

:::warning
The Composition API extension system is **experimental** until 6.9. It becomes stable with 6.9 at the latest, and possibly already with 6.8. Until then, its API can still change without a deprecation.
:::

The Composition API extension system is the runtime behind native setup Single File Components.
Its runtime functions `Shopware.Component.createExtendableSetup()` and `Shopware.Component.overrideComponentSetup()` are internal (`@private`) and are not meant to be called by extensions.
Write a native setup Single File Component instead: an `.override.vue` file declares the bindings it replaces with `swDefineOverride()`, and the build generates the runtime calls for you.

See [Chapter 2: Your first override](../single-file-components/tutorial/your-first-override.md) and the [`swDefineOverride()` reference](../single-file-components/api-reference/macros/sw-define-override.md).

## More interesting topics

- [Customizing templates](../templates-styling/writing-templates.md)
- [Customizing via custom styles](../templates-styling/add-custom-styles.md)
- [Using base components](../module-component-management/using-base-components.md)
