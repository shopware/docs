---
nav:
  title: Adding data associations
  position: 70

---

# Adding Data Associations

## Overview

In this guide you will learn how to add associations to your entities. Every possible kind of association will be covered here, so "One to One", "Many to One" or "One to Many" respectively, and "Many to many" associations.

In every example we'll be working with two example entities, that we want to connect with an association: `FooEntity` and `BarEntity`.

They are **not** created in this guide though!

## Prerequisites

This guide is built upon the [Plugin Base Guide](../../plugin-base-guide), but any plugin will work here. Just note that all examples are using the plugin mentioned above.

In order to add data associations you need an existing entity, as this guide is based on the [Adding custom complex data](add-custom-complex-data) guide, you should have a look at it first.

## Associations

In the following paragraphs, there will be examples for each kind of association. Those are simplified, which means that this guide will not cover how to create entities in the first place. Head over to our guide regarding [Adding custom complex data](add-custom-complex-data).

## Example entity definitions

As already mentioned, this guide will always use the same two example entities for each type of association. They both contain only an ID field, nothing else. For the sake of clarity, here are those example entity definitions:

```php
// <plugin root>/src/Core/Content/Bar/BarDefinition.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Bar;

use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class BarDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'bar';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
            // Other fields here
        ]);
    }
}
```

```php
// <plugin root>/src/Core/Content/Foo/FooDefinition.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Foo;

use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class FooDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'foo';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
            // Other fields here
        ]);
    }
}
```

### One to One associations

One to One associations require you to define a foreign key for one of the two connected associations. E.g. the `bar` table has to contain a `foo_id` column, or the other way around: A `bar_id` column in the `foo` table. In this example it will be `foo_id` in the `BarDefinition`.

Let's have a look at the `defineFields` methods of both entity definitions:

```php
// <plugin root>/src/Core/Content/Bar/BarDefinition.php
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
        (new FkField('foo_id', 'fooId', FooDefinition::class))->addFlags(new Required()),
        (new StringField('name', 'name'))->addFlags(new Required()),

        new OneToOneAssociationField('foo', 'foo_id', 'id', FooDefinition::class, false)
    ]);
}
```

Note the new `FkField`, which basically is the mentioned `foo_id` column. Its parameters are the name of the column in your database\(snake\_case\), the property name in your definition \(lowerCamelCase\) and the respective definition class.

Additional to that, we've got the `OneToOneAssociationField`. Here you supply the name of the property, which should contain the associated entity, in your respective definition, e.g. in this case we want the `FooDefinition` to appear in the `foo` property of our entity. Following are `foo_id`, which is the name of the column in the database, `id` as the ID column in the referenced database \(`foo` in this case\) and the referenced definition. The last parameter defines, if you want to automatically load this association every time you load a `bar` entity. We've set this to `false`.

::: warning
Setting autoload to \`true\` on the \`EntityExtension\` and \`EntityDefinition\` will lead to a recursion / out of memory error. If you want to get the association on every load, set autoload to \`true\` only in the \`EntityExtension\`. See also [Add complex data to existing entities](../data-handling/add-complex-data-to-existing-entities#adding-a-field-with-database).
:::

For the sake of completion, here is the respective `defineFields` method of the `FooDefinition`:

```php
// <plugin root>/src/Core/Content/Foo/FooDefinition.php
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
        (new StringField('name', 'name'))->addFlags(new Required()),

        (new OneToOneAssociationField('bar', 'id', 'foo_id', BarDefinition::class, false))
    ]);
}
```

Note, that in here there is no `FkField` necessary.

### One to Many / Many to One

In "One To Many" / "Many To One" associations, you need to define a foreign key column for the "Many to One" side. E.g. your `bar` entity comes with multiple `foo`'s. Therefore, you have to add a `bar_id` column in your `foo` table. In this example it will be `bar_id` in the `FooDefinition`.

Let's have a look at the `defineFields` methods of both entity definitions:

```php
// <plugin root>/src/Core/Content/Bar/BarDefinition.php
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),

        new OneToManyAssociationField('foos', FooDefinition::class, 'bar_id')
    ]);
}
```

Next to the `IdField`, you only have to define the `OneToManyAssociationField` in your `BarDefinition`. Its parameters are `foos`, which is the property that will contain all `FooEntity`'s, the class name of `FooDefinition` and the name of the column in the referenced table, which points to the definition itself.

Let's have a look at the `FooDefinition` now:

```php
// <plugin root>/src/Core/Content/Foo/FooDefinition.php
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
        (new FkField('bar_id', 'barId', BarDefinition::class))->addFlags(new Required()),

        new ManyToOneAssociationField('bar', 'bar_id', BarDefinition::class, 'id'),
    ]);
}
```

Next to the `IdField`, you can see a new `FkField`, which is the field for the new `bar_id` column. Its parameters are the name of the column in your database \(snake\_case\), the property name in your definition \(lowerCamelCase\) and the respective definition class.

Instead of adding a `OneToManyAssociationField` here now, we have to use the reverse side, which is `ManyToOneAssociationField`. Here you have to apply the name of the property, which will contain the single `BarDefinition` instance, the name of the column, which references to the inverse side entity \(`bar_id`\), the class of the referenced definition and the name of the ID column in the definition's database table itself. You could add another boolean parameter here, which would define whether or not you want this association to always automatically be added and be loaded. This defaults to `false`, since enabling this could come with performance issues.

### Many to Many associations

`ManyToMany` associations require another, third entity to be available. It will be called `FooBarMappingDefinition` and is responsible for connecting both definitions. It also needs an own database table.

#### Mapping definition

Let's create this one first:

```php
// <plugin root>/src/Core/Content/FooBarMappingDefinition.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content;

