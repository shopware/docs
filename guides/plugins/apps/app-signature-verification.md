---
nav:
  title: Signing & Verification in the App System
  position: 40
---

# Signing & Verification in the App System

To ensure secure communication between Shopware shops and your app server, Shopware signs all outgoing requests using a cryptographic signature.
The signature is generated using [HMAC-SHA256](https://en.wikipedia.org/wiki/HMAC), hashing either the query string or the request body, depending on the request method, with your app secret.
By verifying this signature on your server, you can confirm that the request originates from Shopware and remains unaltered during transmission.
This mechanism safeguards your app against request forgery and unauthorized access.

::: warning
**Breaking Change Considerations**

Shopware may add parameters used for signature generation without considering it a breaking change.
Your app should be flexible enough to handle variations in the signature generation data.

To simplify signature verification and response signing, use our [App PHP SDK](https://github.com/shopware/app-php-sdk) or the [Symfony Bundle](https://github.com/shopware/app-bundle-symfony).

If you are not using these tools, ensure that you base signature generation on all query parameters or the entire request body, rather than selecting specific parameters.
:::

## Prerequisites

You should be familiar with the concept of Apps and their registration flow.

<PageRef page="app-base-guide" />

Your app server must be also accessible for the Shopware server.
You can use a tunneling service like [ngrok](https://ngrok.com/) for development.

## Validating requests

::: info
**Query parsing of signature**

Avoid re-parsing and re-encoding the query string for HMAC validation, as parameter order and URL encoding may vary depending on the programming language used.
:::

Shopware signs all requests sent to your app server using a cryptographic signature.
This signature is generated by hashing the request's query string with your app secret.

To ensure the request originates from Shopware, you should verify this signature before processing it.

<Tabs>
<Tab title="PHP">

If you want to do the verification manually, you can use the following code snippets for PHP.

GET requests:

```php
use Psr\Http\Message\RequestInterface;

/** @var RequestInterface $request */
$queryString = $request->getUri()->getQuery();
\parse_str($request->getUri()->getQuery(), $queries);
$compare = $queries['shopware-shop-signature'];

// remove shopware-shop-signature from query string,
// as it is not part of the signature itself
$queryString = \preg_replace(
    \sprintf('/&%s=%s/', 'shopware-shop-signature' ,$compare), '', $queryString
);

// calculate the signature
$signature = hash_hmac('sha256', $queryString, $appSecret);

// validate with compare signature from Shopware
$valid = hash_equals($signature, $compare);
```

POST requests:

```php
use Psr\Http\Message\RequestInterface;

/** @var RequestInterface $request */
$queryString = $request->getUri()->getQuery();
$signature = hash_hmac(
    'sha256',
    $request->getBody()->getContents(),
    $appSecret
);

// reset the stream pointer, so the body can be read again
$request->getBody()->rewind();
$compare = $request->getHeader('shopware-shop-signature')[0];

// validate with compare signature from Shopware
$valid = hash_equals($signature, $compare);
```

</Tab>

<Tab title="App PHP SDK">

With the App PHP SDK, you can use the `RequestVerifier` class to verify the request.

```php
$verifier = new \Shopware\App\SDK\Authentication\RequestVerifier();
$verifier->authenticateRegistrationRequest(
    $request,
    new AppConfiguration('AppName', 'AppSecret', 'register-confirm-url')
);
```

</Tab>

<Tab title="Symfony Bundle">

The Symfony Bundle handles all verification automatically.

</Tab>
</Tabs>

## Signing responses

Shopware expects a signature in the response to verify that the response is coming from your app server.

<Tabs>
<Tab title="PHP">
If you want to sign the response manually, you can use the following code snippet.

```php
use Psr\Http\Message\ResponseInterface;

/** @var ResponseInterface $response */
$body = $response->getBody()->getContents();

// reset the stream pointer, so the body can be read again
$response->getBody()->rewind();

// calculate the signature
$signature = hash_hmac('sha256', $body, $appSecret);

// add the signature to the response
$response = $response->withHeader('shopware-shop-signature', $signature);
```

</Tab>

<Tab title="App PHP SDK">

With the App PHP SDK, you can use the `ResponseSigner` class to sign your responses.

```php

use Shopware\App\SDK\Authentication\ResponseSigner;
use Shopware\App\SDK\Response\PaymentResponse;
use Shopware\App\SDK\Test\MockShop;

/**
 * This is a mock shop for testing purposes
 * You should look this up based on the request with the ShopResolver
 * 
 * @see https://github.com/shopware/app-php-sdk/blob/main/examples/index.php#L43
 * @var Shopware\App\SDK\Test\MockShop $shop
 */
$shop = new MockShop('shopId', 'shopUrl', 'shopSecret');

/** 
 * There are some helper methods to easily create responses for different usages
 * The PaymentResponse::paid() method will create a response
 * that indicates that the payment was successful for example
 * 
 * @see https://github.com/shopware/app-php-sdk/tree/main/src/Response
 * @var Shopware\App\SDK\Response\PaymentResponse $response 
 */
$response = PaymentResponse::paid();

$responseSigner = new ResponseSigner();
$shop = new Shop('shopId', 'shopUrl', 'shopSecret');

// the response will be signed with the shop secret
$response = $responseSigner->sign($response, $shop);
```

</Tab>

<Tab title="Symfony Bundle">

The Symfony Bundle handles all signing automatically.

</Tab>
</Tabs>
