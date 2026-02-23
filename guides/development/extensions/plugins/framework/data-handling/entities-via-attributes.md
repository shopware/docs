---
nav:
  title: Entities via attributes
  position: 1

---

# Entities via attributes

Since Shopware v6.6.3.0, it has been possible to register entities via PHP attributes.
This guide will demonstrate the process.

## Define the entity

First, you need to define your entity.
This is done by creating a new class extending `Entity` and adding the `Entity` attribute to it.
The `name` parameter denotes the name of the entity. It is required and must be unique.

You can also supply the entity collection class to use for this entity, by specifying the `collectionClass` parameter.
The default `EntityCollection` class is used if none is specified.
Note: this is only possible since 6.6.9.0

You have to define a primary key. The primary key is defined by adding the `PrimaryKey` attribute to a property.
In theory, the primary key can be of any type, but it is recommended to use a `UUID`.

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;

#[EntityAttribute('example_entity', collectionClass: ExampleEntityCollection::class)]
class ExampleEntity extends Entity
{
    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;
}
```

This is the most basic entity definition.
You can add more properties and attributes to the entity.
For example, you can add the `Field` attribute to a property to define the type of the property.

## Register the entity

To register the entity, you have to add this class to the DI container in the `services.xml` file.
This is done by adding the `shopware.entity` tag to the service definition.

```xml
<service id="Examples\ExampleEntity">
    <tag name="shopware.entity"/>
</service>
```

That's it.
Your entity is registered, and you can read and write data to it over the DAL.
Using the tag, Shopware automatically registers an `EntityDefinition` and `EntityRepository` for the entity.
Those are registered in the DI container with the names `example_entity.definition` and `example_entity.repository`, respectively.

## Field Types

To define more fields, you typically use the `Field` attribute.
The `Field` attribute requires the `type` parameter, which is the type of the field.
The type can be any of the `FieldType` constants.

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;

#[EntityAttribute('example_entity')]
class ExampleEntity extends Entity
{
    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;

    #[Field(type: FieldType::STRING)]
    public string $string;

    #[Field(type: FieldType::TEXT)]
    public ?string $text = null;

    #[Field(type: FieldType::INT)]
    public ?int $int;

    // ...
}
```

All field types are defined in the [`FieldType`](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/DataAbstractionLayer/Attribute/FieldType.php) class.

### Using field class directly

It is also possible to directly define the field type with any class extending `\Shopware\Core\Framework\DataAbstractionLayer\Field\Field`.
Use the fully qualified class name reference as value for the `type` parameter.

::: info
This feature is available since Shopware 6.6.9.0.
:::

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;
use Shopware\Core\Framework\DataAbstractionLayer\Field\PriceField;
use Shopware\Core\Framework\DataAbstractionLayer\Pricing\PriceCollection;

#[EntityAttribute('example_entity')]
class ExampleEntity extends Entity
{
    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;
    
    #[Field(type: PriceField::class)]
    public ?PriceCollection $price = null;

    // ...
}
```

### Special field types

We also provide a list of special field types, which implement a specific behavior.
They have their own PHP attribute class, for example the `AutoIncrement` or `ForeignKey` field.

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\AutoIncrement;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ForeignKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;

#[EntityAttribute('example_entity')]
class ExampleEntity extends Entity
{
    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;
    
    #[AutoIncrement]
    public int $autoIncrement;

    #[ForeignKey(entity: 'currency')]
    public ?string $foreignKey;
}
```

## JSON fields

If you want to store JSON data in a field with its own validation and serialization logic, you can use the `Serialized` attribute and define its own serializer class:

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Serialized;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;
use Shopware\Core\Framework\DataAbstractionLayer\FieldSerializer\PriceFieldSerializer;
use Shopware\Core\Framework\DataAbstractionLayer\Pricing\PriceCollection;

#[EntityAttribute('example_entity')]
class ExampleEntity extends Entity
{
    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;
    
    #[Serialized(serializer: PriceFieldSerializer::class)]
    public ?PriceCollection $serialized = null;
}
```

## Custom Fields

To allow custom fields, you can use the `EntityCustomFieldsTrait`.
This gives you some helper methods to easily work with custom field values out of the box.

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;
use Shopware\Core\Framework\DataAbstractionLayer\EntityCustomFieldsTrait;

#[EntityAttribute('example_entity')]
class ExampleEntity extends Entity
{
    use EntityCustomFieldsTrait;
    
    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;
}

```

Alternatively you can use the `CustomField` attribute directly, that way you have full control over the custom fields and can add your own helpers.

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\CustomFields;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;

