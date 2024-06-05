# Checkout Gateway Command Reference

| Command                  | Description                                                                                                                                                  | Payload                                                        | Since   |
|:-------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------|:--------|
| `remove-payment-method`  | Removes a payment method from the available payment methods.                                                                                                 | `{"paymentMethodTechnicalName": "string"}`                     | 6.6.3.0 |
| `remove-shipping-method` | Removes a shipping method from the available shipping methods.                                                                                               | `{"shippingMethodTechnicalName": "string"}`                    | 6.6.3.0 |
| `add-cart-error`         | Adds an error to the cart. The level decides the severity of the cart error flash message. Blocking decides, whether to block the checkout for the customer. | `{"message": "string", "level": "int", "blocking": "boolean"}` | 6.6.3.0 |
