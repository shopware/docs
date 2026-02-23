---
nav:
  title: Request Headers
  position: 20

---

# Request Headers

## Common headers

### sw-language-id

By default, the API delivers the entities via the system language. This can be changed by specifying a language id using the `sw-language-id` header.

```bash
POST /api/search/product
--header 'sw-language-id: be01bd336c204f20ab86eab45bbdbe45'
```

::: info
Shopware only populates a translatable field if there is an explicit translation for that field. Instead, the `translated` object always contains values, if necessary fallbacks.

**Example:** You instruct Shopware to fetch the french translation of a product using the `sw-language-id` header, but there's no french translation for the products name. The resulting field `product.name` will be `null`. When you're building applications, always use `product.translated.[value]`to access translated values, to make sure you will always get a valid translation or fallback value.
:::

## sw-version-id

Shopware 6 allows developers to create multiple versions of an entity. This has been used, for example, for orders. This allows relations, like documents, to pin a specific state of the entity it relates to. However, the API initially only delivers the data of the most recent record. To tell the API that a specific version should be returned, the header `sw-version-id` must be sent along with the request.

```bash
POST /api/search/order
--header 'sw-version-id: 0fa91ce3e96a4bc2be4bd9ce752c3425'
```

## sw-inheritance

Shopware 6 allows developers to define inheritance \(parent-child\) relationships between entities of the same type. This has been used, for example, for products and their variants. Certain fields of a variant can therefore inherit the data from the parent product or define \(i.e. override\) them themselves. However, the API initially only delivers the data of its own record, without considering parent-child inheritance. To tell the API that the inheritance should be considered, the header `sw-inheritance` must be sent along with the request.

```bash
POST /api/search/product
--header 'sw-inheritance: 1'
```

## sw-context-token

The `sw-context-token` is used to recognize your customers in the context of the Store API. Refer to [Authentication & Authorization](https://shopware.stoplight.io/docs/store-api/8e1d78252fa6f-authentication-and-authorisation) section of Store API for more details on this.

## sw-access-token

Any request to the Store API needs an Authentication with a `sw-access-token`. Refer to [Authentication & Authorization](https://shopware.stoplight.io/docs/store-api/8e1d78252fa6f-authentication-and-authorisation) section of Store API for more details on this.

## sw-app-user-id

The `sw-app-user-id` header allows apps to execute API requests in the context of a specific user. When this header is included, the system calculates the effective permissions by intersecting the user's permissions with the app's permissions, ensuring that the request runs with the most restrictive permissions from both sources.

This header is particularly useful when an app needs to perform actions on behalf of a user while maintaining proper permission boundaries.

To use the `sw-app-user-id` header, the specified user must either be an admin user, have explicit permission for the specific app, or have the `app.all` permission.

## Advanced headers

### sw-currency-id

When calling the API, a client can include the `sw-currency-id` header to indicate the currency in which it wants to receive prices. For example, if the header is set to "USD," the API might respond with prices converted to U.S. dollars. This header is associated with the currency settings in the admin panel. It allows clients to dynamically switch between different currencies based on their preferences.

```bash
POST /api/search/order
--header 'sw-currency-id: 1987f5c352434028802556e065cd5b1e'
```

### sw-skip-trigger-flow

Flows are an essential part of Shopware and are triggered by events like the creation of a customer. When migrating from another e-commerce platform to shopware, you might import hundreds of thousands of customers via the sync API. In that case, you don't want to trigger the `send email on customer creation` flow. To avoid this behavior, you can pass the `sw-skip-trigger-flow` header.

```bash
POST /api/_action/sync
--header 'sw-skip-trigger-flow: 1'
```

### sw-include-seo-urls

This header indicates whether SEO-friendly URLs for products or categories should be included in the API response. If an API request is made and the `sw-include-seo-urls` header is set, the API response will include all the configured SEO URLs for the specified product. This can provide additional information to the client about the various SEO-friendly paths associated with the product, allowing for better SEO management or customization.

```bash
POST /api/search/product
--header 'sw-include-seo-urls: 1'
```

### sw-app-integration-id

The `sw-app-integration-id` enables seamless connection and data exchange between different software components. This header is required for correct permission checks performed by the backend when fetching or manipulating data. It overrides the default behavior and uses the privileges provided by the app. This is used in the Meteor Admin SDK for the [Repository Data Handling](/resources/admin-extension-sdk/api-reference/data/repository). But the developer itself doesn’t need to care about it because it is handled automatically by the admin.
