---
nav:
  title: Using utility functions
  position: 250

---

# Using utility functions

Utility functions in the Shopware 6 Administration are registered to [the Shopware object](the-shopware-object) and are therefore accessible everywhere in the Administration. They provide many useful [shortcuts](../../../../resources/references/core-reference/administration-reference/utils) for common tasks.

## Prerequisites

All you need for this guide is a running Shopware 6 instance, the files, a registered module, and a good understanding of JavaScript.

## Accessing the utility functions

Let us see how to use one of the utility functions — for example, `capitalizeString` function. As the name implies, the `capitalizeString` function capitalizes strings by calling the [`lodash capitalize`](https://lodash.com/docs/4.17.15#capitalize) function.

```javascript
// <extension root>/src/Resources/app/administration/app/src/component/swag-basic-example/index.js
const { Component, Utils } = Shopware;

Component.register('swag-basic-example', {
    data() {
        return {
            text: 'hello',
            capitalizedString: undefined,
        };
    },

    created() {
        this.capitalize();
    },

    methods: {
        capitalize() {
            this.capitalizedString = Utils.string.capitalizeString(this.string);
        },
    },
});
```

## More, interesting topics

* [Adding filters](add-filter)
* [Adding mixins](add-mixins)
