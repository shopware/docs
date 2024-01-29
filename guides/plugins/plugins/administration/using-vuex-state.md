# Using Vuex Stores

## Overview

The Shopware 6 Administration uses [Vuex](https://vuex.vuejs.org/) stores to keep track of complex state, while just adding a wrapper around it.
Learn what Vuex is, how to use it and when to use it from their great [documentation](https://vuex.vuejs.org/).
This guide will show you how to use Vuex as you normally would, through the interfaces provided by the Shopware 6 Administration.

## Prerequisites

All you need for this guide is a running Shopware 6 instance, the files and preferably a registered module.
Of course you'll have to understand JavaScript and have a basic familiarity with [Vue](https://vuejs.org/) the framework used in the Administration and it's flux library [Vuex](https://vuex.vuejs.org/).

## Creating a store

Creating a store works the same way as it would in standard Vuex with the only limitation being, that all stores have to be `namespaced` in order to prevent collisions with other third party plugins or the Shopware 6 Administration itself.

The following code snippet is the `namespaced` store we will register later through Shopware to the underlying Vuex.
It is admittedly rather short and has only one variable called `content` and a setter for it, but again this all the same as in Vuex. Beware of the property `namespaced`, though.

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/component/store-example/store.js
export default {
    namespaced: true,

    state() {
        return {
            // the state we want to keep track of
            content: ''
        };
    },

    mutations: {
        // a mutation to change the state
        setContent(state, content) {
            state.content = content;
        },
    }
};
```

## Registering the store

The store can be registered in two scopes, on a module scope and on a per component scope.
Both ways use the same functions from the [Shopware object](./the-shopware-object) to register and unregister the `namespaced store modules`.

Registering in a module scope is done by simply calling the function `Shopware.State.registerModule` in the `main.js` file.

```javascript
// <administration root>/src/main.js
import swagBasicState from './store';

Shopware.State.registerModule('swagBasicState', swagBasicState);
```

In the component scope `Namespaced` store modules can be registered in the `beforeCreate` [Vue lifecycle hook](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram),
with the previously mentioned `Shopware.State.registerModule` function.
But then they also need to be `unregistered` in the `beforeDestroy` Vue lifecycle hook,
in order to not leave unused stores behind after a component has been destroyed.

All of this can be seen in the following code sample:

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/component/store-example/index.js
    beforeCreate() {
        // registering the store to vuex through the Shopware objects helper function
        // the first argument is the name the second the imported namespaced store
        Shopware.State.registerModule('swagBasicState', swagBasicState);
    },

    beforeDestroy() {
        // unregister the store before the component is destroyed
        Shopware.State.unregisterModule('swagBasicState');
    },
```

Both methods make the store on the given name everywhere available, regardless of where it has been registered.

## Using the store in a component

The Shopware object also makes the native Vuex helper functions available, like [`mapState`](https://vuex.vuejs.org/guide/state.html#the-mapstate-helper), [`mapGetters`](https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper), [`mapMutations`](https://vuex.vuejs.org/guide/mutations.html#committing-mutations-in-components) and [`mapActions`](https://vuex.vuejs.org/guide/actions.html#dispatching-actions-in-components).
The `namespaced` store itself can be accessed through the `Shopware.State.get()` function.

```javascript
// <plugin-root>/src/Resources/app/administration/app/src/component/store-example/index.js
// import the template
import template from './store-example.html.twig';

const { Component } = Shopware;

// Access the normal Vuex helper functions through the Shopware Object
const { 
    mapState,
    mapMutations,
} = Shopware.Component.getComponentHelper();

Component.register('swag-basic-state', {
    template,

    computed: {
        // the native mapState vuex helper function 
        ...mapState('swagBasicState', [
            'content',
        ])
    },

    methods: {
        // the native mapMutations vuex helper function
        ...mapMutations('swagBasicState', [
            'setContent',
        ]),
    }
});
```

## Adding a template

After we have registered our `namespaced` store, mapped state and mutations, we can now use them in our components or templates.
The component below displays the previously mapped state `content` in a `div` and a `sw-text-field`, mutating the state on the `changed` event of the `sw-text-field`.

```html
// <plugin-root>/src/Resources/app/administration/app/src/component/store-example/store-example.html.twig
<div>
    <h1>SW-6 State</h1>
    <sw-text-field @change="value => setContent(value)" :value="content">
    </sw-text-field>
    <div>
        {{ content }}
    </div>
</div>
```

## More interesting topics

* [The Shopware object](./the-shopware-object).
