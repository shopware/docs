---
nav:
  title: Using Directives
  position: 190

---

# Using Directives

## Overview

Directives in the Shopware 6 Administration are essentially the same as in any other Vue application. This guide will teach you how to register your directives on a global and on a local scope.

Learn more about Vue Directives in their documentation:

<PageRef page="https://vuejs.org/v2/guide/custom-directive.html" title="Custom Directives | Vue.js" target="_blank" />

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and preferably a registered module. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Registering a directives globally

Directives can be registered globally via the [Shopware Objects](the-shopware-object) `register` helper function as seen below:

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/directive/focus.js
const { Directive } = Shopware;

Directive.register('focus', {
    // when the bound element is inserted into the DOM...
    inserted: function (el) {
        // Focus the element
        el.focus();
    }
});
```

As you might have seen, this is the exact same example as in the [Vue documentation](https://vuejs.org/v2/guide/custom-directive.html). Now, the only thing that's left is importing this file in your `main.js`. Then you can use it in the same way as you would do a normal Vue directive.

## Registering a directives locally

Registering directives locally is exactly the same as you're familiar with in Vue. The code snippet below registers the example from the [Vue documentation](https://vuejs.org/v2/guide/custom-directive.html) locally to the `swag-basic-example` component.

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/component/swag-basic-example/index.js
Shopware.Component.register('swag-basic-example', {

    directives: {
        focus: {
            // When the bound element is inserted into the DOM...
            inserted: function (el) {
                // Focus the element
                el.focus();
            }
        }
    }

});
```

As mentioned before, directives can be used as in any other Vue application, after they are registered:

```html
// <plugin-root>/src/Resources/app/administration/app/src/component/swag-basic-example/swag-basic-example.html.twig
<input type="text" v-focus="">
```

::: warning
Make sure the directive you are trying to access is actually in your components scope, either by registering the directive globally or locally to a component.
:::
