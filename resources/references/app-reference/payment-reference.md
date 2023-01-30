---
nav:
  title: Payment Reference
  position: 30

---

# Payment Reference

::: warning
This feature is only available starting with Shopware 6.4.1.0.
:::

These two requests are executed against your API, the up to two endpoints you define per payment method. All bodies are JSON encoded.

### Pay

`POST https://payment.app/pay`

This request gets called, when the users hits _Confirm Order_ in Shopware.

#### Parameters

| Parameter                | Type                   | Description                                                                                                                                                                                                                          |
|--------------------------|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Header**               |                        |                                                                                                                                                                                                                                      |
| shopware-shop-signature* | string                 | The hmac-signature of the JSON encoded body content, signed with the shop secret returned from the registration request                                                                                                              |
| **Body**                 |                        |                                                                                                                                                                                                                                      |
| order*                   | OrderEntity            | The order entity from Shopware including all necessary associations (like currency, shipping address, billing address, line items). See Shopware for detailed and current structure.                                                 |
| orderTransaction*        | OrderTransactionEntity | The order transaction entity from Shopware representing the payment you are supposed to process. See Shopware for detailed and current structure.                                                                                    |
| orderTransaction.id*     | string                 | This should be used to identify the order transaction on a second finalize request.                                                                                                                                                  |
| returnUrl                | string                 | This URL is the URL your app or your payment provider is supposed to redirect back to, once the user has been redirected to the payment provider with the URL you provide in your response. Only supplied on asynchrounous payments. |
| source*                  | object                 | Data to identify the shop that sent this request                                                                                                                                                                                     |
| source.url*              | string                 | The Shop URL sending this request                                                                                                                                                                                                    |
| source.shopId*           | string                 | The shop id you can use to identify the sho that has been registered before with your app.                                                                                                                                           |
| source.appVersion*       | string                 | The version of the app that is installed in the shop.                                                                                                                                                                                |

#### Responses

`200`

```json5
/* Successful redirect */
{
  "redirectUrl": "https://payment.app/user/go/here/068b1ec4d7ff431b95d3b7431cc725aa/"
}
```

```json5
/* Failure due to missing credentials */
{
  "status": "fail",
  "message": "The shop has not provided all credentials for the payment provider."
}
```

### Finalize

`POST https://payment.app/finalize`

This request gets called once the user returns to the `returnUrl` Shopware provided in the first request.

#### Parameters

| Parameter                | Type                   | Description                                                                                                                                                                                                                          |
|--------------------------|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Header**               |                        |                                                                                                                                                                                                                                      |
| shopware-shop-signature* | string                 | The hmac-signature of the JSON encoded body content, signed with the shop secret returned from the registration request                                                                                                              |
| **Body**                 |                        |                                                                                                                                                                                                                                      |
| orderTransaction*        | OrderTransactionEntity | The order transaction entity from Shopware representing the payment you are supposed to process. See Shopware for detailed and current structure.                                                                                    |
| orderTransaction.id*     | string                 | This should be used to identify the order transaction on a second finalize request.                                                                                                                                                  |
| source*                  | object                 | Data to identify the shop that sent this request                                                                                                                                                                                     |
| source.url*              | string                 | The Shop URL sending this request                                                                                                                                                                                                    |
| source.shopId*           | string                 | The shop id you can use to identify the sho that has been registered before with your app.                                                                                                                                           |
| source.appVersion*       | string                 | The version of the app that is installed in the shop.                                                                                                                                                                                |

#### Responses

`200`

```json5
/* Successful redirect */
{
  "status": "paid"
}
```

```json5
/* Failure due to missing funds */
{
  "status": "fail",
  "message": "The user did not have adequate funds."
}
```

```json5
/* Failure if the user has not finished the payment process. */
{
  "status": "cancel",
  "message": "The user did not finish payment."
}
```