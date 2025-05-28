---
nav:
  title: Field inheritance
  position: 110

---

# Field Inheritance

## Overview

In this guide you'll learn how to create inherited fields for your entities. Field inheritance allows you to tell Shopware which fields should inherit values from a parent entity.

## Prerequisites

This guide is built upon the [Plugin Base Guide](../../plugin-base-guide), but any plugin will work here. Just note that all examples are using the plugin mentioned above.

You also should have a look at our [Adding custom complex data](add-custom-complex-data) guide, since this guide is built upon it.

## Inherit a field

To start using inheritance, we have to update our definition and database.

1. Make inheritable fields nullable in the database
2. Add the `ParentFkField`, `ParentAssociationField`, `ChildrenAssociationField` in your definition
3. Enable inheritance by overwriting `isInheritanceAware()`
4. Flag fields as inheritable
5. Add getters and setters to the entity class

### Make fields nullable

The first thing we need to do is to make all our fields that we want to make inheritable nullable in our migration. If you lack knowledge about migrations, have a look at our [Database migrations](../../plugin-fundamentals/database-migrations) guide. We also need a 'parent_id' field for the parent reference.

```sql
ALTER TABLE `swag_example` ADD `parent_id` BINARY(16) NULL;
ALTER TABLE `swag_example` MODIFY `description` VARCHAR(255) NULL;
```

::: code-group

```php [PLUGIN_ROOT/src/Migration/Migration1615363012MakeInheritedColumnsNullable.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1615363012MakeInheritedColumnsNullable extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1615363012;
    }

    public function update(Connection $connection): void
    {
        $query = <<<SQL
            ALTER TABLE `swag_example` 
                ADD `parent_id` BINARY(16) NULL,
                MODIFY `description` VARCHAR(255) NULL;
        SQL;
        
        $connection->executeStatement($query);
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
```

:::

### Add the ParentFkField and the associations

After we've made all our fields nullable, we still need to add the following fields to our definition: `Shopware\Core\Framework\DataAbstractionLayer\Field\ParentFkField`, `Shopware\Core\Framework\DataAbstractionLayer\Field\ParentAssociationField` and `Shopware\Core\Framework\DataAbstractionLayer\Field\ChildrenAssociationField`.

* `ParentFkField`: Is the foreign key, that references the parent's id.
* `ParentAssociationField`: Field that the DAL knows where to load the parent association from.
* `ChildrenAssociationField`: Field that the DAL knows where to load the children association from.

In default, ParentFkField points to a `parent_id` column in the database. All these fields must refer to our definition by using `self::class`. The `ParentAssociationField` has as its second parameter the referenceField, which in our case is `id`. Below you can find an example of how it should then look.

::: code-group

```php [PLUGIN_ROOT/src/Core/Content/Example/ExampleDefinition.php]
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        ...

        new ParentFkField(self::class),
        new ParentAssociationField(self::class, 'id'),
        new ChildrenAssociationField(self::class),

        ...
    ]);
}
```

:::

### Allow inheritance

Now we need to enable inheritance by overriding the `isInheritanceAware` method in our definition, which must then return `true`.

::: code-group

```php [PLUGIN_ROOT/src/Core/Content/Example/ExampleDefinition.php]
public function isInheritanceAware(): bool
{
    return true;
}
```

:::

### Flag fields as inheritable

After we've enabled inheritance for our definition, we need to add the`Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Inherited` flag to all the fields in our definition that should be inherited.

::: code-group

```php [PLUGIN_ROOT/src/Core/Content/Example/ExampleDefinition.php]
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),

        new ParentFkField(self::class),
        new ParentAssociationField(self::class, 'id'),
        new ChildrenAssociationField(self::class),

        (new StringField('name', 'name'))->addFlags(new Inherited()),
        (new StringField('description', 'description'))->addFlags(new Inherited()),
        (new BoolField('active', 'active'))->addFlags(new Inherited()),
    ]);
}
```

:::

### Add getters and setters to the entity class

