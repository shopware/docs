# Integrations/API

Generally, Shopware provides two APIs that serve two aspects of integrations with our platform. Both APIs are based on HTTP and though they serve different use cases, they share some underlying concepts. We recommend understanding these concepts before diving deeper into either of the APIs.

{% page-ref page="general-concepts/" %}

## Customer-facing interactions - Store API

Frontend applications usually provide interfaces for users \(customers\). These applications usually don't expose sensitive data and have two layers of users - anonymous and authenticated i.e., unregistered and registered. Payloads are usually small, performance and availability are critical.
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://shopware.stoplight.io/docs/store-api/storeapi.json" caption="Store API Endpoint Reference" %}

## Backend-facing integrations - Admin API

These integrations are characterized by the exchange of structured data, synchronizations, imports, exports and notifications. Performance is also important in terms of high data loads rather than fast response times. Consistency, error handling, and transaction-safety are critical.
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://shopware.stoplight.io/docs/admin-api/adminapi.json" caption="Endpoint Admin API Reference" %}
