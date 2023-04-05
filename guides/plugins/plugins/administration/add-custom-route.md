---
nav:
  title: Add custom route
  position: 30

---

# Add custom route

Routes in the Shopware 6 Administration are essentially the same as in any other [Vue Router](https://router.vuejs.org). This guide will teach you the basics of creating your very first route from scratch.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and preferably a registered module. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Configuring the route

So lets start with configuring our own route. In order to add routes to a module you simply add the `routes` property, which expects an object containing multiple route configuration objects. Each route configuration object needs to have a `name`, which is set using the configuration object's key. Furthermore, we need to set a component and a path: A route points to a [component](https://vuejs.org/v2/guide/components.html) using the key `component`, which targets the component to be shown when this route is requested. The key `path` represents the actual path, that's going to be used for this route. Do not get confused just because it is equal to the route name in the first route.

Now, our route should look like this:

```javascript
// routes: {
//     nameOfTheRoute: {
//         component: 'example',
//         path: 'actualPathInTheBrowser'
//     }
// }
routes: {
    overview: {
        component: 'sw-product-list',
        path: 'overview'
    },
},
```

Routes can be matched by name and path. This configuration results in this route's full name being `custom.module.overview` and the URL being `/overview` relative to the Administration's default URL. Usually you want to render your custom component here, which is explained [here](add-custom-component). But that is not all! Routes can have parameters, to then be handed to the components being rendered and much more. Learn more about what the Vue Router can do in its official [Documentation](https://router.vuejs.org/guide/essentials/dynamic-matching.html#reacting-to-params-changes).

## Meta data and dynamic parameters

Let's extend this example:

```javascript
Shopware.Module.register('swag-example', {
    color: '#ff3d58',
    icon: 'default-shopping-paper-bag-product',
    title: 'My custom module',
    description: 'Manage your custom module here.',

    routes: {
        overview: {
            component: 'swag-example-list',
            path: 'overview'
        },
        // This is our second route
        detail: {
            component: 'sw-example-detail',
            path: 'detail/:id',
            meta: {
                parentPath: 'swag.example.list'
            }
        }
    },
});
```

This second route, `detail`, comes with a dynamic parameter as part of the route. When you want to open a detail page of an example, the route also has to contain the ID of the example, in the `path` of `detail`:

```javascript
path: 'detail/:id'
```

Furthermore, the `detail` route comes with another new configuration, which is called `meta`. As the name suggests, you can use this object to apply more meta information for your route. In this case the `parentPath` is filled. Its purpose is to link the path of the actual parent route. In the Administration, this results in a "back" button on the top left of your module when being on the detail page. This button will then link back to the list route and the icon defined earlier will also be used for this button.

You might want to have a closer look at the `parentPath` value though. Its route follows this pattern: `<bundle-name>.<name of the route>`

See in this example:

```javascript
...
   meta: {
       parentPath: 'swag.example.list'
   }
...
```

The `bundle-name` is separated by dots instead of dashes here though. The second part is the **name** of the route, the key of the route configuration that is. Thus the path to the `list` route is `swag.example.list`. The same applies for the `create` route.

## More interesting topics

* [Adding a custom service](add-custom-service)
* [Customizing a module](customizing-modules)
* [Adding permissions](add-acl-rules)
