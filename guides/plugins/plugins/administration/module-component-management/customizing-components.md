---
nav:
  title: Customizing components
  position: 170
---

# Customizing components

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
Learn more about internationalization in the Shopware 6 Administration and about adding your own snippets to the Administration [here](adding-snippets).

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

Shopware 6 is introducing a new way to extend components using the Composition API. This system is currently in an experimental state and is needed for the future migration of components from the Options API to the Composition API.

### Current status and future plans

- The existing Options API extension system remains fully supported and functional.
- The new Composition API extension system is introduced as an experimental feature.
- In future versions, components will gradually migrate from Options API to Composition API.
- Plugin developers are encouraged to familiarize themselves with the new system, but should continue using the current Component factory extension system for components written with the Options API.
- For components written with the Composition API, the new extension system should be used.
- In the long term, the Composition API extension system will become the standard way to override components. The Options API extension system will be deprecated and eventually removed when all components are migrated to the Composition API.

### How it works

The new extension system introduces two main functions:

1. `Shopware.Component.createExtendableSetup`: Used within components to make them extendable. This will mainly be used by the core team to make components extendable.
2. `Shopware.Component.overrideComponentSetup`: Used by plugins to override components.

### Using overrideComponentSetup

The `overrideComponentSetup` function is a key part of the new Composition API extension system. It allows plugin developers to override or extend the behavior of existing components without directly altering their source code.

### Basic usage

```javascript
Shopware.Component.overrideComponentSetup()('componentName', (previousState, props, context) => {
    // Your extension logic here
    return {
        // Return the new or modified properties and methods
    };
});
```

#### Parameters

1. `componentName`: A string identifying the component you want to override.
2. Callback function: This function receives three arguments:
   1. `previousState`: The current state of the component, including all its reactive properties and methods.
   2. `props`: The props passed to the component.
   3. `context`: The setup context, similar to what you would receive in a standard Vue 3 setup function.

#### Return value

The callback function should return an object containing any new or modified properties or methods you want to add or change in the component.

#### Example: Replacing a Single Property

```javascript
Shopware.Component.overrideComponentSetup()('sw-product-list', (previousState) => {
    const newPageSize = ref(50);

    return {
        pageSize: newPageSize // Override the default page size with the new ref
    };
});
```

#### Example: Adding a New Method

```javascript
Shopware.Component.overrideComponentSetup()('sw-order-list', (previousState) => {
    return {
        newCustomMethod() {
            console.log('This is a new method added to sw-order-list');
        }
    };
});
```

#### Example: Modifying existing data

```javascript
Shopware.Component.overrideComponentSetup()('sw-customer-list', (previousState) => {
    // Add a new column to the list
    previousState.columns.push({ property: 'customField', label: 'Custom Field' });
    
    return {};
});
```

#### Example: Overwriting a method

```javascript
Shopware.Component.overrideComponentSetup()('sw-customer-list', (previousState) => {
    // Overwrite the existing method
    const newIncrement = () => {
        // Able to access the previous method
        previousState.increment();
        // Add custom logic
        console.log('Incremented by 1');
    };

    return {
        increment: newIncrement,
    };
});
```

#### Example: Accessing props and context

```javascript
Shopware.Component.overrideComponentSetup()('sw-customer-list', (previousState, props, context) => {
    // Access the props
    console.log(props);

    // Access the context
    console.log(context);

    return {};
});
```

### Important notes

1. Type Safety: The system aims to provide type safety. Make sure your IDE is set up to recognize the types from Shopware's type definitions.
2. Reactive Properties: When modifying reactive properties, ensure you maintain their reactivity. Use Vue's reactive utilities when necessary.
3. Multiple Overrides: Multiple plugins can override the same component. Overrides are applied in the order they are registered.
4. Performance: Be mindful of performance implications when adding complex logic to frequently used components.
5. Compatibility: This method is part of the experimental Composition API system. Ensure your plugin clearly states its dependency on this feature.
6. Testing: Thoroughly test your overrides, especially when modifying core component behavior.

### Example real world usage

