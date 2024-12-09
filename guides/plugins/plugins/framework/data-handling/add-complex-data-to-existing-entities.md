---
nav:
  title: Adding complex data to existing entities
  position: 40

---

# Adding Complex Data to Existing Entities

## Overview

Sometimes you want to extend existing entities with some custom information. Extensions are technical and not configurable by the admin user. Also, they can deal with more complex types than scalar ones.

## Prerequisites

To create your own entity extension for your plugin, you first need a plugin as base. Please refer to the [Plugin Base Guide](../../plugin-base-guide).

Basic knowledge of [creating a custom entity](add-custom-complex-data) and [adding associations](add-data-associations) will also be helpful for this guide.

## Creating the extension

In this example, we're going to add a new string field to the `product` entity.

You can choose whether you want to save the new string field to the database or not. Therefore, you're going to see two sections, one for each way.

For both cases, you need to create a new "extension" class in the directory `<plugin root>/src/Extension/`. In this case, we want to extend the `product` entity, so we create a subdirectory `Content/Product/` since the entity location in the Core is the same. Our class needs to extend from the abstract `Shopware\Core\Framework\DataAbstractionLayer\EntityExtension` class, which forces you to implement the `getDefinitionClass` method. It has to point to the entity definition you want to extend, so `ProductDefinition` in this case.

You add new fields by overriding the method `extendFields` and add your new fields in there.

Here's an example class called `CustomExtension`:

```php
// <plugin root>/src/Extension/Content/Product/CustomExtension.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Extension\Content\Product;

use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityExtension;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class CustomExtension extends EntityExtension
{
    public function extendFields(FieldCollection $collection): void
    {
        $collection->add(
            // new fields here
        );
    }

    public function getDefinitionClass(): string
    {
        return ProductDefinition::class;
    }
}
```

Now we have to register our extension via the DI-container. If you don't know how that's done in general, head over to our guide about registering a custom service [Add a custom class / service](../../plugin-fundamentals/add-custom-service) or our guide about the [dependency injection](../../plugin-fundamentals/dependency-injection).

Here's our `services.xml`:

```xml
// <plugin root>/src/Resources/config/services.xml
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

### Adding a field with a database

In this guide, you're extending the product entity in order to add a new string field to it. Since you must not extend the `product` table with a new column, you'll have to add a new table which contains the new data for the product. This new table will then be associated using a [OneToOne association](add-data-associations#One%20to%20One%20associations).

Let's start with the `CustomExtension` class by adding a new field in the `extendFields` method.

```php
// <plugin root>/src/Extension/Content/Product/CustomExtension.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Extension\Content\Product;
use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityExtension;
use Shopware\Core\Framework\DataAbstractionLayer\Field\OneToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class CustomExtension extends EntityExtension
{
    public function extendFields(FieldCollection $collection): void
    {
        $collection->add(
            new OneToOneAssociationField('exampleExtension', 'id', 'product_id', ExampleExtensionDefinition::class, true)
        );
    }

    public function getDefinitionClass(): string
    {
        return ProductDefinition::class;
    }
}
```

As you can see, we're adding a new `OneToOneAssociationField`. Its parameters are the following, in correct order:

* `propertyName`: The name of the property which should contain the associated entity of type `ExampleExtensionDefinition` in the `ProductDefinition`. Property names are usually camelCase, with the first character being lower cased.
* `storageName`: Use the `id` column here, which refers to the `id` field of your product. This will be used for the connection to your association. Storage names are always lowercase and snake_cased.
* `referenceField`: In the `storageName` you defined one of the two connected columns, `id`. The name of the other column in the database, which you want to connect via this association, belongs into this parameter. In that case, it will be a column called `product_id`, which we will define in the `ExampleExtensionDefinition`.
* `referenceClass`: The class name of the definition that we want to connect via the association.
* `autoload`: As the name suggests, this parameter defines if this association should always be loaded by default when the product is loaded. In this case, we definitely want that.

#### Creating ExampleExtensionDefinition

You most likely noticed the new class `ExampleExtensionDefinition`, which we're going to create now. It will contain the actual string field that we wanted to add to the product.

Creating a new entity is not explained in this guide, so make sure you know [this guide](add-custom-complex-data) beforehand.

Our new entity will be located in the same directory as our extension. Let's first have a look at it before going into the explanation:

```php
// <plugin root>/src/Extension/Content/Product/ExampleExtensionDefinition.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Extension\Content\Product;

