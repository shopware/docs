---
nav:
  title: Add Cookies to the Consent Manager
  position: 20

---

# Add Cookies to the Consent Manager

## Overview

Before proceeding, review the [App Base Guide](../app-base-guide.md).

The [Cookie Consent Management Concept](../../../../concepts/commerce/content/cookie-consent-management.md) provides a comprehensive guide to Shopware's cookie consent system.

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

For a complete reference of the structure of the manifest file, take a look at the [Manifest reference](../../../../resources/references/app-reference/manifest-reference.md).

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

The [Manifest reference](../../../../resources/references/app-reference/manifest-reference.md) provides comprehensive information about manifest file structure.

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

## Showing cookies conditionally

Cookies declared in the `manifest.xml` are shown on every sales channel. If your cookies are only relevant under certain conditions, for example a payment provider cookie that is only needed when the corresponding payment method is active in the current sales channel, you can remove them again with an app script for the `cookie-group-collect` hook.

The hook is triggered whenever the cookie consent groups are collected. It gives you access to the collected cookie groups of all extensions, so your script can remove your own groups and entries based on any condition you can express in a script:

```twig
{# Resources/scripts/cookie-group-collect/filter-payment-cookies.twig #}
{% set criteria = {
    'filter': [
        { 'type': 'equals', 'field': 'active', 'value': true },
        { 'type': 'equals', 'field': 'handlerIdentifier', 'value': 'app\\MyApp_myPaymentMethod' }
    ]
} %}

{% if services.store.search('payment_method', criteria).total == 0 %}
    {% set group = hook.cookieGroups.get('myapp.cookie-group.name') %}

    {% if group is not null and group.entries is not null %}
        {% do group.entries.remove('myapp_payment_cookie') %}
    {% endif %}
{% endif %}
```

Since the script runs after all cookies were collected, the entries declared in your `manifest.xml` are already present and can be removed by their cookie name. Groups are indexed by their `snippet-name`, entries by their cookie name.

The `store` service searches within the current sales channel, so the example above does not need an explicit sales channel filter. The handler identifier of an app payment method follows the pattern `app\{AppName}_{identifier}`, where `identifier` is the `<identifier>` of the payment method in your `manifest.xml`.

::: info
The `cookie-group-collect` hook was introduced in Shopware 6.7.14.0. Older versions ignore scripts for unknown hooks, so an app using this script stays installable on earlier versions, where the cookies are always shown.
:::

Any condition available in scripts can be used here, such as system configuration values (`services.config`) or entity lookups (`services.repository` and `services.store`). For the available services and data, see the [script hook reference](../../../../resources/references/app-reference/script-reference/script-hooks-reference.md#cookie-group-collect).

## Snippet handling

As already mentioned in the previous sections, both the `cookie` and the `group` elements can contain `snippet-name` and `snippet-description` child elements. Although their values can be strings that will be displayed in the Storefront, the preferred way to set up cookie names and descriptions is to provide Storefront snippets. It gives you and the shop owner the possibility to add translations for your cookie's name and description.

To learn how to set up Storefront snippets, refer to the snippet guide.

<PageRef page="../../plugins/storefront/styling/add-translations" />

## Automatic Configuration Change Detection

Any changes made to the cookie definitions in your app's `manifest.xml` are automatically detected by Shopware's consent system. This will trigger a re-consent flow for users, ensuring they are always prompted about the latest cookie settings.

This process is handled by a configuration hash mechanism, which is explained in detail in the [Cookie Consent Management Concept](../../../../concepts/commerce/content/cookie-consent-management.md#configuration-hash-mechanism).

## Reacting to cookie consent changes

As described in the previous section, `cookie` elements without a `value` element will not be set automatically. Instead, you have to react to cookie consent changes within your JavaScript. Find out how to [respond to cookie consent changes](../../../plugins/plugins/storefront/advanced/reacting-to-cookie-consent-changes.md).
