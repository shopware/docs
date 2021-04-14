# API error handling in administration)
​
## Overview

The Shopware 6 Administration stores API errors in the [Vuex](https://vuex.vuejs.org/).
Where they are centrally accessible to your components, with a flat data structure wich looks like this:

```
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
​
## Read errors from the store
​
Errors can be read from the store by calling the getter method `getApiErrorFromPath`.
​
```javascript
function getApiErrorFromPath (state) => (entityName, id, path)
```
​
Where path is an `array` representing the nested property names of your entity.

Also we provide a wrapper which can also handle nested fields in object notation, which is much easier to use for scalar fields:
​
```javascript
function getApiError(state) => (entity, field)
```
​
For example an empty product name would result in an error with the path `product.name`, instead of having the array `['product', 'name']`.

In your Vue component, use computed properties to not flood your templates with store calls.
​
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

Those computed properties can then be normally used in your templates:

```html
<div>
    <sw-field ... :error="propertyError"></sw-field>
</div>
```
​
### The mapErrors Service
​
Like every Vuex mapping, fetching the errors from the store may be very repetitive and error-prone.
Because of this we provide you an Vuex like mapper function:
​
​
```javascript
mapPropertyErrors(subject, properties)
```
​
where subject is the entity name (not the entity itself) and properties is an array of properties you want to map.
You can spread its result to create computed properties in your component.
The functions returned by the mapper are named like a camelCase representation of your input suffixed with `Error`.

This is an example from the `sw-product-basic-form` component:
​
```javascript
const { mapPropertyErrors } = Shopware.Component.getComponentHelper();
    
Component.register('sw-product-basic-form', {    
    Component.register('sw-product-basic-form', {
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

Wich then are bound to the inputs like this:

```html
<sw-field type="text" v-model="product.name" :error="productNameError"
``` 
​
### Error configuration for pages
​
When working with nested views you need a way to tell the user that an error occurred on another view, e.g tab.
For this you can write a config for your `sw-page` component which looks like: 
​
```
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
​
This can then directly imported and used in the `mapPageError` computed property:

```javascript
import errorConfiguration from './error.cfg.json';

const { mapPageErrors } = Shopware.Component.getComponentHelper();

Shopware.Component.register('sw-product-detail', {
    computed: {
        ...mapPageErrors(errorConfiguration),
    }
}
```

Wich then makes it possible to indicate if one or more errors exists, in another view or a tab:

```html
<sw-tabs
    :hasError="swProductDetailBaseError">
</sw-tabs>
```