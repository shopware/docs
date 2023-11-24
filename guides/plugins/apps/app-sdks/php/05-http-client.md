---
nav:
  title: HTTP-client
  position: 50

---

# Making HTTP requests to the Shop

The SDK offers a simple HTTP client for sending requests to the Shopware server. To utilize it, you will require the Shop entity, which you can obtain by using the `shopResolver` from the current request. Alternatively, you can use the `ShopRepository` to obtain the Shop entity by its ID.

```php
$app = new AppConfiguration('Foo', 'test', 'http://localhost:6001/register/callback');
// for a repository to save stores implementing \Shopware\App\SDK\Shop\ShopRepositoryInterface, see FileShopRepository as an example
$repository = ...;

// Create a psr 7 request or convert it (HttpFoundation Symfony)
$psrRequest = ...;

$shopResolver = new \Shopware\App\SDK\Shop\ShopResolver($repository);

$shop = $shopResolver->resolveShop($psrRequest);

$clientFactory = new Shopware\App\SDK\HttpClient\ClientFactory();
$httpClient = $clientFactory->createClient($shop);

$response = $httpClient->sendRequest($psrHttpRequest);
```

The client will automatically fetch the OAuth2 token for the shop and add it to the request.

## SimpleHttpClient

The SimpleHttpClient is a wrapper around the PSR18 ClientInterface and provides a simple interface to make requests.

```php
$simpleClient = new \Shopware\App\SDK\HttpClient\SimpleHttpClient\SimpleHttpClient($httpClient);

$response = $simpleClient->get('https://shop.com/api/_info/version');
$response->getHeader('Content-Type'); // application/json
$response->ok(); // true when 200 <= status code < 300
$body = $response->json(); // json decoded body
echo $body['version'];

$simpleClient->post('https://shop.com/api/_action/sync', [
    'entity' => 'product',
    'offset' => 0,
    'total' => 100,
    'payload' => [
        [
            'id' => '123',
            'name' => 'Foo',
        ],
    ],
]);

// and the same with put, patch, delete
```

## Testing

The `\Shopware\App\SDK\HttpClient\ClientFactory::factory` method accepts as a second argument a PSR18 ClientInterface.
So you can overwrite the client with a mock client for testing.

```php
$clientFactory = new Shopware\App\SDK\HttpClient\ClientFactory();
$httpClient = $clientFactory->createClient($shop, $myMockClient);
```

Next, we will look into the [Events](./06-events).
