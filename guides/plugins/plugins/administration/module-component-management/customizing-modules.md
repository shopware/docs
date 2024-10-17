---
nav:
  title: Customize modules
  position: 140

---

# Customize modules

## Overview

In the `Administration` core code, each module is defined in a directory called `module`. A `module` is an encapsulated unit which implements a whole feature. For example there are modules for customers, orders, settings, etc.

## Prerequisites

All you need for this guide is a running Shopware 6 instance. Of course, you'll have to understand JavaScript and have a basic familiarity with TwigJS, the templating engine, used in the Administration. However, that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Customizing a module

Module settings like `color`, `icon`, `navigation` are fixed by design and cannot be changed.

A guide for customizing components, which are already defined in existing modules, can be found here - [Customizing components](customizing-components).

However, modules themselves cannot be directly overridden.

At some point you need to add or change the routes of a module. For example when you want to add a tab to the page.

This is done by creating a new module and implementing a `routeMiddleware`. You can add those changes to your `main.js` file, which could then look like this:

```javascript
// <plugin root>/src/Resources/app/administration/src/main.js
Shopware.Module.register('my-new-custom-route', {
    routeMiddleware(next, currentRoute) {
        if (currentRoute.name === 'sw.product.detail') {
            currentRoute.children.push({
                name: 'sw.product.detail.custom',
                path: '/sw/product/detail/:id/custom',
                component: 'sw-product-detail-custom',
                meta: {
                    parentPath: "sw.product.index"
                }
            });
        }
        next(currentRoute);
    }
});
```

In this example we register a new module which uses the `routeMiddleWare` to scan the routes while the `Vue router` is being set up. If we find the route `sw.product.detail` we just add another child route by pushing it to the `currentRoute.children`.

You can find a detailed example in the [Add tab to existing module](add-new-tab) guide.

## More interesting topics

* [Customizing components](customizing-components)
* [Adding a route](add-custom-route)
