---
nav:
  title: Store API
  position: 40

---

## Store API

Here are some of the actions you can perform on *Advanced Product Catalog* using the Store API.

### List advanced product catalog categories

```http request
GET|POST {url}/store-api/advanced-product-catalogs/categories
```

### Search advanced product catalog categories

```http request
GET {url}/store-api/advanced-product-catalogs/categories/search
```

### Create or update advanced product catalog

```http request
POST {url}/store-api/advanced-product-catalogs/save {
    organizationId: {uuid},
    id: {uuid} (optional),
    autoAddNewCategories: {boolean},
    selectedCategories: {array of uuid}
}
```

### Update advanced product catalog

```http request
PATCH {url}/store-api/advanced-product-catalogs/save {
    organizationId: {uuid},
    id: {uuid} (optional),
    autoAddNewCategories: {boolean},
    selectedCategories: {array of uuid}
}
```

### Remove categories from advanced product catalog

```http request
DELETE {url}/store-api/advanced-product-catalogs/categories/remove {
    id: {uuid},
    removedCategories: {array of uuid}
}
```

For more details, refer to [B2B Advanced Product Catalog](https://shopware.stoplight.io/docs/store-api/branches/main/b286c1f43d395-shopware-store-api) from Store API docs.
