---
nav:
  title: Overloading classes
  position: 110

---

# Overloading Classes

[Download](../../../../../../docs/products/extensions/b2b-suite/guides/example-plugins/B2bServiceExtension.zip) a plugin showcasing the topic.

## Description

To add new functionality or overload existing classes to change functionality, the B2B Suite uses the [Dependency Injection](../../../../../guides/plugins/plugins/plugin-fundamentals/dependency-injection) as an extension system instead of events and hooks, which Shopware uses.

### How does a services.xml look like

In the release package, our service.xml looks like this:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">
    <parameters>
        <parameter key="b2b_role.repository_class">Shopware\B2B\Role\Framework\RoleRepository</parameter>
        [...]
    </parameters>
    <services>
        <service id="b2b_role.repository_abstract" abstract="true">
            <argument type="service" id="dbal_connection"/>
            <argument type="service" id="b2b_common.repository_dbal_helper"/>
        </service>
        [...]

        <service id="b2b_role.repository" class="%b2b_role.repository_class%" parent="b2b_role.repository_abstract"/>
        [...]
    </services>
</container>
```

For development (GitHub), it looks like this:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">
    <services>
        <service id="b2b_role.repository" class="Shopware\B2B\Role\Framework\RoleRepository">
            <argument type="service" id="dbal_connection"/>
            <argument type="service" id="b2b_common.repository_dbal_helper"/>
        </service>

        <service id="b2b_role.grid_helper" class="Shopware\B2B\Common\Controller\GridHelper">
            <argument type="service" id="b2b_role.repository"/>
        </service>

        <service id="b2b_role.crud_service" class="Shopware\B2B\Role\Framework\RoleCrudService">
            <argument type="service" id="b2b_role.repository"/>
            <argument type="service" id="b2b_role.validation_service"/>
        </service>

        <service id="b2b_role.validation_service" class="Shopware\B2B\Role\Framework\RoleValidationService">
            <argument type="service" id="b2b_common.validation_builder"/>
            <argument type="service" id="validator"/>
        </service>

        <service id="b2b_role.acl_route_table" class="Shopware\B2B\Role\Framework\AclRouteAclTable">
            <tag name="b2b_acl.table"/>
        </service>
    </services>
</container>
```

We generate the new services.xml files for our package automatically.

### How do I use it

This is how the [whole system work](http://symfony.com/doc/current/service_container/parent_services.html).

You only have to change the parameter or overload the service id.

Your service file could look like this:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">
    <services>
        <service id="b2b_role.repository" class="Your/Class" parent="b2b_role.repository_abstract">
            <argument id="Your/own/class" type="service"/>
        </service>
        [...]
    </services>
</container>
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
