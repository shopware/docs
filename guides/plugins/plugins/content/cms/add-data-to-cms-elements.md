# Add Data to CMS Element

## Overview

When creating custom CMS elements, you sometimes want to use more complex data types than text or boolean values, e.g. other entities such as media or products. In those cases you can implement a custom `CmsElementResolver` to resolve the configuration data.

## Prerequisites

This guide will not explain how to create custom CMS elements in general, so head over to the official guide about [Adding a custom CMS element](add-cms-element.md) to learn this first.

## Create a data resolver

To manipulate the data of these elements during the loading of the configuration, we create a `DailyMotionCmsElementResolver` resolver in our plugin.

```php
// <plugin root>/src/DataResolver/DailyMotionCmsElementResolver.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\DataResolver;

use Shopware\Core\Content\Cms\Aggregate\CmsSlot\CmsSlotEntity;
use Shopware\Core\Content\Cms\DataResolver\Element\AbstractCmsElementResolver;
use Shopware\Core\Content\Cms\DataResolver\Element\ElementDataCollection;
use Shopware\Core\Content\Cms\DataResolver\ResolverContext\ResolverContext;
use Shopware\Core\Content\Cms\DataResolver\CriteriaCollection;

class DailyMotionCmsElementResolver extends AbstractCmsElementResolver
{
    public function getType(): string
    {
        return 'dailymotion';
    }

    public function collect(CmsSlotEntity $slot, ResolverContext $resolverContext): ?CriteriaCollection
    {
        return null;
    }

    public function enrich(CmsSlotEntity $slot, ResolverContext $resolverContext, ElementDataCollection $result): void
    {

    }
}
```

Our custom resolver extends from the `AbstractCmsElementResolver` which forces us to implement the methods `getType`, `collect` and `enrich`.

In the previous [example](add-cms-element.md) we added a cms element with the name `dailymotion`. As you can see the `getType` method of our custom resolver reflects that name by returning the `dailymotion` string. This resolver is called every time for an element of the type `dailymotion`.

To register our custom resolver to the service container we have to register it in the `services.xml` file in our plugin.

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\DataResolver\DailyMotionCmsElementResolver">
            <tag name="shopware.cms.data_resolver" />
        </service>
    </services>
</container>
```

### Collect data

The `collect` method prepares the criteria object. This is useful if, for example, you have a media entity `ID` stored in your configuration. As in the following example, you can retrieve the configuration for the current cms element with the call `$slot->getFieldConfig()` and then have access to the individual fields. In this case we read out `myCustomMedia` field which may contain a mediaId. If a `mediaId` exists, we create a new `CriteriaCollection` for it. Now we are able to use this media-object later on.

```php
// <plugin root>/src/DataResolver/DailyMotionCmsElementResolver.php
<?php declare(strict_types=1);

// ...
use Shopware\Core\Content\Media\MediaDefinition;
use Shopware\Core\Content\Media\MediaEntity;
// ...

    public function collect(CmsSlotEntity $slot, ResolverContext $resolverContext): ?CriteriaCollection
    {
        $config = $slot->getFieldConfig();
        $myCustomMedia = $config->get('myCustomMedia');

        if (!$myCustomMedia) {
            return null;
        }

        $mediaId = $myCustomMedia->getValue();

        $criteria = new Criteria([$mediaId]);

        $criteriaCollection = new CriteriaCollection();
        $criteriaCollection->add('media_' . $slot->getUniqueIdentifier(), MediaDefinition::class, $criteria);

        return $criteriaCollection;
    }

// ...
```

### Enrich data

Inside the `enrich` you can perform additional logic on the data that has been resolved. Like in the `collect` method, we have access to our configuration fields and their values. Imagine you have stored some information in the element configuration and want to perform an external `Api` call to fetch some additional data. After that you can add the response information to the current slot data by calling `$slot->setData()`.

This could be a possible solution for that:

```php
// <plugin root>/src/DataResolver/DailyMotionCmsElementResolver.php
<?php declare(strict_types=1);
// ...

    public function enrich(CmsSlotEntity $slot, ResolverContext $resolverContext, ElementDataCollection $result): void
    {
        $config = $slot->getFieldConfig();
        $myCustomApiPayload = $config->get('myCustomApiPayload');

        // perform some external api call with the payload `myCustomApiPayload`
        $myCustomAPI = new MyCustomAPI();

        $response = $myCustomAPI->query($myCustomApiPayload);

        if ($response) {
            $slot->setData($response);
        }
    }

// ...
```
