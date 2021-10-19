# Payment

Starting with version 6.4.1.0, Shopware also provides functionality for your app to be able to integrate payment providers. You can choose between just a simple request for approval in the background \(synchronous payment\) and the user being forwarded to a provider for payment \(asynchronous payment\). You provide one or two endpoints, one for starting the payment and providing a redirect URL and one for finalization to check for the resulting status of the payment. The requests and responses of all of your endpoints will be signed and feature JSON content.

## Prerequisites

You should be familiar with the concept of Apps and their registration.

{% page-ref page="app-base-guide.md" %}

To reproduce this example, you should also be aware of how to set up an app on your development platform.

{% page-ref page="local-development/" %}

## Manifest configuration

If your app should provide one or multiple payment methods, you need to define these in your manifest. The created payment methods in Shopware will be identified by the name of your app and the identifier you define per payment method. You should therefore not change the identifier after release, otherwise new payment methods will be created.

You may choose between a synchronous and an asynchronous payment method. These two types are differentiated by defining a `finalize-url` or not. If no `finalize-url` is defined, the internal Shopware payment handler will default to a synchronous payment. If you do not want or need any communication during the payment process with your app, you can also choose not to provide a `pay-url`, then the payment will remain on open on checkout.

Below you can see three different definitions of payment methods.

{% code title="manifest.xml" %}
```markup
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
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
    </payments>
</manifest>
```
{% endcode %}

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

{% hint style="warning" %}
Keep in mind that just by providing a `message`, the payment will default to status `fail`.
{% endhint %}

## Asynchronous payments

Asynchronous payments are more complicated and rely on interaction with the user and therefore a redirect to the payment provider. For example, this might be an integration with _PayPal_ or _Stripe_. The following process applies:

Shopware sends the first `pay` POST request which is supposed to start the payment with the payment provider. All necessary data is provided: the `order`, `orderTransaction` and a `returnUrl`, where the user should be redirected to once the payment process with the payment provider has been finished. If everything is correct and the payment process is ready to start, the response to this request should be a `redirectUrl`, where the user is redirected to by Shopware. In case the payment can't be started \(for example because of missing credentials for the shop\), this can also return a `fail` status and / or a `message`.

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

{% hint style="warning" %}
Keep in mind that just by providing a `message` in either request response, the payment will default to status `fail`, except if you also provide the status `cancel` in the `finalize` request.
{% endhint %}

## Validation

All of the payment requests you receive from Shopware should be checked for a correct signature and the responses should be signed as well. You should be familiar with the Setup process from the [App base guide](app-base-guide.md#setup), as this validation is very similar.

{% page-ref page="app-base-guide.md" %}

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

{% page-ref page="../../../resources/references/app-reference/payment-reference.md" %}