#[EntityAttribute('example_entity')]
class ExampleEntity extends Entity
{
    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;
    
    /**
     * @var array<string, mixed>|null
     */
    #[CustomFields]
    public ?array $customFields = null;
}

```

## API encoding

By default, each field of an entity is not exposed in the API.
To expose a field in the API, you must set the `api` parameter of the `Field` attribute to `true` or specify one of the scopes you want to allow.

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\Api\Context\AdminApiSource;
use Shopware\Core\Framework\Api\Context\SalesChannelApiSource;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;

#[EntityAttribute('example_entity')]
class ExampleEntity extends Entity
{
    #[PrimaryKey]
    #[Field(type: FieldType::UUID, api: true)]
    public string $id;

    #[Field(type: FieldType::STRING)]
    public string $notExposed;

    #[Field(type: FieldType::STRING, api: true)]
    public string $everywhere;

    #[Field(type: FieldType::STRING, api: [AdminApiSource::class])]
    public string $adminOnly;

    #[Field(type: FieldType::STRING, api: [SalesChannelApiSource::class])]
    public string $storeOnly;
```

## Translated fields

To support Shopware translations for your entity, set the `translated` property of the `Field` attribute to `true`.
This will automatically create a `TranslatedField` for the field and register an `EntityTranslationDefinition` for you.

Additionally, you can define a `Translations` attribute on a property to enable loading of all translations of the entity.
This field needs to be nullable, as by default it will not be loaded, but this allows you to add the `translations` association to the criteria to load all translations at once.

Notice: Properties with the `translated` flag must be nullable.

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Translations;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;

#[EntityAttribute('example_entity')]
class ExampleEntity extends Entity
{
    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;

    #[Field(type: FieldType::STRING, translated: true)]
    public ?string $string = null;

    /**
     * @var array<string, ArrayEntity>|null
     */
    #[Translations]
    public ?array $translations = null;
}
```

## Required fields

By default, any field that is not type-hinted as `null` is required.
However, you can explicitly mark a field as required by adding the `Required` attribute.
This will automatically add a validation rule to the field.
This is necessary for fields marked as `translated`, as translated fields must be nullable.

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;

#[EntityAttribute('example_entity')]
class ExampleEntity extends Entity
{
    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;

    #[Required]
    #[Field(type: FieldType::STRING, translated: true)]
    public ?string $required = null;
}
```

## Associations

It is also possible to define associations between entities.
You can use one of the following four association types: `OneToOne`, `OneToMany`, `ManyToOne` or `ManyToMany`.

```php
<?php declare(strict_types=1);

namespace Examples;

use Examples\AttributeEntityAgg;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ForeignKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ManyToMany;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ManyToOne;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\OneToMany;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\OneToOne;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;
use Shopware\Core\System\Currency\CurrencyEntity;

#[EntityAttribute('example_entity')]
class ExampleEntity extends Entity
{
    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;

    #[ForeignKey(entity: 'currency')]
    public ?string $currencyId = null;

    #[ForeignKey(entity: 'currency')]
    public ?string $followId = null;

    #[ManyToOne(entity: 'currency')]
    public ?CurrencyEntity $currency = null;

    #[OneToOne(entity: 'currency')]
    public ?CurrencyEntity $follow = null;

    /**
     * @var array<string, AttributeEntityAgg>|null
     */
    #[OneToMany(entity: 'example_entity_agg', ref: 'example_entity_id')]
    public ?array $aggs = null;

    /**
     * @var array<string, CurrencyEntity>|null
     */
    #[ManyToMany(entity: 'currency')]
    public ?array $currencies = null;
}
```

All the associations are defined as a nullable array property.
The key of the array is the *ID* of the associated entity.
The value is the associated entity by itself.

You can also typehint to many associations with the `EntityCollection` class.

## Getter & Setter, Translations and Collections

With this new pattern, we removed the need for `getter` and `setter` methods.
The properties are public and can be accessed directly.
Also, you don't have to define any `EntityTranslationDefinition` or `EntityCollection` anymore, which reduces the boilerplate code.

## Full example

