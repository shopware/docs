# Reacting to Javascript Events

## Overview

Just like in PHP, there may be useful events in our JavaScript plugins, which you can use to extend the default behavior. This guide will show you how this is done and you can find events, if there's any available for your needs.

## Prerequisites

As most guides, this one is built upon our [Plugin base guide](../plugin-base-guide), but that one is not necessary, you do need a running plugin though! Also this guide will **not** explain how to create a JavaScript plugin in general, head over to our guide [adding custom javascript](add-custom-javascript) to understand how that's done in the first place.

## JavaScript base class

As already mentioned, this guide will not explain how to create a JavaScript plugin in the first place. For this guide, we'll use the following example JavaScript plugin:

```javascript
// <plugin root>/src/Resources/app/storefront/src/events-plugin/events-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';

export default class EventsPlugin extends Plugin {
    init() {
    }
}
```

This one will be used from now on.

## Finding events

So before you can start reacting and listening to events, you need to find them first. Since not every plugin implements events, they can be hard to find by just looking through the code.

Instead, rather search for `this.$emitter.publish` in the directory `platform/src/Storefront/Resources/app/storefront/src` to find all occurrences of events being published. This way, you may or may not find an event useful for your needs, so you don't have to override other JavaScript plugins.

## Registering to events

Now that you possibly found your event, it's time to register to it and execute code once it is fired. For this example, we will listen to the event when the cookie bar is hidden. The respective event can be found via the name [hideCookieBar](https://github.com/shopware/platform/blob/v6.3.4.1/src/Storefront/Resources/app/storefront/src/plugin/cookie/cookie-permission.plugin.js#L71).

```javascript
// <plugin root>/src/Resources/app/storefront/src/events-plugin/events-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';

export default class EventsPlugin extends Plugin {
    init() {
        const plugin = window.PluginManager.getPluginInstanceFromElement(document.querySelector('[data-cookie-permission]'), 'CookiePermission');
        plugin.$emitter.subscribe('hideCookieBar', this.onHideCookieBar);
    }

    onHideCookieBar() {
        alert("The cookie bar has been hidden!");
    }
}
```

Let's have a look at the code. There's one thing you have to understand first. When a plugin calls `this.$emitter.publish`, this event is fired on the plugin's own `$emitter` instance. This means: Every plugin has its own instance of the emitter. Therefore, you cannot just use `this.$emitter.subscribe` to listen to other plugin's events.

Rather, you have to fetch the respective plugin instance using the `PluginManager` and then you have to use `subscribe` on their `$emitter` instance: `plugin.$emitter.subscribe`

And this is done here. We're fetching the instance of the `CookiePermission` plugin by its [selector](https://github.com/shopware/platform/blob/v6.3.4.1/src/Storefront/Resources/app/storefront/src/main.js#L103) via the `PluginManager` and using that instance to register to the event. Once the event is then fired, our own method `onHideCookieBar` is executed and the `alert` will be shown.

::: warning
This does **not** prevent the execution of the original method. Consider those events to be "notifications".
:::

## Next steps

Everytime you don't find an event to implement the changes you need, you may have to override the plugin itself. For this case, head over to our guide about [Override existing javascript](override-existing-javascript).
