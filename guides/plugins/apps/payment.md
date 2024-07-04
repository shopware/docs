---
nav:
  title: Payment
  position: 20

---

# Payment

Starting with version `6.4.1.0`, Shopware also provides functionality for your app to be able to integrate payment providers.
You can choose between just a simple request for approval in the background \(synchronous payment\) and the customer being forwarded to a provider for payment \(asynchronous payment\).
You provide one or two endpoints, one for starting the payment and providing a redirect URL and one for finalization to check for the resulting status of the payment.
The requests and responses of all of your endpoints will be signed and feature JSON content.

## Prerequisites

You should be familiar with the concept of Apps, their registration flow as well as signing and verifying requests and responses between Shopware and the App backend server.

<PageRef page="app-base-guide" />

Your app server must be also accessible for the Shopware server.
You can use a tunneling service like [ngrok](https://ngrok.com/) for development.

## Manifest configuration

If your app should provide one or multiple payment methods, you need to define these in your manifest.
The created payment methods in Shopware will be identified by the name of your app and the identifier you define per payment method.
You should therefore not change the identifier after release, otherwise new payment methods will be created.

You may choose between a synchronous and an asynchronous payment method.
These two types are differentiated by defining a `finalize-url` or not.
If no `finalize-url` is defined, the internal Shopware payment handler will default to a synchronous payment.
If you do not want or need any communication during the payment process with your app, you can also choose not to provide a `pay-url`, then the payment will remain on open on checkout.

Below, you can see different definitions of payment methods.

Depending on the URLs you provide, Shopware knows which kind of payment flow your payment method supports.

<<< @/docs/snippets/config/app/payments.xml

## Synchronous payments

::: info
Be aware, that from Shopware 6.7.0.0 onwards your app-server **has to** respond with a payment state in its response, if you intend to change the transaction state.
:::

There are different types of payments.
Synchronous payment is the simplest of all and does not need any additional interaction with the customer.
If you have defined a `pay-url`, you can choose to be informed about and possibly process the payment or not.
If you do not need to communicate with your app, you can stop reading here and the transaction will stay open.
But if you do define a `pay-url`, you can respond to the request with a different transaction status like authorize, paid, or failed.
This is useful if you want to add a payment provider that only needs the information if the customer has already provided it in the checkout process or not.
For example, a simple credit check for payment upon invoice.
Below you can see an example of a simple answer from your app to mark a payment as authorized.

<Tabs>

<Tab title="HTTP">

Request content is JSON

```json5
{
  "source": {
    "url": "http:\/\/localhost:8000",
    "shopId": "hRCw2xo1EDZnLco4",
    "appVersion": "1.0.0"
  },
  "orderTransaction": {
    //...
  },
  "order": {
    //...
  }
}
```

Refer to an example on [payment payload](https://github.com/shopware/app-php-sdk/blob/main/tests/Context/_fixtures/payment.json) and the response should look like this:

```json5
{
  "status": "authorize"
}
```

Refer to possible [status values](#all-possible-payment-states).
Failing states can also have a `message` property with the reason, which will be logged and could be seen as information for the merchant.

```json5
{
  "status": "authorize",
  "message": "The customer failed to pass the credit check."
}
```

</Tab>

<Tab title="App PHP SDK">

```php
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Shopware\App\SDK\Shop\ShopResolver;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Response\PaymentResponse;

function myController(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($serverRequest);
    $payment = $contextResolver->assemblePaymentPay($serverRequest, $shop);
    
    // implement your logic here based on the information provided in $payment
    
    // check PaymentResponse class for all available payment states
    return $signer->signResponse(PaymentResponse::paid(), $shop);
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
use Shopware\App\SDK\Context\Payment\PaymentPayAction;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Shopware\App\SDK\Response\PaymentResponse;
use Psr\Http\Message\ResponseInterface;

#[AsController]
class PaymentController {
    #[Route('/payment/pay')]
    public function handle(PaymentPayAction $payment): ResponseInterface
    {
        // handle payment
        
        return PaymentResponse::paid();
    }
}
```

</Tab>

</Tabs>

## Asynchronous payments

::: info
Be aware, that from Shopware 6.7.0.0 onwards your app-server **has to** respond with a payment state in its response, if you intend to change the transaction state.
:::

Asynchronous payments are more complicated than synchronous payments.
They require interaction with the customer and a redirect to the payment provider, such as PayPal or Stripe.

Here is how it works:

* Shopware sends the first pay `POST` request to start the payment with the payment provider.
  The request includes all necessary data such as the `order`, `orderTransaction`, and a `returnUrl`,
  where the customer should be redirected once the payment process with the payment provider has been finished.
* Your app server returns a response with a `redirectUrl` to the payment provider.
* The browser will be redirected to this URL and processes his order,
  and the payment provider will redirect the customer back to the `returnUrl` provided in the first request.
* Shopware sends a second `POST` request to the `finalize-url` with the `orderTransaction` and all the query parameters passed by the payment provider to Shopware.
* Your app server responds with a `status` and, if necessary a `message`, like in the synchronous payment.

<Tabs>

<Tab title="HTTP">

Request content is JSON

```json5
{
  "source": {
    "url": "http:\/\/localhost:8000",
    "shopId": "hRCw2xo1EDZnLco4",
    "appVersion": "1.0.0"
  },
  "orderTransaction": {
    //...
  },
  "order": {
    //...
  },
  "returnUrl": "https://shop.com/checkout/...."
}
```

You can find an example refund payload [here](https://github.com/shopware/app-php-sdk/blob/main/tests/Context/_fixtures/payment.json)

and your response should look like this:

```json5
{
  "redirectUrl": "https://payment.app/customer/gotoPaymentProvider"
}
```

</Tab>

<Tab title="App PHP SDK">

```php
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Shopware\App\SDK\Shop\ShopResolver;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Response\PaymentResponse;

function pay(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($serverRequest);
    $payment = $contextResolver->assemblePaymentPay($serverRequest, $shop);
    
    // Implement your logic here based on the information provided in $payment. 
    // Payment providers should redirect the customer to $payment->returnUrl once the payment process has been finished.
    
    return $signer->signResponse(PaymentResponse::redirect($paymentProviderRediectUrl), $shop);
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
use Shopware\App\SDK\Context\Payment\PaymentPayAction;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Shopware\App\SDK\Response\PaymentResponse;
use Psr\Http\Message\ResponseInterface;

#[AsController]
class PaymentController {
    #[Route('/payment/pay')]
    public function handle(PaymentPayAction $payment): ResponseInterface
    {
        // handle payment
        
        return PaymentResponse::redirect($myPaymentUrl);
    }
}
```

</Tab>

</Tabs>

The second `finalize` POST request will be called once the customer has been redirected back to the shop.
This second request is only provided with the `orderTransaction` for identification purposes and `requestData` with all query parameters passed by the payment provider.
The response `status` value determines the outcome of the payment, e.g.:

| Status      | Description                                                     |
|:------------|:----------------------------------------------------------------|
| `cancel`    | Customer has aborted the payment at the payment provider's site |
| `fail`      | Payment has failed \(e.g. missing funds\)                       |
| `paid`      | Successful immediate payment                                    |
| `authorize` | Delayed payment                                                 |

<Tabs>

<Tab title="HTTP">

Request content is JSON

```json5
{
  "source": {
    "url": "http:\/\/localhost:8000",
    "shopId": "hRCw2xo1EDZnLco4",
    "appVersion": "1.0.0"
  },
  "orderTransaction": {
    //...
  },
  "requestData": {
    //...
  }
}
```

and your response should look like this:

```json5
{
  "status": "paid"
}
```

Refer possible [status values](#all-possible-payment-states).
Failing states can also have a `message` property with the reason, which will be logged and could be seen as information for the merchant.

```json5
{
  "status": "authorize",
  "message": "The customer failed to pass the credit check."
}
```

</Tab>

<Tab title="App PHP SDK">

```php
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Shopware\App\SDK\Shop\ShopResolver;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Response\PaymentResponse;

function finalize(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($serverRequest);
    $payment = $contextResolver->assemblePaymentFinalize($serverRequest, $shop);
    
    // implement your logic here based on the information provided in $payment
    
    // check PaymentResponse class for all available payment states
    return $signer->signResponse(PaymentResponse::paid(), $shop);
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
use Shopware\App\SDK\Context\Payment\PaymentFinalizeAction;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Shopware\App\SDK\Response\PaymentResponse;
use Psr\Http\Message\ResponseInterface;

#[AsController]
class PaymentController {
    #[Route('/payment/finalize')]
    public function handle(PaymentFinalizeAction $payment): ResponseInterface
    {
        // handle payment
        
        return PaymentResponse::paid();
    }
}
```

</Tab>

</Tabs>

## Prepared payments

With Shopware `6.4.9.0`, you can use prepared payments to enhance your checkout process beyond forwarding to a payment provider.
This feature enables you to integrate more deeply into the checkout process.
This method allows you to prepare the payment before placing the order, e.g., with credit card fields on the checkout confirmation page.
Once you add specific parameters to the order placement request in the Storefront, which is also known as the checkout confirmation form, you can pass these parameters to your prepared payment handler.
This enables your payment handler to capture the payment successfully when the order is placed.

For this, you have two calls available during the order placement, the `validate` call to verify,
that the payment reference is valid and if not, stop the placement of the order, and the `pay` call,
which then allows the payment to be processed to completion after the order has been placed and persisted.

Let's first talk about the `validate` call.
Here, you will receive three items to validate your payment.
The `cart` with all its line items, the `requestData` from the `CartOrderRoute` request and the current `salesChannelContext`.
This allows you to validate, if the payment reference you may have given your payment handler via the Storefront implementation is valid and will be able to be used to pay the order which is about to be placed.
The array data you may send as the `preOrderPayment` object in your response will be forwarded to your `pay` call, so you don't have to worry about identifying the order by looking at the cart from the `validate` call.
If the payment is invalid, either return a response with an error response code or provide a `message` in your response.

::: info
Be aware, that from Shopware 6.7.0.0 onwards your app-server **has to** respond with a payment state in its response, if you intend to change the transaction state.
:::

<Tabs>

<Tab title="HTTP">

Request content is JSON

```json5
{
  "source": {
    "url": "http:\/\/localhost:8000",
    "shopId": "hRCw2xo1EDZnLco4",
    "appVersion": "1.0.0"
  },
  "cart": {
    //...
  },
  "requestData": {
    //...
  },
  "salesChannelContext": {
    //...
  }
}
```

You can refer to an example on [validation payload](https://github.com/shopware/app-php-sdk/blob/main/tests/Context/_fixtures/payment-validation.json) and your response looks like this:

```json5
{
  "preOrderPayment": {
    "myCustomReference": "1234567890"
  }
}
```

this will be forwarded to the `pay` call afterward.

</Tab>

<Tab title="App PHP SDK">

```php
use Psr\Http\Message\RequestInterface;
use Shopware\App\SDK\Shop\ShopResolver;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Response\PaymentResponse;

function validate(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($serverRequest);
    $payment = $contextResolver->assemblePaymentValidate($serverRequest, $shop);
    
    // implement your logic here based on the information provided in $payment
    
    // check PaymentResponse class for all available payment states
    return $signer->signResponse(PaymentResponse::validateSuccess(['myCustomReference' => '1234567890']), $shop);
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
use Shopware\App\SDK\Context\Payment\PaymentValidateAction;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Shopware\App\SDK\Response\PaymentResponse;
use Psr\Http\Message\ResponseInterface;

#[AsController]
class PaymentController {
    #[Route('/payment/pay')]
    public function handle(PaymentValidateAction $payment): ResponseInterface
    {
        // handle payment
        
        return PaymentResponse::validateSuccess(['myCustomReference' => '1234567890']);
    }
}
```

</Tab>

</Tabs>

If the payment has been validated and the order has been placed, you then receive another call to your `pay` endpoint.
You will receive the `order`, the `orderTransaction` and also the `preOrderPayment` array data, that you have sent in your validate call.

<Tabs>

<Tab title="HTTP">

Request content is JSON

```json5
{
  "source": {
    "url": "http:\/\/localhost:8000",
    "shopId": "hRCw2xo1EDZnLco4",
    "appVersion": "1.0.0"
  },
  "orderTransaction": {
    //...
  },
  "order": {
    //...
  },
  "preOrderPayment": {
    //...
  }
}
```

and your response should look like this:

```json5
{
  "status": "authorize"
}
```

You can find all possible status values [here](#all-possible-payment-states).
Failing states can also have a `message` property with the reason, which will be logged and could be seen as information for the merchant.

```json5
{
  "status": "authorize",
  "message": "The customer failed to pass the credit check."
}
```

</Tab>

<Tab title="App PHP SDK">

```php
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Shopware\App\SDK\Shop\ShopResolver;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Response\PaymentResponse;

function pay(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($serverRequest);
    $payment = $contextResolver->assemblePaymentCapture($serverRequest, $shop);
    
    // contains your passed data from the validate call (preOrderPayment)
    $payment->requestData
    
    // implement your logic here based on the information provided in $payment
    
    // check PaymentResponse class for all available payment states
    return $signer->signResponse(PaymentResponse::paid(), $shop);
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
use Shopware\App\SDK\Context\Payment\PaymentCaptureAction;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Shopware\App\SDK\Response\PaymentResponse;
use Psr\Http\Message\ResponseInterface;

#[AsController]
class PaymentController {
    #[Route('/payment/pay')]
    public function handle(PaymentCaptureAction $payment): ResponseInterface
    {
        // handle payment
        
        return PaymentResponse::paid();
    }
}
```

</Tab>

</Tabs>

::: warning
Keep in mind that if the integration into the checkout process does not work as expected,
your customer might not be able to use the prepared payment.
This is especially valid for after order payments, since there the order already exists.
For these cases, you should still offer a traditional synchronous / asynchronous payment flow.
Don't worry, if you have set the transaction state in your capture call to anything but open, the asynchronous payment process will not be started immediately after the prepared payment flow.
:::

## Refund

With Shopware `6.4.12.0`, we have also added basic functionality to be able to refund payments.
Your app will need to register captured amounts and create and persist a refund beforehand for Shopware to be able to process a refund of a capture.

Similar to the other requests, on your `refund` call you will receive the data required to process your refund.
This is the `order` with all its details and also the `refund` which holds the information on the `amount`, the referenced `capture` and, if provided, a `reason` and specific `positions` which items are being refunded.

::: info
Be aware, that from Shopware 6.7.0.0 onwards your app-server **has to** respond with a payment state in its response, if you intend to change the transaction state.
:::

<Tabs>

<Tab title="HTTP">

Request content is JSON

```json5
{
  "source": {
    "url": "http:\/\/localhost:8000",
    "shopId": "hRCw2xo1EDZnLco4",
    "appVersion": "1.0.0"
  },
  "order": {
    //...
  },
  "refund": {
    //...
  }
}
```

You can refer to [refund payload](https://github.com/shopware/app-php-sdk/blob/main/tests/Context/_fixtures/refund.json) example and your response should look like this:

```json5
{
  "status": "completed"
}
```

</Tab>

<Tab title="App PHP SDK">

```php
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Shopware\App\SDK\Shop\ShopResolver;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Response\RefundResponse;

function refund(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($serverRequest);
    $payment = $contextResolver->assemblePaymentRefund($serverRequest, $shop);
    
    // implement your logic here based on the information provided in $payment
    
    // check RefundResponse class for all available refund states
    return $signer->signResponse(RefundResponse::completed(), $shop);
}
```

</Tab>

</Tabs>

## Recurring captures

::: info
Recurring orders and payments require the Subscriptions feature, available exclusively in our [paid plans](https://www.shopware.com/en/pricing/).
:::

Recurring payments are a special case of payment that is used for handling recurring orders, such as subscriptions.
The request and response payloads are similar to the synchronous payment flow.
At this point, a valid running billing agreement between the customer and the PSP should exist.
Use any of the other payment flows to capture the initial order and create such an agreement during the checkout.
Afterward, this flow can capture the payment for every recurring payment order.

::: info
Be aware, that from Shopware 6.7.0.0 onwards your app-server **has to** respond with a payment state in its response, if you intend to change the transaction state.
:::

<Tabs>

<Tab title="HTTP">

Request content is JSON

```json5
{
  "source": {
    "url": "http:\/\/localhost:8000",
    "shopId": "hRCw2xo1EDZnLco4",
    "appVersion": "1.0.0"
  },
  "orderTransaction": {
    //...
  },
  "order": {
    //...
  }
}
```

You can refer to an example on [recurring capture payload](https://github.com/shopware/app-php-sdk/blob/main/tests/Context/_fixtures/payment.json) and your response looks like this:

```json5
{
  "status": "paid"
}
```

</Tab>

<Tab title="App PHP SDK">

```php
use Psr\Http\Message\RequestInterface;
use Shopware\App\SDK\Shop\ShopResolver;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Response\PaymentResponse;

function validate(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($serverRequest);
    $payment = $contextResolver->assemblePaymentRecurringCapture($serverRequest, $shop);
    
    // implement your logic here based on the information provided in $payment
    
    // check PaymentResponse class for all available payment states
    return $signer->signResponse(PaymentResponse::paid(), $shop);
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
use Shopware\App\SDK\Context\Payment\PaymentPayAction;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Shopware\App\SDK\Response\PaymentResponse;
use Psr\Http\Message\ResponseInterface;

#[AsController]
class PaymentController {
    #[Route('/payment/pay')]
    public function handle(PaymentPayAction $payment): ResponseInterface
    {
        // handle recurring payment capture
        
        return PaymentResponse::paid();
    }
}
```

</Tab>

</Tabs>

## All possible payment states

The following lists are all possible payment state options:

* `open` - The payment is open and can be processed
* `paid` - The payment has been paid
* `cancelled` - The payment has been canceled
* `refunded` - The payment has been refunded
* `failed` - The payment has failed
* `authorize` - The payment has been authorized
* `unconfirmed` - The payment has not been confirmed yet
* `in_progress` - The payment is in progress
* `reminded` - The payment has been reminded
* `chargeback` - The payment has been charged back

## All possible refund states

The following lists are all possible refund state options:

* `open` - The refund is open and can be processed
* `in_progress` - The refund is in progress
* `cancelled` - The refund has been canceled
* `failed` - The refund has failed
* `completed` - The refund has been refunded

## API docs

You can further take a look at [Payment references](../../../resources/references/app-reference/payment-reference).
