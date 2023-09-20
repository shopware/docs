---
nav:
  title: Adding custom complex data
  position: 30

---

# Adding Custom Complex Data

## Overview

Quite often, your plugin has to save data into a custom database table. Shopware 6's data abstraction layer fully supports custom entities, so you don't have to take care of the data handling at all.

## Prerequisites

This guide is built upon the [Plugin base guide](../../plugin-base-guide), but any plugin will work here. Just note that all examples are using the plugin mentioned above. In order to create a database table, you need to understand plugin migrations [Plugin migrations](../../plugin-fundamentals/database-migrations). Also, you'll have to understand how the [Dependency injection](../../plugin-fundamentals/dependency-injection) works as well.

::: info
Refer to this video on **[Creating a custom entity](https://www.youtube.com/watch?v=mTHTyof4gPk)**. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Creating the database table

We'll start with creating a new database table. Make sure to always add your individual prefix to your plugin's database tables, e.g. your manufacturer name.

In this guide we'll name our table `swag_example`, you'll find this name a few more times in here, so make sure to remember that one.

As already mentioned in the prerequisites, creating a database table is done via plugin migrations [Plugin migrations](../../plugin-fundamentals/database-migrations), head over to this guide to understand how this example works.

```php
// <plugin root>/src/Migration/Migration1611664789Example.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1611664789Example extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1611664789;
    }

    public function update(Connection $connection): void
    {
        $sql = <<<SQL
CREATE TABLE IF NOT EXISTS `swag_example` (
    `id` BINARY(16) NOT NULL,
    `name` VARCHAR(255) COLLATE utf8mb4_unicode_ci,
    `description` VARCHAR(255) COLLATE utf8mb4_unicode_ci,
    `active` TINYINT(1) COLLATE utf8mb4_unicode_ci,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3),
    PRIMARY KEY (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;
SQL;
        $connection->executeStatement($sql);
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
```

After reinstalling your plugin, you should see your new database table `swag_example`.

## Creating an entity

### EntityDefinition class

Introducing the table to Shopware 6 is done by adding a so called `EntityDefinition` for your table. As the name suggests, it defines your own entity, including its fields and name, the latter also represents the table name and therefore has to perfectly match.

Your custom entity definition should be placed inside a folder named after the domain it handles, e.g. "Checkout" if you were to include a Checkout entity. Thus, a good location for this example could be in a directory like this: `<plugin root>/src/Core/Content/Example`  
This will also be the case for the `Entity` class itself, as well as the `EntityCollection` class, but those are explained later in this guide.

Start of with creating a new file named `ExampleDefinition.php` in the directory `<plugin root>/src/Core/Content/Example/ExampleDefinition.php`. Below you'll see our example defininition, which is explained afterwards:

```php
// <plugin root>/src/Core/Content/Example/ExampleDefinition.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example;

use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class ExampleDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'swag_example';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([]);
    }
}
```

First of all, your own definition has to extend from the class `Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition`, which enforces you to implement two methods: `getEntityName` and `defineFields`.

The method `getEntityName` returns a string equal to your table name. In this example it is `swag_example`. Keep in mind, that the return of your `getEntityName` method will be used for two cases:

* The database table name
* The repository name in the DI container \(`<the-name>.repository`\)

The method `defineFields` contains all the fields, that your entity or table consists of.

As you can see in your migration, your table consists of the following fields: You've got an `id` field, a `name` field, a `description` and an `active` field. Other than that, the other two columns `created_at` and `updated_at` don't have to be defined in your definition, since they're included by default. You're asked to return a `Shopware\Core\Framework\DataAbstractionLayer\FieldCollection` instance here, which then has to contain an array of your fields. There's several field classes, e.g. an `Shopware\Core\Framework\DataAbstractionLayer\Field\IdField` or a `Shopware\Core\Framework\DataAbstractionLayer\Field\StringField`, which you have to create and pass into the `FieldCollection`, so let's do that.

```php
// <plugin root>/src/Core/Content/Example/ExampleDefinition.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example;

use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use Shopware\Core\Framework\DataAbstractionLayer\Field\BoolField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;

class ExampleDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'swag_example';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
            (new StringField('name', 'name')),
            (new StringField('description', 'description')),
            (new BoolField('active', 'active'))
        ]);
    }
}
```

As you can see, we've implemented an `IdField` for the `id` column, a `StringField` for the `name` and the `description`, as well as a `BoolField` for the `active` column. Most `Field` classes ask for two parameters, such as the `IdField`:

* A storage name, which represents the name of the field in the storage, e.g. the column in an SQL database.
* A property name, which defines how you can access this field later on. Make sure to remember those for the next step.

The `storageName` is written in snake\_case, while the `propertyName` must be written in lowerCamelCase.

Another thing to note is the `addFlags` call on the `IdField`. Those flags are like attributes to fields, such a required field being marked by using the `Required` flag.

If you want to know more about the flags and how to use them, head over to our guide on how to use flags [Using flags](using-flags).

All that's left to do now, is to introduce your `ExampleDefinition` to Shopware by registering your class in your `services.xml` file and by using the `shopware.entity.definition` tag, because Shopware is looking for definitions this way. If your plugin does not have a `services.xml` file yet or you don't know how that's done, head over to our guide about registering a custom service [Add a custom class / service](../../plugin-fundamentals/add-custom-service) or our guide about the [Dependency injection](../../plugin-fundamentals/dependency-injection).

Here's the `services.xml` as it should look like:

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Core\Content\Example\ExampleDefinition">
            <tag name="shopware.entity.definition" entity="swag_example" />
        </service>
    </services>
</container>
```

Please note the tag for your definition and the respective `entity` attribute, which has to contain the technical name of your entity, which you provided in your entity definition. In this case this must be `swag_example`.

And basically that's it already for your definition class. Theoretically you could start using your entity now by injecting the `swag_example.repository` service to other services and start working with the repository, e.g. to [read data](reading-data) or to [write data](writing-data).

Yet, we highly recommend you to create a custom `Entity` class, as well as a custom `EntityCollection` class. This is not mandatory, but those will be replaced with generic classes otherwise.

### Entity class

The entity class itself is a simple key-value object, like a struct, which contains as many properties as fields in the definition, ignoring the ID field, which is handled by the `EntityIdTrait`.

```php
// <plugin root>/src/Core/Content/Example/ExampleEntity.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class ExampleEntity extends Entity
{
    use EntityIdTrait;

    protected ?string $name;

    protected ?string $description;

    protected bool $active;

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function setActive(bool $active): void
    {
        $this->active = $active;
    }
}
```

As you can see, it only holds the properties and its respective getters and setters, for the fields mentioned in the `EntityDefinition` class.

Now you need your definition to know its custom entity class. This is done by overriding the method `getEntityClass` in your `ExampleDefinition`.

```php
// <plugin root>/src/Core/Content/Example/ExampleDefinition.php
class ExampleDefinition extends EntityDefinition
{
    [...]

    public function getEntityClass(): string
    {
        return ExampleEntity::class;
    }
}
```

That's it. Instead of generic `ArrayEntity` instances, you'll get `ExampleEntity` class instances now if you were to read your data using the repository.

### EntityCollection

Just like the `Entity` class, you do want to create your own `EntityCollection` class.

So create a `ExampleCollection` class in the same directory as your `ExampleDefinition` and `ExampleEntity`. Extending from `Shopware\Core\Framework\DataAbstractionLayer\EntityCollection`, it comes with a method called `getExpectedClass`, which once again returns the fully qualified class name of the `Entity` class to be used. Go ahead and override this method and return your `ExampleEntity` here. Additionally, you can provide helper methods in your custom `EntityCollection`, such as filtering the result set by certain conditions, but that's up to you.

This is how your collection class could then look like:

```php
// <plugin root>/src/Core/Content/Example/ExampleCollection.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void               add(ExampleEntity $entity)
 * @method void               set(string $key, ExampleEntity $entity)
 * @method ExampleEntity[]    getIterator()
 * @method ExampleEntity[]    getElements()
 * @method ExampleEntity|null get(string $key)
 * @method ExampleEntity|null first()
 * @method ExampleEntity|null last()
 */
class ExampleCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return ExampleEntity::class;
    }
}
```

The class documentation is just another helper to have a proper auto-completion when working with your `ExampleCollection`.

Now it's time to introduce your custom collection to your `ExampleDefinition` again. This is done by overriding its `getCollectionClass` method.

```php
// <plugin root>/src/Core/Content/Example/ExampleDefinition.php
class ExampleDefinition extends EntityDefinition
{
    [...]

    public function getCollectionClass(): string
    {
        return ExampleCollection::class;
    }
}
```

That's it, your definition is now completely registered to Shopware 6! From here on your custom entity is accessible throughout the API and you can fully use it for CRUD operations with its repository.

## Next steps

You've now got a simple entity about a single database table. However, your entity will most likely be even more complex.

For example we also have a guide about [Associations](add-data-associations), since you most likely will have multiple tables that have a relation to each other. Furthermore, the fields in this example are already [Using flags](using-flags). When dealing with products, you are also dealing with [Inheritance](field-inheritance), which we also got covered.

One more thing: Maybe you want to connect your database table to an already existing database table, hence an already existing entity. This is done by [extending the said existing entity](add-complex-data-to-existing-entities).
