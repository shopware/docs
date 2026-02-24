# In-App Purchase Gateway

## Context

::: info
In-App Purchase is available since Shopware version 6.6.9.0
:::

In-App Purchase Gateway was introduced to enhance flexibility in managing In-App Purchases.

The gateway enables app servers to restrict specific In-App Purchases based on advanced decision-making processes handled on the app server side.

::: info
**Current Limitations:**  
At present, the In-App Purchase Gateway supports only restricting the checkout process for new In-App Purchases.  
**Plans:**  
We aim to expand its functionality to include filtering entire lists of In-App Purchases before they are displayed to users.
:::

## Prerequisites

You should be familiar with the concept of Apps, their registration flow as well as signing and verifying requests and responses between Shopware and the App backend server.

<PageRef page="../../app-base-guide.md" title="App base guide" />

Your app server must be also accessible for the Shopware server.
You can use a tunneling service like [ngrok](https://ngrok.com/) for development.

## Manifest Configuration

To indicate that your app leverages the In-App Purchase Gateway, include the `inAppPurchase` property within the `gateways` property in your app's `manifest.xml`.

Below is an example of a properly configured manifest snippet for enabling the checkout gateway:

```xml [manifest.xml]
<?xml version="1.0" encoding="UTF-8"?>
<manifest>
    <!-- ... -->

    <gateways>
        <inAppPurchases>https://my-app.server.com/inAppPurchases/gateway</inAppPurchases>
    </gateways>
</manifest>
```

After successful installation of your app, the In-App Purchases gateway will already be used.

## In-App Purchases gateway endpoint

During checkout of an In-App Purchase, Shopware checks for any active In-App Purchases gateways and will call the `inAppPurchases` url.
The app server will receive a list containing the single only In-App Purchase the user wants to buy as part of the payload.

::: warning
**Connection timeouts**

The Shopware shop will wait for a response for 5 seconds.
Be sure that your In-App Purchases gateway implementation on your app server responds in time,
otherwise Shopware will time out and drop the connection.
:::

<Tabs>

<Tab title="HTTP">

Request content is JSON

```json5
{
  "source": {
    "url": "http:\/\/localhost:8000",
    "shopId": "hRCw2xo1EDZnLco4",
    "appVersion": "1.0.0",
    "inAppPurchases": "eyJWTEncodedTokenOfActiveInAppPurchases"
  },
  "purchases": [
    "my-in-app-purchase-bronze",
    "my-in-app-purchase-silver",
    "my-in-app-purchase-gold",
  ],
}
```

Respond with the In-App Purchases you want the user to be allowed to buy by simply responding with the purchase identifier in the `purchases` array.
During checkout, respond with an empty array to disallow the user from buying the In-App Purchase.

```json5
{
  "purchases": [
    "my-in-app-purchase-bronze",
    "my-in-app-purchase-silver",
    // disallow the user from buying the gold in-app purchase by removing it from the response
  ]
}
```

</Tab>

<Tab title="App PHP SDK">

With version `4.0.0`, support for the In-App Purchases gateway has been added to the `app-php-sdk`.
The SDK will handle the communication with the Shopware shop and provide you with a convenient way to handle the incoming payload and respond with the necessary purchases.

```php

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Shopware\App\SDK\Authentication\ResponseSigner;
use Shopware\App\SDK\Context\Cart\Error;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Context\InAppPurchase\InAppPurchaseProvider;
use Shopware\App\SDK\Framework\Collection;
use Shopware\App\SDK\HttpClient\ClientFactory;
use Shopware\App\SDK\Response\InAppPurchaseResponse;
use Shopware\App\SDK\Shop\ShopResolver;

function inAppPurchasesController(): ResponseInterface {
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($request);

    $inAppPurchaseProvider = new InAppPurchaseProvider(new SBPStoreKeyFetcher(
        (new ClientFactory())->createClient($shop)
    ));
    
    $contextResolver = new ContextResolver($inAppPurchaseProvider);
    
    /** @var Shopware\App\SDK\Context\Gateway\InAppFeatures\FilterAction $action */
    $action = $contextResolver->assembleInAppPurchasesFilterRequest($request, $shop);
    
    /** @var Shopware\App\SDK\Framework\Collection $purchases */
    $purchases = $action->getPurchases();
    
    // filter the purchases based on your business logic
    $purchases->remove('my-in-app-purchase-gold');
    
    $response = InAppPurchasesResponse::filter($purchases);
    
    return $signer->sign($response);
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
<?php declare(strict_types=1);

namespace App\Controller;

use Shopware\App\SDK\Context\Cart\Error;
use Shopware\App\SDK\Context\Gateway\InAppFeatures\FilterAction;
use Shopware\App\SDK\Framework\Collection;
use Shopware\App\SDK\Gateway\Checkout\CheckoutGatewayCommand;
use Shopware\App\SDK\Gateway\Checkout\Command\AddCartErrorCommand;
use Shopware\App\SDK\Response\GatewayResponse;
use Symfony\Bridge\PsrHttpMessage\HttpFoundationFactoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/gateway', name: 'api.gateway.')]
class GatewayController extends AbstractController
{
    public function __construct(
        private readonly HttpFoundationFactoryInterface $httpFoundationFactory
    ) {
    }

    #[Route('/inAppPurchases', name: 'in-app-purchases', methods: ['POST'])]
    public function inAppPurchases(FilterAction $action): Response
    {
        // the user already has the best premium purchase
        // disallow him from buying the less premium ones
        if ($action->source->inAppPurchases->has('my-in-app-purchase-gold')) {
            $action->purchases->remove('my-in-app-purchase-bronze');
            $action->purchases->remove('my-in-app-purchase-silver');
        }

        $response = GatewayResponse::createCheckoutGatewayResponse($commands);

        return $this->httpFoundationFactory->createResponse($response);
    }
}
```

</Tab>

</Tabs>

## Event

Plugins can listen to the `Shopware\Core\Framework\App\InAppPurchases\Event\InAppPurchasesGatewayEvent`.
This event is dispatched after the In-App Purchases Gateway has received the app server response.
It allows plugins to manipulate the available In-App Purchases, based on the same payload the app servers retrieved.
