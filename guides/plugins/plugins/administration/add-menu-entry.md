# Add menu entry

When it comes to the module configuration, the menu entry is one of the mos important things to set up. It serves to open your module.

This menu entry can be defined in your module configuration. Remember, your module configuration

{% code title="<plugin root>/src/Resources/app/administration/src/module/swag-example/index.js" %}
```javascript
Shopware.Module.register('swag-plugin', {
    // configuration here
});
```
{% endcode %}

For details on this module configuration, please refer to the guide about [adding a custom module](./add-custom-module.md).

In order to create your own menu entry, you need to use the `navigation` key: It takes an array of objects, each one configuring a route connected to your module.

## Simple menu entry

So let's define a menu entry using the `navigation` key in your module configuration. It takes an array of objects, each one configuring a route connected to your module:

{% code title="<plugin root>/src/Resources/app/administration/src/module/swag-example/index.js" %}
```javascript
navigation: [{
    label: 'CustomModule',
    color: '#ff3d58',
    path: 'swag.custommodule.list',
    icon: 'default-shopping-paper-bag-product',
    position: 100
}]
```
{% endcode %}

As you see, you are able to configure several things in there:

| Configuration | Description |
| :--- | :--- |
| label | The label to be shown with this menu entry. |
| color | This  is the theme color of the module. This color may differ from the module's color itself. |
| path | Which one of your configured routes shall be used when clicking this menu entry? Make sure to leave the path's name here. |
| icon | Also you can set a separate icon, which can make sense e.g. when having multiple menu entries for a single module, such as a special icon for 'Create bundle'. This example does not have this and it's only going to have a single menu entry, so use the icon from the main module here. |
| position | The position of the menu entry. The higher the value, the more likely it is that your menu entry appears in the bottom. |

Of course there's more to be configured here, but more's not necessary for this example.

## Menu entry in category

Due to UX reasons, we're not supporting plugin modules to add new menu entries on the first level of the main menu. Please use the "parent" property inside your navigation object to define the category where you want your menu entry will be appended to:

{% code title="<plugin root>/src/Resources/app/administration/src/module/swag-example/index.js" %}
```javascript
navigation: [{
    label: 'CustomModule',
    color: '#ff3d58',
    path: 'swag.custommodule.list',
    icon: 'default-shopping-paper-bag-product',
    parent: 'sw-catalogue',
    position: 100
}]
```
{% endcode %}

If you're planning to publish your plugin to the Shopware Store keep in mind we're rejecting plugins which have created their own menu entry on the first level.

