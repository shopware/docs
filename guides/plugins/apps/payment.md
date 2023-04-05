# Payment

Starting with version 6.4.1.0, Shopware also provides functionality for your app to be able to integrate payment providers. You can choose between just a simple request for approval in the background \(synchronous payment\) and the user being forwarded to a provider for payment \(asynchronous payment\). You provide one or two endpoints, one for starting the payment and providing a redirect URL and one for finalization to check for the resulting status of the payment. The requests and responses of all of your endpoints will be signed and feature JSON content.

## Prerequisites

You should be familiar with the concept of Apps and their registration.

<PageRef page="app-base-guide" />

To reproduce this example, you should also be aware of how to set up an app on your development platform.

<PageRef page="local-development/" />

## Manifest configuration

If your app should provide one or multiple payment methods, you need to define these in your manifest. The created payment methods in Shopware will be identified by the name of your app and the identifier you define per payment method. You should therefore not change the identifier after release, otherwise new payment methods will be created.

You may choose between a synchronous and an asynchronous payment method. These two types are differentiated by defining a `finalize-url` or not. If no `finalize-url` is defined, the internal Shopware payment handler will default to a synchronous payment. If you do not want or need any communication during the payment process with your app, you can also choose not to provide a `pay-url`, then the payment will remain on open on checkout.

Below you can see three different definitions of payment methods.

```xml
// manifest.xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-2.0.xsd">
    <meta>
        <!-- The name of the app should not change. Otherwise all payment methods are created as duplicates. -->
        <name>PaymentApp</name>
        <!-- ... -->
    </meta>

    <payments>
        <payment-method>
            <!-- The identifier of the payment method should not change. Otherwise a separate method is created. -->
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
            <identifier>allBellsAndWhistlesPayment</identifier>
            <name>Payment, that offers everything</name>
            <name lang="de-DE">Eine Zahlungsart, die alles kann</name>
            <pay-url>https://payment.app/async/pay</pay-url>
            <finalize-url>https://payment.app/async/finalize</finalize-url>
            <validate-url>https://payment.app/prepared/validate</validate-url>
            <capture-url>https://payment.app/prepared/capture</capture-url>
            <refund-url>https://payment.app/refund</refund-url>
            <!-- This optional path to this icon must be relative to the manifest.xml -->
            <icon>Resources/paymentLogo.png</icon>
        </payment-method>
    </payments>
</manifest>
```

## Synchronous payments

Synchronous payments are the more simple kind of payments without any further interaction with the user. You have two different kind of options here. Depending on if you have defined a `pay-url`, you can choose to be informed about - and possibly process - a payment or not.

If you would just like to define another payment method like _advanced payment_ or _collect on delivery_, where the owner of the shop will manually mark the payment as `paid` later, you can stop reading this guide here, because no communication with your app is required. The transaction will remain on the status `open`.

On the other hand, if you define a `pay-url`, you have the option to respond on this request with a different transaction status, for example `authorize`, `paid`or `fail`. This is useful if you would like to add a payment provider which only need the information the user has already provided in the checkout process and no additional information is required. This could be - for example - a simple credit check for payment upon invoice.

