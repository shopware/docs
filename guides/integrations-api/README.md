# Integrations / API

Generally, Shopware provides two APIs that serve two aspects of integrations that there can be with our platform. Both APIs are based on HTTP and though they serve quite different cohorts / use cases, they do share some underlying concepts. We recommend understanding these concepts, before diving deeper into either of the APIs.

{% page-ref page="general-concepts/" %}

## **Customer-facing interactions - Store API**

Such as applications are usually considered "frontends" and provide interfaces for users \(customers\). These applications usually don't expose sensitive data and have two layers of users - anonymous and authenticated - i.e. unregistered and registered. Payloads are usually small, performance and availability are critical.
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://shopware.stoplight.io/docs/store-api/storeapi.json" caption="Store API Endpoint Reference" %}

## Backend-facing integrations - Admin API

These integrations are characterised by the exchange of structured data, synchronisations, imports, exports or notifications. Performance is also important, but rather in terms of high data loads rather than fast response times. Consistency, error handling, transaction-safety are critical.
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://shopware.stoplight.io/docs/admin-api/adminapi.json" caption="Endpoint Admin API Reference" %}



