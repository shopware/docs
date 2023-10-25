---
nav:
  title: Request Headers
  position: 20

---

# Request Headers

## sw-language-id

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

## sw-skip-trigger-flow

Flows are an essential part of Shopware and are triggered by events like the creation of a customer. When migrating from another ecommerce platform to shopware, you might import hundreds of thousands of customers via the sync API. In that case, you don't want to trigger the `send email on customer creation` flow. To avoid this behavior, you can pass the `sw-skip-trigger-flow` header.

```bash
POST /api/_action/sync
--header 'sw-skip-trigger-flow: 1'
```
