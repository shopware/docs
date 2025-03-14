---
nav:
  title: Add custom component
  position: 20

---

# Add custom component

## Overview

Since the Shopware 6 Administration is using [VueJS](https://vuejs.org/) as its framework, it also supports creating custom components. This guide will teach you how to register your own custom component with your plugin.

In this example, you will create a component that will print a 'Hello world!' everywhere it's being used.

## Prerequisites

This guide **does not** explain how to create a new plugin for Shopware 6. Head over to our Plugin base guide to learn how to create a plugin at first:

<PageRef page="../../plugin-base-guide" />

If you want to work with entities in your custom component or page, it might be useful to take a look at how to create a custom entity guide first:

<PageRef page="../../framework/data-handling/add-custom-complex-data" />

Especially if you want to add a new page for an own module, you should consider looking at the process on how to add a custom module first.

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

<Tabs>
<Tab title="Asynchronous loading">
The asynchronous loading behavior is the preferred way. This way, the component will only be loaded when it's actually being used. This will speed up the loading time of the Administration.

You can use the `Shopware.Component.register` method to register your component. This method expects a name and a function that will import your component. By using a dynamic import here, your component will be loaded asynchronously when it's being used.

```javascript
// <plugin root>/src/Resources/app/administration/src
Shopware.Component.register('hello-world', () => import('./component/custom-component/hello-world'));
```

</Tab>

<Tab title="Synchronous loading">
This way you can import the file synchronously. In most cases this just slows down the loading time of the Administration and may not be needed. Hence, the asynchronous loading is preferred instead.

To import your component synchronously, you need to import it directly in the `main.js` file. The component registration
will be done in the `index.js` file of your component.

```javascript
// <plugin root>/src/Resources/app/administration/src
import './component/custom-component/hello-world';
```

</Tab>
</Tabs>

### Index.js as main entry point for this component

Head back to the `index.js` file, this one will be the most important for your component.

The structure of this file depends on the type of your component. If it loads synchronously, you need to register your component directly in this file. If it loads asynchronously, you can just export the component and register it in the `main.js` file.

<Tabs>
<Tab title="Asynchronous loading">
If you want to load your component asynchronously, you can just export it in the `index.js` file and register it in the `main.js` file.
To get full type support for your component, you should use the `wrapComponentConfig` function from the ComponentFactory.

```javascript
export default Shopware.Component.wrapComponentConfig({
    // Configuration here
});
```

</Tab>

<Tab title="Synchronous loading">
First you have to register your component using the `ComponentFactory`, which is available throughout our third party wrapper. This `Component` object provides a method `register`, which expects a name and a configuration for your component.

```javascript
// <plugin-root>/src/Resources/app/administration/src/component/custom-component/hello-world
Shopware.Component.register('hello-world', {
    // Configuration here
});
```

</Tab>
</Tabs>

A component's template is being defined by using the `template` property. For this short example, the template will be defined inline. An example for a bigger template will also be provided later on this page.

```javascript
// <plugin-root>/src/Resources/app/administration/src/component/custom-component/hello-world
export default Shopware.Component.wrapComponentConfig({
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

export default Shopware.Component.wrapComponentConfig('hello-world', {
    template: template
});
```

In the core code, you will find another syntax for the same result though:

```javascript
// <plugin-root>/src/Resources/app/administration/src/component/custom-component/hello-world.html.twig
import template from 'hello-world.html.twig';

export default Shopware.Component.wrapComponentConfig('hello-world', {
    template
});
```

This is a [shorthand](https://eslint.org/docs/latest/rules/object-shorthand), which can only be used if the variable is named exactly like the property.

## Next steps

You've now added a custom component, including a little template. However, there's more to discover here.

* [More about templates](../templates-styling/writing-templates.md)
* [Add some styling to your component](../templates-styling/add-custom-styles.md)
* [Use shortcuts for your component](../advanced-configuration/add-shortcuts.md)

Furthermore, what about [customizing other components](customizing-components.md), instead of creating new ones?
