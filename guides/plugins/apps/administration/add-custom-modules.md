---
nav:
  title: Add custom module
  position: 20

---

# Add custom module

## Overview

In your app, you are able to add your own modules to the Administration. Your custom modules are loaded as iframes which are embedded in the Shopware Administration and within this iframe, your website will be loaded and shown.

Creating custom modules takes place at the `<admin>` section of your `manifest.xml`. Take a look at the [Manifest Reference](../../../../resources/references/app-reference/manifest-reference) You can add any amount of custom modules by adding new `<module>` elements to your manifest.

To configure your module you can set it up with with some additional attributes.

* `name` \(required\): The technical name of the module. This is the name your module is referenced with.
* `parent` \(required\): The Administration navigation id of the menu item that serves as the parent menu item.
* `source` \(optional\): The URL to your app servers endpoint from which the module is served from. This can be omitted if you want to define a menu item that should serve as a parent menu item for other app modules.
* `parent` \(optional\): The Administration navigation id from the menu item that serves as the parent menu item. If omitted your module will be listed under the "My apps" menu entry. **This field will be required in future versions as we are going to remove the "My Apps" menu item**
* `position` \(optional\): A numeric index that sets the position of your menu entry regarding to it's siblings.

Additionally you can define `label` elements inside of your `module` element, to set up how your module will be displayed in the admin menu.

```xml
// manifest.xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
        ...
    </meta>
    <admin>
        <module name="exampleModule"
                source="https://example.com/promotion/view/promotion-module"
                parent="sw-marketing"
                position="50"
        >
            <label>Example module</label>
            <label lang="de-DE">Beispiel Modul</label>
        </module>
    </admin>
</manifest>
```

For a complete reference of the structure of the manifest file, take a look at the [Manifest reference](../../../../resources/references/app-reference/manifest-reference).

If the user opens the module in the Administration your app will receive a request to the URL defined in the `source` attribute of your `module` element. Your app can determine the shop that has opened the module through query parameters added to the url:

* `shop-id`: The unique identifier of the shop, where the app was installed
* `shop-url`: The URL of the shop, this can later be used to access the Shopware API
* `timestamp`: The Unix timestamp when the request was created
* `shopware-shop-signature`: SHA256 HMAC of the rest of the query string, signed with the `shop-secret`

A sample request may look like this:

```text
https://example.com/promotion/view/promotion-config?shop-id=HKTOOpH9nUQ2&shop-url=http%3A%2F%2Fmy.shop.com&timestamp=1592406102&shopware-shop-signature=3621fffa80187f6d43ce6cb25760340ab9ba2ea2f601e6a78a002e601579f415
```

In this case the `shopware-shop-signature` parameter contains an SHA256 HMAC of the rest of the query string, signed again with the secret your app assigned the shop during the [registration](../app-base-guide#setup). The signature can be used to verify the authenticity of the request.

## Leave loading state

Because your module is displayed as an iframe in the Administration, Shopware can not easily tell when your module has finished loading. Therefore, your new module will display a loading spinner to signalize your iframe is loading. To leave the loading state, your iframe needs to give a notification when the loading process is done.

```javascript
function sendReadyState() {
    window.parent.postMessage('sw-app-loaded', '*');
}
```

This has to be done as soon as everything is loaded so that the loading spinner disappears. If your view is not fully loaded after 5 seconds, it will be aborted.

## Structure your modules

With Shopware 6.4.0.0 we added a third level in the admin menu structure. This change was made to give you as a developer the opportunity to group your Administration modules if needed.

When you define a module, it gets automatically loaded by the Administration. Additionally the Administration creates a menu entry for your module. You can reference this menu entry and set it as the parent menu entry for your other modules.

The navigation id of your modules always uses the pattern `app-<appName>-<moduleName>`. So, within your manifest you can add a reference to modules that you just created:

```xml
// manifest.xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
        <name>myApp</app>
        ...
    </meta>
    <admin>
        <module name="myModules"
                source="https://example.com/promotion/view/promotion-module"
                parent="sw-catalogue"
                position="50"
        >
            <label>My apps modules</label>
            <label lang="de-DE">Module meiner app</label>
        </module>

        <module name="someModule"
                source="https://example.com/promotion/view/promotion-module"
                parent="app-myApp-myModules"
                position="1"
        >
            <label>Module underneath "My apps modules"</label>
            <label lang="de-DE">Modul unterhalb von "Module meiner app"</label>
        </module>
    </admin>
</manifest>
```

Modules that are used as a parent for other modules do not need the `source` attribute to be set, although they can.

## Add main module to your app

With Shopware 6.4.0.0 You can define a main module for your app. This "special" module will be opened from the list of your installed apps as well as from the app detail page if you bought it from the Shopware store.

Your main module can be defined by adding a `main-module` element within your `administration` section of your manifest file. It's only required attribute is the `source` attribute.

To avoid mixing other modules with your main module, we decided to separate the main module from modules with navigation entries. You can still use the same URL on both, a module that is available through the menu and your main module.

```xml
// manifest.xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
        <name>myApp</app>
        ...
    </meta>
    <admin>
        <module name="normalModule"
                source="https://example.com/main"
                parent="sw-catalogue"
                position="50"
        >
            <label>Module in admin menu</label>
            <label lang="de-DE">Modul im Adminmenü</label>
        </module>

        <!-- You can use the same url to open your module from the app store -->
        <main-module source="https://example.com/main"/>
    </admin>
</manifest>
```

This feature is not compatible with themes as they will always open the theme config by default.

## Admin design compatibility

As your module page is integrated as an iframe you are not able to use the stylesheet and javascript out of the box.
Having the stylesheets that are used in the Administration can be beneficial for the app module to seamlessly integrate into the Administration.
You can use the shop version that is passed as `sw-version` within the request query to determine what stylesheets you want to load.
The compiled Administration stylesheets for each version can be found within the tagged releases of the `shopware/administration` package within the `Resources/public/static` folder.
Combining these information enables your app the look exactly like the Administration although it is encapsuled within an iframe.
