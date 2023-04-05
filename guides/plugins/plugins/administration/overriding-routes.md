# Override existing routes

## Overview

In the `Administration` core code, each module is defined in a directory called `module`. Modules define routes which can be extended with `routeMiddleware`. To see what else you can customize in existing modules, have a look at this [guide](customizing-modules)

A `module` is an encapsulated unit which implements a whole feature. For example there are modules for customers, orders, settings, etc.

## Prerequisites

All you need for this guide is a running Shopware 6 instance. Of course, you'll have to understand JavaScript and have a basic familiarity with [Vue](https://vuejs.org/) and the [Vue Router](https://router.vuejs.org/). However, that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. Further a basic understanding of what modules are is also required, learn more about them [here](add-custom-module)

## Applying the override

At some point you might want to override or change existing routes, for example, to change the privileges required for a route or entirely replace it with your own.

This is done by creating a new module and implementing a `routeMiddleware`. You can add those changes to your `main.js` file, which could then look like this:

```javascript
// <plugin root>/src/Resources/app/administration/src/main.js
Module.register('my-new-custom-route', {
    routeMiddleware(next, currentRoute) {
        if (currentRoute.name === 'sw.product.detail') {

            const childIndex = currentRoute.children.findIndex(child => child.name === 'sw.product.detail.base');

            currentRoute.children[childIndex] = {
                name: 'sw.product.detail.base',
                component: 'sw-product-detail-base',
                path: 'base',
                meta: {
                    parentPath: 'sw.product.index',
                    privilege: 'product.editor'
                }
            }
        }
        next(currentRoute);
    }
});
```

This `routeMiddleware` changes the required privileges for the `sw.product.detail.base` route from `product.viewer` to `product.editor`. The rest of the route configurations stays the same in this example.

If you want to learn more about ACL take a look at this [guide](add-acl-rules) and if you want to learn everything about Administration routes, head over to this [guide](add-custom-route)
