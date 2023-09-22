---
nav:
  title: Create permissions via plugin
  position: 20

---

# Creating own permissions via plugin

This article explains how to create custom permissions using a plugin.

To create custom permissions, you will utilize the event subscriber concept in Symfony.
Create a new class called `PermissionCollectorSubscriber` that implements the `EventSubscriberInterface`:

```php
<?php declare(strict_types=1);

use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class PermissionCollectorSubscriber implements EventSubscriberInterface
{
    public const OWN_ENTITY_GROUP = 'own_entity';

    // Here you define your custom permissions as constants
    public const OWN_ENTITY_READ = 'own_entity.read';
    
    public const OWN_ENTITY_EDIT = 'own_entity.edit';
    
    public const OWN_ENTITY_CREATE = 'own_entity.create';
    
    public const OWN_ENTITY_DELETE = 'own_entity.delete';

    public static function getSubscribedEvents(): array
    {
        return [
            PermissionCollectorEvent::NAME => [ 'onAddOwnPermissions' , 1000 ]
        ];
    }

    // This method is called when the PermissionCollectorEvent is triggered
    public function onAddOwnPermissions(PermissionCollectorEvent $event): void
    {
        $collection = $event->getCollection();

        // Here you add your custom permissions to the permission collection
        $collection->addPermission(self::EMPLOYEE_READ, self::OWN_ENTITY_GROUP, []);
        $collection->addPermission(self::EMPLOYEE_EDIT, self::OWN_ENTITY_GROUP, [ self::EMPLOYEE_READ ]);
        $collection->addPermission(self::EMPLOYEE_CREATE, self::OWN_ENTITY_GROUP, [ self::EMPLOYEE_READ, self::EMPLOYEE_EDIT ]);
        $collection->addPermission(self::EMPLOYEE_DELETE, self::OWN_ENTITY_GROUP, [ self::EMPLOYEE_READ, self::EMPLOYEE_EDIT ]);
    }
}
```

The `PermissionCollector` collects the permissions of all subscribers and then passes them to the storefront, where they can be attached to the role by the user.
If you want to check in the template if the user has this permission, the Twig function `isB2bAllowed` can be used:

```twig
{% sw_extends '@Storefront/storefront/page/checkout/checkout-item.html.twig' %}

{{ parent() }}

{% if isB2bAllowed(constant('PermissionCollectorSubscriber::EMPLOYEE_READ')) %}
...
{% endif  %}
```

In controllers, the checking of permissions must happen via the employee's role:

```php
<?php declare(strict_types=1);
public function employeeList(Request $request, SalesChannelContext $context): Response
{
    if (!$context->getCustomer()->getEmployee()->getRole()->can(PermissionCollectorSubscriber::EMPLOYEE_READ)) {
        throw new PermissionDeniedException();
    }
...
}
```
