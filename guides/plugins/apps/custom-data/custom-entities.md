# Custom entities

In addition to [Custom fields](custom-fields), you can create completely own entities in the system, named custom entities.
Unlike [Custom fields](custom-fields), you can generate completely custom data structures with custom relations, which can then be maintained by the admin.
To make use of the custom entities register your entities in your `entities.xml` file, which is located in the `Resources` directory of your app.

```xml
// <app root>/Resources/entities.xml
<?xml version="1.0" encoding="utf-8" ?>
<entities xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/System/CustomEntity/Xml/entity-1.0.xsd">
    <entity name="custom_entity_bundle">
        <fields>
            <string name="name" required="true" translatable="true" store-api-aware="true" />
            <price name="discount" required="true" store-api-aware="true"/>
            <many-to-many name="products" reference="product" store-api-aware="true" />
        </fields>
    </entity>
</entities>
```

For a complete reference of the structure of the entities file take a look at the [Custom entity xml reference](../../../../resources/references/app-reference/entities-reference).

## Functionality

All registered entities will get an automatically registered repository. It is also available in the [App scripts](../app-scripts/) section, in case you are allowed to access the repository service inside the hook.

```twig
{% set blogs = services.repository.search('custom_entity_blog', criteria) %}
```

Additionally, to the repository you can also access your custom entities via [Admin api](../../../../concepts/api/admin-api).

```bash
POST /api/search/custom-entity-blog
```

## Permissions

Unlike core entities, your app directly has full access rights to your own custom entities. However, if your entity has associations that reference core tables,
you need the appropriate [permissions](../../../../resources/references/app-reference/manifest-reference) to load and write these associations.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
        <!-- ... -->
    </meta>
    <permissions>
        <read>product</read>
<!--    <read>custom_entity_blog</read>   < permissions for own entities are automatically set  -->
    </permissions>
</manifest>
```

## Shorthand prefix

Since v6.4.15.0 it is possible to also use the `ce_` shorthand prefix for your custom entities to prevent problems with length restrictions of names inside the DB.

```xml
<?xml version="1.0" encoding="utf-8" ?>
<entities xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/System/CustomEntity/Xml/entity-1.0.xsd">
    <entity name="ce_bundle">
        <fields>
            ...
        </fields>
    </entity>
</entities>
```

If you use the shorthand in the entity definition, you also need to use it if you use the repository or the API.

```twig
{% set blogs = services.repository.search('ce_blog', criteria) %}
```

```bash
POST /api/search/ce_blog
```

::: warning
Note that you can't rename existing custom entities as that would lead to the deletion of all existing data.
:::
