# Using Flags

## Overview

In this guide you'll learn how to use flags of the DAL but this guide will not explain all flags and its purpose.

## Prerequisites

In order to use flags in your entities for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../../plugin-base-guide).

You should also have a look at the [Flags reference](../../../../../resources/references/core-reference/dal-reference/flags-reference) to understand what each flag is used for. Furthermore you should know how entities work, therefore you can head over to our [Adding custom complex data](add-custom-complex-data) guide.

## Using flags

You have to add the flags to fields in your definition in order to use them. You can even modify the field's flags by creating entity extensions. It is also possible to use multiple flags comma separated.

### Single flag example

```php
(new IdField('id', 'id'))->addFlags(new PrimaryKey())
```

### Multiple flags example

```php
(new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required())
```

### Overwrite default flags

You can also use setFlags to overwrite the Default Flags which could be set. Be careful to not overwrite essential flags for a specific field.

```php
(new IdField('id', 'id'))->setFlags(new Required())
```

## Example entity

Below you can find an example implementation in an entity where we use flags.

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
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
            (new StringField('name', 'name')),
            (new StringField('description', 'description')),
            (new BoolField('active', 'active'))
        ]);
    }
}
```
