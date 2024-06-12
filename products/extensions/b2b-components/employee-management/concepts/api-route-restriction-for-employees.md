---
nav:
  title: API Route Restriction for Employees
  position: 20

---

# API Route Restriction for Employees

## Overview

B2B employees and business partners share the same customer account. This can lead to inconsistency for all users of the shared account because they are allowed to change settings and data (both via Storefront and Store API), which are not related to the B2B permission system. Hence, it is decided to restrict most of the customer account routes by implementing a denylist pattern to prevent the illegal modification of customer data and settings, instead of replicating all customer features for employee accounts. All non-account related routes are still available for B2B employees.

## Denylist

The denylist can be found in the employee management config at: `Resources\config\employee_route_access.xml`. All denied routes are inside `<denied>` tags. The routes inside the `<allowed>` tags are not important for third-party developers because they are used for internal integration tests to remind developers to extend the list if new Store API account routes are added.

### Denylist Example

```xml
<?xml version="1.0" encoding="utf-8"?>
<routes xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../Schema/Xml/employee-route-access-1.0.xsd">
    <denied>store-api.account.change-profile</denied>
    <denied>store-api.account.change-email</denied>
    <denied>...</denied>

    <allowed>store-api.account.login</allowed>
    <allowed>store-api.account.logout</allowed>
    <allowed>...</allowed>
</routes>
```

### How to load the Denylist

The denylist is loaded by using the `load` function in the `Shopware\Commercial\B2b\Domain\RouteAccess\EmployeeRouteAccessLoader` class. The return result is an associative array that includes arrays of all `allowed` and `denied` routes.

### Where is the Denylist loaded

The denylist is loaded in the `Shopware\Commercial\B2b\Subscriber\B2bRouteBlocker`, which listens to each controller event and validates the route access before the request reaches the controller. Illegal attempts cause an exception to be thrown.

### How to override the Denylist

It is possible to create additional `employee_route_access.xml` configs, which include new denied routes. After the config is ready, you can decorate the `Shopware\Commercial\B2b\Domain\RouteAccess\EmployeeRouteAccessLoader`, which supports recommended Shopware decoration pattern. Adapt the solution of the decorated `EmployeeRouteAccessLoader::load` function and return your own config.

#### Decoration Example

```php
<?php declare(strict_types=1);

namespace Shopware\Commercial\B2B\Domain\RouteAccess;

class DecoratedEmployeeRouteAccessLoader extends AbstractEmployeeRouteAccessLoader
{
    private const CONFIG = __DIR__ . '/../../Resources/config/new-custom-employee_route_access.xml';

    public function __construct(
        private readonly AbstractEmployeeRouteAccessLoader $decorated
    ) {
    }

    public function getDecorated(): AbstractEmployeeRouteAccessLoader
    {
        return $this->decorated;
    }

    public function load(): array
    {
        $oldConfig = $this->decorated->load();
        $customConfig = (array) @simplexml_load_file(self::CONFIG);

        // This example merges the old config with the new created custom config.
        // Return the $customConfig variable to override the old completely

        return array_merge_recursive($oldConfig, $customConfig);
    }
}
```
