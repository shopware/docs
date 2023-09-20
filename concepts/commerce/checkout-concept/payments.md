---
nav:
  title: Payments
  position: 30

---

# Payments

Shopware 6 payment system is an integral part of the checkout process. A payment is applied to a transaction of an order. As with any order change, this is done through the state machine. At its core, the payment system is composed of payment handlers. These extend Shopware to support multiple different payment types. A list of all payment handlers is stored in the database.

::: info
If you want to directly skip to implementation details, then head to the [Add payment plugin](../../../guides/plugins/plugins/checkout/payment/add-payment-plugin) section.
:::

## Payment flow

The payment and checkout flow consist of two essential steps:

* Placing the order and
* Handling the payment

These steps are outlined in the diagram below:

![Headless payment flow](../../../.gitbook/assets/payment-flow-headless.png)

The diagram above shows the payment flow for headless environments; however, for the single-stack scenario (i.e., when the default Storefront is used) the differences are minor and described in the section below.

If you want to see a specific example of a headless payment using the Store API, head to [API documentation](https://shopware.stoplight.io/docs/store-api/docs/guides/quick-start/handling-the-payment.md).

### 1. Select payment method

The first step for a user is to select their desired payment. The current payment method is stored in the user context, which can be manipulated by calling the corresponding route or endpoint (`/store-api/context`).

### 2. Place order

In this step, an order is created. It takes no required parameters but creates the order based on the user's current context and cart. You can add additional information like tracking parameters or comments. Shopware creates the order internally together with an open transaction which acts as a placeholder for the payment.

A transaction contains information like a unique ID, the payment method, or the total amount to be paid. An order can have multiple transactions, but only a single one is created in this step.

#### 2.1 Prepare payment (optional)

Some payment integrations already create a payment reservation or authorization at this point. This totally depends on the specific payment extension and is not standardized by Shopware in any way. However, usually, some type of payment intent or transaction reference is stored in the meantime.

### 3. Handle payment

This step can only be executed after an order has been placed. It starts the payment by determining the correct payment handler for the selected payment method.

::: info
Although from a functional perspective, steps 2 and 3 are separated but in the default Storefront both are initiated in the same request.
:::

#### 3.1 Payment handler

There are two types of payment handlers in Shopware:

* **Synchronous payment**

In this scenario, the payment integration usually makes a request to the payment gateway to execute or authorize the payment. The gateway immediately responds with a status and Shopware can give feedback to the user.

* **Asynchronous payment**

These payments include a user redirect. The redirect target is defined by the payment integration and contains information about the transaction as well as a callback URL for the payment gateway.

The frontend can also define success and error URLs that will be used for the eventual redirect after step 3.3.

In the default Storefront, this redirect takes place automatically. In the headless scenario, Shopware returns the redirect URL within the  API response so that the frontend can perform the redirect.

#### 3.2 Payment execution on gateway (optional)

This step is only executed for asynchronous payments. After being redirected, the user can perform final checks or authorizations on the payment gateway UI. After that, the payment gateway redirects the user to the callback URL provided in step 3.1 along with a parameter indicating the outcome of the payment.

#### 3.3 Payment finalize (optional)

This step is only executed for asynchronous payments. It is triggered by the callback URL (which points to `/payment/finalize-transaction`) that has been provided to the payment gateway in step 3.1. Depending on the payment success, Shopware updates the transaction status and redirects the user to the corresponding finish page from step 3.

::: warning
**Disclaimer**

The actual implementation of payment integrations differs between providers. Therefore, our specification does not include any guidelines about payment states or specific API calls to be made. Some integrations share data between the steps or provide and call upon webhooks after the payment process has been finished. These implementations go beyond our standards.
:::

## Next steps

<PageRef page="../../../guides/plugins/plugins/checkout/payment/add-payment-plugin" />
