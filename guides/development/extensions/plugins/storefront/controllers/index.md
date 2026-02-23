---
nav:
  title: Storefront Controllers
  position: 140

---

# Storefront Controllers

Storefront controllers define HTTP endpoints for the storefront scope.
They coordinate page rendering and delegate business logic to Store API routes or page loaders.

## Core Principles

Structure:

* A Storefront controller must extend `\Shopware\Storefront\Controller\StorefrontController`.
* The class must define the storefront route scope: `#[Route(defaults: [\Shopware\Core\PlatformRequest::ATTRIBUTE_ROUTE_SCOPE => [\Shopware\Storefront\Framework\Routing\StorefrontRouteScope::ID]])]`.
* Each action requires a `#Route` attribute.
* Route names should use the `frontend` prefix (unless explicitly configured otherwise).
* Each route must define the corresponding HTTP Method: GET, POST, DELETE, PATCH.
* Each action must declare a return type.
* The function name should be concise.
* Dependencies must be injected via the class constructor and defined in the DI-container service definition.
* Dependent services must be assigned to a private class property.

Responsibilities:

* A controller represents a single entry point.
* A route must have a single purpose.
* Controllers must not contain business logic.
* Business logic belongs in Store API routes.
* Controllers must not access repositories directly.

Data Loading:

* Read operations must delegate to Store API routes or page loaders.
* Routes that render full storefront pages should use a page loader class to load all corresponding data.
* Page loaders may call multiple Store API routes.

Write Operations:

* must call a corresponding Store API route.
* Use the `createActionResponse()` function for redirects or forwards.

Caching:

* Pages with identical data for all users should use the `_httpCache` attribute.

## Additional guidelines

* Use Symfony flash bags for error reporting.
* Storefront functionality should be available inside the Store API too.
