---
nav:
  title: Shipping methods
  position: 25

---

# Shipping methods

Starting with version REPLACE_WITH_NEXT_RELEASE_VERSION as **experimental feature**. Shopware has introduced experimental functionality for adding shipping methods via the App Manifest to a shop. **The entire functionality and API are subject to change during the development process.**

## Prerequisites

You should be familiar with the concept of Apps, their registration flow as well as signing and verifying requests and responses between Shopware and the App backend server.

<PageRef page="app-base-guide" />

Your app server must be also accessible for the Shopware server.

## Manifest configuration

### Basic configuration
The following example represents the most minimal configuration for a shipping method.

**Important!**

Ensure that the `<identifier>` of your shipping method remains unchanged, as Shopware will deactivate or delete shipping methods that do no longer appear in the manifest during app updates.
```xml
// manifest.xml

<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
        <!-- Make sure that the name of your app does not change anymore, otherwise there will be duplicates of your shipping methods -->
        <name>NameOfYourShippingMethodApp</name>
        <!-- ... -->
    </meta>

    <shipping-methods>
        
        <shipping-method>
            <!-- Identifier should not change after first release -->
            <identifier>NameOfYourFirstShippingMethod</identifier>
            <name>First shipping method</name>
        </shipping-method>

    </shipping-methods>
</manifest>
```

### Extended configuration
The functionality of course offers more than one identifier name. The following example represents all possible configurations.

* Translation of field that are visible to the customer and requires a translation
* Shipping method description
* Shipping method icon
* Shipping method active (expects true or false). Default value is `false` 

```xml
// manifest.xml

        <?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
        <!-- Make sure that the name of your app does not change anymore, otherwise there will be duplicates of your shipping methods -->
        <name>NameOfYourShippingMethodApp</name>
        <!-- ... -->
    </meta>

    <shipping-methods>

        <shipping-method>
            <!-- Identifier should not change after first release -->
            <identifier>NameOfYourFirstShippingMethod</identifier>
            <name>First shipping method</name>
            <name lang="de-DE">Erste Versandmethode</name>
            <!-- The following configurations are optional -->
            <description>This is a simple description</description>
            <description lang="de-DE">Das ist eine einfache Beschreibung</description>
            <!-- This path to this icon must be relative to the manifest.xml -->
            <icon>icon.png</icon>
            <active>true</active>
        </shipping-method>

    </shipping-methods>
</manifest>
```