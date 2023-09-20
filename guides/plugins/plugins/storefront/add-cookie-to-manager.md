# Add Cookie to Manager

## Overview

Since the GDPR was introduced, every website has to be shipped with some sort of a cookie consent manager. This is also the case for Shopware 6 of course, which comes with a cookie consent manager by default. In this guide you will learn how you can add your own cookies to the cookie consent manager of Shopware 6.

## Prerequisites

This guide is built upon the [Plugin base guide](../plugin-base-guide.md), so have a look at that first if you're lacking a running plugin. Also you will have to know how to [create your own service](../plugin-fundamentals/add-custom-service.md) and [decorations](../plugin-fundamentals/adjusting-service.md#decorating-the-service), so you might want to have a look at those guides as well.

## Extend the cookie consent manager

Adding custom cookies basically requires you to decorate a service, the `CookieProvider` to be precise. Neither decorations, nor adding a service via a `services.xml` is explained here, so make sure to have a look at the previously mentioned guides first, if you're lacking this knowledge.

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

The interface mentioned above requires you to implement a method called `getCookieGroups`, which has to return an array of cookie groups and their respective cookies. You need to call the original method now, receive the default cookie groups and then merge your custom group, if there's any, and your custom cookies into it.

Let's have a look at an example:

```php
// <plugin root>/src/Service/CustomCookieProvider.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use Shopware\Storefront\Framework\Cookie\CookieProviderInterface;

class CustomCookieProvider implements CookieProviderInterface {

    private CookieProviderInterface $originalService;

    public function __construct(CookieProviderInterface $service)
    {
        $this->originalService = $service;
    }

    private const singleCookie = [
        'snippet_name' => 'cookie.name',
        'snippet_description' => 'cookie.description ',
        'cookie' => 'cookie-key',
        'value' => 'cookie value',
        'expiration' => '30'
    ];

    // cookies can also be provided as a group
    private const cookieGroup = [
        'snippet_name' => 'cookie.group_name',
        'snippet_description' => 'cookie.group_description ',
        'entries' => [
            [
                'snippet_name' => 'cookie.first_child_name',
                'cookie' => 'cookie-key-1',
                'value'=> 'cookie value',
                'expiration' => '30'
            ],
            [
                'snippet_name' => 'cookie.second_child_name',
                'cookie' => 'cookie-key-2',
                'value'=> 'cookie value',
                'expiration' => '60'
            ]
        ],
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
}
```

As already mentioned, we're overwriting the method `getCookieGroups` and in there we're calling the original method first. We then proceed to merge our own custom group into it, as well as a custom cookie.

This will eventually lead to a new group being created, containing two new cookies, as well as a new cookie without a group.

And that's basically it already. After loading your Storefront, you should now see your new cookies and the cookie-group.

### Cookie array keys

Here's a list of attributes, that you can apply to a cookie array:

| Attribute | Data type | Required | Description |
| :--- | :--- | :--- | :--- |
| snippet\_name | String | Yes | Key of a snippet containing the display name of a cookie or cookie group. |
| snippet\_description | String | No | Key of a snippet containing a short description of a cookie or cookie group. |
| cookie | String | Yes | The internal cookie name used to save the cookie. |
| value | String | No | If unset, the cookie will not be updated \(set active or inactive\) by Shopware, but passed to the update event only. |
| expiration | String | No | Cookie lifetime in days. **If unset, the cookie expires with the session**. |
| entries | Array | No | An array of cookie objects. Used to create grouped cookies. Nested groups are not supported. If using this, **the group itself should not have the attributes** _**cookie**_**,** _**value**_ **and** _**expiration**_**.**. |

## Next steps

Those changes will mainly just show your new cookies in the cookie consent manager, but without much function. Head over to our guide about [Reacting to cookie consent changes](reacting-to-cookie-consent-changes.md) to see how you can implement your custom logic once your cookie got accepted or declined.
