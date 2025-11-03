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

::: code-group

```xml [manifest.xml]
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
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

:::

Cookie elements can be configured by adding the following child elements:

* `cookie` (required): The technical name of the cookie. The value is used to store the cookie in the customer's cookie jar.
* `snippet-name` (required): A string that represents the label of the cookie in the cookie consent manager. To provide translations this should be the key of a Storefront snippet.
* `value` (optional): A fixed value that is set as the cookie's value when the customer accepts your cookie. **If unset, the cookie will not be updated (set active or inactive) by Shopware, but passed to the update event.**
* `expiration` (optional): Cookie lifetime in days. **If unset, the cookie expires with the session.**
* `snippet-description` (optional): A string that represents the description of the cookie in the cookie consent manager. To provide translations, this should be the key of a Storefront snippet.

For a complete reference of the structure of the manifest file, take a look at the [Manifest reference](../../../../resources/references/app-reference/manifest-reference).

## Create a cookie group

When adding multiple cookies through your app it may become handy to group them. This makes it possible for the customer to accept all of your cookies at once and additionally enhances the readability of the cookie consent manager.

To add a cookie group, you can add a `groups` section within your `cookies` section in your `manifest.xml`. In the following example, we use the cookie that we created in the previous section but display it in a cookie group:

::: code-group

```xml [manifest.xml]
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
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

:::

A `group` element consists of three child elements to configure the cookie group. Here is a description of all of them:

* `snippet-name` (required): A string that represents the label of the cookie group in the cookie consent manager. To provide translations this should be the key of a Storefront snippet.
* `entries` (required): Contains the grouped cookies. It is a collection of `cookie` elements described in the previous section.
* `snippet-description` (optional): A string that represents the description of the cookie group in the cookie consent manager. To provide translations this should be the key of a Storefront snippet.

For a complete reference of the structure of the manifest file, take a look at the [Manifest reference](../../../../resources/references/app-reference/manifest-reference).

## Assigning Cookies to Standard Cookie Groups

Apps can assign cookies to Shopware's standard cookie groups (Required, Statistical, Comfort Features, Marketing) by using the built-in cookie group snippet names in your manifest.xml.

### Available Standard Cookie Groups

Shopware provides four standard cookie groups that you can use:

| Snippet Name | Category | User Consent Required |
| :--- | :--- | :--- |
| `cookie.groupRequired` | Technically Required | No (always active) |
| `cookie.groupComfortFeatures` | Comfort Features | Yes |
| `cookie.groupMarketing` | Marketing | Yes |
| `cookie.groupStatistical` | Statistical/Analytics | Yes |

