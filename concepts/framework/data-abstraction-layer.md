---
nav:
  title: Data Abstraction Layer
  position: 10

---

# Data Abstraction Layer

## Database access

### Database guide

In contrast to most Symfony applications, Shopware uses no ORM, but a thin abstraction layer called the data abstraction layer \(DAL\).
The DAL is implemented with the specific needs of Shopware in mind and lets developers access the database via pre-defined interfaces.
Some concepts used by the DAL, like Criteria, may sound familiar to you if you know [Doctrine](https://symfony.com/doc/current/doctrine.html) or other ORMs.
A reference to more in-depth documentation about the DAL can be found below.

Refer to [Shopware 6.6.5.0 entity relationship model](../../../assets/shopware6-erd.pdf) that depicts different tables and their relationships.

Alternatively, you can export a fresh ER model, using [MySQL Workbench](https://dev.mysql.com/doc/workbench/en/wb-reverse-engineering.html), [PHPStorm Database Tools](https://www.jetbrains.com/help/phpstorm/creating-diagrams.html), or similar tool.

::: info
Mysql Workbench → File → Import → Reverse Engineer Mysql Script → Select Db → ER diagram is created.
If you want to have it as an image: File → Export → Export as PNG
:::

### CRUD operations

An EntityRepository is used to interact with the DAL.
This is the recommended way for developers to interface with the DAL or the database in general.

### Provisioning code to use the repositories

Before using the repositories, you will need to get them from the [Dependency Injection Container (DIC)](../../guides/plugins/plugins/plugin-fundamentals/dependency-injection).
This is done with [Constructor injection](https://symfony.com/doc/current/service_container/injection_types.html#constructor-injection), so you will need to extend your services constructor by expecting an EntityRepository:

```php
// <plugin root>/src/Service/DalExampleService.php
public function __construct (EntityRepository $productRepository)
{
    $this->productRepository = $productRepository;
}
```

If you are using [Service autowiring](https://symfony.com/doc/current/service_container/autowiring.html) with the correct type and argument variable names, the repository will be injected automatically.

Alternatively, configure the `product.repository` service to be injected explicitly:

```html
// <plugin root>src/Resources/config/service.xml
<service id="Swag\ExamplePlugin\Service\DalExampleService">
    <argument type="service" id="product.repository"/>
</service>
```

You can read more about dependency injection and service registration in Shopware in the services guides:

<PageRef page="../../guides/plugins/plugins/plugin-fundamentals/add-custom-service" />

### Translations

The DAL was designed, among other things, to enable the special requirements of Shopware's translation system.
When a record is read or searched, three language levels are searched.

1. **Current language**: The first level is the current language that is set and displayed to the user.
2. **Parent language**: the second level is an optional parent language that can be configured.
So it is possible to translate certain dialects faster.
3. **System language**: The third and last level is the system language that is selected during the installation.
Each entity in the system has a translation in this language.
This serves as a final fallback to ensure only one label for the entity in the end.

The translations for a record are stored in a separate table.
The name of this table is always the same as the table for which the records are translated, with the additional suffix `_translation`.

### Versioning

Another feature that the DAL offers is versioning.
This makes it possible to store multiple versions of a single entity.
All data assigned to an entity is duplicated and made available under the new version.
Multiple entities or changes to different entities can be stored for one version.
The versioning was designed for previews, publishing, or campaign features, to prepare changes that are not yet live and to be able to view them in the store.
Currently, it is not possible (yet) to create a completely new entity with another version than the default live version.
Means, you cannot "draft" the entity first and then update it into the live version.
A live version of your entity is always required, before deriving a new version from it.

The versioning is also reflected in the database.
Entities that are versionable always have a compound foreign key: `id`, `version_id`.
Also, the foreign keys, which point to a versioned record, always consist of two columns, e.g.: `product_id` and `product_version_id`.

### Context

The context `core/Framework/Context.php` defines important configuration of the shop system and is instantiated once per request.
Depending on the passed parameters it can change the CRUD behavior of the DAL.
For example when using the currency toggle in the storefront and selecting Dollar instead of Euro, the context currency ID is changed accordingly and all operations now refer to Dollar.

### Inheritance

Another reason why the DAL was designed is to meet the requirements of the product and variant system.
For this purpose, a parent-child inheritance system was implemented in the DAL.
This allows variants to inherit records, properties, or even whole associations from the parent or container product.
For example, if a variant has not been assigned any categories or images, those of the parent product are used.

### Indexing

The DAL was designed to be optimized for use in ecommerce.
One principle has proven to be very effective so far: "The more time you put into indexing data, the faster it is possible to read it".
This is reflected in Shopware as follows:

* A product is written once every X minutes
* A product is called X times every X seconds by a customer.

This varies depending on the store, but the ratio is always the same.
Data records are read way more often than they are written.
Therefore, it is worthwhile to spend a little more time on the writing process in order to minimize the effort required for the reading process.
This is done in the DAL via the Entity Indexer pattern.
As soon as a product record is written, the corresponding Product Indexer is triggered, which pre-selects certain aggregations and writes them away optimized for the later reading process.
