# Adding error handling

​

## Overview

The Shopware 6 Administration stores API errors in the [Vuex store](https://vuex.vuejs.org/). There they are centrally accessible to your components, with a flat data structure looking like this:

```text
(state)
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
function getApiErrorFromPath (state) => (entityName, id, path)
```

​ In there, the parameter `path` is an `array` representing the nested property names of your entity.

Also we provide a wrapper which can also handle nested fields in object notation, being much easier to use for scalar fields: ​

```javascript
function getApiError(state) => (entity, field)
```

​ For example, an empty product name would result in an error with the path `product.name`, instead of having the array `['product', 'name']` present.

In your Vue component, use computed properties to avoid flooding your templates with store calls. ​

```javascript
computed: {
    propertyError() {
        return this.$store.getters.getApiError(myEntity, 'myFieldName');
    },
    nestedpropertyError() {
        return this.$store.getters.getApiError(myEntity, 'myFieldName.nested');
    }
}
```

Those computed properties can then be used in your templates the familiar way:

```html
<div>
    <sw-field ... :error="propertyError"></sw-field>
</div>
```

​

### The mapErrors Service

​ Like every Vuex mapping, fetching the errors from the store may be very repetitive and error-prone. Because of this we provide you an Vuex like mapper function: ​

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
<sw-field type="text" v-model="product.name" :error="productNameError">
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
<sw-tabs
    :hasError="swProductDetailBaseError">
</sw-tabs>
```
