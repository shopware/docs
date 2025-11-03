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

This guide is built upon the [Plugin base guide](../plugin-base-guide), so have a look at that first if you're lacking a running plugin. Also you will have to know how to [create your own service](../plugin-fundamentals/add-custom-service) and [decorations](../plugin-fundamentals/adjusting-service#decorating-the-service), so you might want to have a look at those guides as well.

## Extend the cookie consent manager

Adding custom cookies basically requires you to decorate a service, the `CookieProvider` to be precise. Neither decorations, nor adding a service via a `services.xml` is explained here, so make sure to have a look at the previously mentioned guides first, if you're lacking this knowledge.

::: warning
Since Shopware 6.7, cookies use structured objects (`CookieEntry` and `CookieGroup`) instead of arrays for better type safety and consistency. The array format is deprecated.
:::

### Registering your decoration

Start with creating the `services.xml` entry and with decorating the `CookieProviderInterface`. The `CookieProvider` service was already built before we decided to use abstract classes for decorations, so don't be confused here.

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
       <service id="PluginName\Framework\Cookie\CustomCookieProvider"
                decorates="Shopware\Storefront\Framework\Cookie\CookieProviderInterface">
             <argument type="service"
                       id="PluginName\Framework\Cookie\CustomCookieProvider.inner" />
         </service>
    </services>
</container>
```

In the next step we'll create the actual decorated class.

### Creating the decorated service

We need to create a class called `CustomCookieProvider`, which implements the `CookieProviderInterface`. Our constructor parameter is the original `CookieProviderInterface` instance, which we need to call to get all other cookies as well.

The interface mentioned above requires you to implement a method called `getCookieGroups`, which has to return an array of cookie groups and their respective cookies. You need to call the original method now, receive the default cookie groups and then add your custom cookies using the `CookieEntry` and `CookieGroup` classes.

Let's have a look at an example:

```php
// <plugin root>/src/Framework/Cookie/CustomCookieProvider.php
<?php declare(strict_types=1);

namespace PluginName\Framework\Cookie;

use Shopware\Storefront\Framework\Cookie\CookieProviderInterface;
use Shopware\Core\Content\Cookie\Struct\CookieEntry;
use Shopware\Core\Content\Cookie\Struct\CookieGroup;
use Shopware\Core\Framework\Struct\Collection;

class CustomCookieProvider implements CookieProviderInterface {

    private CookieProviderInterface $originalService;

    public function __construct(CookieProviderInterface $service)
    {
        $this->originalService = $service;
    }

    public function getCookieGroups(): array
    {
        // Get existing cookie groups from decorated service
        $cookieGroups = $this->originalService->getCookieGroups();

        // Create a single cookie
        $singleCookie = new CookieEntry(
            snippetName: 'cookie.name',
            cookie: 'cookie-key',
            value: 'cookie value',
            expiration: 30,
            snippetDescription: 'cookie.description'
        );

        // Create entries collection for cookie group
        $groupEntries = new Collection([
            new CookieEntry(
                snippetName: 'cookie.first_child_name',
                cookie: 'cookie-key-1',
                value: 'cookie value',
                expiration: 30
            ),
            new CookieEntry(
                snippetName: 'cookie.second_child_name',
                cookie: 'cookie-key-2',
                value: 'cookie value',
                expiration: 60
            )
        ]);

        // Create a cookie group with multiple cookies
        $cookieGroup = new CookieGroup(
            snippetName: 'cookie.group_name',
            entries: $groupEntries,
            snippetDescription: 'cookie.group_description'
        );

        // Add new cookies using Collection
        $collection = new Collection($cookieGroups);
        $collection->add($cookieGroup);
        $collection->add($singleCookie);

        return $collection->getElements();
    }
}
```

As already mentioned, we're overwriting the method `getCookieGroups` and in there we're calling the original method first. We then proceed to add our custom group into it, as well as a custom cookie.

This will eventually lead to a new group being created, containing two new cookies, as well as a new cookie without a group.

And that's basically it already. After loading your Storefront, you should now see your new cookies and the cookie-group.

## Parameter Reference

For a complete list of available parameters and their types, refer to the source code:

* [`CookieEntry`](https://github.com/shopware/shopware/blob/trunk/src/Core/Content/Cookie/Struct/CookieEntry.php) - Individual cookie definition
* [`CookieGroup`](https://github.com/shopware/shopware/blob/trunk/src/Core/Content/Cookie/Struct/CookieGroup.php) - Cookie group definition

::: info
Cookie groups should not have the `cookie`, `value`, `expiration`, or `isRequired` parameters. These only apply to individual `CookieEntry` objects within the group's `entries`.
:::

## Migrating from Array Format (Shopware 6.6 and earlier)

If you're upgrading from Shopware 6.6 or earlier, you need to convert your array-based cookies to structs.

### Before (Array format - deprecated)

```php
private const singleCookie = [
    'snippet_name' => 'cookie.name',
    'snippet_description' => 'cookie.description',
    'cookie' => 'cookie-key',
    'value' => 'cookie value',
    'expiration' => '30'
];

