---
nav:
  title: Store API
  position: 60

---

# Store API

Use the Store API to add custom endpoints or extend existing ones in plugins. Store API routes are service-based and follow strict architectural conventions to ensure consistency, cacheability, and extensibility.

## Core Principles

Routes:

* Do not implement the Sales Channel API, deprecated as of 6.4.
* Define Store API controllers as services.
* Use named routes internally.
* Each route class or API method requires the attribute: `#[Route(defaults: [\Shopware\Core\PlatformRequest::ATTRIBUTE_ROUTE_SCOPE => [\Shopware\Core\Framework\Routing\StoreApiRouteScope::ID]])]`.
* Response decorators must extend `StoreApiResponse`.

Route design:

* A route represents a single, focused functionality.
* A route must return a `StoreApiResponse`, to convert to JSON.
* A route response can only contain one object.
* Routes may be decorated to extend behavior.

Storefront integration:

* Storefront controllers must not access repositories directly.
* Controllers must call Store API routes.
* Page loaders and controllers may call multiple routes.
* Business logic belongs in Store API routes, not in controllers.
