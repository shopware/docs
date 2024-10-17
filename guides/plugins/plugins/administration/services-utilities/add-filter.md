---
nav:
  title: Add filter
  position: 280

---

# Add filter

## Overview

In this guide you'll learn, how to create a filter for the Shopware Administration. A filter is just a little helper for formatting text. In this example, we create a filter that converts text into uppercase and adds an underscore at the beginning and end.

## Prerequisites

This guide requires you to already have a basic plugin running. If you don't know how to do this in the first place, have a look at our [Plugin base guide](../plugin-base-guide).

## Creating the filter

First we create a new file in the directory `<plugin root>/src/Resources/app/administration/src/app/filter`. In this case we name our filter `example`, so our file will be named `example.filter.js`.

Here's an example how your filter could look like:

```javascript
// <plugin root>/src/Resources/app/administration/src/app/filter/example.filter.js
const { Filter } = Shopware;

Filter.register('example', (value) => {
    if (!value) {
        return '';
    }

    return `_${value.toLocaleUpperCase()}_`;
});
```

As you can see, it's very simple. We use `Filter` from the `Shopware` object where we can register our filter with the method `register`. The first argument we pass is the name of our filter, which is `example`. The second argument is a function with which we format our text.

If you want to use multiple arguments in your filter function, it could look like this:

```javascript
Filter.register('example', (value, secondValue, thirdValue) => {
    ...
});
```

Last, import the filter into your plugin's `main.js` file.

## Next steps

Now that you know how to create a filter for the Administration, we want to use it in our code. For this head over to our [using filter](using-filter) guide.