Below you can see an example for a simple answer from your app to mark a payment as authorized. You can see two methods, `checkSignature` and `sign`, for both of these see the section [Validation](payment.md#validation). The provided status should be the transistion name for the transaction based on the previous status `open`.

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/sync/process", name="sync.process", methods={"POST"})
 */
public function processSynchronousPayment(Request $request): JsonResponse
{
      // more on this in section "Validation"
      $this->checkSignature($request);

      $content = \json_decode($request->getContent(), true);

      // implement your logic here based on the information provided in $content
      $response = [ 'status' => 'authorize' ];

      // this returns a json encoded response with the `shopware-app-signature` in the header
      return $this->sign($response, $content['source']['shopId']);
}
```

Instead of a successful response, you can also provide a failed response with a message \(which will be logged\) like this:

```php
$response = [
    'status' => 'fail',
    'message' => 'The customer failed to pass the credit check.',
];
```

::: warning
Keep in mind that just by providing a `message`, the payment will default to status `fail`.
:::

## Asynchronous payments

Asynchronous payments are more complicated and rely on interaction with the user and therefore a redirect to the payment provider. For example, this might be an integration with _PayPal_ or _Stripe_. The following process applies:

Shopware sends the first `pay` POST request, which is supposed to start the payment with the payment provider. All necessary data is provided: the `order`, `orderTransaction`, and a `returnUrl`, where the user should be redirected once the payment process with the payment provider has been finished. If everything is correct and the payment process is ready to start, the response to this request must be a `redirectUrl`, where the user is redirected to by Shopware. In case the payment can't be started \(for example, because of missing credentials for the shop\), the response can return a `fail` status and/or a `message`. If you provide a message, the payment process will fail automatically and a generic error message is shown to the user. The provided message will be shown in the log files.

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/async/pay", name="async.pay", methods={"POST"})
 */
public function startAsyncPayment(Request $request): JsonResponse
{
    // more on this in section "Validation"
    $this->checkSignature($request);

    $content = json_decode($request->getContent(), true);

    // you can identify the transaction later on with the orderTransactionId
    $transactionId = $content['orderTransaction']['id'];

    // implement your logic here based on the information provided in $content
    // you should save the transactionId for later identification in the second request and in the user redirection
    $response = [ 'redirectUrl' => sprintf('https://payment.app/user/go/here/%s/', $transactionId) ];

    // this returns a json encoded response with the `shopware-app-signature` in the header
    return $this->sign($response, $content['source']['shopId']);
}
```

The second `finalize` POST request will be called once the user has been redirected that your app or your payment provider should back to the shop. This second request is only provided with the `orderTransaction` for identification purposes. The response `status` value determines the outcome of the payment, e.g.:

| Status | Description |
| :--- | :--- |
| `cancel` | User has aborted the payment at the payment provider's site |
| `fail` | Payment has failed \(e.g. missing funds\) |
| `paid` | Successful immediate payment |
| `authorize` | Delayed payment |

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/async/finalize", name="async.finalize", methods={"POST"})
 */
public function finalizeAsyncPayment(Request $request): JsonResponse
{
    // more on this in section "Validation"
    $this->checkSignature($request);

    $content = json_decode($request->getContent(), true);

    // you can identify the transaction again with the orderTransactionId
    $transactionId = $content['orderTransaction']['id'];
    $status = $this->getStatusFromPaymentProvider($transactionId);

    // implement your logic here based on the information provided in $content
    // you should save the transactionId for later identification in the second request and in the user redirection
    $response = [ 'status' => $status ];

    // this returns a json encoded response with the `shopware-app-signature` in the header
    return $this->sign($response, $content['source']['shopId']);
}

private function getStatusFromPaymentProvider(string $transactionId): string
{
    // check with the payment provider here to receive the final status
    return 'paid';
}
```

Instead of a successful response, you can also provide a failed response with a message \(which will be logged\) like this:

```php
$response = [
    'status' => 'fail',
    'message' => 'The customer failed to pass the credit check.',
];
```

::: warning
Keep in mind that just by providing a `message` in either request response, the payment will default to status `fail`, except if you also provide the status `cancel` in the `finalize` request.
:::

## Prepared payments

If you would like to not only offer forwarding to a payment provider, but integrate more deeply into the checkout process, with Shopware 6.4.9.0 and later you might like to use prepared payments. This method allows you to prepare the payment already before the order is placed, e.g. with credit card fields on the checkout confirm page. By adding parameters to the order placement request -- in the Storefront, this is the checkout confirm form -- you can then hand your prepared payment handler the parameters to successfully capture the payment when the order is placed.

For this, you have two calls available during the order placement, the `validate` call to verify, that the payment reference is valid and if not, stop the placement of the order, and the `capture` call, which then allows the payment to be processed to completion after the order has been placed and persisted.

Let's first talk about the `validate` call. Here, you will receive three items to validate your payment. The `cart` with all its line items, the `requestData` from the `CartOrderRoute` request and the current `salesChannelContext`. This allows you to validate, if the payment reference you may have given your payment handler via the Storefront implementation is valid and will be able to be used to pay the order which is about to be placed. The array data you may send as the `preOrderPayment` object in your response will be forwarded to your `capture` call, so you don't have to worry about identifying the order by looking at the cart from the `validate` call. If the payment is invalid, either return a response with an error response code or provide a `message` in your response.

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/prepared/validate", name="prepared.validate", methods={"POST"})
 */
public function validatePreparedPayment(Request $request): JsonResponse
{
    // more on this in section "Validation"
    $this->checkSignature($request);

    $content = json_decode($request->getContent(), true);

    // you may validate your payment now with e.g. this data
    $yourPaymentReference = $content['requestData']['myAppPaymentId'];
    $cartAmount = $content['cart']['price']['totalPrice'];

    // this helps you later identify the payment reference in your capture call
    $response = [ 'preOrderPayment' => ['paymentId' => $yourPaymentReference] ];

    // this returns a json encoded response with the `shopware-app-signature` in the header
    return $this->sign($response, $content['source']['shopId']);
}
```

If the payment has been validated and the order has been placed, you then receive another call to your `capture` endpoint. You will receive the `order`, the `orderTransaction` and also the `preOrderPayment` array data, that you have sent in your validate call.

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/prepared/capture", name="prepared.capture", methods={"POST"})
 */
public function capturePreparedPayment(Request $request): JsonResponse
{
    // more on this in section "Validation"
    $this->checkSignature($request);

    $content = json_decode($request->getContent(), true);

    // you may capture your payment now with e.g. this data
    $yourPaymentReference = $content['preOrderPayment']['paymentId'];
    $orderAmount = $content['order']['price']['totalPrice'];   
    
    // you can provide any status here that the payment should have later on in Shopware
    $response = [ 'status' => 'paid' ];

    // this returns a json encoded response with the `shopware-app-signature` in the header
    return $this->sign($response, $content['source']['shopId']);
}
```

::: warning
Keep in mind that if the integration into the checkout process does not work as expected, your customer might not be able to use the prepared payment. This is especially valid for after order payments, since there the order already exists. For these cases, you should still offer a traditional synchronous / asynchronous payment flow. Don't worry, if you have set the transaction state in your capture call to anything but open, the asynchronous payment process will not be started immediately after the prepared payment flow.
:::

## Refund

With Shopware 6.4.12.0, we have also added basic functionality to be able to refund payments. Your app will need to register captured amounts and create and persist a refund beforehand for Shopware to be able to process a refund of a capture.

Similar to the other requests, on your `refund` call you will receive the data required to process your refund. This is the `order` with all its details and also the `refund` which holds the information on the `amount`, the referenced `capture` and, if provided, a `reason` and specific `positions` which items are being refunded.

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/refund", name="refund", methods={"POST"})
 */
public function refundPayment(Request $request): JsonResponse
{
    // more on this in section "Validation"
    $this->checkSignature($request);

    $content = json_decode($request->getContent(), true);

    // you may capture your payment now with e.g. this data
    $captureId = $content['refund']['captureId'];
    $refundAmount = $content['refund']['amount']['totalPrice'];
    
    // you can provide any status here that the refund should have later on in Shopware
    $response = [ 'status' => 'refunded' ];

    // this returns a json encoded response with the `shopware-app-signature` in the header
    return $this->sign($response, $content['source']['shopId']);
}
```

## Validation

All of the payment requests you receive from Shopware should be checked for a correct signature and the responses should be signed as well. You should be familiar with the Setup process from the [App base guide](app-base-guide.md#setup), as this validation is very similar.

<PageRef page="app-base-guide" />

When receiving a payment `pay` or `finalize` request, you need to first validation the signature of the request. This signature is provided in the `shopware-shop-signature` header, which contains a cryptographic signature of the query string. Therefore you need to calculate the `sha256 hmac` based on the encoded JSON and the secret you have saved during the app registration.

```php
use Symfony\Component\HttpFoundation\Request;

private function checkSignature(Request $request): void
{
    $requestContent = json_decode($request->getContent(), true);
    $shopId = $requestContent['source']['shopId'];

    // get the secret you have saved on registration for this shopId
    $shopSecret = $this->getSecretByShopId($shopId);

    $signature = $request->headers->get('shopware-shop-signature'):
    if ($signature === null) {
        throw new Exception('No signature provided signature');
    }

    $hmac = hash_hmac('sha256', $request->getContent(), $shopSecret);
    if (!hash_equals($hmac, $signature)) {
        throw new Exception('Invalid signature');
    }
}
```

When sending your response, you also need to add a signature to the header of the request. This signature needs to be provided in the `shopware-app-signature` header. This also needs to be calculated as a `sha256 hmac` based on the encoded JSON and the secret you have saved during the app registration.

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

private function sign(array $content, string $shopId): JsonResponse
{
    // this encodes the json automatically
    $response = new JsonResponse($content);

    // get the secret you have saved on registration for this shopId
    $shopSecret = $this->getSecretByShopId($shopId);

    $hmac = \hash_hmac('sha256', $response->getContent(), $secret);
    $response->headers->set('shopware-app-signature', $hmac);

    return $response;
}
```

## API docs

<PageRef page="../../../resources/references/app-reference/payment-reference" />
