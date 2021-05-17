# Data Abstraction Layer

## Database access

### Database guide

In contrast to most Symfony applications, Shopware uses no ORM but a thin abstraction layer called the data abstraction layer \(DAL\). The DAL is implemented with the specific needs of Shopware in mind and lets developers access the database via pre-defined interfaces. Some concepts used by the DAL, like Criteria, may sound familiar to you if you know [Doctrine](https://symfony.com/doc/current/doctrine.html) or other ORMs. A reference to more in-depth documentation about the DAL, can be found below.

## CRUD operations

An EntityRepository is used to interact with the DAL. This is the recommended way for developers to interface with the DAL or the database in general.

### Provisioning code to use the repositories

Before using the repositories, you'll need to get them from the DIC. This is done with [constructor injection](https://symfony.com/doc/current/service_container/injection_types.html#constructor-injection), so you'll need to extend your services constructor by expecting an EntityRepositoryInterface:

{% code title="<plugin root>/src/Service/DalExampleService.php" %}
```php
public function __construct (EntityRepositoryInterface $productRepository)
{
    $this->productRepository = $productRepository;
}
```
{% endcode %}

If you're using [service autowiring](https://symfony.com/doc/current/service_container/autowiring.html), and the type and argument variable names are correct, the repository will be injected automatically.

Alternatively, configure the product.repository service to be injected explicitly:

{% code title="<plugin root>src/Resources/config/service.xml" %}
```markup
<service id="Swag\ExamplePlugin\Service\DalExampleService">
    <argument type="service" id="product.repository"/>
</service>
```
{% endcode %}

You can read more about dependency injection and service registration in Shopware in the services guides:

{% page-ref page="../../guides/plugins/plugins/plugin-fundamentals/add-custom-service.md" %}

### Translations
The DAL was designed, among other things, to enable the special requirements of Shopware's translation system. When a record is read or searched, three language levels are searched.

1. current language: The first level is the current language that is set and displayed to the user.

2. parent language: the second level is an optional parent language that can be configured. So it is possible to translate certain dialects faster.

3. system language: The third and last level is the system language that is selected during the installation. Each entity in the system has a translation in this language. This serves as a final fallback to ensure only one label for the entity in the end.

The translations for a record are stored in a separate table. The name of this table is always the same as the table for which the records are translated, with the additional suffix `_translation`.

### Versioning
Another feature of the DAL is the versioning it brings with it. This makes it possible to store multiple versions of an entity. All data that is subordinate to an entity is duplicated and made available under the new version. Multiple entities or changes to different entities can be stored for one version. The versioning was designed for previews, publishing or campaign features, to prepare changes that are not yet live and to be able to view them in the store.

The versioning is also reflected in the database. Entities that are versionable always have a compound foreign key: `id`, `version_id`. Also the foreign keys, which point to a versioned record, always consist of two columns, e.g.: `product_id` and `product_version_id`.

### Inheritance
Another reason why the DAL was designed is to meet the requirements of the product and variant system. For this purpose, a parent-child inheritance system was implemented in the DAL. This allows variants to inherit records, properties or even whole associations from the parent or also called container product. For example, if a variant has not been assigned any categories or images, those of the parent product are used.

### Indexing
The DAL was designed to be optimized for use in e-commerce. There is one principle that has proven to be very effective so far: "The more time you put into indexing data, the faster it is possible to read it". This is reflected in Shopware as follows:

* A product is written once every X minutes

* A product is called X times every X seconds by a customer.

This varies depending on the store, but the ratio is always the same. Data records are read way more often than they are written. Therefore it is worthwhile to spend a little more time on the writing process in order to minimize the effort required for the reading process. This is done in the DAL via the Entity Indexer pattern. As soon as a product record is written, the corresponding Product Indexer is triggered, which pre-selects certain aggregations and writes them away optimized for the later reading process.
