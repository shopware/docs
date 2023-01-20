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

## sw-inheritance

Shopware 6 allows developers to define inheritance \(parent-child\) relationships between entities of the same type. This has been used, for example, for products and their variants. Certain fields of a variant can therefore inherit the data from the parent product or define \(i.e. override\) them themselves. However, the API initially only delivers the data of its own record, without considering parent-child inheritance. To tell the API that the inheritance should be considered, the header `sw-inheritance` must be sent along with the request.

```bash
POST /api/search/product
--header 'sw-inheritance: 1'
```
