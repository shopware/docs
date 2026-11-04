---
nav:
  title: Adding Error Handling
  position: 130

---

# Adding Error Handling

## Overview

The Shopware 6 Administration stores API errors in the `api` property of the Pinia `error` store, accessible through `Shopware.Store.get('error')`. System errors are stored separately in its `system` property. The API error structure looks like this:

```text
(`Shopware.Store.get('error').api`)
 |- entityNameA
    |- id1
        |- property1
        |- property2
        ...
    |- id2
        |- property1
        |- property2
        ...
 |- entityNameB
   ...
```

In this guide you will learn how to access this error store directly or via one of the provided helper functions. ​

## Read errors from the store

​ Errors can be read from the store by calling the getter method `getApiErrorFromPath`. ​

```javascript
Shopware.Store.get('error').getApiErrorFromPath(entityName, id, path)
```

For example, read an error for a product's name with `Shopware.Store.get('error').getApiError(product, 'name')`; the equivalent array path for `getApiErrorFromPath` is `['name']`.

The `getApiError` getter accepts a field name in dot notation:

```javascript
Shopware.Store.get('error').getApiError(entity, field)
```

For example, pass `name` for a product name or `name.nested` for a nested property. The equivalent paths for `getApiErrorFromPath` are `['name']` and `['name', 'nested']`.

In your Vue component, use computed properties to avoid flooding your templates with store calls. ​

```javascript
computed: {
    propertyError() {
        return Shopware.Store.get('error').getApiError(myEntity, 'myFieldName');
    },
    nestedpropertyError() {
        return Shopware.Store.get('error').getApiError(myEntity, 'myFieldName.nested');
    }
}
```

Those computed properties can then be used in your templates the familiar way:

```html
<div>
    <mt-text-field ... :error="propertyError"></mt-text-field>
</div>
```

​

### The mapErrors Service

Fetching errors from the store may be very repetitive and error-prone. The `mapPropertyErrors` helper function can simplify this task:

```javascript
mapPropertyErrors(subject, properties)
```

​ Here, the `subject` parameter is the entity name \(not the entity itself\) and `properties` is an array of the properties you want to map. You can spread its result to create computed properties in your component. The functions returned by the mapper are named like a camelCase representation of your input, suffixed with `Error`.

This is an example from the `sw-product-basic-form` component: ​

```javascript
const { mapPropertyErrors } = Shopware.Component.getComponentHelper();

Component.register('sw-product-basic-form', {
    computed: {
        ...mapPropertyErrors('product', [
            'name',
            'description',
            'productNumber',
            'manufacturerId',
            'active',
            'markAsTopseller'
        ])
    }
})
```

Which then are bound to the inputs like this:

```html
<mt-text-field v-model="product.name" :error="productNameError" />
```

​

### Error configuration for pages

​ When working with nested views, you need a way to tell the user that an error occurred on another view, e.g in another `tab`. For this you can write a config for your `sw-page` component which looks like seen below: ​

```json
{
  "sw.product.detail.base": {
    "product": [
      "taxId",
      "price",
      "stock",
      "manufacturerId",
      "name"
    ]
  },
  "sw.product.detail.cross.selling": {
    "product_cross_selling": [
      "name",
      "type",
      "position"
    ]
  }
}
```

​ This can then directly imported and used in the `mapPageError` computed property:

```javascript
import errorConfiguration from './error.cfg.json';

const { mapPageErrors } = Shopware.Component.getComponentHelper();

Shopware.Component.register('sw-product-detail', {
    computed: {
        ...mapPageErrors(errorConfiguration),
    }
}
```

This makes it possible to indicate if one or more errors exists, in another view or a tab:

```html
<sw-tabs>
    <sw-tabs-item
        :route="{ name: 'sw.product.detail.base', params: { id: $route.params.id } }"
        :has-error="swProductDetailBaseError">
        General
    </sw-tabs-item>
</sw-tabs>
```