use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\OneToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class ExampleExtensionDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'swag_example_extension';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    public function getEntityClass(): string
    {
        return ExampleExtensionEntity::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
            new FkField('product_id', 'productId', ProductDefinition::class),
            (new StringField('custom_string', 'customString')),
            // ReferenceVersionField only needed on versioned entities
            new ReferenceVersionField(ProductDefinition::class, 'product_version_id'),
            new OneToOneAssociationField('product', 'product_id', 'id', ProductDefinition::class, false)
        ]);
    }
}
```

We've created a new entity definition called `ExampleExtensionDefinition`, as mentioned in the `CustomExtension` class. Its table name will be `swag_example_extension` and it will have a custom entity class called `ExampleExtensionEntity`, as you can see in the `getEntityClass` method. This will remain an example, creating the actual entity `ExampleExtensionEntity` is not part of this guide.

So let's have a look at the `defineFields` method. There's the default `IdField`, that almost every entity owns. The next field is the actual `product_id` column, which will be necessary in order to properly this entity with the product and vice versa. It has to be defined as `FkField` since that's what it is: a foreign key.

Now we're getting to the actual new data, in this example, this is just a new string field. It is called `customString` and can now be used in order to store new string data for the product in the database.

The last field is the inverse side of the `OneToOneAssociationField`. The first parameter defines the name of the property again, which will contain the `ProductEntity`. Now take a look at the second and third parameters. Those are the same as in the `ProductDefinition`, but the other way around. This order is important.

The fourth parameter is the class of the associated definition, the `ProductDefinition` in this case. The last parameter, once again, defines the autoloading. In this example, the product definition will **not** be loaded, when you're just trying to load this extension entity. Yet, the extension entity will always automatically be loaded when the product entity is loaded, just like we defined earlier.

Of course, this new definition also needs to be registered to the DI container:

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Extension\Content\Product\CustomExtension">
            <tag name="shopware.entity.extension"/>
        </service>

        <service id="Swag\BasicExample\Extension\Content\Product\ExampleExtensionDefinition">
            <tag name="shopware.entity.definition" entity="swag_example_extension" />
        </service>
    </services>
</container>
```

#### Adding the new database table

Of course, you have to add the new database table via a [Database migration](../../plugin-fundamentals/database-migrations). Look at the guide linked above to see how exactly this is done. Here's the example migration and how it could look like:

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1614903457ExampleExtension extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1614903457;
    }

    public function update(Connection $connection): void
    {
    // product_version_id only needed when extending a versioned entity
        $sql = <<<SQL
CREATE TABLE IF NOT EXISTS `swag_example_extension` (
    `id` BINARY(16) NOT NULL,
    `product_id` BINARY(16) NULL,
    `product_version_id` BINARY(16) NOT NULL,
    `custom_string` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `unique.swag_example_extension.product` UNIQUE (`product_id`, `product_version_id`),
    CONSTRAINT `fk.swag_example_extension.product_id` FOREIGN KEY (`product_id`, `product_version_id`) REFERENCES `product` (`id`, `version_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL;
        $connection->executeStatement($sql);
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
```

##### Foreign keys

The `AssociationFields` take care of loading the data, but it is recommended to add [foreign key constraints](https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html) to your migration query. This will ensure that your data is consistent (checks if the foreign key exists); for example, it will delete the `swag_example_extension` entry when the linked product is deleted.

#### Writing into the new field

As already mentioned, your new association is automatically loaded every time a product entity is loaded. This section will show you how to write to the new field instead.

As with every [write operation](writing-data), this is done via the product repository in this example.

```php
$this->productRepository->upsert([[
    'id' => '<your product ID here>',
    'exampleExtension' => [
        'customString' => 'foo bar'
    ]
]], $context);
```

In this case, you'd write "foo bar" to the product with your desired ID. Note the keys `exampleExtension`, as defined in the product extension class `CustomExtension`, and the key `customString`, which is the property name that you defined in the `ExampleExtensionDefinition` class.

### Adding a field without a database

We can use the DAL event which gets fired every time the product entity is loaded. You can find those kinds of events in the respective entities' event class. In this case, it is `Shopware\Core\Content\Product\ProductEvents`.

Below, you can find an example implementation where we add our extension when the product gets loaded.

```php
// <plugin root>/src/Subscriber/ProductSubscriber.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Subscriber;

use Shopware\Core\Content\Product\ProductEntity;
use Shopware\Core\Framework\Struct\ArrayEntity;
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

We're registering to the `ProductEvents::PRODUCT_LOADED_EVENT` event, which is fired every time one or multiple products are requested. In the event listener method `onProductsLoaded`, we're then adding our own data to the new field via the method `addExtension`.

Please note that its second parameter, the actual value, has to be a struct and not just a string or other kind of scalar value.

After we've created our subscriber, we have to adjust our `services.xml` to register it. Below you can find our `services.xml`.

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Subscriber\ProductSubscriber">
            <tag name="kernel.event_subscriber"/>
        </service>
    </services>
</container>
```

## Entity extension vs. Custom fields

[Custom fields](../custom-field/add-custom-field) are by default configurable by the admin user in the Administration, and they mostly support scalar types, e.g. a text-field, a number field, or the likes. If you'd like to create associations between entities, you'll need to use an entity extension, just like we did here. Of course, you can also add scalar values without an association to an entity via an extension.

## Bulk entity extensions

::: info
This feature is available since Shopware 6.6.10.0
:::

In case your project or plugin requires many entity extensions, you can register a `BulkEntityExtension` which allows extending multiple entities at once:

```php
<?php

namespace Examples;

use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Content\Category\CategoryDefinition;

class MyBulkExtension extends BulkEntityExtension
{
    public function collect(): \Generator
    {
        yield ProductDefinition::ENTITY_NAME => [
            new FkField('main_category_id', 'mainCategoryId', CategoryDefinition::class),
        ];

        yield CategoryDefinition::ENTITY_NAME => [
            new FkField('product_id', 'productId', ProductDefinition::class),
            new ManyToOneAssociationField('product', 'product_id', ProductDefinition::class),
        ];
    }
}
```

Each yield defines the entity name which should be extended and the array value defines the fields which should be added. In this example, the `product` and `category` entities are extended.

You must also register the extension in your `services.xml` file and tag it with `shopware.bulk.entity.extension`.

```xml
<service id="Examples\MyBulkExtension">
   <tag name="shopware.bulk.entity.extension"/>
</service>
```
