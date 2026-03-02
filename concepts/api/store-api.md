---
nav:
  title: Store API
  position: 50

---

# Store API

The Store API represents the customer-facing surface of Shopware. It is designed for storefront/frontend-related interactions such as product browsing, cart handling, checkout, and customer account management. It exposes only data that is relevant and safe for frontend use and supports both anonymous and authenticated customers.

The Store API acts as a normalized interface layer between customer-facing applications and the Shopware Core. It enables headless frontends (such as SPAs or native apps) to consume Shopware functionality via JSON over HTTP. Core business logic is exposed through HTTP routes, ensuring that the Storefront and API consumers rely on the same underlying services.

For details on endpoints, authentication methods, schemas, and request formats, always refer to the Store API documentation.
<PageRef page="https://shopware.stoplight.io/docs/store-api/7b972a75a8d8d-shopware-store-api" title="Store API – Stoplight Reference" target="_blank" />

Shopware provides [Composable Frontends](https://frontends.shopware.com/) as a headless frontend implementation based on the Store API.
