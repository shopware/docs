# Adding custom complex data

## Overview

Quite often, your plugin has to save data into a custom database table. Shopware 6's data abstraction layer fully supports custom entities, so you don't have to take care of the data handling at all.

## Prerequisites

This guide is built upon the [plugin base guide](../../plugin2-base-guide.md), but any plugin will work here. Just note that all examples are using the plugin mentioned above.
In order to create a database table, you need to understand plugin migrations [Plugin migrations](../../plugin-fundamentals/database-migrations.md).
Also, you'll have to understand how the [dependency injection](../../plugin-fundamentals/dependency-injection.md) works as well.

## Creating the database

We'll start with creating a new database table. Make sure to always add your individual prefix to your plugin's database tables, e.g. your manufacturer name.

In this guide we'll name our table `swag_example`, you'll find this name a few more times in here, so make sure to remember that one.

As already mentioned in the prerequisites, creating a database table is done via plugin migrations [Plugin migrations](../../plugin-fundamentals/database-migrations.md),
head over to this guide to understand how this example works.

{% code title="<plugin root>/src/Migration/Migration1611664789Example.php" %}
```php
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
        $connection->executeUpdate($sql);
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
```
{% endcode %}

After reinstalling your plugin, you should see your new database table `swag_example`.

## Creating an entity

### EntityDefinition class

Introducing the table to Shopware 6 is done by adding a so called `EntityDefinition` for your table. As the name suggests, it defines your own entity, including its fields and name, the latter also represents the table name and therefore has to perfectly match.

Your custom entity definition should be placed inside a folder named after the domain it handles, e.g. "Checkout" if you were to include a Checkout entity. Thus, a good location for this example could be in a directory like this: `<plugin root>/src/Core/Content/Example`  
This will also be the case for the `Entity` class itself, as well as the `EntityCollection` class, but those are explained later in this guide.

Start of with creating a new file named `ExampleDefinition.php` in the directory `<plugin root>/src/Core/Content/Example/ExampleDefinition.php`. Below you'll see our example defininition, which is explained afterwards:

{% code title="<plugin root>/src/Core/Content/Example/ExampleDefinition.php" %}
```php
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
{% endcode %}

First of all, your own definition has to extend from the class `Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition`, which enforces you to implement two methods: `getEntityName` and `defineFields`.

The method `getEntityName` returns a string equal to your table name. In this example it is `swag_example`. Keep in mind, that the return of your `getEntityName` method will be used for two cases:

* The database table name
* The repository name in the DI container \(`<the-name>.repository`\)

The method `defineFields` contains all the fields, that your entity or table consists of.

As you can see in your migration, your table consists of the following fields: You've got an `id` field, a `name` field, a `description` and an `active` field. Other than that, the other two columns `created_at` and `updated_at` don't have to be defined in your definition, since they're included by default. You're asked to return a `Shopware\Core\Framework\DataAbstractionLayer\FieldCollection` instance here, which then has to contain an array of your fields. There's several field classes, e.g. an `Shopware\Core\Framework\DataAbstractionLayer\Field\IdField` or a `Shopware\Core\Framework\DataAbstractionLayer\Field\StringField`, which you have to create and pass into the `FieldCollection`, so let's do that.

{% code title="<plugin root>/src/Core/Content/Example/ExampleDefinition.php" %}
```php
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
{% endcode %}

As you can see, we've implemented an `IdField` for the `id` column, a `StringField` for the `name` and the `description`, as well as a `BoolField` for the `active` column. Most `Field` classes ask for two parameters, such as the `IdField`:

* A storage name, which represents the name of the field in the storage, e.g. the column in an SQL database.
* A property name, which defines how you can access this field later on. Make sure to remember those for the next step.

The `storageName` is written in snake\_case, while the `propertyName` must be written in lowerCamelCase.

Another thing to note is the `addFlags` call on the `IdField`. Those flags are like attributes to fields, such a required field being marked by using the `Required` flag.