Here is an example of how to create an extendable component and how to override it:

```javascript
import { defineComponent, reactive } from 'vue';

// Original component
const originalComponent = defineComponent({
    template: `
        <div>
            <h1>{{ message }}</h1>
            <div>
                <mt-button @click="increment">Increment</mt-button>

                <p>
                    {{ countMessage }}
                </p>

                <p>
                    Notifications are currently: {{ showNotification ? 'enabled' : 'disabled' }}
                </p>
            </div>
        </div>
    `,
    props: {
        showNotification: {
            type: Boolean,
            default: false,
        },
    },
    setup: (props, context) => Shopware.Component.createExtendableSetup({
        props,
        context,
        name: 'originalComponent',
    }, () => {
        const count = ref(0);
        const message = 'Hello from Shopware!';
        const countMessage = computed(() => `The current count is: ${count.value}`);

        const increment = () => {
            count.value++;
        };

        const privateExample = ref('This is a private property');

        return {
            public: {
                count,
                message,
                countMessage,
                increment,
            },
            private: {
                privateExample,
            }
        };            
    }),
});

// Overriding the component with a plugin
Shopware.Component.overrideComponentSetup()('originalComponent', (previousState, props) => { 
    const newMessage = 'Hello from the plugin!';
    const newCountMessage = computed(() => `The new, amazing count is: ${previousState.count.value}`);
    const newIncrement = () => {
        previousState.increment();
        
        if (props.showNotification) {
            Shopware.ServiceContainer.get('notification').dispatch({
                title: 'Incremented!',
                message: `The count has been incremented by the user to ${previousState.count.value}!`,
                variant: 'success',
            });
        }
    };

    return {
        message: newMessage,
        countMessage: newCountMessage,
        increment: newIncrement,
    };
});
```

In this example, `createExtendableSetup` is used to make the `originalComponent` extendable. The `overrideComponentSetup` function is then used to modify the properties of the component. In this case, the message is changed, a new computed property is added, and the increment method is modified to show a notification if the `showNotification` prop is set to `true`.

### Key differences from Options API extension system

- Uses Composition API syntax and reactive primitives of Vue 3 instead of Vue 2 options API.
- Extensions are applied using function composition rather than option merging.
- Provides more granular control over what parts of a component can be overridden.
- Only overrides are possible. Extending a component is not supported anymore. This can be done natively with the Composition API.

### Using TypeScript

To take full advantage of the Composition API extension system, it is recommended to use TypeScript. This will provide better type safety and autocompletion in your IDE and prevent common errors.

For adding type safety to props you need to import the type of the component you want to override and use it in the `overrideComponentSetup` function as a generic type: `<typeof _InternalTestComponent>`. The types for the `previousState` are automatically inferred from the component you are overriding by using the correct component name.

```typescript
import _InternalTestComponent from 'src/the/path/to/the/exported/component';

Shopware.Component.overrideComponentSetup<typeof _InternalTestComponent>()('_internal_test_compponent', (previousState, props) => {
    const newBaseValue = ref(5);
    const newMultipliedValue = computed(() => {
        // Props are now correctly typed
        return newBaseValue.value * props.multiplier!;
    });

    // Previous state is now correctly typed
    previousState.baseValue.value = 2;

    return {
        baseValue: newBaseValue,
        multipliedValue: newMultipliedValue,
    };
});
```

### Accessing private properties

In some cases, you may need to access private properties of a component. This is not recommended, as it can lead to unexpected behavior and breakages when the component is updated. However, if you need to access private properties for debugging or testing purposes, you can do so using the `_private` property of the `previousState` object where all private properties are stored.

Note: overriding and accessing private properties has no TS support and is not recommended for production use.

```javascript
Shopware.Component.overrideComponentSetup()('sw-customer-list', (previousState, props, context) => {
    // Access the private properties
    console.log(previousState._private.thePrivateProperty);
});
```

## More interesting topics

- [Customizing templates](writing-templates)
- [Customizing via custom styles](add-custom-styles)
- [Using base components](using-base-components)