```php
<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Checkout\Order\OrderEntity;
use Shopware\Core\Checkout\Order\OrderStates;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\AutoIncrement;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Entity as EntityAttribute;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Field;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\FieldType;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ForeignKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ManyToMany;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\ManyToOne;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\OnDelete;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\OneToMany;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\OneToOne;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Serialized;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\State;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Translations;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityCustomFieldsTrait;
use Shopware\Core\Framework\DataAbstractionLayer\Field\PriceField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldSerializer\PriceFieldSerializer;
use Shopware\Core\Framework\DataAbstractionLayer\FieldType\DateInterval;
use Shopware\Core\Framework\DataAbstractionLayer\Pricing\PriceCollection;
use Shopware\Core\Framework\Struct\ArrayEntity;
use Shopware\Core\System\Currency\CurrencyEntity;
use Shopware\Core\System\StateMachine\Aggregation\StateMachineState\StateMachineStateEntity;

#[EntityAttribute('example_entity', since: '6.6.3.0', collectionClass: ExampleEntityCollection::class)]
class ExampleEntity extends Entity
{
    use EntityCustomFieldsTrait;

    #[PrimaryKey]
    #[Field(type: FieldType::UUID)]
    public string $id;

    #[Field(type: FieldType::STRING)]
    public string $string;

    #[Field(type: FieldType::TEXT)]
    public ?string $text = null;

    #[Field(type: FieldType::INT)]
    public ?int $int;

    #[Field(type: FieldType::FLOAT)]
    public ?float $float;

    #[Field(type: FieldType::BOOL)]
    public ?bool $bool;

    #[Field(type: FieldType::DATETIME)]
    public ?\DateTimeImmutable $datetime = null;

    #[AutoIncrement]
    public int $autoIncrement;

    /**
     * @var array<string, mixed>|null
     */
    #[Field(type: FieldType::JSON)]
    public ?array $json = null;

    #[Field(type: FieldType::DATE)]
    public ?\DateTimeImmutable $date = null;

    #[Field(type: FieldType::DATE_INTERVAL)]
    public ?DateInterval $dateInterval = null;

    #[Field(type: FieldType::TIME_ZONE)]
    public ?string $timeZone = null;

    #[Serialized(serializer: PriceFieldSerializer::class, api: true)]
    public ?PriceCollection $serialized = null;

    #[Field(type: PriceField::class)]
    public ?PriceCollection $price = null;

    #[Required]
    #[Field(type: FieldType::STRING, translated: true)]
    public string $transString;

    #[Field(type: FieldType::TEXT, translated: true)]
    public ?string $transText = null;

    #[Field(type: FieldType::INT, translated: true)]
    public ?int $transInt;

    #[Field(type: FieldType::FLOAT, translated: true)]
    public ?float $transFloat;

    #[Field(type: FieldType::BOOL, translated: true)]
    public ?bool $transBool;

    #[Field(type: FieldType::DATETIME, translated: true)]
    public ?\DateTimeImmutable $transDatetime = null;

    /**
     * @var array<string, mixed>|null
     */
    #[Field(type: FieldType::JSON, translated: true)]
    public ?array $transJson = null;

    #[Field(type: FieldType::DATE, translated: true)]
    public ?\DateTimeImmutable $transDate = null;

    #[Field(type: FieldType::DATE_INTERVAL, translated: true)]
    public ?DateInterval $transDateInterval = null;

    #[Field(type: FieldType::TIME_ZONE, translated: true)]
    public ?string $transTimeZone = null;

    #[Field(type: FieldType::STRING, translated: true, column: 'another_column_name')]
    public ?string $differentName = null;

    #[ForeignKey(entity: 'currency')]
    public ?string $currencyId = null;

    #[State(machine: OrderStates::STATE_MACHINE)]
    public ?string $stateId = null;

    #[ForeignKey(entity: 'currency')]
    public ?string $followId = null;

    #[ManyToOne(entity: 'currency', onDelete: OnDelete::RESTRICT)]
    public ?CurrencyEntity $currency = null;

    #[OneToOne(entity: 'currency', onDelete: OnDelete::SET_NULL)]
    public ?CurrencyEntity $follow = null;

    #[ManyToOne(entity: 'state_machine_state')]
    public ?StateMachineStateEntity $state = null;

    /**
     * @var array<string, AttributeEntityAgg>|null
     */
    #[OneToMany(entity: 'attribute_entity_agg', ref: 'attribute_entity_id', onDelete: OnDelete::CASCADE)]
    public ?array $aggs = null;

    /**
     * @var array<string, CurrencyEntity>|null
     */
    #[ManyToMany(entity: 'currency', onDelete: OnDelete::CASCADE)]
    public ?array $currencies = null;

    /**
     * @var array<string, OrderEntity>
     */
    #[ManyToMany(entity: 'order', onDelete: OnDelete::CASCADE)]
    public ?array $orders = null;

    /**
     * @var array<string, ArrayEntity>|null
     */
    #[Translations]
    public ?array $translations = null;
}


<?php declare(strict_types=1);

namespace Examples;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @extends EntityCollection<ExampleEntity>
 */
class ExampleEntityCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return ExampleEntity::class;
    }
}
```
