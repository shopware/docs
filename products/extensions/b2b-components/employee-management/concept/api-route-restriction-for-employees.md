# API Route Restriction for Employees

## General

B2B employees and Business Partners share the same customer account.
This can lead to inconsistency for all users of the shared account because they are allowed to change settings and data (both via Storefront and Store-API),
which are not related to the B2B permission system.
We decided to restrict most of the customer account routes by implementing a deny-list pattern to prevent the illegal modification of customer data and settings,
instead of replicating all customer features for employee accounts. We don't consider those features relevant to employee account users.

## Deny-List

The deny-list can be found in the `Resources\config\employee_route_access.xml` config in the employee management folder.
All denied routes are inside the `<denied>` tags.
The routes inside the `<allowed>` tags are not important for third party developers because they are used for our internal integration tests to remind our developers to extend the list if new Store-API account routes were added.

### How is the Deny-List loaded

The deny-list is loaded with the `load` function in the `Shopware\Commercial\B2b\Domain\RouteAccess\EmployeeRouteAccessLoader` class.
The return result is an associative array that includes an allowed and a denied array. You can access them via the index keys `allowed` and `denied`.

### Where is the Deny-List loaded

The deny-list is loaded in the `Shopware\Commercial\B2b\Subscriber\B2bRouteBlocker` which listens on each controller event and validates the route access before the request reaches the controller.
In illegal attempts an exception will be thrown.

### How to override the Deny-List

You can create your own `employee_route_access.xml` config which includes your denied routes.
After your config is ready, you can decorate the `Shopware\Commercial\B2b\Domain\RouteAccess\EmployeeRouteAccessLoader` which supports our recommended Shopware decoration pattern.
Adapt the solution of the decorated `EmployeeRouteAccessLoader::load` function and return your own config. The `B2bRouteBlocker` will use your config out of the box.
