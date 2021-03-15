# Adding Mixins

## Overview
This documentation chapter will cover how to add a new administration Mixin for your plugin.
Generally, mixins behave the same as they do in Vue normally, differing only in the registration and the way mixins are included in a component.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. As stated before mixins in Shopware are basically the same as in Vue so you should have read their [documentation](https://vuejs.org/v2/guide/mixins.html) on them first. 

## Register a new Mixin

For this example, we'll just use the example mixin from the [VueJS documentation](https://vuejs.org/v2/guide/mixins.html) and adjust it to be used in Shopware.

Mixins in Shopware have to be registered in the mixin registry via the `Mixin.register` function to be available everywhere in the administration.

Converting the Vue mixin to be used in Shopware looks like the example seen below:

{% code title="<administration root>/mixins/swag-basic-example.js" %}
```javascript
// get the Mixin property of the shopware object
const { Mixin } = Shopware;

// give the mixin a name and feed it into the register function as the second argunment
Mixin.register('swag-basic-mixin', {
    created: function () {
        this.hello()
    },
    methods: {
        hello: function () {
            console.log('hello from mixin!')
        }
    }
});
```
{% endcode %}

## Importing the Mixin in the Plugin

Now that we have registered the mixin, we need to import it at the top of our `main.js` file.

```javascript
{% code title="<administration root>/src/main.js" %}
import '<administration root>/mixins/swag-basic-example.js'
{% endcode %}
```

## Using the Mixin

After registering our mixin under a name, we can get it from the registry with the `Mixin.getByName` function and inject it into our component as seen below.

{% code title="<administration root>/components/swag-basic-example/index.js" %}
```javascript
const { Component, Mixin } = Shopware;

Component.register('swag-basic-example', {

    mixins: [
        Mixin.getByName('swag-basic-mixin')
    ],
});
```
{% endcode %}

## Next steps

Now that you learned how to created a mixin, you might want to create or customize an administration component:
* [Creating a new administration component](./add-custom-component.md)
* [Extending an existing administration component](./customizing-components.md)

If you however want to add your own service to the administration:
* [Adding services](./add-custom-service.md)
