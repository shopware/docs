---
nav:
  title: APIs
  position: 40

---

# APIs

Shopware exposes HTTP-based APIs that allow external systems and custom applications to interact with the platform.

Two functional APIs are available, each representing a different integration surface:

* **Store API**: customer-facing interactions
* **Admin API**: administrative and system-level operations

Both APIs use HTTP, exchange structured JSON payloads, and require authenticated access. While they serve different purposes within the platform, they share some underlying design principles and structural patterns:

* Search criteria abstraction for filtering, sorting, and pagination
* Structured JSON request/response bodies
* Versioned endpoints
* Header-based contextual behavior

These patterns form the foundation of integration development.

## Store API

The Store API represents the customer-facing surface of Shopware. It is designed for storefront/frontend-related interactions such as product browsing, cart handling, checkout, and customer account management. It exposes only data that is relevant and safe for frontend use and supports both anonymous and authenticated customers.

The Store API acts as a normalized interface layer between customer-facing applications and the Shopware Core. It enables headless frontends (such as SPAs or native apps) to consume Shopware functionality via JSON over HTTP. Core business logic is exposed through HTTP routes, ensuring that the Storefront and API consumers rely on the same underlying services.

For details on endpoints, authentication methods, schemas, and request formats, always refer to the Store API documentation.
<PageRef page="https://shopware.stoplight.io/docs/store-api/7b972a75a8d8d-shopware-store-api" title="Store API – Stoplight Reference" target="_blank" />

Shopware provides [Composable Frontends](https://frontends.shopware.com/)
 as a headless frontend implementation based on the Store API.

## Admin API

The Admin API represents the administrative and integration surface of Shopware. It enables structured access to core business entities such as products, orders, customers, media, and configurations. It is intended for backend integrations, automation, data synchronization, and system-to-system communication.

These integrations typically involve structured data exchange, synchronization, imports, exports, and notifications. They prioritize consistency, error handling, validation, and transactional integrity. Performance is also important in terms of high data loads rather than fast response times.

The Admin API provides CRUD operations for every entity within Shopware and is used to build integrations with external systems.

For details on endpoints, authentication methods, schemas, and request formats, always refer to the Admin API documentation.

<PageRef page="https://shopware.stoplight.io/docs/admin-api/8d53c59b2e6bc-shopware-admin-api" title="Admin API – Stoplight Reference" target="_blank" />
