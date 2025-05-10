---
nav:
  title: Shipping methods
  position: 25

---

# Shipping methods

Starting with version 6.5.7.0 as **experimental feature**. Shopware has introduced experimental functionality for adding shipping methods via the App Manifest to a shop. **The entire functionality and API are subject to change during the development process.**

## Prerequisites

You should be familiar with the concept of Apps, their registration flow as well as signing and verifying requests and responses between Shopware and the App backend server.

<PageRef page="app-base-guide" />

Your app server must be also accessible for the Shopware server.

## Manifest configuration

### Basic configuration

The following example represents the most minimal configuration for a shipping method.

**Important!**

Ensure that the `<identifier>` of your shipping method remains unchanged, as Shopware will deactivate or delete shipping methods that do no longer appear in the manifest during app updates.

::: code-group

```xml [manifest.xml]

<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <!-- Make sure that the name of your app does not change anymore, otherwise there will be duplicates of your shipping methods -->
        <name>NameOfYourShippingMethodApp</name>
        <!-- ... -->
    </meta>

    <shipping-methods>

        <shipping-method>
            <!-- The identifier should not change after the first release -->
            <identifier>NameOfYourFirstShippingMethod</identifier>
            <name>First shipping method</name>

            <delivery-time>
                <!-- Requires a new generated UUID for your new delivery time -->
                <id>c8864e36a4d84bd4a16cc31b5953431b</id>
                <name>From 2 to 4 days</name>
                <min>2</min>
                <max>4</max>
                <unit>day</unit>
            </delivery-time>
        </shipping-method>

    </shipping-methods>
</manifest>
```

:::

### Delivery Time

The app manufacturer should initially display the standard delivery time to the shop manager, who can subsequently adjust it as needed. The delivery time requires some configurations.

#### Id

The ID should only be generated initially and should remain unchanged thereafter. Changing it will result in the creation of a new one.

::: info
Please note that you should not modify the ID of the shipping time.
:::

#### Name

The name should describe the delivery time simply, briefly and comprehensibly.

#### Min / Max

The min and max values depend on the unit. Assuming the unit is days, in our example, the delivery time has a range from 2 to 4 days.

#### Unit

The following values are possible units

* hour
* day
* week
* month
* year

::: code-group

```xml [manifest.xml]

<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    
    ...

    <shipping-methods>

        <shipping-method>
            <identifier>NameOfYourFirstShippingMethod</identifier>
            <name>First shipping method</name>
            ...
            <delivery-time>
                <id>c8864e36a4d84bd4a16cc31b5953431b</id>
                <name>From 2 to 4 days</name>
                <min>2</min>
                <max>4</max>
                <unit>day</unit>
            </delivery-time>
            ...
        </shipping-method>

    </shipping-methods>
</manifest>
```

:::

### Extended configuration

The functionality offers more than one identifier name. The following examples represent all possible configurations.

* Translation of fields that are visible to the customer and requires a translation
* Shipping method description
* Shipping method icon
* Shipping method active (expects true or false). Default value is `false`

::: code-group

```xml [manifest.xml]

<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">

    ...

    <shipping-methods>

        <shipping-method>
            <!-- Identifier should not change after the first release -->
            <identifier>NameOfYourFirstShippingMethod</identifier>
            <name>First shipping method</name>
            <name lang="de-DE">Erste Versandmethode</name>
            <delivery-time>
                <!-- Remember to remove the dashes from generated UUID -->
                <id>c8864e36a4d84bd4a16cc31b5953431b</id>
                <name>From 2 to 4 days</name>
                <min>2</min>
                <max>4</max>
                <unit>day</unit>
            </delivery-time>
            <!-- The following configurations are optional -->
            <description>This is a simple description</description>
            <description lang="de-DE">Das ist eine einfache Beschreibung</description>
            <icon>icon.png</icon>
            <active>true</active>
            <tracking-url>https://www.yourtrackingurl.com</tracking-url>
            <position>2</position>
        </shipping-method>

    </shipping-methods>
</manifest>
```

:::

### Description

You can initially add a description for the customer.

::: info
Please note that the manifest cannot modify the description once you install the app, as the merchant can change it.
:::

::: code-group

```xml [manifest.xml]

<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    
    ...

    <shipping-methods>

        <shipping-method>
            <identifier>NameOfYourFirstShippingMethod</identifier>
            <name>First shipping method</name>
            ...
            <description>This is a simple description</description>
            <description lang="de-DE">Das ist eine einfache Beschreibung</description>
            <description lang="fr-FR">C'est une description simple</description>
            ...
        </shipping-method>

    </shipping-methods>
</manifest>
```

:::

### Icon

You can initially add a shipping method icon. You must specify the path to this icon as relative to the manifest.xml file. For example, you have the following directory structure:

```text
YourAppDirectory/
├── assets/
│   └── icons/
│       └── yourIcon.png
└── manifest.xml
```

The path should be: `assets/icons/yourIcon.png`

::: info
Please note that the manifest cannot modify the icon once you install the app, as the merchant can change it.
:::

::: code-group

```xml [manifest.xml]

<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    
    ...

    <shipping-methods>

        <shipping-method>
            <identifier>NameOfYourFirstShippingMethod</identifier>
            <name>First shipping method</name>
            ...
            <icon>assets/icons/yourIcon.png</icon>
            ...
        </shipping-method>

    </shipping-methods>
</manifest>
```

:::

### Active

You can activate the shipping method by default. Possible values for active are `true` or `false`

* true: Activates the shipping method
* false: Deactivates the shipping method. Alternatively, you can leave out active

::: code-group

```xml [manifest.xml]

<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    
    ...

    <shipping-methods>

        <shipping-method>
            <identifier>NameOfYourFirstShippingMethod</identifier>
            <name>First shipping method</name>
            ...
            <active>true</active>
            ...
        </shipping-method>

    </shipping-methods>
</manifest>
```

:::

### Tracking url

It is possible to add a tracking URL for customers to monitor the delivery status.

::: code-group

```xml [manifest.xml]

<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    
    ...

    <shipping-methods>

        <shipping-method>
            <identifier>NameOfYourFirstShippingMethod</identifier>
            <name>First shipping method</name>
            ...
            <tracking-url>https://www.yourtrackingurl.com</tracking-url>
            ...
        </shipping-method>

    </shipping-methods>
</manifest>
```

:::

### Position

Here, you can set the display order of the shipping methods in the checkout. If you omit the tag, the position of the shipping method is 1 by default.

::: code-group

```xml [manifest.xml]

<?xml version="1.0" encoding="UTF-8" ?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">

    ...

    <shipping-methods>

        <shipping-method>
            <identifier>NameOfYourFirstShippingMethod</identifier>
            <name>First shipping method</name>
            ...
            <position>2</position>
            ...
        </shipping-method>

    </shipping-methods>
</manifest>
```

:::

<!-- {"WATCHER_URL":"https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Xml/ShippingMethod/ShippingMethod.php","WATCHER_HASH":"945a4d13311c8ebf3f893d14a9dc0690"} -->
