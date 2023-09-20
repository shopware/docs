# Add custom component

## Overview

Since the Shopware 6 Administration is using [VueJS](https://vuejs.org/) as its framework, it also supports creating custom components. This guide will teach you how to register your own custom component with your plugin.

In this example, you will create a component, that will print a 'Hello world!' everywhere it's being used.

## Prerequisites

This guide **does not** explain how to create a new plugin for Shopware 6. Head over to our Plugin base guide to learn how to create a plugin at first:

<PageRef page="../plugin-base-guide" />

If you want to work with entities in your custom component or page, it might be useful to take a look at how to create custom entity guide first:

<PageRef page="../framework/data-handling/add-custom-complex-data" />

Especially if you want to add a new page for an own module, you should consider to look at the process on how to add a custom module first.

<PageRef page="add-custom-module" />

This way, you're able to start building your own module in the right order.

### Injecting into the Administration

Same as with all custom extensions of the Administration, the main entry point to extend the Administration via plugin is the `main.js` file. It has to be placed into a `<plugin root>/src/Resources/app/administration/src` directory in order to be found by Shopware 6.

## Creating a custom component

### Path to the component

Usually there's one question you have to ask yourself first: Will your new component be used as a `page` for your plugin's custom route, or is this going to be a component to be used by several other components, such as an element that prints 'Hello world' everywhere it's used? In order to properly structure your plugin's code and to be similar to the core structure, you have to answer this question first. If it's going to be used as page for a module, it should be placed here: `<plugin-root>/src/Resources/app/administration/src/module/<your module's name>/page/<your component name>`

Otherwise, if it's going to be a general component to be used by other components, the following will be the proper path. For this example, this component scenario is used. `<plugin-root>/src/Resources/app/administration/src/component/<name of your plugin>/<name of your component>`

::: info
Using this path is **not** a hard requirement, but rather a recommendation. This way, third party developers having a glance at your code will get used to it real quick, because you stuck to Shopware 6's core conventions.
:::

Since the latter example is being used, this is the path being created in the plugin now: `<plugin-root>/src/Resources/app/administration/src/component/custom-component/hello-world`

### Import your custom component via main.js file

In the directory mentioned above, create a new file `index.js`. We will get you covered with more information about it later. Now import your custom component using your plugin's `main.js` file:

```javascript
// <plugin root>/src/Resources/app/administration/src
import './app/component/custom-component/hello-world';
```

### Index.js as main entry point for this component

Head back to the `index.js` file, this one will be the most important for your component.

First you have to register your component using the `ComponentFactory`, which is available throughout our third party wrapper. This `Component` object provides a method `register`, which expects a name and a configuration for your component.

```javascript
// <plugin-root>/src/Resources/app/administration/src/component/custom-component/hello-world
Shopware.Component.register('hello-world', {
    // Configuration here
});
```

A component's template is being defined by using the `template` property. For this short example, the template will be defined inline. An example for a bigger template will also be provided later on this page.

```javascript
// <plugin-root>/src/Resources/app/administration/src/component/custom-component/hello-world
Shopware.Component.register('hello-world', {
    template: '<h2>Hello world!</h2>'
});
```

That's it. You can now use your component like this `<hello-world></hello-world>` in any other template in the Administration.

### Long template example

It's quite uncommon to have such a small template example and you don't want to define huge templates inside a javascript file. For this case, just create a new template file in your component's directory, which should be named after your component. For this example `hello-world.html.twig` is used.

Now simply import this file in your component's JS file and use the variable for your property.

```javascript
// <plugin-root>/src/Resources/app/administration/src/component/custom-component/hello-world.html.twig
import template from 'hello-world.html.twig';

Shopware.Component.register('hello-world', {
    template: template
});
```

In the core code, you will find another syntax for the same result though:

```javascript
// <plugin-root>/src/Resources/app/administration/src/component/custom-component/hello-world.html.twig
import template from 'hello-world.html.twig';

Shopware.Component.register('hello-world', {
    template
});
```

This is a [shorthand](https://alligator.io/js/object-property-shorthand-es6/), which can only be used if the variable is named exactly like the property.

## Next steps

You've now added a custom component, including a little template. However, there's more discover here.

* [More about templates](writing-templates)
* [Add some styling to your component](add-custom-styles)
* [Use shortcuts for your component](add-shortcuts)

Furthermore, what about [customizing other components](customizing-components), instead of creating new ones.
