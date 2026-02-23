---
nav:
  title: Add data to CMS element
  position: 40

---

# Add Data to CMS Element

## Overview

When creating custom CMS elements,
you sometimes want to use more complex data types than text or boolean values, e.g., other entities such as media or products.
In those cases you can implement a custom `CmsElementResolver` to resolve the configuration data.

## Prerequisites

This guide will not explain how to create custom CMS elements in general,
so head over to the official guide about [Adding a custom CMS element](add-cms-element) to learn this first.

## Create a data resolver

To manipulate the data of these elements during the loading of the configuration,
we create a `DailyMotionCmsElementResolver` resolver in our plugin.

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

In the previous [example](add-cms-element) we added a CMS element with the name `dailymotion`.
As you can see the `getType` method of our custom resolver reflects that name by returning the `dailymotion` string.
This resolver is called every time for an element of the type `dailymotion`.

To register our custom resolver to the service container, we have to register it in the `services.xml` file in our plugin.

::: code-group

```xml [PLUGIN_ROOT/src/Resources/config/services.xml]
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

:::

### Collect data

The `collect` method prepares the criteria object.
This is useful if, for example, you have a media entity `ID` stored in your configuration.
As in the following example, you can retrieve the configuration for the current CMS element with the call `$slot->getFieldConfig()` and then have access to the individual fields.
In this case we read out `myCustomMedia` field which may contain a mediaId.
If a `mediaId` exists, we create a new `CriteriaCollection` for it.
Now we are able to use this media object later on.
If you want to add data from an [attribute entity](../../framework/data-handling/entities-via-attributes), you do not have an explicit definition class.
Instead, you pass `example_entity.defintion` as second parameter to the `CriteriaCollection::add()` method.

::: code-group

```php [PLUGIN_ROOT/src/DataResolver/DailyMotionCmsElementResolver.php]
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

:::

### Enrich data

Inside the `enrich` you can perform additional logic on the data that has been resolved.
Like in the `collect` method, we have access to our configuration fields and their values.
Imagine you have stored some information in the element configuration and want to perform an external `Api` call to fetch some additional data.
After that you can add the response information to the current slot data by calling `$slot->setData()`.

This could be a possible solution for that:

::: code-group

```php [PLUGIN_ROOT/src/DataResolver/DailyMotionCmsElementResolver.php]
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

:::

### Event-based extensibility

In Shopware’s CMS flow, CMS Elements are not “live bound” to the original entity (e.g. a product).
Instead, during the slot-resolution, resolvers copy values from the entity into internal CMS structs
(for example, `ProductNameCmsElementResolver` takes the string `name` from the `product` entity and writes it into the CMS text element).
Once that copy is done, the storefront rendering reads from the CMS structs — not from the original entity.
Therefore: if you wait until a “page loaded” event (e.g. `ProductPageLoadedEvent`) after the copying happened, changing the underlying entity has no effect on what is displayed in the CMS output.
To make modifications effective (e.g. change product name, adjust a field, override some data), you must intervene before or after the resolver runs — i.e. at a point in the CMS resolution pipeline where the entity is still used for populating the CMS slots.

#### Available Extensions / Events

Shopware exposes three CMS extension classes under `Shopware\Core\Content\Cms\Extension`.
These extension classes follow the common Extension Point Pattern in Shopware and publish named hooks that you can subscribe to (the classes usually expose a `NAME` constant used as the event identifier).
All three extension points are dispatched with lifecycle suffixes such as `.pre` and `.post`, so you will typically see event names like `cms-slots-data.resolve.pre` or `cms-slots-data.resolve.post`.
Using the `.pre` hook lets you intervene before the respective phase runs; `.post` runs after the phase finished.

- `CmsSlotsDataCollectExtension` - This event (`cms-slots-data.collect` + suffix) allows interception of the collection process, where a criteria list is populated using the respective CMS resolver.
The resulting criteria list is then used to load CMS elements during the CMS page resolution process.

- `CmsSlotsDataEnrichExtension` - This event (`cms-slots-data.enrich` + suffix) allows interception of the enrichment process, during which CMS slots used in a rendered CMS page are populated with data loaded by the respective CMS resolver from the search results.

- `CmsSlotsDataResolveExtension` - This event (`cms-slots-data.resolve` + suffix) enables interception of the resolution process, allowing the collection of CMS slot data and enrichment of slots by their respective CMS resolvers.

#### Example Workflow: Modifying Product Data Before CMS Rendering

Here is a rough outline of how you would implement a subscriber to change some product properties before they end up in CMS elements:

1. Create an event subscriber for the CMS slot resolution event.
2. In the listener method, inspect the `ResolverContext` (or event payload) and check whether the entity is an instance of the type you care about (e.g. `ProductEntity`).
3. Modify the entity (e.g. `$entity->setName(...)`, set custom fields, translations, etc.).
4. Let execution continue, so the built-in resolvers pick up your modified entity and fill CMS elements accordingly.
5. Test frontend — changes should be visible.

#### PHP example (simplified)

```PHP
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

// ...

class CmsPreResolveSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            'cms-slots-data.resolve.pre' => 'onCmsSlotsResolvePre',
        ];
    }

    public function onCmsSlotsResolvePre(CmsSlotsDataResolveExtension $event): void
    {
        $resolverContext = $event->getResolverContext();
        $entity = $resolverContext->getEntity();

        if ($entity instanceof ProductEntity) {
            // modify e.g. the name
            $entity->setName('New custom name');
            // optionally modify other fields
        }
    }
}

// ...
```
