# Adding Data Translations

## Overview

In this guide you'll learn how to add translations to entities.

## Prerequisites

This guide is built upon the [Plugin base guide](../../plugin-base-guide.md), but any plugin will work here. Just note that all examples are using the plugin mentioned above.

In order to create data translations you need an existing entity, as this guide is based on the [Adding custom complex data](add-custom-complex-data.md) guide, you should have a look at it first.

::: info
Refer to this video on **[Translating your entity](https://www.youtube.com/watch?v=FfqxfQl3I4w)** that deals with data translations. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Creating the migration

We'll start with creating a new database table. Make sure to use the name of your entity appending `_translation`.

In this guide we'll name our table `swag_example_translation` since our entity is named `swag_example`.

The translation table's columns should be the following:

<dl>
    <dt>`swag_example_id`</dt>
    <dd>This will refer to the `swag_example` entity this translation belongs to. This is also a foreign key.</dd>
    <dt>`language_id`</dt>
    <dd>This will contain the ID of the language for this translation. This is also a foreign key.</dd>
    <dt>`name`</dt>
    <dd>The actual translated value, the translated name of the `swag_example` entity.</dd>
    <dt>`created_at`</dt>
    <dd>Date when the translations has been created.</dd>
    <dt>`updated_at`</dt>
    <dd>Date when the translations has been updated.</dd>
</dl>

This is how your migration could look like:

```php
// <plugin root>/src/Migration/Migration1612863838ExampleTranslation.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1612863838ExampleTranslation extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1612863838;
    }

    public function update(Connection $connection): void
    {
        $query = <<<SQL
CREATE TABLE IF NOT EXISTS `swag_example_translation` (
    `swag_example_id` BINARY(16) NOT NULL,
    `language_id` BINARY(16) NOT NULL,
    `name` VARCHAR(255),
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NULL,
    PRIMARY KEY (`swag_example_id`, `language_id`),
    CONSTRAINT `fk.swag_example_translation.swag_example_id` FOREIGN KEY (`swag_example_id`)
        REFERENCES `swag_example` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk.swag_example_translation.language_id` FOREIGN KEY (`language_id`)
        REFERENCES `language` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci;
SQL;
        $connection->executeStatement($query);
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
```

## Creating the translation entity

The translation is an aggregation to the `ExampleEntity`. Therefore, you should place it into the `<plugin root>/src/Core/Content/Example/Aggregate` directory. In this directory we create a subdirectory called `ExampleTranslation` where we create a new definition for our translation which is called `ExampleTranslation`.

### EntityDefinition class

Now we can start creating our `ExampleTranslationDefinition` which extends from `Shopware\Core\Framework\DataAbstractionLayer\EntityTranslationDefinition`. Special for entity translation is, that we have to override a method called `getParentDefinitionClass` which returns the definition class of our entity we want to translate. In this case it's `ExampleDefinition`.

```php
// <plugin root>/src/Core/Content/Example/Aggregate/ExampleTranslation/ExampleTranslationDefinition.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\Aggregate\ExampleTranslation;

use Shopware\Core\Framework\DataAbstractionLayer\EntityTranslationDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use Swag\BasicExample\Core\Content\Example\ExampleDefinition;

class ExampleTranslationDefinition extends EntityTranslationDefinition
{
    public const ENTITY_NAME = 'swag_example_translation';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    public function getParentDefinitionClass(): string
    {
        return ExampleDefinition::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new StringField('name', 'name'))->addFlags(new Required()),
        ]);
    }
}
```

As you can see, we've implemented a `StringField` for the `name` column, the other fields like the `language_id` will be automatically added by the `EntityTranslationDefinition` since they are base fields of it.

All that's left to do now, is to introduce your `ExampleTranslationDefinition` to Shopware by registering your class in your `services.xml` file and by using the `shopware.entity.definition` tag, because Shopware 6 is looking for definitions this way. Note, that we have to register the translation after the entity we want to translate.

Here's the `services.xml` as it should look like:

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Core\Content\Example\ExampleDefinition">
            <tag name="shopware.entity.definition" entity="swag_example" />
        </service>

        <service id="Swag\BasicExample\Core\Content\Example\Aggregate\ExampleTranslation\ExampleTranslationDefinition">
            <tag name="shopware.entity.definition" entity="swag_example_translation" />
        </service>
    </services>
</container>
```

### Entity class

So far we introduced our definition, we can create our `ExampleTranslationEntity`. Our entity has to extend from the `Shopware\Core\Framework\DataAbstractionLayer\TranslationEntity` which comes with some getters and setters for the the `language_id`. We only have to add three properties here, one for the `example_id`, one for the actual name and one for the association to the `ExampleEntity`. All of those properties need a getter and a setter again, so add those too.

Here's our `ExampleTranslationEntity`:

```php
// <plugin root>/src/Core/Content/Example/Aggregate/ExampleTranslation/ExampleTranslationEntity.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\Aggregate\ExampleTranslation;

use Shopware\Core\Framework\DataAbstractionLayer\TranslationEntity;
use Swag\BasicExample\Core\Content\Example\ExampleEntity;

class ExampleTranslationEntity extends TranslationEntity
{
    protected string $exampleId;

    protected ?string $name;

    protected ExampleEntity $example;

    public function getExampleId(): string
    {
        return $this->exampleId;
    }

    public function setExampleId(string $exampleId): void
    {
        $this->exampleId = $exampleId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getExample(): ExampleEntity
    {
        return $this->example;
    }

    public function setExample(ExampleEntity $example): void
    {
        $this->example = $example;
    }
}
```

Now we need our translation definition to know its custom entity class. This is done by overriding the method `getEntityClass` in our `ExampleTranslationDefinition`.

```php
// <plugin root>/src/Core/Content/Example/Aggregate/ExampleTranslation/ExampleTranslationDefinition.php
class ExampleTranslationDefinition extends EntityTranslationDefinition
{
    [...]

    public function getEntityClass(): string
    {
        return ExampleTranslationEntity::class;
    }
}
```

### EntityCollection

As we already know, we should create an `EntityCollection` for our `Entity` too. For entity translations it is the same way as for normal entities.

Our collection class could then look like this:

```php
// <plugin root>/src/Core/Content/Example/Aggregate/ExampleTranslation/ExampleTranslationCollection.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example\Aggregate\ExampleTranslation;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                          add(ExampleTranslationEntity $entity)
 * @method void                          set(string $key, ExampleTranslationEntity $entity)
 * @method ExampleTranslationEntity[]    getIterator()
 * @method ExampleTranslationEntity[]    getElements()
 * @method ExampleTranslationEntity|null get(string $key)
 * @method ExampleTranslationEntity|null first()
 * @method ExampleTranslationEntity|null last()
 */
class ExampleTranslationCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return ExampleTranslationEntity::class;
    }
}
```

### Main Entity Class

The main entity class, that is the class with the field(s) we are going to translate, must define:

* a `TranslatedField` for the “name” field
* a `TranslationsAssociationField`, with a reference to the ExampleTranslationDefinition

```php
// <plugin root>/src/Core/Content/Example/ExampleDefinition.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example;

use ...

class ExampleDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'example';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    [...]

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new ApiAware(), new Required()),
            (new StringField('not_translated_field', 'notTranslatedField'))->addFlags(new ApiAware()),
            (new TranslatedField('name'))->addFlags(new ApiAware(), new Required()),
            (new TranslationsAssociationField(
                ExampleTranslationDefinition::class,
                'swag_example_id'
            ))->addFlags(new ApiAware(), new Required())
        ]);
    }
}