If you want to know more about the flags and how to use them, head over to our guide on how to use flags [Using flags](./using-flags.md).

All that's left to do now, is to introduce your `ExampleDefinition` to Shopware by registering your class in your `services.xml` file and by using the `shopware.entity.definition` tag,
because Shopware is looking for definitions this way.
If your plugin does not have a `services.xml` file yet or you don't know how that's done,
head over to our guide about registering a custom service [Add a custom class / service](../../plugin-fundamentals/add-custom-service.md)
or our guide about the [Dependency injection](../../plugin-fundamentals/dependency-injection.md).

Here's the `services.xml` as it should look like:

```markup
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

And basically that's it already for your definition class.
Theoretically you could start using your entity now by injecting the `swag_example.repository` service to other services and start working with the repository,
e.g. to [read data](./reading-data.md) or to [write data](./writing-data.md).

Yet, we highly recommend you to create a custom `Entity` class, as well as a custom `EntityCollection` class.
This is not mandatory, but those will be replaced with generic classes otherwise.

### Entity class

The entity class itself is a simple key-value object, like a struct, which contains as many properties as fields in the definition, ignoring the ID field, which is handled by the `EntityIdTrait`.

{% code title="<plugin root>/src/Core/Content/Example/ExampleEntity.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class ExampleEntity extends Entity
{
    use EntityIdTrait;

    /**
     * @var string|null
     */
    protected $name;

    /**
     * @var string|null
     */
    protected $description;

    /**
     * @var bool
     */
    protected $active;

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
{% endcode %}

As you can see, it only holds the properties and its respective getters and setters, for the fields mentioned in the `EntityDefinition` class.

Now you need your definition to know its custom entity class. This is done by overriding the method `getEntityClass` in your `ExampleDefinition`.

{% code title="<plugin root>/src/Core/Content/Example/ExampleDefinition.php" %}
```php
class ExampleDefinition extends EntityDefinition
{
    [...]

    public function getEntityClass(): string
    {
        return ExampleEntity::class;
    }
}
```
{% endcode %}

That's it. Instead of generic `ArrayEntity` instances, you'll get `ExampleEntity` class instances now if you were to read your data using the repository.

### EntityCollection

Just like the `Entity` class, you do want to create your own `EntityCollection` class.

So create a `ExampleCollection` class in the same directory as your `ExampleDefinition` and `ExampleEntity`. Extending from `Shopware\Core\Framework\DataAbstractionLayer\EntityCollection`, it comes with a method called `getExpectedClass`, which once again returns the fully qualified class name of the `Entity` class to be used. Go ahead and override this method and return your `ExampleEntity` here. Additionally, you can provide helper methods in your custom `EntityCollection`, such as filtering the result set by certain conditions, but that's up to you.

This is how your collection class could then look like:

{% code title="<plugin root>/src/Core/Content/Example/ExampleCollection.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Bundle;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void               add(CustomEntity $entity)
 * @method void               set(string $key, CustomEntity $entity)
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
{% endcode %}

The class documentation is just another helper to have a proper auto-completion when working with your `ExampleCollection`.

Now it's time to introduce your custom collection to your `ExampleDefinition` again. This is done by overriding its `getCollectionClass` method.

{% code title="<plugin root>/src/Core/Content/Example/ExampleDefinition.php" %}
```php
class ExampleDefinition extends EntityDefinition
{
    [...]

    public function getCollectionClass(): string
    {
        return ExampleCollection::class;
    }
}
```
{% endcode %}

That's it, your definition is now completely registered to Shopware 6! From here on your custom entity is accessible throughout the API and you can fully use it for CRUD operations with its repository.

## Next steps

As a follow up, you might want to have a look at the documentation on how to [translate custom entities](./add-data-translations.md),
e.g. for your `name` and `description` field. Also you might want to have a look on how to [add data associations](./add-data-associations.md).

