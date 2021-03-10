# Adding Shortcuts

## Overview 

Shortcuts in Shopware 6 are defined on a Component basis. This guide will show you how to add your own ones.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and preferably a registered module and custom component.
Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Configuring the Shortcuts

The following code sample will show you how to register shortcuts in your components with help of the `shortcuts` attribute.

{% code title="<plugin root>/src/Resources/app/administration/src/module/swag-example/index.js" %}
```javascript
const { Component } = Shopware;

Component.register('swag-basic-example', {
    
    shortcuts: {
        'SYSTEMKEY+S': {
            active() {
                return this.acl.can('product.editor');
            },
            method: 'myEditProductFunction'
        },
        ESCAPE: 'myCancelEditProductFunction'
    },

   
    methods: {
        myEditProductFunction() {
            console.log("myEditProductFunction")
        },
        myCancelEditProductFunction() {
            console.log("myCancelEditProductFunction")
        }
    }
});
```
{% endcode %}

The first keyboard shortcut reacts to the key combination of `SYSTEMKEY+S`, only if the the user has the privilege `product.editor`, with the invocation of the component method with the name `myEditProductFunction`.
The second keyboard shortcut defines that, upon the `ESCAPE` key being pressed, the function with the name `myCancelEditProductFunction` should be invoked.

Since ACL is used in the first keyboard shortcut you might want to learn more about ACL and how to add your own ACL rules [here](./add-acl-rules.md).

## Next steps

Now you that know how to add shortcuts to your components, you may want to learn more about [ACL](./add-acl-rules.md). Furthermore, if you want to learn about other possibilities to extend the Administration, we got you covered with other guides:

* [Writing templates](writing-templates.md)
* [Add custom module](add-custom-module.md)
* [Add menu entry](./add-menu-entry.md)
* [Add custom routes](./add-custom-route.md)
