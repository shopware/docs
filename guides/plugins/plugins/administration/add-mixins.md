# Adding Mixins

## Overview

This documentation chapter will cover how to add a new Administration mixin for your plugin. In general, mixins behave the same as they do in Vue normally, differing only in the registration and the way mixins are included in a component. If you want an overview over the shopware provided mixins look at them here: [Using Mixins](using-mixins).

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. As stated before mixins in Shopware are basically the same as in Vue, so you should have read their [documentation](https://vuejs.org/v2/guide/mixins.html) on them first.

## Register a new Mixin

For this example, we'll just use the example mixin from the [VueJS documentation](https://vuejs.org/v2/guide/mixins.html) and adjust it to be used in Shopware.

Mixins in Shopware have to be registered in the mixin registry via the `Mixin.register` function to be available everywhere in the Administration.

Converting the Vue mixin to be used in Shopware looks like the example seen below:

```javascript
// <administration root>/mixins/swag-basic-example.js
// get the Mixin property of the shopware object
const { Mixin } = Shopware;

// give the mixin a name and feed it into the register function as the second argument
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

## Importing the Mixin in the Plugin

Now that we have registered the mixin, we need to import it *before importing our components* in the `main.js` file.

```javascript
// <administration root>/src/main.js
import '<administration root>/mixins/swag-basic-example.js'
    
// importing components...
```

## Using the Mixin

After registering our mixin under a name, we can get it from the registry with the `Mixin.getByName` function and inject it into our component as seen below.

```javascript
// <administration root>/components/swag-basic-example/index.js
const { Component, Mixin } = Shopware;

Component.register('swag-basic-example', {

    mixins: [
        Mixin.getByName('swag-basic-mixin')
    ],
});
```

This can also be done with Shopware provided mixins, learn more about them here: [Using Mixins](using-mixins)

## More interesting topics

* [Adding filters](add-filter)
* [Using utils](using-utils)
