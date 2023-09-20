---
nav:
  title: Integrations / API
  position: 10

---

# Integrations/API

Generally, Shopware provides two APIs that serve two aspects of integrations with our platform. Both APIs are based on HTTP and though they serve different use cases, they share some underlying concepts. We recommend understanding these concepts before diving deeper into either of the APIs.

<PageRef page="general-concepts/" />

## Customer-facing interactions - Store API

Frontend applications usually provide interfaces for users \(customers\). These applications usually don't expose sensitive data and have two layers of users - anonymous and authenticated i.e., unregistered and registered. Payloads are usually small, performance and availability are critical.

<PageRef page="https://shopware.stoplight.io/docs/store-api/storeapi.json" title="Store API Endpoint Reference" target="_blank" />

## Backend-facing integrations - Admin API

These integrations are characterized by the exchange of structured data, synchronizations, imports, exports and notifications. Performance is also important in terms of high data loads rather than fast response times. Consistency, error handling, and transaction-safety are critical.

<PageRef page="https://shopware.stoplight.io/docs/admin-api/adminapi.json" title="Endpoint Admin API Reference" target="_blank" />
