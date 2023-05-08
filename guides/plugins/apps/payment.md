# Payment

Starting with version 6.4.1.0, Shopware also provides functionality for your app to be able to integrate payment providers. You can choose between just a simple request for approval in the background \(synchronous payment\) and the user being forwarded to a provider for payment \(asynchronous payment\). You provide one or two endpoints, one for starting the payment and providing a redirect URL and one for finalization to check for the resulting status of the payment. The requests and responses of all of your endpoints will be signed and feature JSON content.

## Prerequisites

You should be familiar with the concept of Apps, their registration and signing and verifying of requests and responses.

{% page-ref page="app-base-guide.md" %}

Your app-server should be also accessible for the Shopware server.
You can use a tunneling service like [ngrok](https://ngrok.com/) for development.

## Manifest configuration

If your app should provide one or multiple payment methods, you need to define these in your manifest. The created payment methods in Shopware will be identified by the name of your app and the identifier you define per payment method. You should therefore not change the identifier after release, otherwise new payment methods will be created.

You may choose between a synchronous and an asynchronous payment method. These two types are differentiated by defining a `finalize-url` or not. If no `finalize-url` is defined, the internal Shopware payment handler will default to a synchronous payment. If you do not want or need any communication during the payment process with your app, you can also choose not to provide a `pay-url`, then the payment will remain on open on checkout.

Below you can see three different definitions of payment methods.

{% code title="manifest.xml" %}

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
        <!-- The name of the app should not change. Otherwise, all payment methods are created as duplicates. -->
        <name>PaymentApp</name>
        <!-- ... -->
    </meta>

    <payments>
        <payment-method>
            <!-- The identifier of the payment method should not change. Otherwise, a separate method is created. -->
            <identifier>asynchronousPayment</identifier>
            <name>Asynchronous payment</name>
            <name lang="de-DE">Asynchrone Zahlung</name>
            <description>This payment method requires forwarding to payment provider.</description>
            <description lang="de-DE">Diese Zahlungsmethode erfordert eine Weiterleitung zu einem Zahlungsanbieter.</description>
            <pay-url>https://payment.app/async/pay</pay-url>
            <finalize-url>https://payment.app/async/finalize</finalize-url>
            <!-- This optional path to this icon must be relative to the manifest.xml -->
            <icon>Resources/paymentLogo.png</icon>
        </payment-method>

        <payment-method>
            <!-- The identifier of the payment method should not change. Otherwise a separate method is created. -->
            <identifier>synchronousPayment</identifier>
            <name>Synchronous payment</name>
            <name lang="de-DE">Synchrone Zahlung</name>
            <description>This payment method does everything in one request.</description>
            <description lang="de-DE">Diese Zahlungsmethode arbeitet in einem Request.</description>
            <!-- This URL is optional for synchronous payments (see below). -->
            <pay-url>https://payment.app/sync/process</pay-url>
        </payment-method>

        <payment-method>
            <!-- The identifier of the payment method should not change. Otherwise a separate method is created. -->
            <identifier>simpleSynchronousPayment</identifier>
            <name>Simple Synchronous payment</name>
            <name lang="de-DE">Einfache synchrone Zahlung</name>
            <description>This payment will not do anything and stay on 'open' after order.</description>
            <description lang="de-DE">Diese Zahlungsmethode wird die Transaktion auf 'offen' belassen.</description>
            <!-- No URL is provided. -->
        </payment-method>

        <payment-method>
            <!-- The identifier of the payment method should not change. Otherwise a separate method is created. -->
            <identifier>preparedPayment</identifier>
            <name>Payment, that offers everything</name>
            <name lang="de-DE">Eine Zahlungsart, die alles kann</name>
            <validate-url>https://payment.app/prepared/validate</validate-url>
            <capture-url>https://payment.app/prepared/capture</capture-url>
            <!-- This optional path to this icon must be relative to the manifest.xml -->
            <icon>Resources/paymentLogo.png</icon>
        </payment-method>
    </payments>
</manifest>
```

{% endcode %}

## Synchronous payments

There are two types of payments: synchronous and other kinds like advanced payment or collect on delivery.
Synchronous payments are simple and don't need any extra interaction with the user.
If you have defined a pay-url, you can choose to be informed about and possibly process the payment or not.
If you don't need to communicate with your app, you can stop reading here and the transaction will stay open.
But if you do define a pay-url, you can respond to the request with a different transaction status like authorize, paid,
or fail.
This is useful
if you want
to add a payment provider that only needs the information the user has already provided in the checkout process
and no extra information is needed.
For example, a simple credit check for payment upon invoice.
Below you can see an example of a simple answer from your app to mark a payment as authorized.

{% tabs %}

{% tab title="HTTP" %}

Request content is JSON

```json
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

and your response should look like this:

```json
{
  "status": "authorize"
}
```

You can find all possible status values [here](#all-possible-payment-states).
Failing states can have also a `message` property with the reason displayed to the user.

```json
{
  "status": "authorize",
  "message": "The customer failed to pass the credit check."
}
```

{% endtab %}

{% tab title="App PHP SDK" %}

```php
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

{% endtab %}

{% endtabs %}

## Asynchronous payments

Asynchronous payments are more complicated than synchronous payments.
They require interaction with the user and a redirect to the payment provider such as PayPal or Stripe.

Here’s how it works:

- Shopware sends the first pay POST request to start the payment with the payment provider.
  The request includes all necessary data such as the `order`, `orderTransaction`, and a `returnUrl`,
  where the user should be redirected once the payment process with the payment provider has been finished.
- Our app server returns a response with a `redirectUrl` to the payment provider.
- The browser will be redirected to this URL and processes his order, and the payment provider will redirect the user
  back to the `returnUrl` provided in the first request.
- Shopware sends a second POST request to the `finalize-url` with the `orderTransaction` and all the query parameters passed by the payment provider to Shopware.
- Our app server responds with a `status` and a `message` if necessary like in the synchronous payment.

{% tabs %}

{% tab title="HTTP" %}

Request content is JSON

```json
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

```json
{
  "redirectUrl": "https://payment.app/user/gotoPaymentProvider"
}
```

{% endtab %}

{% tab title="App PHP SDK" %}

```php
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
    // Payment providers should redirect the user to $payment->returnUrl once the payment process has been finished.
    
    return $signer->signResponse(PaymentResponse::redirect($paymentProviderRediectUrl), $shop);
}
```

{% endtab %}

{% endtabs %}

The second `finalize` POST request will be called once the user has been redirected back to the shop.
This second request is only provided with the `orderTransaction` for identification purposes and `requestData` with all query parameters
passed by the payment provider.
The response `status` value determines the outcome of the payment, e.g.:

| Status      | Description                                                 |
|:------------|:------------------------------------------------------------|
| `cancel`    | User has aborted the payment at the payment provider's site |
| `fail`      | Payment has failed \(e.g. missing funds\)                   |
| `paid`      | Successful immediate payment                                |
| `authorize` | Delayed payment                                             |

{% tabs %}

{% tab title="HTTP" %}

Request content is JSON

```json
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

```json
{
  "status": "paid"
}
```

You can find all possible status values [here](#all-possible-payment-states).
Failing states can have also a `message` property with the reason displayed to the user.

```json
{
  "status": "authorize",
  "message": "The customer failed to pass the credit check."
}
```

{% endtab %}

{% tab title="App PHP SDK" %}

```php
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

{% endtab %}

{% endtabs %}

## Prepared payments

If you would like to not only offer forwarding to a payment provider,
but integrate more deeply into the checkout process,
with Shopware 6.4.9.0, and later you might like to use prepared payments.
This method allows you to prepare the payment already before the order is placed,
e.g. with credit card fields on the checkout confirmation page.
By adding parameters to the order placement request --
in the Storefront, this is the checkout confirmation form --
you can then hand your prepared payment handler the parameters
to successfully capture the payment when the order is placed.

For this, you have two calls available during the order placement, the `validate` call to verify, that the payment reference is valid and if not, stop the placement of the order, and the `capture` call, which then allows the payment to be processed to completion after the order has been placed and persisted.

Let's first talk about the `validate` call. Here, you will receive three items to validate your payment. The `cart` with all its line items, the `requestData` from the `CartOrderRoute` request and the current `salesChannelContext`. This allows you to validate, if the payment reference you may have given your payment handler via the Storefront implementation is valid and will be able to be used to pay the order which is about to be placed. The array data you may send as the `preOrderPayment` object in your response will be forwarded to your `capture` call, so you don't have to worry about identifying the order by looking at the cart from the `validate` call. If the payment is invalid, either return a response with an error response code or provide a `message` in your response.

{% tabs %}

{% tab title="HTTP" %}

Request content is JSON

```json
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

You can find an example validation payload [here](https://github.com/shopware/app-php-sdk/blob/main/tests/Context/_fixtures/payment-validation.json)

and your response should look like this:

```json
{
  "preOrderPayment": {
    "myCustomReference": "1234567890"
  }
}
```

this will be forwarded to the `capture` call afterward.

{% endtab %}

{% tab title="App PHP SDK" %}

```php
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
    return $signer->signResponse(PaymentResponse::validateSuccess(['myCustomReference' => '1234567890'], $shop);
}
```

{% endtab %}

{% endtabs %}

If the payment has been validated and the order has been placed, you then receive another call to your `capture` endpoint. You will receive the `order`, the `orderTransaction` and also the `preOrderPayment` array data, that you have sent in your validate call.

{% tabs %}

{% tab title="HTTP" %}

Request content is JSON

```json
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

```json
{
  "status": "authorize"
}
```

You can find all possible status values [here](#all-possible-payment-states).
Failing states can have also a `message` property with the reason displayed to the user.

```json
{
  "status": "authorize",
  "message": "The customer failed to pass the credit check."
}
```

{% endtab %}

{% tab title="App PHP SDK" %}

```php
use Shopware\App\SDK\Shop\ShopResolver;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Response\PaymentResponse;

function capture(RequestInterface $request): ResponseInterface
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

{% endtab %}

{% endtabs %}

{% hint style="warning" %}
Keep in mind that if the integration into the checkout process does not work as expected, your customer might not be able to use the prepared payment. This is especially valid for after order payments, since there the order already exists. For these cases, you should still offer a traditional synchronous / asynchronous payment flow. Don't worry, if you have set the transaction state in your capture call to anything but open, the asynchronous payment process will not be started immediately after the prepared payment flow.
{% endhint %}

## Refund

With Shopware 6.4.12.0, we have also added basic functionality to be able to refund payments. Your app will need to register captured amounts and create and persist a refund beforehand for Shopware to be able to process a refund of a capture.

Similar to the other requests, on your `refund` call you will receive the data required to process your refund. This is the `order` with all its details and also the `refund` which holds the information on the `amount`, the referenced `capture` and, if provided, a `reason` and specific `positions` which items are being refunded.

{% tabs %}

{% tab title="HTTP" %}

Request content is JSON

```json
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

You can find an example refund payload [here](https://github.com/shopware/app-php-sdk/blob/main/tests/Context/_fixtures/refund.json)

and your response should look like this:

```json
{
  "status": "completed"
}
```

{% endtab %}

{% tab title="App PHP SDK" %}

```php
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

{% endtab %}

{% endtabs %}

## All possible payment states

The following lists are all possible payment state options:

- `open` - The payment is open and can be processed
- `paid` - The payment has been paid
- `cancelled` - The payment has been canceled
- `refunded` - The payment has been refunded
- `failed` - The payment has failed
- `authorized` - The payment has been authorized
- `unconfirmed` - The payment has not been confirmed yet
- `in_progress` - The payment is in progress
- `reminded` - The payment has been reminded
- `chargeback` - The payment has been charged back

## All possible refund states

The following lists are all possible refund state options:

- `open` - The refund is open and can be processed
- `in_progress` - The refund is in progress
- `cancelled` - The refund has been canceled
- `failed` - The refund has failed
- `completed` - The refund has been refunded

## API docs

{% page-ref page="../../../resources/references/app-reference/payment-reference.md" %}
