# Tax provider

Tax calculations differ from country to country. Especially in the US, the sales tax calculation can be tedious, as the laws and regulations differ from state to state, country-wise, or even based on cities. Therefore, most shops use a third-party service (so-called tax provider) to calculate sales taxes.

With version 6.5.0.0, Shopware allows apps to integrate custom tax calculations, which could include an automatic tax calculation with a tax provider. An app has to provide an endpoint, which is called during the checkout to provide new tax rates. The requests and responses of all of your endpoints will be signed and featured as JSON content.

## Prerequisites

You should be familiar with the concept of apps and their registration.

<PageRef page="app-base-guide" />

To reproduce this example, you should also be aware of how to set up an app on your development platform.

<PageRef page="local-development/" />

## Manifest configuration

To indicate to Shopware that your app uses a custom tax calculation, you must provide one or more `tax-provider` properties inside a `tax` parent property of your app's `manifest.xml`.

Below, you can see an example definition of a working tax provider.

```xml
// manifest.xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        <!-- The name of the app should not change. Otherwise all payment methods are created as duplicates. -->
        <name>PaymentApp</name>
        <!-- ... -->
    </meta>
    
    <tax>
        <tax-provider>
            <identifier>myCustomTaxProvider</identifier>                        <!-- Unique identifier of the tax provider -->
            <name>My custom tax provider</name>                                 <!-- Display name of the tax provider -->    
            <priority>1</priority>                                              <!-- Priority of the tax provider - can be changed in the administration as well -->
            <processUrl>https://tax-provider.app/provide-taxes</processUrl>     <!-- Url of your implementation - is called during checkout to provide taxes -->
        </tax-provider>
    </tax>
</manifest>
```

After successful installation of your app, the tax provider will already be used during checkout to provide taxes. You should also see the new tax provider showing up in the administration in `Settings > Tax`.

## Tax provider endpoint

During checkout, Shopware checks for any active tax providers - sorted by priority - and will call the `processUrl` to provide taxes one-by-one, until one of endpoint successfully provides taxes for the current cart.

::: warning
**Connection timeouts**

The Shopware shop will wait for a response for 5 seconds. Be sure, that your tax provider implementation responds in time, otherwise Shopware will time out and drop the connection.
:::

In the following, we will have a look at a working example of a tax provider endpoint.

Our implementation uses the [Shopware AppTemplate](https://github.com/shopware/AppTemplate): An easy app-server-integration for Symfony PHP implementations.

```php
// ProcessController.php
<?php declare(strict_types=1);

namespace App\Controller;

use App\Shop\ShopRepository;
use Shopware\AppBundle\Authentication\RequestVerifier;
use Shopware\AppBundle\Authentication\ResponseSigner;
use Symfony\Bridge\PsrHttpMessage\Factory\HttpFoundationFactory;
use Symfony\Bridge\PsrHttpMessage\HttpMessageFactoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ProcessController extends AbstractController
{
    public function __construct(
        private HttpMessageFactoryInterface $psrHttpFactory,
        private RequestVerifier $requestVerifier,
        private ResponseSigner $responseSigner,
        private ShopRepository $shopRepository,
    ) {
    }

    #[Route('/process', name: 'process')]
    public function process(Request $request): Response
    {
        $content = \json_decode($request->getContent(), true);

        // shop id is in source->shopId
        $shopId = $content['source']['shopId'];
        $shop = $this->shopRepository->getShopFromId($shopId);

        // transform symfony request to psr request
        // mandatory, if you use the shopware app template
        // and want to authenticate the requests easily
        $psrRequest = $this->psrHttpFactory->createRequest($request);

        // authenticate, that the request came from shopware
        $this->requestVerifier->authenticatePostRequest($psrRequest, $shop);

        $lineItems = $content['cart']['lineItems'];
        $lineItemTaxes = [];

        // generally, you may want to call a tax provider here instead
        // for our example we simply assume a hefty tax rate of 50%
        foreach ($lineItems as $lineItem) {
            $taxRate = 50;
            $tax = $lineItem['price']['totalPrice'] * $taxRate / 100;

            // shopware will look for the `uniqueIdentifier` property of the lineItem to identify this lineItem even in nested-line-item structures
            $lineItemTaxes[$lineItem['uniqueIdentifier']] = [
                [
                    'tax' => $tax,
                    'taxRate' => $taxRate,
                    'price' => $lineItem['price']['totalPrice'],
                ],
            ];
        }

        // you can provide lineItemTaxes, deliveryTaxes and cartPriceTaxes
        // if you do not provide cartPriceTaxes, Shopware will recalculate them according to your provided taxes
        $responseContent = [
            'lineItemTaxes' => $lineItemTaxes,
            //'deliveryTaxes' => [], // use the deliveryPositionId as keys, if you want to transmit delivery taxes
            //'cartPriceTaxes' => [],
        ];

        $response = new \GuzzleHttp\Psr7\Response(200, [], \json_encode($responseContent));
        $response = $this->responseSigner->signResponse($response, $shop);

        // transform psrResponse to symfony response
        $factory = new HttpFoundationFactory();
        return $factory->createResponse($response);
    }
}
```

If you wish to use a tax provider, you will probably have to provide the whole cart for the tax provider to correctly calculate taxes during checkout and you will probably get sums of the specific tax rates, which you can respond to Shopware via `cartPriceTaxes`. If given, Shopware does not recalculate the tax sums and will use those given by your tax provider.
