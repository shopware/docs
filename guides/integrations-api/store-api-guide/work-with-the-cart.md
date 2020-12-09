# Work with the cart

Any online store would be useless if it wasn't shoppable. Hence we need a cart where we can collect items which we want to buy.

Implicitly, a cart is associated with your `sw-context-token` header.

## Create a new cart

To create a new one, make sure to set a context token header. If you want to, you can also pass a name to identify the cart later on.

```javascript
// POST /store-api/v3/checkout/cart

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

## Add items to the cart