use Shopware\Core\Framework\DataAbstractionLayer\Field\CreatedAtField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use Shopware\Core\Framework\DataAbstractionLayer\MappingEntityDefinition;
use Swag\BasicExample\Core\Content\Bar\BarDefinition;
use Swag\BasicExample\Core\Content\Foo\FooDefinition;

class FooBarMappingDefinition extends MappingEntityDefinition
{
    public const ENTITY_NAME = 'foo_bar';

    public function getEntityName(): string
    {
        return self::ENTITY_NAME;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new FkField('bar_id', 'barId', BarDefinition::class))->addFlags(new PrimaryKey(), new Required()),
            (new FkField('foo_id', 'fooId', FooDefinition::class))->addFlags(new PrimaryKey(), new Required()),
            new ManyToOneAssociationField('bar', 'bar_id', BarDefinition::class, 'id'),
            new ManyToOneAssociationField('foo', 'foo_id', FooDefinition::class, 'id')
        ]);
    }
}
```

The mapping definition has to extend from the `MappingEntityDefinition`, instead of the `EntityDefinition` like in other entity definitions. The rest is quite the same: Your entity definitions needs an entity name, saved in `ENTITY_NAME`, as well as the method `defineFields`, which has to return a `FieldCollection`.

First of all there are two `FkField`'s. Its parameters are the name of the column in your database\(snake\_case\), the property name in your definition \(lowerCamelCase\) and the respective definition class.

Additional to that, you need the `ManyToOneAssociationField`'s. Here you have to supply the name of the property in your entity, which should contain the entries, again the name of the column in the database and the definition again. The last parameter is most likely `id`, which is the column name of the connected table. You could add another boolean parameter here, which would define whether or not you want this association to always automatically be added and be loaded. This defaults to `false`, since enabling this could come with performance issues.

Of course, you have to add both mentioned fields for each definition you want to connect, so two times that is.

#### Adjusting the main definitions

The last thing to do, is to add a `ManyToManyAssociationField` to each of your definitions themselves, like in the following example:

```php
// <plugin root>/src/Core/Content/Bar/BarDefinition.php
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),

        new ManyToManyAssociationField(
            'foos',
            FooDefinition::class,
            FooBarMappingDefinition::class,
            'bar_id',
            'foo_id'
        ),
    ]);
}
```

Its parameters are the following:

* `propertyName`: The name of the property in your entity, that will contain the associated entities.
* `referenceDefinition`: The class of the associated definition.
* `mappingDefinition`: The class of the mapping definition.
* `mappingLocalColumn`: The name of the id column for the current entity, `bar_id` if you're in the `BarDefinition`.
* `mappingReferenceColumn`: The name of the id column for the referenced entity.

For the sake of completion, here is the respective `FooDefinition`:

```php
// <plugin root>/src/Core/Content/Foo/FooDefinition.php
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),

        new ManyToManyAssociationField(
            'bars',
            BarDefinition::class,
            FooBarMappingDefinition::class,
            'foo_id',
            'bar_id'
        ),
    ]);
}
```

And that's it, your `ManyToMany` association is now set up properly.

## Next steps

One type of association you'll often stumble upon are translations. If you wonder how to add translations to your entity, [this is the place](add-data-translations) to go.

Otherwise you may want to update some data, for this you can look at our [Writing data](writing-data) and [Replacing data](reading-data) guide. If you plan to remove associated data from entities, you can head over to our [Remove associated data](deleting-associated-data) guide.
