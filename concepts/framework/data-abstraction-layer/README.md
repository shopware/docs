# Data Abstraction Layer

## Database access

### Database guide

In contrast to most Symfony applications, Shopware uses no ORM but a thin abstraction layer called the data abstraction
layer (DAL). The DAL is implemented with the specific needs of Shopware in mind and lets developers access the database
via pre-defined interfaces. Some concepts used by the DAL, like Criteria, may sound familiar to you if you
know [Doctrine](https://symfony.com/doc/current/doctrine.html) or other ORMs. A reference to more in-depth documentation
about the DAL, can be found below.

## CRUD operations

An EntityRepository is used to interact with the DAL. This is the recommended way for developers to interface with the
DAL or the database in general.

### Provisioning code to use the repositories

Before using the repositories, you'll need to get them from the DIC. This is done
with [constructor injection](https://symfony.com/doc/current/service_container/injection_types.html#constructor-injection), so you'll need to extend your services constructor by expecting an EntityRepositoryInterface:

{% code title="<plugin root>/src/Service/DalExampleService.php" %}
```php
public function __construct (EntityRepositoryInterface $productRepository)
{
    $this->productRepository = $productRepository;
}
```
{% endcode %}

If you're using [service autowiring](https://symfony.com/doc/current/service_container/autowiring.html), and the type
and argument variable names are correct, the repository will be injected automatically.

Alternatively, configure the product.repository service to be injected explicitly:

{% code title="<plugin root>src/Resources/config/service.xml" %}
```xml
<service id="Swag\ExamplePlugin\Service\DalExampleService">
    <argument type="service" id="product.repository"/>
</service>
```
{% endcode %}

You can read more about dependency injection and service registration in Shopware in the services guides:

{% page-ref page="../../../guides/plugins/plugins/plugin-fundamentals/add-custom-service.md" %}
