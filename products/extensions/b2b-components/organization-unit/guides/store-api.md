---
nav:
  title: Store API
  position: 30

---

## Store API

Here are some of the actions you can perform on *Organization Unit* using the Store API.

### Create new organization unit

```http request
POST {url}/store-api/organization-unit {
    name: {string},
    defaultShippingAddressId: {uuid},
    defaultBillingAddressId: {uuid},
    employeeIds: {array of uuid},
    shippingAddressIds: {array of uuid},
    billingAddressIds: {array of uuid},
    paymentMethodIds: {array of uuid},
    shippingMethodIds: {array of uuid}
}
```

### Update organization unit

```http request
POST {url}/store-api/organization-unit/{id} {
    name: {string},
    defaultShippingAddressId: {uuid},
    defaultBillingAddressId: {uuid},
    employeeIds: {array of uuid},
    shippingAddressIds: {array of uuid},
    billingAddressIds: {array of uuid},
    paymentMethodIds: {array of uuid},
    shippingMethodIds: {array of uuid}
}
```

### Get organization unit

```http request
GET|POST {url}/store-api/organization-unit/{id}
```

### Get organization units

```http request
GET|POST {url}/store-api/organization-units
```

### Remove organization units

```http request
DELETE {url}/store-api/organization-unit {
    ids: {array}
}
```
