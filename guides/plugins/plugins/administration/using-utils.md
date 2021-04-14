# Using Utility functions

Utility functions in the Shopware 6 Administration are registered to the Shopware object and are therefore accessible everywhere in the Administration. They provide many useful shortcuts for common tasks, see all of them [here](../../../../resources/references/core-reference/administration-reference/utils.md) in our reference section.

## Prerequisites

All you need for this guide is a running Shopware 6 instance, the files and preferably a registered module. Of course you'll have to understand JavaScript. However, that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Accessing the Utility functions

As noted in the introduction utils in the Shopware 6 Administration are bound to the Shopware global object. Learn more about that [here](the-shopware-object.md).

In this very short example we'll show you how to use a function of utility functions, in this case the `capitalizeString` function. The `capitalizeString` function in turn calls the [`lodash capitalize`](https://lodash.com/docs/4.17.15#capitalize) function wich as the name implies capitalizes strings.

{% code title="<plugin-root>/src/Resources/app/administration/app/src/component/swag-basic-example/index.js" %}
```javascript
const { Component, Utils } = Shopware;

Component.register('swag-basic-example', {

    data: function () {
        return {
            string: 'hello',
            capitalizedString: undefined
        }
    },

    created: function () {
        this.capitalize()
    },

    methods: {
        capitalize() {
            this.capitalizedString = Utils.string.capitalizeString(this.string);
        }
    }
});
```
{% endcode %}

## An overview of all the functions

In the example before we just used the `deepCopy` function, but there more functions than reasonable to display in this guide.

If want to look up at all available utility functions, take a look at the previously mentioned [reference page](../../../../resources/references/core-reference/administration-reference/utils.md)

## More interesting topics

* [Adding filters](add-filter.md)
* [Adding mixins](add-mixins.md)

