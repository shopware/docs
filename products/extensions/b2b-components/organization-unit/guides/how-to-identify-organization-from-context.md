---
nav:
  title: How to identify the organization unit from the context
  position: 50

---

# How to identify the organization unit from the context

To determine the organization unit linked to an employee, you can retrieve the employee entity from the sales channel context. This entity includes a reference to the organization the employee belongs to.

Here’s an example:

```php
...
$employee = $context->getCustomer()?->getExtension(SalesChannelContextFactoryDecorator::CUSTOMER_EMPLOYEE_EXTENSION);

if (!$employee instanceof EmployeeEntity) {
    return;
}

$organizationId = $employee->get('organizationId');
...
}
```

This code checks whether the current customer has an employee extension. If it does, it retrieves the employee entity and then accesses the `organizationId` property to get the ID of the organization unit associated with that employee.
You can use this `organizationId` to load data related to the organization or to control what the employee is allowed to access.
