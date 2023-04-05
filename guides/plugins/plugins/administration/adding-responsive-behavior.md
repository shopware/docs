# Adding responsive behavior

## Overview

The Shopware 6 Administration provides two ways of adding classes to elements based on their size, the device helper and the `v-responsive` directive. Alternatively you can use `css` media queries to make your plugin responsive. Learn how to use `css` here:

<PageRef page="add-custom-styles" />

## DeviceHelper

The DeviceHelper provides methods to get device and browser information like the current viewport size. The helper methods can be accessed with `this.$device` in every Vue component, since it is bound to the Vue prototype.

It makes it possible to run functions to react to `onResize` events with adding classes or removing them. The example below shows you how to use the `$device.onResize` helper.

```javascript
const listener = function (ev) {
    // do something on resize with the event, like adding or removing classes to elements   
};

const scope = this;
const component = 'sw-basic-example';

this.$device.onResize({ listener, scope, component });
```

The code snippet before could be placed in the `mounted` [Vue lifecycle](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram) hook to register those listeners automatically. Then you can automatically remove the listeners in the `onDestroy` hook

```javascript
this.$device.removeResizeListener(component);
```

It also provides many helper functions e.g. to get the screen dimensions. Although there are many more as seen below:

| Function | Description |
| :--- | :--- |
| `this.$device.getViewportWidth();` | Gets the viewport width |
| `this.$device.getViewportHeight();` | Gets the viewport height |
| `this.$device.getDevicePixelRatio();` | Gets the device pixel ratio |
| `this.$device.getScreenWidth();` | Gets the screen width |
| `this.$device.getScreenHeight();` | Gets screen height |
| `this.$device.getScreenOrientation();` | Gets the screen orientation |

## v-responsive directive

The `v-responsive` directive can be used to dynamically apply classes based on an element's dimensions.

```html
<input v-responsive="{ 'is--compact': el => el.width <= 1620, timeout: 200 }">
```

Let's do a small explanation of this directive:

* Apply class \(in this case: `is--compact`\) when the width of the element is smaller than 1620px.
* `timeout`: Sets the duration on how much the throttle should wait.
