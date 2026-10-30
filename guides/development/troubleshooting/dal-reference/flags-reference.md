---
nav:
  title: Flags Reference
  position: 20

---

# Flags Reference

| Classname        | Description                                                                                                                                                                                                                                                                                                                                       |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AllowEmptyString | Flag a text column that an empty string should not be considered as null                                                                                                                                                                                                                                                                          |
| AllowHtml        | In case a column is allowed to contain HTML-escaped data. Beware of injection possibilities                                                                                                                                                                                                                                                       |
| ApiAware         | Makes a field available in the Store or Admin API. If no parameter is passed for the flag, the field will be exposed in both the Store and Admin API. By default, all fields are enabled for the Admin API because the flag is set in the base Field class. However, the scope can be restricted to `AdminApiSource` and `SalesChannelApiSource`. |
| Choice           | Lists the values a string, int, or float field accepts. The values appear in the API schema. With `strict: true`, a write with another value fails with a write validation error, see [Strict choices](#strict-choices).                                                                                                                          |
| CascadeDelete    | In case the referenced association data is deleted, the related data will be deleted too                                                                                                                                                                                                                                                          |
| Computed         | Indexer or external systems compute the value and cannot be written using the DAL.                                                                                                                                                                                                                                                                |
| Deprecated       | This flag is used to mark the field that has been deprecated and will be removed with the next major version.                                                                                                                                                                                                                                     |
| Extension        | Defines that the data of this field is stored in an Entity::$extension and is not part of the struct itself.                                                                                                                                                                                                                                      |
| Immutable        | By setting the "Immutable" flag, it indicates that the field is write-once and then read-only                                                                                                                                                                                                                                                     |
| Inherited        | Defines that the parent record can inherit the data of this field                                                                                                                                                                                                                                                                                 |
| PrimaryKey       | The PrimaryKey flag defines the field as part of the entity's primary key. Usually, this should be the ID field.                                                                                                                                                                                                                                  |
| Required         | Fields marked as "Required" must be specified during the creation request of an entity. This configuration is only considered during the write process.                                                                                                                                                                                           |
| RestrictDelete   | Associated data with this flag, restricts the deletion of the entity in case a record with the primary key exists.                                                                                                                                                                                                                                |
| ReverseInherited | Flags "ReverseInherited"                                                                                                                                                                                                                                                                                                                          |
| Runtime          | Defines that the data of the field will be loaded at runtime by an event subscriber or other class. Used in entity extensions for plugins or not directly fetchable associations.                                                                                                                                                                 |
| SearchRanking    | Defines the weight for a search query on the entity for this field                                                                                                                                                                                                                                                                                |
| SetNullOnDelete  | In case the referenced association data will be deleted, the related data will be set to null, and a Written event will be thrown                                                                                                                                                                                                                 |
| Since            | The "Since" flag defines since which Shopware version the field is available.                                                                                                                                                                                                                                                                     |
| WriteProtected   | By setting the "WriteProtected" flag, write access via API can be restricted. This flag is primarily used to protect indexed data from direct writes via the API.                                                                                                                                                                                 |

## Strict choices

A field with `new Choice(['page', 'link', 'folder'], strict: true)` only accepts the listed values.
Any other value is rejected with a write validation error on that field, for every DAL write, including the Admin API, the Sync API, and imports.
This also applies to entities written inside another entity's payload.
Writes that do not send the field still succeed, and rows that already store another value keep it.
A string value is checked as sent and again after HTML sanitizing, so a value that only matches one of the choices after sanitizing is rejected as well.

Starting with Shopware 6.7.17.0, `category.type` is a strict choice of `page`, `link`, and `folder`, like `product_visibility.visibility`.

### Add values with an enum provider

An extension adds values to a strict choice with an enum provider.
Implement `Shopware\Core\Framework\DataAbstractionLayer\FieldSerializer\FieldEnumProviderInterface`, support the entity and the field, and return the additional values from `getChoices()`:

```php
<?php declare(strict_types=1);

namespace Swag\MyPlugin\Category;

use Shopware\Core\Content\Category\CategoryDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\FieldSerializer\FieldEnumProviderInterface;

class MyCategoryTypeProvider implements FieldEnumProviderInterface
{
    public function isSupported(string $entity, string $fieldName): bool
    {
        return $entity === CategoryDefinition::ENTITY_NAME && $fieldName === 'type';
    }

    public function getChoices(): array
    {
        return ['my_type'];
    }
}
```

Tag the service with `shopware.api.enum_provider`:

```php
$services->set(MyCategoryTypeProvider::class)
    ->tag('shopware.api.enum_provider');
```

The write validation accepts these values, and the generated API schema lists them.
Before 6.7.17.0, enum providers only extended the API schema, and strict choices rejected their values.
