---
nav:
  title: Extending the Organization entity
  position: 50

---

# What is an Attribute Entity

An Attribute Entity uses PHP attributes (e.g. `#[Entity(...)]`, `#[Field(...)]`) to describe the structure of the entity instead of the traditional EntityDefinition and EntityCollection.
Unlike normal entities, attribute entities do not have a corresponding EntityDefinition class, which changes how you need to write extensions for them.

You can read more about using Attribute entities here: [Entities via attributes](../../../../../guides/plugins/plugins/framework/data-handling/entities-via-attributes.md).

## How to extend the Organization entity

When extending a normal entity, you usually refer to its EntityDefinition class in your extension. However, attribute entities like `OrganizationEntity` don't have such classes, you must reference them by their entity name string.

The entity name is the value provided in the #[Entity(...)] attribute. For `OrganizationEntity`, that name is:

```php
#[Entity('b2b_components_organization')]
```

Even though `OrganizationEntity` does not have a traditional EntityDefinition class, Shopware still generates the definition and repository using the entity name.

| Type                        | Service name                                  |
|-----------------------------|-----------------------------------------------|
| Definition | `b2b_components_organization.definition` |
| Repository | `b2b_components_organization.repository` |

An example of an organization extension

```php
class OrganizationExtension extends EntityExtension
{
    public function extendFields(FieldCollection $collection): void
    {
        $collection->add(
            (new OneToManyAssociationField(
                'yourEntities',
                YourEntityDefinition::class,
                'organization_id'
            ))->addFlags(new CascadeDelete())
        );
    }

    public function getEntityName(): string
    {
        return 'b2b_components_organization';
    }
}
```