::: info
For a complete overview of these categories and their purposes, see the [Cookie Consent Management Concept](../../../../concepts/commerce/content/cookie-consent-management#cookie-categories).
:::

### Example: Assigning Cookies to Different Groups

Here's how to assign your app's cookies to different standard groups in your `manifest.xml`:

::: code-group

```xml [Statistical]
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <name>MyApp</name>
        <label>My App</label>
        <version>1.0.0</version>
        <author>Your Name</author>
    </meta>

    <cookies>
        <!-- Analytics cookies go to Statistical group -->
        <group>
            <snippet-name>cookie.groupStatistical</snippet-name>
            <entries>
                <cookie>
                    <cookie>myapp_analytics_session</cookie>
                    <snippet-name>myapp.cookie.analyticsSession</snippet-name>
                    <snippet-description>myapp.cookie.analyticsSessionDescription</snippet-description>
                    <value>1</value>
                    <expiration>30</expiration>
                </cookie>
                <cookie>
                    <cookie>myapp_pageview_tracker</cookie>
                    <snippet-name>myapp.cookie.pageviewTracker</snippet-name>
                    <value>1</value>
                    <expiration>30</expiration>
                </cookie>
            </entries>
        </group>
    </cookies>
</manifest>
```

```xml [Marketing]
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
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

```xml [Comfort Features]
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <name>MyApp</name>
        <label>My App</label>
        <version>1.0.0</version>
        <author>Your Name</author>
    </meta>

    <cookies>
        <!-- User preferences go to Comfort Features group -->
        <group>
            <snippet-name>cookie.groupComfortFeatures</snippet-name>
            <entries>
                <cookie>
                    <cookie>myapp_user_preferences</cookie>
                    <snippet-name>myapp.cookie.userPreferences</snippet-name>
                    <snippet-description>myapp.cookie.userPreferencesDescription</snippet-description>
                    <value>{}</value>
                    <expiration>365</expiration>
                </cookie>
            </entries>
        </group>
    </cookies>
</manifest>
```

```xml [Required]
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <name>MyApp</name>
        <label>My App</label>
        <version>1.0.0</version>
        <author>Your Name</author>
    </meta>

    <cookies>
        <!-- Essential cookies go to Required group (rarely needed for apps) -->
        <group>
            <snippet-name>cookie.groupRequired</snippet-name>
            <entries>
                <cookie>
                    <cookie>myapp_essential_functionality</cookie>
                    <snippet-name>myapp.cookie.essential</snippet-name>
                    <snippet-description>myapp.cookie.essentialDescription</snippet-description>
                    <value>1</value>
                    <expiration>365</expiration>
                </cookie>
            </entries>
        </group>
    </cookies>
</manifest>
```

:::

### Best Practices for Cookie Group Assignment

When assigning cookies to groups, consider these guidelines:

**Technically Required (`cookie.groupRequired`):**

* Only use for cookies that are absolutely essential for your app's core functionality
* These cannot be disabled by users
* Rarely needed for apps - most app cookies are optional

**Comfort Features (`cookie.groupComfortFeatures`):**

* User experience enhancements
* Video embeds, maps, social media integrations
* Chat widgets and interactive features

**Marketing (`cookie.groupMarketing`):**

* Advertising and retargeting pixels
* Conversion tracking
* Marketing campaign attribution
* User behavior tracking for advertising

**Statistical (`cookie.groupStatistical`):**

* Analytics and statistics
* A/B testing
* Heatmaps and user behavior analysis
* Performance monitoring

::: warning
Incorrect categorization may lead to GDPR compliance issues. Always categorize cookies based on their actual purpose, not convenience. When in doubt, prefer more restrictive categories (e.g., Marketing over Comfort Features).
:::

## Snippet handling

As already mentioned in the previous sections, both the `cookie` and the `group` elements can contain `snippet-name` and `snippet-description` child elements. Although their values can be strings that will be displayed in the Storefront, the preferred way to set up cookie names and descriptions is to provide Storefront snippets. It gives you and the shop owner the possibility to add translations for your cookie's name and description.

If you are not familiar with setting up Storefront snippets, please refer to our snippet guide.

<PageRef page="../../plugins/storefront/add-translations" />

## Automatic Configuration Change Detection

Since Shopware 6.7, cookie configurations defined in your app's `manifest.xml` are automatically included in the configuration hash. This helps support GDPR compliance by tracking changes to cookie handling and ensuring users are informed.

### How it works

1. When you update your app and change cookie definitions, Shopware automatically detects this
2. The configuration hash changes, triggering a re-consent flow for users
3. Users are re-prompted to review and accept the updated cookie configuration
4. This ensures users are always informed about changes to cookie handling

### What triggers re-consent

The configuration hash changes when:

* New cookies are added in your app manifest
* Existing cookie properties are modified (name, description, expiration)
* Cookies are removed from your app
* Cookie groups are restructured

You don't need to implement this manually - it's handled automatically by Shopware's cookie consent system.

### Example Scenario

```xml
<!-- Version 1.0.0 of your app -->
<cookies>
    <cookie>
        <cookie>my-app-cookie</cookie>
        <snippet-name>myApp.cookie.name</snippet-name>
        <expiration>30</expiration>
    </cookie>
</cookies>
```

When you update your app to version 2.0.0 and change the cookie:

```xml
<!-- Version 2.0.0 - expiration changed -->
<cookies>
    <cookie>
        <cookie>my-app-cookie</cookie>
        <snippet-name>myApp.cookie.name</snippet-name>
        <expiration>90</expiration> <!-- Changed from 30 to 90 days -->
    </cookie>
</cookies>
```

After the app update:

1. The configuration hash will be different
2. Users will see the consent banner again on their next visit
3. Non-essential cookies will be cleared
4. Users can review and accept the new 90-day expiration

## Reacting to cookie consent changes

As described in the previous section, `cookie` elements without a `value` element will not be set automatically. Instead, you have to react to cookie consent changes within your JavaScript. Find out how to [respond to cookie consent changes](../../../plugins/plugins/storefront/reacting-to-cookie-consent-changes).
