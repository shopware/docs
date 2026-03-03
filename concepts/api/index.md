---
nav:
  title: API
  position: 40

---

# API

Shopware exposes HTTP-based APIs that allow external systems and custom applications to interact with the platform.

Two functional APIs are available, each representing a different integration surface:

* **Store API**: customer-facing interactions
* **Admin API**: administrative and system-level operations

Both APIs use HTTP and exchange JSON payloads. The Administration API requires OAuth 2.0 authentication, whereas the Store API is publicly accessible and only requires contextual headers, with authentication needed for customer-specific endpoints. While they serve different purposes within the platform, they share some underlying design principles and structural patterns:

* Search criteria abstraction for filtering, sorting, and pagination
* Structured JSON request/response bodies
* Header-based contextual behavior

These patterns form the foundation of integration development.
