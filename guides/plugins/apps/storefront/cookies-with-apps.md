---
nav:
  title: Add cookies to the consent manager
  position: 20

---

# Add cookies to the consent manager

## Prerequisites

You should be familiar with the concept of apps.

<PageRef page="../app-base-guide" />

::: info
For a comprehensive understanding of Shopware's cookie consent system, see the [Cookie Consent Management Concept](../../../../concepts/commerce/content/cookie-consent-management).
:::

## Create a single cookie

To add new cookies to the cookie consent manager, you can add a `cookies` section to your `manifest.xml`. Inside this section, you can add new `cookie` elements, as shown in the following example. Note that you don't need a `setup` section in your `manifest.xml` since extending the Storefront doesn't need a registration nor an own server to run.

```XML
<?XML version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/refs/tags/v6.7.4.0/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <name>ExampleAppWithCookies</name>
        <version>1.0.0</version>
        <!-- other meta data goes here -->
    </meta>
    <cookies>
        <cookie>
            <cookie>my-cookie</cookie>
            <snippet-name>example-app-with-cookies.my-cookie.name</snippet-name>
            <snippet-description>example-app-with-cookies.my-cookie.description</snippet-description>
            <value>a static value for the cookie</value>
            <expiration>1</expiration>
        </cookie>
    </cookies>
</manifest>
```

Cookie elements can be configured by adding the following child elements:

* `cookie` (required): The technical name of the cookie. The value is used to store the cookie in the customer's cookie jar.
* `snippet-name` (required): A string that represents the label of the cookie in the cookie consent manager. To provide translations this should be the key of a Storefront snippet.
* `value` (optional): A fixed value that is set as the cookie's value when the customer accepts your cookie. **If unset, the cookie will not be updated (set active or inactive) by Shopware, but passed to the update event.**
* `expiration` (optional): Cookie lifetime in days. **If unset, the cookie expires with the session.**
* `snippet-description` (optional): A string that represents the description of the cookie in the cookie consent manager. To provide translations, this should be the key of a Storefront snippet.

For a complete reference of the structure of the manifest file, take a look at the [Manifest reference](../../../../resources/references/app-reference/manifest-reference).

## Create a cookie group

When adding multiple cookies through your app, it may become handy to group them. This makes it possible for the customer to accept all of your cookies at once and additionally enhances the readability of the cookie consent manager.

To add a cookie group, you can add a `groups` section within your `cookies` section in your `manifest.xml`. In the following example, we use the cookie that we created in the previous section but display it in a cookie group:

```XML
<?XML version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/refs/tags/v6.7.4.0/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <name>ExampleAppWithCookies</name>
        <version>1.0.0</version>
        <!-- other meta data goes here -->
    </meta>
    <cookies>
        <group>
            <snippet-name>example-app-with-cookies.cookie-group.name</snippet-name>
            <snippet-description>example-app-with-cookies.cookie-group.description</snippet-description>
            <entries>
                <cookie>
                    <cookie>my-cookie</cookie>
                    <snippet-name>example-app-with-cookies.my-cookie.name</snippet-name>
                    <snippet-description>example-app-with-cookies.my-cookie.description</snippet-description>
                    <value>a static value for the cookie</value>
                    <expiration>1</expiration>
                </cookie>
            </entries>
        </group>
    </cookies>
</manifest>
```

A `group` element consists of three child elements to configure the cookie group. Here is a description of all of them:

* `snippet-name` (required): A string that represents the label of the cookie group in the cookie consent manager. To provide translations this should be the key of a Storefront snippet.
* `entries` (required): Contains the grouped cookies. It is a collection of `cookie` elements described in the previous section.
* `snippet-description` (optional): A string that represents the description of the cookie group in the cookie consent manager. To provide translations this should be the key of a Storefront snippet.

For a complete reference of the structure of the manifest file, take a look at the [Manifest reference](../../../../resources/references/app-reference/manifest-reference).

## Assigning Cookies to Standard Cookie Groups

You can assign your app's cookies to Shopware's standard cookie groups by using one of the built-in snippet names in your `manifest.xml`: `cookie.groupRequired`, `cookie.groupComfortFeatures`, `cookie.groupStatistical`, and `cookie.groupMarketing`.

The following example shows how to assign cookies to the **Marketing group**:

```XML
<?XML version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/refs/tags/v6.7.4.0/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <name>MyApp</name>
        <label>My App</label>
        <version>1.0.0</version>
        <author>Your Name</author>
    </meta>

    <cookies>
        <!-- Marketing/Tracking cookies go to Marketing group -->
        <group>
            <snippet-name>cookie.groupMarketing</snippet-name>
            <entries>
                <cookie>
                    <cookie>myapp_conversion_tracking</cookie>
                    <snippet-name>myapp.cookie.conversionTracking</snippet-name>
                    <snippet-description>myapp.cookie.conversionTrackingDescription</snippet-description>
                    <value>1</value>
                    <expiration>90</expiration>
                </cookie>
                <cookie>
                    <cookie>myapp_ad_targeting</cookie>
                    <snippet-name>myapp.cookie.adTargeting</snippet-name>
                    <value>1</value>
                    <expiration>365</expiration>
                </cookie>
            </entries>
        </group>
    </cookies>
</manifest>
```

## Snippet handling

As already mentioned in the previous sections, both the `cookie` and the `group` elements can contain `snippet-name` and `snippet-description` child elements. Although their values can be strings that will be displayed in the Storefront, the preferred way to set up cookie names and descriptions is to provide Storefront snippets. It gives you and the shop owner the possibility to add translations for your cookie's name and description.

If you are not familiar with setting up Storefront snippets, please refer to our snippet guide.

<PageRef page="../../plugins/storefront/add-translations" />

## Automatic Configuration Change Detection

Any changes made to the cookie definitions in your app's `manifest.xml` are automatically detected by Shopware's consent system. This will trigger a re-consent flow for users, ensuring they are always prompted about the latest cookie settings.

This process is handled by a configuration hash mechanism, which is explained in detail in the [Cookie Consent Management Concept](../../../../concepts/commerce/content/cookie-consent-management#configuration-hash-mechanism).

## Reacting to cookie consent changes

As described in the previous section, `cookie` elements without a `value` element will not be set automatically. Instead, you have to react to cookie consent changes within your JavaScript. Find out how to [respond to cookie consent changes](../../../plugins/plugins/storefront/reacting-to-cookie-consent-changes).
