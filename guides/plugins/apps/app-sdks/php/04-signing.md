---
nav:
  title: Signing
  position: 40

---

# Signing of responses

The Shopware App System requires you to sign your responses to the Shopware server.

The signing is required for the following actions:

* ActionButton
* TaxProvider
* Payment

To sign the response, you need to create a `ResponseSigner` and call the `signResponse` method with our PSR 7 Response.

```php
$app = new AppConfiguration('Foo', 'test', 'http://localhost:6001/register/callback');
// for a repository to save stores implementing \Shopware\App\SDK\Shop\ShopRepositoryInterface, see FileShopRepository as an example
$repository = ...;

// Create a psr 7 request or convert it (HttpFoundation Symfony)
$psrRequest = ...;

$shopResolver = new \Shopware\App\SDK\Shop\ShopResolver($repository);

$shop = $shopResolver->resolveShop($psrRequest);

// do something
$response = ....;

$signer = new \Shopware\App\SDK\Authentication\ResponseSigner();
$signer->signResponse($psrResponse, $shop);
```

Next, we will look into the [Making HTTP requests to the Shop](./05-http-client).
