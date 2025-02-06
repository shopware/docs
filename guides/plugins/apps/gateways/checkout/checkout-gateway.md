# Checkout Gateway

## Context

As of Shopware version 6.6.3.0, the Checkout Gateway was introduced.

The Checkout Gateway aims to allow a streamlined implementation for making informed decisions during the checkout process, based on both the cart contents and the current sales channel context.
In particular, the app system benefits from this solution, enabling seamless communication and decision-making on the app server during the checkout.

While this documentation focuses on the app integration of the Checkout Gateway, the design is intended to allow a custom replacement solution via the plugin system."

## Prerequisites

You should be familiar with the concept of Apps, their registration flow as well as signing and verifying requests and responses between Shopware and the App backend server.

<PageRef page="../../app-base-guide.md" title="App base guide" />

Your app server must be also accessible for the Shopware server.
You can use a tunneling service like [ngrok](https://ngrok.com/) for development.

## Manifest configuration

To indicate to Shopware that your app uses the checkout gateway, you must provide a `checkout` property inside a `gateways` parent property of your app's `manifest.xml`.

Below, you can see an example definition of a working checkout gateway configuration.

::: code-group

```xml [manifest.xml]
<?xml version="1.0" encoding="UTF-8"?>
<manifest>
    <!-- ... -->

    <gateways>
        <checkout>https://my-app.server.com/checkout/gateway</checkout>
    </gateways>
</manifest>
```

:::

After successful installation of your app, the checkout gateway will already be used during checkout.

## Checkout gateway endpoint

During checkout, Shopware checks for any active checkout gateways and will call the `checkout` url.
The app server will receive the current `SalesChannelContext`, `Cart`, and available payment and shipping methods as part of the payload.

::: warning
**Connection timeouts**

The Shopware shop will wait for a response for 5 seconds.
Be sure that your checkout gateway implementation on your app server responds in time, otherwise Shopware will time out and drop the connection.
:::

Your app server can then respond with a list of commands to manipulate the cart, payment methods, shipping methods, or add cart errors.

You can find a reference of all currently available commands [here](./command-reference.md).

Let's assume that your payment method is not available for carts with a total price above 1000€.

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
  "salesChannelContext": {
    //...
  },
  "availablePaymentMethods": [
    "payment-method-technical-name-1",
    "payment-method-technical-name-2",
    // ...
  ],
  "availableShippingMethods": [
    "shipping-method-technical-name-1",
    "shipping-method-technical-name-2",
    // ...
  ]
}
```

And your response could look like this:

```json5
{
  "commands": [
    {
      "command": "remove-payment-method",
      "payload": {
        "paymentMethodTechnicalName": "payment-myApp-payment-method"
      }
    },
    {
      "command": "add-cart-error",
      "payload": {
        "message": "Payment method 'My App Payment Method' is not available for carts > 1000€.",
        "blocking": false,
        "level": 10,
      }
    }
  ]
}
```

</Tab>

<Tab title="App PHP SDK">

With version `3.0.0`, support for the checkout gateway has been added to the `app-php-sdk`.
The SDK will handle the communication with the Shopware shop and provide you with a convenient way to handle the incoming payload and respond with the necessary commands.

```php
<?php declare(strict_types=1);

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Shopware\App\SDK\Context\Cart\Error;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Framework\Collection;
use Shopware\App\SDK\Gateway\Checkout\CheckoutGatewayCommand;
use Shopware\App\SDK\Gateway\Checkout\Command\AddCartErrorCommand;
use Shopware\App\SDK\Gateway\Checkout\Command\RemovePaymentMethodCommand;
use Shopware\App\SDK\Response\GatewayResponse;
use Shopware\App\SDK\Shop\ShopResolver;

function gatewayController(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($request);
    
    /** @var Shopware\App\SDK\Context\Gateway\Checkout\CheckoutGatewayAction $action */
    $action = $contextResolver->assembleCheckoutGatewayRequest($request, $shop);

    /** @var Collection<Shopware\App\SDK\Gateway\Checkout\CheckoutGatewayCommand> $commands */
    $commands = new Collection();

    if ($action->paymentMethods->has('payment-myApp-payment-method')) {
        if ($action->cart->getPrice()->getTotalPrice() > 1000) {
            $commands->add(new RemovePaymentMethodCommand('payment-myApp-payment-method'));
            $commands->add(new AddCartErrorCommand('Payment method \'My App Payment Method\' is not available for carts > 1000€.', false, Error::LEVEL_WARNING));
        }
    }

    $response = GatewayResponse::createCheckoutGatewayResponse($commands);

    return $signer->sign($response);
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
<?php declare(strict_types=1);

namespace App\Controller;

use Shopware\App\SDK\Context\Cart\Error;
use Shopware\App\SDK\Context\Gateway\Checkout\CheckoutGatewayAction;
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

    #[Route('/checkout', name: 'checkout', methods: ['POST'])]
    public function checkout(CheckoutGatewayAction $action): Response
    {
        /** @var Collection<CheckoutGatewayCommand> $commands */
        $commands = new Collection();

        if ($action->paymentMethods->has('payment-myApp-payment-method')) {
            if ($action->cart->getPrice()->getTotalPrice() > 1000) {
                $commands->add(new RemovePaymentMethodCommand('payment-myApp-payment-method'));
                $commands->add(new AddCartErrorCommand('Payment method \'My App Payment Method\' is not available for carts > 1000€.', false, Error::LEVEL_WARNING));
            }
        }

        $response = GatewayResponse::createCheckoutGatewayResponse($commands);

        return $this->httpFoundationFactory->createResponse($response);
    }
}
```

</Tab>

</Tabs>

## Event

Plugins can listen to the `Shopware\Core\Checkout\Gateway\Command\Event\CheckoutGatewayCommandsCollectedEvent`.
This event is dispatched after the Checkout Gateway has collected all commands from all app servers.
It allows plugins to manipulate the commands before they are executed, based on the same payload the app servers retrieved.
