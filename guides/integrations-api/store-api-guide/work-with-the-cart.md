# Working with the cart

## Overiew

Any online store would be useless if it wasn't shoppable. Hence we need a cart where we can collect items which we want to buy.

Implicitly, a cart is associated with your `sw-context-token` header.

## Create a new cart

To create a new one, make sure to set a context token header. If you want to, you can also pass a name to identify the cart later on.

```javascript
// POST /store-api/checkout/cart

{
  "name": "my-cart"
}
```

**Response**

```javascript
{
  "name": "my-cart",
  "token": "nqVMbLr8Q1Vs5jFdz4xk4vkSXAEKiOMt",
  "price": {
    "netPrice": 0,
    "totalPrice": 0,
    "calculatedTaxes": [],
    "taxRules": [],
    "positionPrice": 0,
    "taxStatus": "gross",
    "apiAlias": "cart_price"
  },
  "lineItems": [],
  "errors": [],
  "deliveries": [],
  "transactions": [
    {
      "amount": {
        "unitPrice": 0,
        "quantity": 1,
        "totalPrice": 0,
        "calculatedTaxes": [],
        "taxRules": [],
        "referencePrice": null,
        "listPrice": null,
        "apiAlias": "calculated_price"
      },
      "paymentMethodId": "35ce6af5a12a49708740a38bbbdf517e",
      "apiAlias": "cart_transaction"
    }
  ],
  "modified": false,
  "customerComment": null,
  "affiliateCode": null,
  "campaignCode": null,
  "extensions": {
    "cart-promotions": {
      "addedCodes": [],
      "blockedPromotionIds": [],
      "apiAlias": "shopware_core_checkout_promotion_cart_extension_cart_extension"
    }
  },
  "apiAlias": "cart"
}
```

If you want to delete your cart, you can sent a `DELETE` request to the same endpoint.

## Adding new items to the cart

The api `POST /store-api/checkout/cart/line-item` can be used to add multiple new line items.

**Product**

```javascript
// POST /store-api/checkout/cart/line-item

{
    "items": [
        {
            "type": "product",
            "referencedId": "<productId>"
        },
        {
            "type": "product",
            "referencedId": "<productId>",
            "quantity": 2
        }
    ]
}
```

You can set following properties on a product line item: `referencedId`, `payload` and `quantity`. When the Line Item is wrong miss-configured, the cart will add an error. This error is in the `error` key in the response.

**Promotion**

```javascript
// POST /store-api/checkout/cart/line-item

{
    "items": [
        {
                "type": "promotion",
                "referencedId": "<promotionCode>"
            }
    ]
}
```

### Error-Handling

When you pass invalid line item configuration to the API the cart calculation process will remove the line items again and add errors to the cart. This errors are ~~~~in the `error` key in the cart response. An example for an invalid `referencedId` would be look like this:

```javascript
"errors": {
    "product-not-foundfc2376912354406d80dd8887fc30ffa8": {
      "id": "fc2376912354406d80dd8887fc30ffa8",
      "message": "The product %s could not be found",
      "code": 0,
      "line": 166,
      "key": "product-not-foundfc2376912354406d80dd8887fc30ffa8",
      "level": 10,
      "messageKey": "product-not-found"
    }
  }
```

#### Updating items in the cart

Use the `PATCH /store-api/checkout/cart/line-item` endpoint to update line items in to cart.

```javascript
// PATCH /store-api/checkout/cart/line-item

{
    "items": [
        {
            "id": "<id>",
            "quantity": <quantity>,
            "referencedId": "<newReferenceId>"
        }
    ]
}
```

#### Deleting items in the cart

The api `DELETE /store-api/checkout/cart/line-item` can be used to remove line items to the cart

```javascript
// DELETE /store-api/checkout/cart/line-item

{
    "ids": [
        "<id>"
    ]
}
```

## Creating an order from the cart

The endpoint `/store-api/checkout/order` can be used to create an order from the cart. You will need items in the cart and you need to be logged in.

