# Overview
Routes in the Shopware 6 Administration are essentially the same as in any other [Vue Router] (https://router.vuejs.org/) This guide will teach you the basics of creating your very first route from scratch.

## Prerequisites
All you need for this guide is a running Shopware 6 instance and full access to both the files and preferably a registered module.
Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Configuring the route
In order to add routes to a module you simply add a routes property, which expects an object containing multiple route configuration objects. Each route configuration object needs to have a name, which is set using the configuration object's key, a component to render and a path.

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
The component represents the technical name of the component, which is then rendered when this route is matched. Routes can be matched by name and path. This configuration results in this route's full name being `custom.module.overview` and the URL being `/overview` relative to the Administration's default URL.
Usually you want to render your custom component here, which is explained [PLACEHOLDER-LINK: Creating a component in the Administration] here.
But that is not all! Routes can have parameters, to then be handed to the components being rendered and much more. Learn more about what the Vue Router can do in its official [Documentation] (https://router.vuejs.org/guide/essentials/dynamic-matching.html#reacting-to-params-changes).

## Next steps
As you might have noticed, your route is just rendering a Shopware made component.
But here's a list of things you can do now:
* Creating a new administration component [PLACEHOLDER-LINK: Creating administration module]
* Extending an existing administration component to display [PLACEHOLDER-LINK: Plugin configuration]