The last thing we need to do is add our new fields to our entity class.

::: code-group

```php [PLUGIN_ROOT/src/Core/Content/Example/ExampleEntity.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Content\Example;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class ExampleEntity extends Entity
{
    ...

    protected ?self $parent = null;

    protected ?string $parentId;

    protected ?ExampleCollection $children = null;

    ...

    public function getParent(): ?ExampleEntity
    {
        return $this->parent;
    }

    public function setParent(ExampleEntity $parent): void
    {
        $this->parent = $parent;
    }

    public function getParentId(): ?string
    {
        return $this->parentId;
    }

    public function setParentId(?string $parentId): void
    {
        $this->parentId = $parentId;
    }

    public function getChildren(): ?ExampleCollection
    {
        return $this->children;
    }

    public function setChildren(ExampleCollection $children): void
    {
        $this->children = $children;
    }
}
```

:::

## Translations

This concept also supports translations. Given a parent/child entity with an inherited language \(de-CH _inherits from_ de-DE\), the inheritance system will try to look up the values in following order:

1. Child \(de-CH\)
2. Child \(de-DE\)
3. Parent \(de-CH\)
4. Parent \(de-DE\)

If an inheritance is not found, the next translation in the chain above will be used.

### Enable translation inheritance

Assuming our definition is already aware of inheritance, we have to update our definition and add the `Inherited` flag to our translated fields and the translation association.

::: code-group

```php [PLUGIN_ROOT/src/Core/Content/Example/ExampleDefinition.php]
(new TranslatedField('name'))->addFlags(new Inherited()),
(new TranslationsAssociationField(ExampleTranslationDefinition::class))->addFlags(new Inherited()),
```

:::

## Association inheritance

Association inheritance allows you to inherit associations from a parent entity.
To make an association inheritable, you need to add the `Inherited` flag to the association field in your definition.

::: code-group

```php [PLUGIN_ROOT/src/Core/Content/Example/ExampleDefinition.php]
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        ...
        (new FkField('tax_id', 'taxId', TaxDefinition::class))->addFlags(new Inherited()),
        (new ManyToOneAssociationField('tax', 'tax_id', TaxDefinition::class, 'id'))->addFlags(new Inherited()),
        ...
    ]);
}
```

:::

We then need to add the foreign key column to our migration:

::: code-group

```php [PLUGIN_ROOT/src/Migration/Migration1615363013AddInheritedAssociation.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\InheritanceUpdaterTrait;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1615363013AddInheritedAssociation extends MigrationStep
{
    use InheritanceUpdaterTrait;
    
    public function getCreationTimestamp(): int
    {
        return 1615363013;
    }

    public function update(Connection $connection): void
    {
        $query = <<<SQL
            ALTER TABLE `swag_example` 
                ADD `tax_id` BINARY(16) NULL,
                ADD CONSTRAINT `fk.swag_example.tax_id` FOREIGN KEY (`tax_id`)
                    REFERENCES `tax` (`id`) ON DELETE CASCADE ON UPDATE CASCADE'
        SQL;
        
        $connection->executeStatement($query);
        
        $this->updateInheritance($connection, 'swag_example', 'tax');
    }

}
```

:::

### "Inheritance columns"

Note the use of the `updateInheritance` method in the migration.
This method is used to create "inheritance columns" in the database.
These columns are used internally by the DAL to store the inherited references.
Those columns need to be present in the database for the inheritance system to work correctly.
In those columns, the concrete reference values to perform the join on are stored.
In the case of `ToMany` associations, the ID stored in the column is the ID of the base entity (parent ID if the association is inherited, child ID if not).
For `ToOne` associations like this example, the ID stored in the column is the ID of the entity that is referenced by the association.

This additional column is needed because of two reasons:

1. To allow overriding the association in the child entity with null values, which would otherwise not be possible.
2. To improve performance by avoiding additional queries to load the parent entity when the association is inherited.

Those columns are not visible in the entity definition or entity class and cannot be accessed directly. They are only used internally by the DAL.