```javascript
// POST /store-api/checkout/order

{
    "includes": {
        "order": ["orderNumber", "price", "lineItems"],
        "order_line_item": ["label", "price"]
    }
}
{
  "orderNumber": "10060",
  "price": {
    "netPrice": 557.94,
    "totalPrice": 597,
    "calculatedTaxes": [
      {
        "tax": 39.06,
        "taxRate": 7,
        "price": 597,
        "apiAlias": "cart_tax_calculated"
      }
    ],
    "taxRules": [
      {
        "taxRate": 7,
        "percentage": 100,
        "apiAlias": "cart_tax_rule"
      }
    ],
    "positionPrice": 597,
    "taxStatus": "gross",
    "apiAlias": "cart_price"
  },
  "lineItems": [
    {
      "label": "Aerodynamic Bronze Prawn Crystals",
      "price": {
        "unitPrice": 597,
        "quantity": 1,
        "totalPrice": 597,
        "calculatedTaxes": [
          {
            "tax": 39.06,
            "taxRate": 7,
            "price": 597,
            "apiAlias": "cart_tax_calculated"
          }
        ],
        "taxRules": [
          {
            "taxRate": 7,
            "percentage": 100,
            "apiAlias": "cart_tax_rule"
          }
        ],
        "referencePrice": null,
        "listPrice": null,
        "apiAlias": "calculated_price"
      },
      "apiAlias": "order_line_item"
    }
  ],
  "customerComment": "comment",
  "affiliateCode": "affiliate code",
  "campaignCode": "campaign code",
  "apiAlias": "order"
}
```

Depending on your requirements, you might need additional data from the order. You can control what gets passed using the `includes` parameter in the request body. Some interesting fields:

### `order.deliveries`

Shopware's data model is capable of representing multiple deliveries or shipments within a single order. Each delivery can have a different set of items, shipping method and delivery dates. However, in our current version, Shopware doesn't support creation of multiple deliveries out of the box, so most likely, you'll just be using `order.deliveries[0]` .

### `order.transactions`

A transaction represents a payment for an order. It contains a payment method, an amount and a state. An order can have multiple payments \(for example, if a payment fails, you can [switch methods](handling-the-payment.md#handle-exceptions) and create a second transaction with an alternative payment method\).

### `order.addresses`

An order can have multipel associated addresses \(e.g. for shipping or deliverie/s\). Those will be passed in the `addresses` association. You can map them using their references in the order, such as `order.billingMethodId` or `order.deliveries[*].shippingOrderAddressId` .

### `order.lineItems`

This field contains all line items of the order. Line items may not only be products, but also discounts or virtual items, like bundles. Line items are stored as copies of their corresponding products, so when a product is deleted in your store, the line items from older orders remain available.

{% hint style="info" %}
All the above also applies to the `/order` endpoint, which simply lists orders for the current customer.
{% endhint %}

## Payment methods

The endpoint `/store-api/payment-method` can be used to list all payment methods of the sales channel. With the parameter `onlyAvailable` you can restrict the result to only valid payments methods \(some payment methods can be generally available, but dynamically disabled based on the cart configuration or other parameters\)

Additionally, the api basic parameters \(`filter`, `aggregations`, etc.\) can be used to restrict the result.

```javascript
// POST /store-api/payment-method

{
    "includes": {
        "payment_method": ["name", "description", "active"]
    }
}

[
    {
        "name": "Cash on delivery",
        "description": "Payment upon receipt of goods.",
        "active": true,
        "apiAlias": "payment_method"
    },
    {
        "name": "Paid in advance",
        "description": "Pay in advance and get your order afterwards",
        "active": true,
        "apiAlias": "payment_method"
    }
]
```

## Shipping methods

The endpoint `/store-api/shipping-method` can be used to list all payment methods of the sales channel. With the parameter `onlyAvailable` you can restrict the result to only valid shipping methods. The same logic as for payment methods applies in here.

Also here, the api basic parameters \(`filter`, `aggregations`, etc.\) can be used to restrict the result.

```javascript
// POST /store-api/shipping-method

{
    "includes": {
        "shipping_method": ["name", "active", "deliveryTime"],
        "delivery_time": ["name", "unit"]
    }
}

[
    {
        "name": "Express",
        "active": true,
        "deliveryTime": {
            "name": "1-3 days",
            "unit": "day",
            "apiAlias": "delivery_time"
        },
        "apiAlias": "shipping_method"
    }
]
```

