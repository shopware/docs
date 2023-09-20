# Remove Javascript Plugin

## Overview

When you develop your own plugin, you might want to exclude Javascript plugins at some occasions. For example, if you don't want a Core plugin to interfere, with your own code. This guide will teach you how to remove this Javascript plugin with your own Shopware plugin.

## Prerequisites

While this is not mandatory, having read the guide about adding custom javascript plugins beforehand might help you understand this guide a bit further:

<PageRef page="add-custom-javascript" />

Other than that, this guide just requires you to have a running plugin installed, e.g. our plugin from the plugin base guide:

<PageRef page="../plugin-base-guide" />

## Unregistering Javascript Plugin

Imagine we wanted to exclude the `OffCanvasCart` plugin, just to get a test case which can be inspected easily. In order to remove a Javascript plugin, you only need to add the following line to your `main.js` file:

```javascript
// <plugin root>/src/Resources/app/storefront/src/main.js
window.PluginManager.deregister('OffCanvasCart', '[data-offcanvas-cart]');
```

After building the Storefront anew, you shouldn't be able to open the offcanvas cart anymore. Another useful way of testing this is using your browser's devtools. Just open your devtool's console and type in `PluginManager.getPluginList()` in order to get a list of all registered plugins.

In our case, we shouldn't find `OffCanvasCart` in the listed plugins anymore.

## Next steps

Did you already take a look at our other storefront guides? They can give you some neat starting points on how to extend and customize Shopware's storefront.

* [Override existing Javascript in your plugin](override-existing-javascript.md)
* [Reacting to Javascript events](reacting-to-javascript-events.md)
