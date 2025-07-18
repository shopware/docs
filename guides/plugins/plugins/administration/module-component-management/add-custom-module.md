---
nav:
  title: Add custom module
  position: 10

---

# Add custom module

In the `Administration` core code, each module is defined in a directory called `module`.
Inside the `module` directory lies the list of several modules, each having their own directory named after the module itself.

## Prerequisites

This guide **does not** explain how to create a new plugin for Shopware 6.
Head over to our Plugin base guide to learn how to create a plugin at first:

<PageRef page="../../plugin-base-guide" />

## Creating the index.js file

The first step is creating a new directory `<plugin root>/src/Resources/app/administration/src/module/swag-example`, so you can store your own modules files in there.
Right afterward, create a new file called `index.js` in there. Consider it to be the main file for your custom module.

::: warning
This is necessary, because Shopware 6 is automatically requiring an `index.js` file for each module.
:::

Your custom module directory isn't known to Shopware 6 yet.
The entry point of your plugin is the `main.js` file.
That's the file you need to change now so that it loads your new module.
For this, add the following line to your `main.js` file:

```javascript
// <plugin root>/src/Resources/app/administration/src/main.js
import './module/swag-example';
```

Now your module's `index.js` will be executed.

## Registering the module

Your `index.js` is still empty now, so let's get going to actually create a new module.
This is technically done by calling the method `registerModule` method of our [ModuleFactory](https://github.com/shopware/shopware/blob/trunk/src/Administration/Resources/app/administration/src/core/factory/module.factory.ts), but you're not going to use this directly.

Instead, you're using the `Shopware.Module.register()` method, but why is that?

`Shopware` is a [global object](../data-handling-processing/the-shopware-object.md) created for third party developers.
It is mainly the bridge between the Shopware Administration and our plugin.
The `Module` object comes with a `register` helper method to easily register your module.
The method needs two parameters to be set, the first one being the module's name, the second being a javascript object, which contains your module's configuration.

```javascript
// <plugin root>/src/Resources/app/administration/src/module/swag-example/index.js
Shopware.Module.register('swag-example', {
    // configuration here
});
```

## Configuring the module

In this file, you can configure a couple of things, e.g., the color of your module.
Each module needs a primary color, which will be used on specific accents and locations throughout your module.
To name a few, it's the color of the main icon of the module, the tag in the global search input and the accent color of the smart bar.

In this example `#ff3d58` is used as a color, which is a soft red.
Also, each module has its own icon. You can see [here](https://shopware.design/icons/) which icons are available in Shopware 6 by default.
In our case here, let's say we use the icon `regular-shopping-bag`, which will also be used for the module.

::: danger
This is not the icon being used for a menu entry! The icon for that needs to be configured separately.
Please refer to the [Add a menu entry](../routing-navigation/add-menu-entry.md) guide for more information on this topic.
:::

In addition, you're able to configure a title here, which will be used for the actual browser title.
Just add a string for the key `title`.
This will be the default title for your module, you can edit this for each component later on.

The `description` is last basic information you should set here, which will be shown as an empty-state.
That means the description will be shown e.g., when you integrated a list component, but your list is empty as of now.
In that case, your module's description will be displayed instead.

Another important aspect is the routes that your module is going to use, such as e.g. `swag-example-list` for the list of your module, `swag-example-detail` for the detail page and `swag-example-create` for creating a new entry.
Those routes are configured as an object in a property named `routes`. We will cover that in the next paragraph.

## Setting up menu entry and routes

The next steps are covered in their own guides. The first one would be adding a menu entry, so please take a look at the guide regarding:

<PageRef page="../routing-navigation/add-menu-entry" />

The second one refers to setting up custom routes; its guide can be found in the guide on adding custom routes:

<PageRef page="../routing-navigation/add-custom-route" />

## Set up additional meta info

If you have been following that guide, then you should have got a menu entry then.
The related routes are also set up already and linked to components, which will be created in the next main step.
There's a few more things we need to change in the configurations though that you should add to your module, such as a unique `name` and a `type`.
For reference, see this example:

```javascript
// <plugin root>/src/Resources/app/administration/src/module/swag-example/index.js
Shopware.Module.register('swag-example', {
    type: 'plugin',
    name: 'Example',
    title: 'swag-example.general.mainMenuItemGeneral',
    description: 'sw-property.general.descriptionTextModule',
    color: '#ff3d58',
    icon: 'regular-shopping-bag',
...
```

The `name` should be technically unique, the `type` would be 'plugin' here. When it comes to this `type`, there are basically two options in Shopware: `core` and `plugin`.
So every third-party module should use `plugin`.
To give a little context: Looking at `module.factory` inside `registerModule` the plugin type is the only case which is being checked and has some different behavior.
So it is more a convention and not a real validation which throws an error when `type` is divergent to these options.

## Implementing snippets

You've already set a label for your module's menu entry.
Yet, by default the `Administration` expects the value in there to be a [Vuei18n](https://kazupon.github.io/vue-i18n/started.html#html) variable, a translation key that is.
It's looking for a translation key `example` now and since you did not provide any translations at all yet, it can't find any translation for it and will just print the key of a snippet.
Now let's implement the translation snippets.

This is done by providing a new object to your module configuration, `snippets` this time.
This object contains another object for each language you want to support.
In this example `de-DE` and of course `en-GB` will be supported.

Each language then contains a nested object of translations, so let's have a look at an example:

```json
{
    "swag-example": {
        "nested": {
            "value": "example"
        },
        "foo": "bar"
    }
}
```

In this example you would have access to two translations by the following paths: `swag-example.nested.value` to get the value 'example' and `swag-example.foo` to get the value 'bar'.
You can nest those objects as much as you want. Please note that each path is prefixed by the extension name.

Since those translation objects become rather large, you should store them into separate files.
For this purpose, create a new directory `snippet` in your module's directory and in there two new files: `de-DE.json` and `en-GB.json`.
The snippet files will be loaded automatically based on the folder structure.

Let's also create the first translation, which is for your menu's label.
It's key should be something like this: `swag-example.general.mainMenuItemGeneral`

Thus open the `snippet/en-GB.json` file and create the new object in there.
The structure here is the same as in the first example, just formatted as json file.
Afterward, use this path in your menu entry's `label` property.

To translate the `description` or the `title`, add those to your snippet file as well and edit the values in your module's `description` and `title`.
The title will be the same as the main menu entry by default.

This should be your snippet file now:

```json
{
    "swag-example": {
        "general": {
            "mainMenuItemGeneral": "My custom module",
            "descriptionTextModule": "Manage this custom module here"
        }
    }
}
```

## Build the Administration

As mentioned above, Shopware 6 is looking for a `main.js` file in your plugin.
Its contents get minified into a new file named after your plugin and will be moved to the `public` directory of Shopware 6 root directory.
Given this plugin would be named "AdministrationNewModule", the bundled and minified javascript code for this example would be located under `<plugin root>/src/Resources/public/administration/js/administration-new-module.js`, once you run the command following command in your shopware root directory:

<Tabs>
<Tab title="Template">

```bash
./bin/build-administration.sh
```

</Tab>

<Tab title="platform only (contribution setup)">

```bash
composer run build:js:admin
```

</Tab>
</Tabs>

::: info
Your plugin has to be activated for this to work.
:::

Make sure to also include that file when publishing your plugin!
A copy of this file will then be put into the directory `<shopware root>/public/bundles/administration/administrationnewmodule/administration/js/administration-new-module.js`.

Your minified JavaScript file will now be loaded in production environments.

## Special: Case Settings

### Link your module into settings

If you think about creating a module concerning settings, you might want to link your module in the `settings` section of the Administration.
You can add the `settingsItem` option to the module configuration as seen below:

```javascript
// <plugin root>/src/Resources/app/administration/src/module/swag-example/index.js
import './page/swag-plugin-list';
import './page/swag-plugin-detail';
Shopware.Module.register('swag-plugin', {
    ...
    settingsItem: [{
        group: 'plugins',
        icon: 'regular-rocket',
        to: 'swag.plugin.list',
        name: 'SwagExampleMenuItemGeneral', // optional, fallback is taken from module
        id: '', // optional, fallback is taken from module
        label: '', // optional, fallback is taken from module
        iconComponent: YourCustomIconRenderingComponent, // optional, this overrides the component used to render the icon
    }]
});
```

The `group` property determines the tab, the item will be displayed in. Valid options are 'shop', 'system' and 'plugins'.

The `icon` property contains the icon name which will be displayed. Refer to the [Meteor Icon Kit documentation](https://developer.shopware.com/resources/meteor-icon-kit/) for icon names.

The `to` property must contain the name of the route. The route has to be defined in a separate routes section as described [here](../routing-navigation/add-custom-route.md). Have a look at the `Configuring the route` section in particular to find out about the name of your route.

## Example for the final module

Here's your final module:

```javascript
// <plugin root>/src/Resources/app/administration/src/module/swag-example/index.js
import './page/swag-example-list';
import './page/swag-example-detail';
import './page/swag-example-create';
import deDE from './snippet/de-DE';
import enGB from './snippet/en-GB';

Shopware.Module.register('swag-example', {
    type: 'plugin',
    name: 'Example',
    title: 'swag-example.general.mainMenuItemGeneral',
    description: 'sw-property.general.descriptionTextModule',
    color: '#ff3d58',
    icon: 'regular-shopping-bag',

    snippets: {
        'de-DE': deDE,
        'en-GB': enGB
    },

    routes: {
        list: {
            component: 'swag-example-list',
            path: 'list'
        },
        detail: {
            component: 'swag-example-detail',
            path: 'detail/:id',
            meta: {
                parentPath: 'swag.example.list'
            }
        },
        create: {
            component: 'swag-example-create',
            path: 'create',
            meta: {
                parentPath: 'swag.example.list'
            }
        }
    },

    navigation: [{
        label: 'swag-example.general.mainMenuItemGeneral',
        color: '#ff3d58',
        path: 'swag.example.list',
        icon: 'regular-shopping-bag',
        position: 100
    }]
});
```

## Next steps

As you might have noticed, we are just adding a custom module to the module.
However, there's a lot more possible when it comes to extending the Administration.
In addition, you surely want to customize your module even more.
You may want to try the following things:

* [Add custom component](../module-component-management/add-custom-component.md)
* [Add a menu entry](../routing-navigation/add-menu-entry.md)
* [Add a custom route](../routing-navigation/add-custom-route.md)
* [Add a custom service](../services-utilities/add-custom-service.md)
* [Add translations](../templates-styling/adding-snippets.md)
* [Customizing another module](customizing-modules.md)
* [Dealing with data in the Administration](../data-handling-processing/using-data-handling.md)
* [Adding permissions to your module](../permissions-error-handling/add-acl-rules.md)
