---
nav:
  title: Working with APIs
  position: 10

---

# Working with APIs

Shopware provides two HTTP APIs:

* [Admin API](https://shopware.stoplight.io/docs/admin-api/twpxvnspkg3yu-quick-start-guide)
* [Store API](https://shopware.stoplight.io/docs/store-api/38777d33d92dc-quick-start-guide).

These APIs serve different purposes but share common principles and infrastructure.

## Admin API

Primarily for backend and administrative functions, the Admin API enables structured data exchanges, bulk operations, data synchronization, and import-export tasks.

Use it when:

* Managing entities (products, categories, orders)
* Running backend integrations
* Performing bulk operations
* Building admin-side applications

Full endpoint documentation (local instance required): `/api/_info/stoplightio.html`.

Search endpoints use: `POST /api/search/{entity}`

## Store API

This customer-facing API allows you to access and manipulate data related to products, customer interactions, shopping carts, and other aspects of Shopware that significantly impact the frontend user experience. It serves both anonymous and authenticated users.

Use it when:

* Interacting with products and listings
* Managing carts and checkout
* Building headless storefronts
* Serving anonymous or authenticated customers

Full endpoint documentation (local instance required): `/store-api/_info/stoplightio.html`

## Shared API mechanics

Both APIs use the same foundational structures:

* [Search Criteria](search-criteria): encapsulates the entire search definition in one generic object
* [Request Headers](request-headers): additional instructions
* [Partial Data Loading](partial-data-loading)

These define how data is filtered, structured, and versioned.

For architectural background, see the [API overview](apis).

## Generated API reference

### OpenAPI schema

Shopware exposes OpenAPI schemas for both Admin API and Store API. These schemas are generated via PHP annotations using [swagger-php](https://github.com/zircote/swagger-php). If you build custom endpoints, you can leverage these annotations to generate standardized documentation for your custom endpoints.

::: warning
Due to security restrictions, your **`APP_ENV`** environment variable must be set to **`dev`** to access the specifications described below.
:::

To retrieve the raw schema definition directly, use the following endpoint:

```text
/(api|store-api)/_info/openapi3.json
```

### Entity schema

To access the schema definitions of all available entities instead of an endpoint reference, use one of the corresponding schema endpoints instead:

```text
/(api|store-api)/_info/open-api-schema.json
```
