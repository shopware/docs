---
nav:
  title: API
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
