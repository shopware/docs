---
nav:
  title: Tax provider
  position: 10

---

# Tax provider

Tax calculations differ from country to country. Especially in the US, the sales tax calculation can be tedious, as the laws and regulations differ from state to state, country-wise, or even based on cities. Therefore, most shops use a third-party service (so-called tax provider) to calculate sales taxes.

With version 6.5.0.0, Shopware allows apps to integrate custom tax calculations, which could include an automatic tax calculation with a tax provider. An app has to provide an endpoint, which is called during the checkout to provide new tax rates. The requests and responses of all of your endpoints will be signed and featured as JSON content.

## Prerequisites

You should be familiar with the concept of Apps, their registration flow as well as signing and verifying requests and responses between Shopware and the App backend server.

<PageRef page="app-base-guide" />

Your app server must be also accessible for the Shopware server.
You can use a tunneling service like [ngrok](https://ngrok.com/) for development.

## Manifest configuration

To indicate to Shopware that your app uses a custom tax calculation, you must provide one or more `tax-provider` properties inside a `tax` parent property of your app's `manifest.xml`.

Below, you can see an example definition of a working tax provider.

<<< @/docs/snippets/config/app/tax.xml

After successful installation of your app, the tax provider will already be used during checkout to provide taxes. You should also see the new tax provider showing up in the administration in `Settings > Tax`.

## Tax provider endpoint

During checkout, Shopware checks for any active tax providers - sorted by priority - and will call the `processUrl` to provide taxes one-by-one, until one of endpoint successfully provides taxes for the current cart.

::: warning
**Connection timeouts**

The Shopware shop will wait for a response for 5 seconds. Be sure, that your tax provider implementation responds in time, otherwise Shopware will time out and drop the connection.
:::

In response, you can adjust the taxes of the entire cart, the entire delivery, or each item in the cart.

<Tabs>

<Tab title="HTTP">

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
  "salesChannelContext": {
    //...
  }
}
```

You can find an example payload [here](https://github.com/shopware/app-php-sdk/blob/main/tests/Context/_fixtures/tax.json)

and your response should look like this:

```json
{
  // optional: Overwrite the tax of an line item
  "lineItemTaxes": {
    "unique-identifier-of-lineitem": [
      {"tax":19,"taxRate":23,"price":19}
    ]
  },
  // optional: Overwrite the tax of an delivery
  "deliveryTaxes": {
    "unique-identifier-of-delivery-position": [
      {"tax":19,"taxRate":23,"price":19}
    ]
  },
  // optional: Overwrite the tax of the entire cart
  "cartPriceTaxes": [
    {"tax":19,"taxRate":23,"price":19}
  ]
}
```

</Tab>

<Tab title="App PHP SDK">

```php
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Shopware\App\SDK\Shop\ShopResolver;
use Shopware\App\SDK\Context\ContextResolver;

function taxController(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($serverRequest);
    $taxInfo = $contextResolver->assembleTaxProvider($serverRequest, $shop);
    
    $builder = new TaxProviderResponseBuilder();

    // optional: Add tax for each line item
    foreach ($taxInfo->cart->getLineItems() as $item) {
        $taxRate = 50;

        $price = $item->getPrice()->getTotalPrice() * $taxRate / 100;

        $builder->addLineItemTax($item->getUniqueIdentifier(), new CalculatedTax(
            tax: $price,
            taxRate: $taxRate,
            price: $item->getPrice()->getTotalPrice()
        ));
    }

    // optional: Add tax for each delivery
    foreach ($taxProviderContext->cart->getDeliveries() as $item) {
        foreach ($item->getPositions() as $position) {
            $builder->addDeliveryTax($position->getIdentifier(), new CalculatedTax(
                tax: 10,
                taxRate: 50,
                price: 100
            ));
        }
    }

    // optional: Add tax to the entire cart
    $builder->addCartTax(new CalculatedTax(
        tax: 20,
        taxRate: 50,
        price: 100
    ));
    
    return $signer->signResponse($builder->build(), $shop);
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
use Shopware\App\SDK\Context\TaxProvider\TaxProviderAction;
use Shopware\App\SDK\TaxProvider\TaxProviderResponseBuilder;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Psr\Http\Message\ResponseInterface;

#[AsController]
class TaxController {
    #[Route('/tax.process')]
    public function handle(TaxProviderAction $taxInfo): ResponseInterface
    {
        $builder = new TaxProviderResponseBuilder();

        // optional: Add tax for each line item
        foreach ($taxInfo->cart->getLineItems() as $item) {
            $taxRate = 50;
    
            $price = $item->getPrice()->getTotalPrice() * $taxRate / 100;
    
            $builder->addLineItemTax($item->getUniqueIdentifier(), new CalculatedTax(
                tax: $price,
                taxRate: $taxRate,
                price: $item->getPrice()->getTotalPrice()
            ));
        }
    
        // optional: Add tax for each delivery
        foreach ($taxProviderContext->cart->getDeliveries() as $item) {
            foreach ($item->getPositions() as $position) {
                $builder->addDeliveryTax($position->getIdentifier(), new CalculatedTax(
                    tax: 10,
                    taxRate: 50,
                    price: 100
                ));
            }
        }
    
        // optional: Add tax to the entire cart
        $builder->addCartTax(new CalculatedTax(
            tax: 20,
            taxRate: 50,
            price: 100
        ));
        
        return $builder->build();
    }
}
```

</Tab>

</Tabs>

If you wish to use a tax provider, you will probably have to provide the whole cart for the tax provider to correctly calculate taxes during checkout and you will probably get sums of the specific tax rates, which you can respond to Shopware via `cartPriceTaxes`. If given, Shopware does not recalculate the tax sums and will use those given by your tax provider.