private const cookieGroup = [
    'snippet_name' => 'cookie.group_name',
    'snippet_description' => 'cookie.group_description',
    'entries' => [
        [
            'snippet_name' => 'cookie.first_child_name',
            'cookie' => 'cookie-key-1',
            'value'=> 'cookie value',
            'expiration' => '30'
        ]
    ]
];

public function getCookieGroups(): array
{
    return array_merge(
        $this->originalService->getCookieGroups(),
        [
            self::cookieGroup,
            self::singleCookie
        ]
    );
}
```

### After (Struct format - recommended)

```php
use Shopware\Core\Content\Cookie\Struct\CookieEntry;
use Shopware\Core\Content\Cookie\Struct\CookieGroup;
use Shopware\Core\Framework\Struct\Collection;

private readonly CookieEntry $singleCookie;
private readonly CookieGroup $cookieGroup;

public function __construct(CookieProviderInterface $service)
{
    $this->originalService = $service;

    $this->singleCookie = new CookieEntry(
        snippetName: 'cookie.name',
        cookie: 'cookie-key',
        value: 'cookie value',
        expiration: 30,
        snippetDescription: 'cookie.description'
    );

    $this->cookieGroup = new CookieGroup(
        snippetName: 'cookie.group_name',
        entries: new Collection([
            new CookieEntry(
                snippetName: 'cookie.first_child_name',
                cookie: 'cookie-key-1',
                value: 'cookie value',
                expiration: 30
            )
        ]),
        snippetDescription: 'cookie.group_description'
    );
}

public function getCookieGroups(): array
{
    $collection = new Collection($this->originalService->getCookieGroups());
    $collection->add($this->cookieGroup);
    $collection->add($this->singleCookie);

    return $collection->getElements();
}
```

### Key Migration Changes

* Use `CookieEntry` and `CookieGroup` objects instead of arrays
* Use `Collection` objects for cookie group entries instead of plain arrays
* Parameter names are camelCase (e.g., `snippetName` instead of `snippet_name`)
* Use named parameters for better readability
* `expiration` is now an integer instead of a string
* Create objects explicitly and assign them to variables for better code clarity
* Import the struct classes and Collection at the top of your file

## Cookie Configuration Changes and Re-Consent

Since Shopware 6.7, cookie configurations include a hash that tracks changes. When you modify cookie configurations through your plugin (add/remove/change cookies), the hash changes automatically, triggering a re-consent flow for users.

This helps maintain transparency by re-prompting users when cookie handling changes, supporting GDPR compliance requirements. The hash is automatically calculated from all cookie configurations provided by the `CookieProvider`.

::: info
While this feature helps with GDPR compliance, shop owners are responsible for ensuring their overall cookie usage, privacy policies, and data handling practices comply with GDPR and other applicable regulations.
:::

### How it works

1. Your plugin adds/modifies cookies via `CookieProvider`
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
