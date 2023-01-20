# Versioning Entities

## Overview

In this guide you will learn how to version your entities. The entity versioning system in Shopware gives you the opportunity to create multiple versions of an entity, which could be used to save drafts for example.

## Prerequisites

In order to add your own versioned entities for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../../plugin-base-guide.md).

Furthermore you should have a look at our [Adding custom complex data](add-custom-complex-data.md) guide, since this guide is built upon it.

## Adjust migration

First of all, we have to add a new column to our table: `version_id` which in union with the `id` field replaces the primary key.

So your SQL command could look like this:

```sql
ALTER TABLE `swag_example`
    ADD `version_id` BINARY(16) NOT NULL AFTER `id`,
    ADD PRIMARY KEY `id_version_id` (`id`, `version_id`),
    DROP INDEX `PRIMARY`;
```

## Adjust definition

After we've added the new field to our table, we also have to add it to our definition. For this we use a `Shopware\Core\Framework\DataAbstractionLayer\Field\VersionField` which is always required, if we want to version our entity.

```php
// <plugin root>/src/Core/Content/Example/ExampleDefinition.php
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        new VersionField(),
        ...
    ]);
}
```

## Create and merge version

In this section we will create a new version of our entity which will create a new entry in the database with our updated values. When we merge a particular version, all versions before the merged version are deleted. In the example below, we are using a service where we injected a `swag_example.repository`.

```php
// <plugin root>/src/
public function exampleVersioning(Context $context): void
{
    $exampleId = Uuid::randomHex();

    $this->exampleRepository->create([[
        'id' => $exampleId,
        'name' => 'Example',
        'description' => 'This is an example',
        'active' => true,
    ]], $context);

    // Create new version of our entity
    $versionId = $this->exampleRepository->createVersion($exampleId, $context);

    // Update the context with our version
    $versionContext = $context->createWithVersionId($versionId);

    // Update our new entity version
    $this->exampleRepository->update([
        [
            'id' => $exampleId,
            'description' => 'This is our new description',
        ],
    ], $versionContext);

    // Our first entity will be found
    $exampleOne = $this->exampleRepository->search(new Criteria([$exampleId]), $context)->first();

    // Updated entity will be found
    $exampleTwo = $this->exampleRepository->search(new Criteria([$exampleId]), $versionContext)->first();

    $this->exampleRepository->merge($versionId, $context);

    // Our updated entity will be found now
    $exampleThree = $this->exampleRepository->search(new Criteria([$exampleId]), $context)->first();
}
```

As you can see above, we first created a new `ExampleEntity` with the description 'This is an example'.

Then we created a new version of our entity with the appropriate repository method `createVersion` and as arguments the id of our created entity and the context. This method returns the id of our new entity version, which we have stored in a variable.

Next, we used the `createWithVersionId` method of our `Context` to create a new context with our new versionId assigned to it. This new `Context` is used to update the `ExampleEntity`. In our case we have updated the description to 'This is our new description'. By using the updated context with the new `versionId`, the DAL knows that we want to update this version of our entity.

Subsequently, we searched the repository with the original context and our new versioned context. In the first search result, using the original context, we get the first version of our entity, which we created at the beginning. With the second search result we get the updated entity, using our new versioned context.

Lastly, we used the repository method `merge` with our versionId, which deletes all versions before this one. The merged version is now our new live version. From now on we can find it without using a versioned context.

## Versioning with foreign keys

If you have an entity with foreign keys, your foreign keys also need to be versioned. In this example we're using an inherited field. If you are not familiar with inheritance, head over to our [Field inheritance](field-inheritance.md) guide.

### Migration

In this step we have to additionally add a foreign key constraint for your `parent_id` and `parent_version_id` referencing to our `id` and `version_id`. The same pattern applies to other entities.

```sql
ALTER TABLE `swag_example`
    ADD `version_id` BINARY(16) NOT NULL AFTER `id`,
    ADD `parent_version_id` BINARY(16) NOT NULL,
    ADD PRIMARY KEY `id_version_id` (`id`, `version_id`),
    DROP INDEX `PRIMARY`,
    CONSTRAINT `fk.swag_example.parent_id` FOREIGN KEY (`parent_id`, `parent_version_id`)
        REFERENCES `swag_example` (`id`, `version_id`) ON DELETE CASCADE ON UPDATE CASCADE
```

### Definition

After we've added the new field to our table, we also have to add it to our definition. For this we use a `Shopware\Core\Framework\DataAbstractionLayer\Field\ReferenceVersionField` which references to our entity by using `self::class` and the related field `parent_version_id`.

```php
// <plugin root>/src/Core/Content/Example/ExampleDefinition.php
protected function defineFields(): FieldCollection
{
    return new FieldCollection([
        new VersionField(),
        (new ReferenceVersionField(self::class, 'parent_version_id')),
        ...
    ]);
}
```
