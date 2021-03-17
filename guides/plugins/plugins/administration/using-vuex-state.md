# Using Vuex Stores

The Shopware 6 Administration uses [Vuex](https://vuex.vuejs.org/) stores to keep track of complex state, while just adding a wrapper around it.
Learn what Vuex is, how to use it and when to use it from their great [documentation](https://vuex.vuejs.org/).
This guide will show you how to use Vuex as you normally would, through the interfaces provided by the Shopware 6 Administration.

## Prerequisites

All you need for this guide is a running Shopware 6 instance, the files and preferably a registered module. 
Of course you'll have to understand JavaScript and have a basic familiarity with [Vue](https://vuejs.org/) the framework used in the Administration and it's flux library [Vuex](https://vuex.vuejs.org/).

## Creating a store

The creation of a store is the same as in normal Vuex with the only limitation that all stores have to be `namespaced` in order to prevent collisions with other third party plugins or the Shopware 6 Administration itself.

The following code snippet is the `namespaced` store we will register later through Shopware to the underlying Vuex.
It is admittedly rather short and has only one variable called `content` and a setter for it, but again this all the same as in Vuex.

{% code title="<plugin-root>/src/Resources/app/administration/app/src/component/store-example/store.js" %}
```javascript
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
{% endcode %}

## Creating the component to use the store

Now that we've created our `namespaced` store, we need to register it to a component to use it.
This is done through the [Shopware object](./the-shopware-object.md) as seen below in the `beforeCreate` [Vue lifecycle hook](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram).

Learn more about the Shopware object [here](./the-shopware-object.md).

The Shopware object also makes the native Vuex helper functions available, like [`mapState`](https://vuex.vuejs.org/guide/state.html#the-mapstate-helper), [`mapGetters`](https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper), [`mapMutations`](https://vuex.vuejs.org/guide/mutations.html#committing-mutations-in-components) and [`mapActions`](https://vuex.vuejs.org/guide/actions.html#dispatching-actions-in-components).
The `namespaced` store itself can be accessed through the `Shopware.State.get()` function.

{% code title="<plugin-root>/src/Resources/app/administration/app/src/component/store-example/index.js" %}
```javascript
// import the template and the namespaced store
import template from './store-example.html.twig';
import swagBasicState from './store';

const { Component } = Shopware;

// Access the normal Vuex helper functions through the Shopware Object
const { 
    mapState,
    mapMutations,
} = Shopware.Component.getComponentHelper();

Component.register('swag-basic-state', {
    template,

    beforeCreate() {
        // registering the store to vuex trough the Shopware objects helper function
        // the first argument is the name the second the previusly imported namespaced store
        Shopware.State.registerModule('swagBasicState', swagBasicState);
    },

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
{% endcode %}

After we have registered our `namespaced` store, mapped state and mutations, we can now use them in our components or templates.
The component below displays the previously mapped state `content` in a `div` and a `sw-text-field`, mutating the state on the `changed` event of the `sw-text-field`.

{% code title="<plugin-root>/src/Resources/app/administration/app/src/component/store-example/store-example.html.twig" %}
```html
<div>
	<h1>SW-6 State</h1>
	<sw-text-field @change="value => setContent(value)" :value="content"></sw-text-field>
	<div>
		{{ content }}
	</div>
</div>
```
{% endcode %}

## Next steps

Now that you have learned how to use Vuex in the Shopware 6 Administration you might want to dive deeper into one of the following things:

* [The Shopware object](./the-shopware-object.md).
* [How to create custom templates](./writing-templates.md)
* [How to add your own components](./add-custom-component.md)
* [Customizing components](./add-custom-route.md)
