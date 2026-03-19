---
nav:
  title: Overloading classes
  position: 110

---

# Overloading Classes

[Download](../example-plugins/B2bServiceExtension.zip) a plugin showcasing the topic.

## Description

To add new functionality or overload existing classes to change functionality, the B2B Suite uses the [Dependency Injection](../../../../../guides/plugins/plugins/plugin-fundamentals/dependency-injection) as an extension system instead of events and hooks, which Shopware uses.

### How does a services.php look like

In the release package, our services.php looks like this:

```php
// <plugin root>/src/Resources/config/services.php
<?php declare(strict_types=1);

use Shopware\B2B\Role\Framework\RoleRepository;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();
    $parameters = $configurator->parameters();

    $parameters->set('b2b_role.repository_class', RoleRepository::class);

    $services->set('b2b_role.repository_abstract')
        ->abstract(true)
        ->args([
            service('dbal_connection'),
            service('b2b_common.repository_dbal_helper'),
        ]);
    // [...]

    $services->set('b2b_role.repository', '%b2b_role.repository_class%')
        ->parent('b2b_role.repository_abstract');
    // [...]
};
```

For development (GitHub), it looks like this:

```php
// <plugin root>/src/Resources/config/services.php
<?php declare(strict_types=1);

use Shopware\B2B\Role\Framework\RoleRepository;
use Shopware\B2B\Common\Controller\GridHelper;
use Shopware\B2B\Role\Framework\RoleCrudService;
use Shopware\B2B\Role\Framework\RoleValidationService;
use Shopware\B2B\Role\Framework\AclRouteAclTable;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set('b2b_role.repository', RoleRepository::class)
        ->args([
            service('dbal_connection'),
            service('b2b_common.repository_dbal_helper'),
        ]);

    $services->set('b2b_role.grid_helper', GridHelper::class)
        ->args([service('b2b_role.repository')]);

    $services->set('b2b_role.crud_service', RoleCrudService::class)
        ->args([
            service('b2b_role.repository'),
            service('b2b_role.validation_service'),
        ]);

    $services->set('b2b_role.validation_service', RoleValidationService::class)
        ->args([
            service('b2b_common.validation_builder'),
            service('validator'),
        ]);

    $services->set('b2b_role.acl_route_table', AclRouteAclTable::class)
        ->tag('b2b_acl.table');
};
```

We generate the new services.php files for our package automatically.

### How do I use it

This is how the [whole system work](http://symfony.com/doc/current/service_container/parent_services.html).

You only have to change the parameter or overload the service id.

Your service file could look like this:

```php
// <plugin root>/src/Resources/config/services.php
<?php declare(strict_types=1);

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Your\Own\YourClass;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set('b2b_role.repository', YourClass::class)
        ->parent('b2b_role.repository_abstract')
        ->args([service(YourClass::class)]);
    // [...]
};
```

Just define a class with the same service id as our normal class and add our abstract class as the parent.
After that, add your own arguments or override ours.

An example of your class could look like this:

```php
<?php declare(strict_types=1);

[...]

class YourRoleRepository extends RoleRepository
{
    public array $myService;

    public function __construct()
    {
        $args = func_get_args();

        $this->myService = array_pop($args);

        parent::__construct(... $args);
    }

    public function updateRole(RoleEntity $role): RoleEntity
    {
        // your stuff
    }
}
```

You extend the B2B class and just change any action you need.

### What is the profit

By building our extension system this way, we can still add and delete constructor arguments without breaking your plugins.
Also, we don't have to add too many interfaces to the B2B Suite.

### What are the problems with this approach

Since we don't know which plugin is loaded first, we can't say which class overload another one.
To prevent any random errors, you should only overload each class once.
