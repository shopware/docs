# Override Existing Javascript

## Overview

If you have to customize the logic of some core JavaScript Storefront plugins you can override them with your own implementations. You will see how this works by extending the cookie permission plugin and showing the cookie notice on every page load and asking the user if he wants to hide cookie bar via a confirm dialogue.

## Prerequisites

While this is not mandatory, having read the guide about [adding custom javascript plugins](add-custom-javascript) in the first place might help you understand this guide a bit further. Other than that, this guide just requires you to have a running plugin installed, e.g. our plugin from the [Plugin base guide](../plugin-base-guide).

## Extending an existing JavaScript plugin

As JavaScript Storefront plugins are vanilla JavaScript classes, you can simply extend them.

::: info
Each JavaScript plugin can only be overridden once. If two Shopware plugins try to override the same plugin, only the last one of them will actually work.
:::

So let's start with creating the proper directory structure. This example will be called `my-cookie-permission`, as it's extending the default `cookie-permission` plugin.

So for this example you create a `<plugin root>/src/Resources/app/storefront/src/my-cookie-permission` directory and put an empty file `my-cookie-permission.plugin.js` in there. The latter will be your main plugin class file.

Next you create a JavaScript class that extends the original CookiePermission plugin inside your previously created file:

```javascript
import CookiePermissionPlugin from 'src/plugin/cookie/cookie-permission.plugin';

export default class MyCookiePermission extends CookiePermissionPlugin {
}
```

The first line just imports the original `cookie-permission` plugin class, so you can extend from it.

Now you can override the functions from the parent class.

### Always show the cookie bar

Let's start with the function, that the cookie bar should _always_ show up, no matter if the user already configured his cookie preferences or not. By having a look at the [original cookie permission plugin](https://github.com/shopware/platform/blob/v6.3.4.0/src/Storefront/Resources/app/storefront/src/plugin/cookie/cookie-permission.plugin.js#L46-L53), we can see that it's only shown when the item `this.options.cookieName` is set in the `CookieStorage`. The latter is just a neat helper from Shopware 6 itself to simplify dealing with cookies in JavaScript.

So we'll just override the `init()` method and make sure this value is always set to an empty string, which will evaluate to `false`.

After that you call the `init()` method of the original plugin.

```javascript
import CookiePermissionPlugin from 'src/plugin/cookie/cookie-permission.plugin';
import CookieStorage from 'src/helper/storage/cookie-storage.helper';

export default class MyCookiePermission extends CookiePermissionPlugin {
    init() {
        CookieStorage.setItem(this.options.cookieName, '');
        super.init();
    }
}
```

So now the cookie will always be set to an empty string, resulting in the cookie bar always being shown after a page reload.

### Adding confirm dialogue

Upon clicking the "Accept" or "Deny" button, you want to prompt a confirm dialogue if the user wants to hide the cookie bar. Therefore you override the `_hideCookieBar()` function to show the dialogue and only call the parent implementation if the user clicks "OK" in the confirm dialogue. So your whole plugin now looks like this:

```javascript
import CookiePermissionPlugin from 'src/plugin/cookie/cookie-permission.plugin';
import CookieStorage from 'src/helper/storage/cookie-storage.helper';

export default class MyCookiePermission extends CookiePermissionPlugin {
    init() {
        CookieStorage.setItem(this.options.cookieName, '');
        super.init();
    }

    _hideCookieBar() {
        if (confirm('Do you want to hide the cookie bar?')) {
            super._hideCookieBar();
        }
    }
}
```

Of course, if the user reloads the page, the bar will be back up.

### Register your extended plugin

A few things are now missing to actually register your overridden plugin version. Currently, Shopware doesn't even know your overridden plugin, so let's introduce it to Shopware.

Create a new file called `main.js` in the directory `<plugin root>/src/Resources/app/storefront/src/`, which represents the automatically loaded entry point for javascript files in a plugin.

Next you have to register your extended plugin using the `PluginManager` from the global window object for this. But instead of using the `register()` function to register a new plugin, you use the `override()` function to indicate that you want to override an existing plugin.

```javascript
import MyCookiePermission from './my-cookie-permission/my-cookie-permission.plugin';

const PluginManager = window.PluginManager;
PluginManager.override('CookiePermission', MyCookiePermission, '[data-cookie-permission]');

// Necessary for the webpack hot module reloading server
if (module.hot) {
    module.hot.accept();
}
```

### Testing your changes

To see your changes you have to build the Storefront. Use the following command and reload your Storefront.

<Tabs>
<Tab title="Template">

```bash
./bin/build-storefront.sh
```

</Tab>
<Tab title="platform only (contribution setup)">

```bash
composer run build:js:storefront
```

</Tab>
</Tabs>

You should see the cookie notice at the bottom of the page. If you click the "Accept" or the "Deny" button you should be prompted to confirm hiding the bar.

## Next steps

Sometimes you don't have to actually override a javascript plugin, since sometimes you can simply use an event instead. Learn how this is done in our guide about [listening to events](../plugin-fundamentals/listening-to-events).
