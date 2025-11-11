---
nav:
  title: Add cookie to manager
  position: 160

---

# Add Cookie to Manager

## Overview

Since the GDPR was introduced, every website has to be shipped with some sort of a cookie consent manager. This is also the case for Shopware 6 of course, which comes with a cookie consent manager by default. In this guide you will learn how you can add your own cookies to the cookie consent manager of Shopware 6.

::: info
For a comprehensive understanding of Shopware's cookie consent system, see the [Cookie Consent Management Concept](../../../../concepts/commerce/content/cookie-consent-management).
:::

## Prerequisites

This guide is built upon the [Plugin base guide](../plugin-base-guide), so take a look at that first if you're lacking a running plugin. Also, you will need to know how to [create your own service](../plugin-fundamentals/add-custom-service) and [subscribe to an event](../plugin-fundamentals/listening-to-events), so you might want to take a look at those guides as well.

## Extend the cookie consent manager

Adding custom cookies requires you to listen to the `CookieGroupsCollectEvent` and add your custom cookies to the collection.

::: tip
It is recommended to use an event listener if you're listening to a single event. If you need to react to multiple events, an event subscriber is the better choice.
:::

### Registering your event listener

Start with creating the `services.xml` and registering your event listener.

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="PluginName\Listener\CookieListener">
            <tag name="kernel.event_listener" event="Shopware\Storefront\Framework\Cookie\CookieGroupsCollectEvent"/>
        </service>
    </services>
</container>
```

In the next step we'll create the actual listener class.

### Creating the listener

We need to create a class called `CookieListener` with an `__invoke` method. This method will be executed once the `CookieGroupsCollectEvent` is dispatched.

The event object that is passed to our listener method contains the cookie groups collection, which we can use to add our custom cookies.

::: warning
Since Shopware 6.7.3.0, cookies use structured objects (`CookieEntry` and `CookieGroup`) instead of arrays for better type safety and consistency. The array format is deprecated.
:::

Let's have a look at an example:

```php
// <plugin root>/src/Listener/CookieListener.php
<?php declare(strict_types=1);

namespace PluginName\Listener;

use Shopware\Storefront\Framework\Cookie\CookieGroupsCollectEvent;
use Shopware\Core\Framework\Cookie\CookieEntry;
use Shopware\Core\Framework\Cookie\CookieGroup;

class CookieListener
{
    public function __invoke(CookieGroupsCollectEvent $event): void
    {
        $cookieGroups = $event->getCookieGroups();

        // Create a single cookie
        $singleCookie = new CookieEntry(
            'cookie.name',
            'cookie-key',
            'cookie value',
            30,
            'cookie.description'
        );

        // Create entries collection for cookie group
        $groupEntries = [
            new CookieEntry(
                'cookie.first_child_name',
                'cookie-key-1',
                'cookie value',
                30
            ),
            new CookieEntry(
                'cookie.second_child_name',
                'cookie-key-2',
                'cookie value',
                60
            )
        ];

        // Create a cookie group with multiple cookies
        $cookieGroup = new CookieGroup(
            'cookie.group_name',
            $groupEntries,
            'cookie.group_description'
        );

        $cookieGroups->add($cookieGroup);
        $cookieGroups->add($singleCookie);
    }
}
```

This will eventually lead to a new group being created, containing two new cookies, as well as a new cookie without a group.

And that's basically it already. After loading your Storefront, you should now see your new cookies and the cookie-group.

## Parameter Reference

For a complete list of available parameters and their types, refer to the source code:

* [`CookieEntry`](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Cookie/CookieEntry.php) - Individual cookie definition
* [`CookieGroup`](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Cookie/CookieGroup.php) - Cookie group definition

::: info
Cookie groups should not have the `cookie`, `value`, `expiration`, or `isRequired` parameters. These only apply to individual `CookieEntry` objects within the group's `entries`.
:::

## Migrating from CookieProviderInterface (Shopware 6.7.2 and earlier)

If you are upgrading from an older version, you might have used the `CookieProviderInterface` to add custom cookies. This interface is now deprecated and should be replaced with the `CookieGroupsCollectEvent`.

For backward compatibility, you can still use the `CookieProviderInterface` to provide cookies in the old array syntax. However, it is highly recommended to use the new event-based system to provide the new object structure.

## Cookie Configuration Changes and Re-Consent

Since Shopware 6.7.3.0, cookie configurations include a hash that tracks changes. When you modify cookie configurations through your plugin (add/remove/change cookies), the hash changes automatically, triggering a re-consent flow for users.

This helps maintain transparency by re-prompting users when cookie handling changes, supporting GDPR compliance requirements. The hash is automatically calculated from all cookie configurations provided by the `CookieProvider`.

::: info
While this feature helps with GDPR compliance, shop owners are responsible for ensuring their overall cookie usage, privacy policies, and data handling practices comply with GDPR and other applicable regulations.
:::

### How it works

1. Your plugin adds/modifies cookies via the `CookieGroupsCollectEvent`
2. Shopware calculates a hash of the entire cookie configuration
3. The hash is stored in the user's browser
4. On the next visit, if the hash differs, the consent banner appears again
5. Users are informed about changes and can make new choices

This automatic re-consent mechanism helps shop owners maintain transparency about cookie changes.

::: info
The configuration hash is exposed via the Store API endpoint `/store-api/cookie/groups`. For API documentation, see [Fetch all cookie groups](https://shopware.stoplight.io/docs/store-api/f9c70be044a15-fetch-all-cookie-groups).
:::

## Video Platform Cookies

YouTube and Vimeo cookies are now handled separately in Shopware's cookie management. If you're adding video functionality to your plugin, ensure you register the appropriate cookie for your video platform or reuse existing ones.

## Next steps

Those changes will mainly just show your new cookies in the cookie consent manager, but without much function. Head over to our guide about [Reacting to cookie consent changes](reacting-to-cookie-consent-changes) to see how you can implement your custom logic once your cookie got accepted or declined.
