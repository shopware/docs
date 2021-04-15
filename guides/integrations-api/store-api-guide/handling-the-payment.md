# Handling the payment

## Overview

{% hint style="info" %}
For understanding the general principles of payment, please head to our [Payment](https://github.com/shopware/docs/tree/4dd18decd18d812c20a9c2b9c224299c519af522/concepts/commerce/checkout-concept/payments.md) article in the concepts section
{% endhint %}

In this guide, we'll go through the headless payment process in Shopware. You'll learn about the following things:

* Initiate a payment through the Store API
* Handle the outcome of the payment
* What is happening in the background?
* Additional caveats and notes

## Set the payment method

The payment method for an order is part of the users context. You can obtain the context using the `/context` endpoint. If you call that endpoint, you will be able to see the currently selected shipping method in `context.paymentMethod` . You can update the current payment method of the user by performing the following request before **placing** an order.

```javascript
// PATCH /store-api/context

{
  "paymentMethodId": "<new-payment-method-id>"
}
```

{% hint style="info" %}
How to find the [list of available payment methods](work-with-the-cart.md#payment-methods)?
{% endhint %}

## Initiate the payment

In Shopware, an order and a payment are handled separately. In other words, when an order is created the payment flow for that order is not initialised immediately.

Every order is created together with a transaction which contains information about the payment \(like amount, payment method and its current state\). In a newly created order the transaction has the `open` state.

We can initiate the payment using the handle payment endpoint as follows:

```javascript
// POST /store-api/handle-payment

{
  "orderId": "<id-of-the-order>",
  "finishUrl": "<url-for-successful-payment>",
  "errorUrl": "<url-for-unsuccessful-payment>"
}
```

First of all, we pass the `orderId` identifying the order we want to pay for. Now two cases, depending on the payment method and type of integration that can occur:

### Transmit additional payment details

Depending on the payment integration, you might have to provide some additional details when calling this endpoint, such as credit card information or bank account information. It is difficult to provide a common interface for all payment integrations, since flows, data and state changes can be various.

In order to provide a more common interface, we advise to use the **optional** parameter `paymentDetails` when calling the `/handle-payment` endpoint. A call could look like this:

```javascript
// POST /store-api/handle-payment

{
  "orderId": "<id-of-the-order>",
  "finishUrl": "<url-for-successful-payment>",
  "errorUrl": "<url-for-unsuccessful-payment>",
  "paymentDetails": {
    "creditCardId": "<credit-card-id>"
  }
}
```

The content or structure of the `paymentDetails` parameter would rely entirely on the implementation of the selected payment methods and is not standardised to any further extent.

You might need more data / persist data along with the customer which is either - not available when calling the endpoint - or - not supposed to be transmitted at that point - such as saved payment credentials, access tokens or secrets. This data should be transmitted through separate endpoints or be part of the plugin configuration.

## Payment Flows

Depending on the payment method, the user can flow can differ. The concept of asynchronous and synchronous payment handlers is described in our concepts article on [payments](https://github.com/shopware/docs/tree/4dd18decd18d812c20a9c2b9c224299c519af522/concepts/commerce/checkout-concept/payments.md).

**Synchronous payment**  
In the synchronous case, the endpoint simply triggers an action that handles the payment \(e.g. an external payment API\) and receives an immediate response.

**Asynchronous payment**  
In that case, the user flow is different, because the user gets redirected to an external website to perform the payment \(e.g. entering detailed information, logging in etc.\). Shopware will create a JWT \(JSON web token\) containing transaction-related information including:

* transaction identifier
* payment method identifier
* finish page URL
* error page URL

All this information will be assembled into a **return URL** for the external payment provider containing the token as a parameter `_sw_payment_token`. Together with this **return URL** \(neither the `finishUrl` nor the `errorUrl` - it's a Shopware endpoint\), Shopware will redirect your call to the external payment endpoint to let it conduct the payment.

After the payment has been conducted \(or if it has been cancelled\), the payment provider will redirect the user back to the API, calling the return URL provided before.

The endpoint called in this return URL is `/payment/finalize-transaction`. This method will internally decrypt the JWT \(which is still contained in the `_sw_payment_token` parameter\) and route the user depending on the outcome of the payment according to your `finishUrl` and `errorUrl`.

{% hint style="warning" %}
**Why does my payment status remain open after calling** `/handle-payment`**?**

After handling the payment, the state of your payment transaction might still remain `open`. It depends on how your payment integration \(or the payment provider\) handles they payment.

Some providers \(e.g. PayPal\) return immediate responses about the transactions' success. Some providers \(e.g. Stripe\) set up additional web hooks that allow the payment platform to asynchronously inform your store, that a payment has changed state. In those cases, please consult the documentation from these providers to get further details on their specific implementation.
{% endhint %}

## Handle Exceptions

If for some reason the payment wasn't successful \(or cancelled by the user, because they forgot their password\), you'd redirect them to a page where they can try an alternative payment method rather than just showing an error. Remember that, at this point, the order has already been created. However, its payment status is `cancelled` right now, since the payment wasn't successful.

Shopware provides a way to modify existing orders \(i.e. change the selected payment method\) and re-initiate the payment. Doing so involves two steps:

In order to alter the payment method for your order, call the **order payment** endpoint:

```javascript
// POST /store-api/order/payment

{
    "paymentMethodId": "1901dc5e888f4b1ea4168c2c5f005540",
    "orderId": "4139ce0f86fb47ff872a1ec88378f5d1"
}
```

Calling this endpoint will cause Shopware to cancel all existing payment transactions an create a single new transaction with the `open` state. Think of it like a "reset payment transactions" endpoint. Now that you've resetted the order payment, you can re-initiate the payment using the flow [described above](handling-the-payment.md#introduction).

