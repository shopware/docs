# The Sanitizer helper

## Overview

The Shopware 6 Sanitizer Helper is a wrapper around [`DOMPurify`](https://github.com/cure53/DOMPurify), which is used to sanitize HTML in order to prevent `XSS attacks`.

## Where is it registered?

The Sanitizer Helper is registered to the [Shopware Global Object](./the-shopware-object) and therefore can be accessed anywhere in your plugin.

```javascript
const sanitizer = Shopware.Helper.SanitizerHelper; 
```

It also is registered in the Vue prototype as seen [here](https://github.com/shopware/platform/blob/trunk/src/Administration/Resources/app/administration/src/app/plugin/sanitize.plugin.js).
This means it can also be accessed in your components like this:

```javascript
const Sanitizer = this.$sanitizer;
const sanitize = this.$sanitize;
```

## Sanitizing HTML

As mentioned before the `SanitizerHelper` is registered to the [Shopware Global Object](./the-shopware-object) and therefore can be accessed like this everywhere:

```javascript
Shopware.Helper.SanitizerHelper.sanitize('<img src=x onerror=alert(1)//>'); // becomes <img src="x">
```

And since it is bound to the Vue prototype it can be used in all Vue components like this:

```javascript
this.$sanitizer.sanitize('<svg><g/onload=alert(2)//<p>'); // becomes <svg><g></g></svg>
this.$sanitize('<img src=x onerror=alert(1)//>'); // becomes <img src="x">
```

## How to set the config

The config can be set with the `setConfig` and cleared with the `clearConfig` function, as seen below:

```javascript
Shopware.Helper.SanitizerHelper.setConfig({
    USE_PROFILES: { html: true }
});

Shopware.Helper.SanitizerHelper.clearConfig()
```

See all of the configuration options [here](https://github.com/cure53/DOMPurify#can-i-configure-dompurify)

## How to add hooks

The aforementioned Wrapper also provides functions to add and remove hooks to DOMPurify.
Learn what DOMPurify hooks are in their [documentation](https://github.com/cure53/DOMPurify#hooks).

```javascript
Shopware.Helper.SanitizerHelper.addMiddleware('beforeSanitizeElements',  function (
        currentNode,
        hookEvent,
        config
    ) {
        // Do something with the current node and return it
        // You can also mutate hookEvent (i.e. set hookEvent.forceKeepAttr = true)
        return currentNode;
    }
);

Shopware.Helper.SanitizerHelper.removeMiddleware('beforeSanitizeElements');
```
