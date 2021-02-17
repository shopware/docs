## Adding complex data to existing entities

## Overview

Sometimes you want to extend existing entities with some custom information, this guide will have you covered.
Extensions are technical and not configurable by the admin user just like that. Also they can deal with more complex types than scalar ones.

## Prerequisites

In order to create your own entity extension for your plugin, you first need a plugin as base.
Therefore, you can refer to the [Plugin Base Guide](../../plugin-base-guide.md).

## Creating the extension

First of all we have to create an extension class in `<plugin root>/src/Extension/`. In this case we want to extend the `product` entity, so we create a subdirectory `Content/Product/` since the entity is located there in the Core.
Our class has to extend from `Shopware\Core\Framework\DataAbstractionLayer\EntityExtension`. Then we override the method `extendsFields` and add the fields we want to add to the collection.
Last for this class, we have to override the `getDefinitionClass` and return the `ProductDefinition`.

This is how your class could then look like this:

{% code title="<plugin root>/src/Extension/Content/Product/CustomExtension.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Extension\Content\Product;

use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityExtension;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Runtime;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class CustomExtension extends EntityExtension
{
    public function extendFields(FieldCollection $collection): void
    {
        $collection->add(
            (new StringField('custom_string', 'customString'))->addFlags(new Runtime())
        );
    }

    public function getDefinitionClass(): string
    {
        return ProductDefinition::class;
    }
}
```
{% endcode %}

This example adds another field named `custom_string` to the `ProductDefinition`. The `Runtime` flag tells the data abstraction layer, that you're going to take care of the field's content yourself.

Now we have to register our extension via the DI-container. If you don't know how that's done, head over to our guide about registering a custom service [PLACEHOLDER-LINK: Add a custom class / service] or our guide about the dependency injection [PLACEHOLDER-LINK: Dependency injection].

Here's our `services.xml`:

{% code title="<plugin root>/src/Resources/config/services.xml" %}
```xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Extension\Content\Product\CustomExtension">
            <tag name="shopware.entity.extension"/>
        </service>
    </services>
</container>
```
{% endcode %}

## Taking care of new field

In this step we take care of the `product` entities' new field ourselves. For this we need a new subscriber. If you are not familiar with a subscriber, have a look at our [PLACEHOLDER-LINK: Listening to events] guide.
Below you can find an example implementation where we add our extension, when the product gets loaded.

{% code title="<plugin root>/src/Subscriber/ProductSubscriber.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Shopware\Core\Content\Product\ProductEntity;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Core\Content\Product\ProductEvents;

class ProductSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ProductEvents::PRODUCT_LOADED_EVENT => 'onProductsLoaded'
        ];
    }

    public function onProductsLoaded(EntityLoadedEvent $event): void
    {
        /** @var ProductEntity $productEntity */
        foreach ($event->getEntities() as $productEntity) {
            $productEntity->addExtension('custom_string', new ArrayEntity(['foo' => 'bar']));
        }
    }
}
```
{% endcode %}

After we've created our subscriber, we have to adjust our `services.xml` to register it. Below you can find our `services.xml`.

{% code title="<plugin root>/src/Resources/config/services.xml" %}
```xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Extension\Content\Product\CustomExtension">
            <tag name="shopware.entity.extension"/>
        </service>

        <service id="Swag\BasicExample\Subscriber\ProductSubscriber">
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```
{% endcode %}

## Entity extension vs. Custom fields

Custom fields are by default, configurable by the admin user in the administration and they mostly support scalar types,
e.g. a text-field, a number field or the likes.
If you'd like to create associations between entities, you'll need to use an entity extension.

## Next steps

Now that you know, how to extend existing entities you may want to create your own entity, to get a grip of this, you can head over to our [Adding custom complex data](./add-custom-complex-data.md) guide.
Or maybe you want to get more familiar with custom fields, for this check out our [PLACEHOLDER-LINK: Add custom field] guide.
Since this guide talked about entity associations, you might want to have a look at our guide regarding [PLACEHOLDER-LINK: Entity associations].