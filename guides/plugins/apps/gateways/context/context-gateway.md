# Context Gateway

::: danger
**Security and privacy**

With the context gateway, Shopware allows your app to manipulate the customer context, which includes sensitive information like customer addresses, payment methods, and more.
It is your responsibility to ensure that the commands are valid and do not compromise the security or privacy of customers.

As this is a powerful feature, you should only use it if you are sure that your app server is secure and the commands you send are safe.

:::

## Context

As of Shopware version 6.7.1.0, the Context Gateway was introduced.

The Context Gateway is a powerful feature that allows apps to securely interact with the customer context, based on the current cart and sales channel and make informed decisions on the app server.
The app system benefits from this solution, enabling app developers to manipulate customer contexts and provide a more tailored shopping experience.

It is designed as to being the connection point between your apps Javascript and your app server.

## Prerequisites

You should be familiar with the concept of Apps, their registration flow as well as signing and verifying requests and responses between Shopware and the App backend server.

<PageRef page="../../app-base-guide.md" title="App base guide" />

Your app server must be also accessible for the Shopware server.
You can use a tunneling service like [ngrok](https://ngrok.com/) for development.

## Manifest configuration

To indicate to Shopware that your app uses the context gateway, you must provide a `context` property inside a `gateways` parent property of your app's `manifest.xml`.

Below, you can see an example definition of a working checkout gateway configuration.

::: code-group

```xml [manifest.xml]
<?xml version="1.0" encoding="UTF-8"?>
<manifest>
    <!-- ... -->

    <gateways>
        <!-- ... -->
        <context>https://my-app.server.com/context/gateway</context>
    </gateways>
</manifest>
```

:::

After successful installation of your app, the context gateway is ready to be called by Shopware.

## Context gateway endpoint

Your JavaScript integration is responsible for calling the context gateway endpoint.
The app server will receive the current `SalesChannelContext`, `Cart`, and any custom data you provide as part of the payload.

::: warning
**Connection timeouts**

The Shopware shop will wait for a response for 5 seconds.
Be sure that your context gateway implementation on your app server responds in time, otherwise Shopware will time out and drop the connection.
:::

### JavaScript `ContextGatewayClient`

Your implementation must call the `frontend.gateway.context` storefront endpoint, which is automatically registered by Shopware beforehand.
You can send any data in the requests body, which will be forwarded to your app server.

Luckily, Shopware provides you with a `ContextGatewayClient` service, which you can use to ease the communication with the context gateway.
This client is designed to be used in your app's JavaScript code and handles the communication with the context gateway endpoint.
You can use this client to call the context gateway and receive a response containing the (new) context token and an optional redirect URL.

See an example JavaScript plugin implementation here, which is triggered, when clicking a button in the storefront:

::: code-group

```javascript [context-gateway.js]
import Plugin from 'src/plugin-system/plugin.class';
import ContextGatewayClient from 'src/service/context-gateway.service';

export default class MyPlugin extends Plugin {
  init() {
    this._registerEvents();
  }
  
  _registerEvents() {
    this.el.addEventListener('click', this._onClick.bind(this));
  }
  
  async _onClick() {
    // create client with your app name
    const gatewayClient = new ContextGatewayClient('myAppName');
    
    // call the gateway with optional custom data
    const tokenResponse = await gatewayClient.call({ some: 'data', someMore: 'data' });
    
    // either: you can work with the new token or redirect URL
    // this means you have to handle the navigation yourself, e.g. reloading the page or redirecting to the URL
    const token = tokenResponse.token;
    const redirectUrl = tokenResponse.redirectUrl;

    // or: if you want shopware to handle the navigation automatically, even supplying an optional custom target path is possible
    await gatewayClient.navigate(tokenResponse, '/custom/target/path');
  }
}
```

:::

::: info
**Navigation `customTarget` behavior**

You can provide an optional custom target path to the `navigate` method.

The customTarget parameter overrides the default redirect path.

- If absolute (starts with /), it replaces the entire path after the domain. This can override sales channel switches inside the tokenResponses redirectUrl parameter from subpath sales channels. (e.g. `https://example.com/en` becomes `https://example.com/custom/target/path`)
- If relative, it is appended to the tokenResponses redirectUrl's path.
- If null, the redirectUrl from the tokenResponse is used as is, when given. Otherwise, the page is simply reloaded to apply context changes to the storefront.

All trailing slashes are removed to ensure a clean, consistent URL.

:::

### App server response

Your app server can then respond with a list of commands to manipulate the current sales channel context, like changing language or currency, registering a new customer, or logging existing customers in.

You can find a reference of all currently available commands [here](./command-reference.md).

Let's assume that you want to change the current sales channel context to a different currency and language, if the current context's currency is not GBP.

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
  "data": {
    "your": "custom data",
    "appears": "here"
  }
}
```

And your response could look like this:

```json5
{
  "commands": [
    {
      "command": "context_change-currency",
      "payload": {
        "iso": "GBP"
      }
    },
    {
      "command": "context_change-language",
      "payload": {
        "iso": "en-GB",
      }
    }
  ]
}
```

</Tab>

<Tab title="App PHP SDK">

With version `4.1.0`, support for the context gateway has been added to the `app-php-sdk`.
The SDK will handle the communication with the Shopware shop and provide you with a convenient way to handle the incoming payload and respond with the necessary commands.

```php
<?php declare(strict_types=1);

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Shopware\App\SDK\Context\Cart\Error;
use Shopware\App\SDK\Context\ContextResolver;
use Shopware\App\SDK\Framework\Collection;
use Shopware\App\SDK\Gateway\Context\ContextGatewayCommand;
use Shopware\App\SDK\Gateway\Context\Command\ChangeCurrencyCommand;
use Shopware\App\SDK\Gateway\Context\Command\ChangeLanguageCommand;
use Shopware\App\SDK\Response\GatewayResponse;
use Shopware\App\SDK\Shop\ShopResolver;

function gatewayController(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    $signer = new ResponseSigner();
    
    $shop = $shopResolver->resolveShop($request);
    
    /** @var Shopware\App\SDK\Context\Gateway\Context\ContextGatewayAction $action */
    $action = $contextResolver->assembleContextGatewayRequest($request, $shop);

    /** @var Collection<Shopware\App\SDK\Gateway\Context\ContextGatewayCommand> $commands */
    $commands = new Collection();

    if ($action->getSalesChannelContext()->getCurrency()->getIsoCode() !== 'GBP') {
        $commands->add(new ChangeCurrencyCommand('GBP'));
        $commands->add(new ChangeLanguageCommand('en-GB'));
    }

    $response = GatewayResponse::createContextGatewayResponse($commands);

    return $signer->sign($response);
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
<?php declare(strict_types=1);

namespace App\Controller;

use Shopware\App\SDK\Context\Cart\Error;
use Shopware\App\SDK\Context\Gateway\Context\ContextGatewayAction;
use Shopware\App\SDK\Framework\Collection;
use Shopware\App\SDK\Gateway\Context\Command\ChangeCurrencyCommand;
use Shopware\App\SDK\Gateway\Context\Command\ChangeLanguageCommand;
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

    #[Route('/context', name: 'context', methods: ['POST'])]
    public function context(ContextGatewayAction $action): Response
    {
        /** @var Collection<ContextGatewayCommand> $commands */
        $commands = new Collection();

        if ($action->getSalesChannelContext()->getCurrency()->getIsoCode() !== 'GBP') {
            $commands->add(new ChangeCurrencyCommand('GBP'));
            $commands->add(new ChangeLanguageCommand('en-GB'));
        }

        $response = GatewayResponse::createContextGatewayResponse($commands);

        return $this->httpFoundationFactory->createResponse($response);
    }
}
```

</Tab>

</Tabs>

### Command validation

Shopware will validate the commands you respond from your app server in terms of general reasonableness.

The following checks are performed:

- The command must be a valid command, e.g. `context_change-currency`.
- The payload must be valid for all commands.
- Only a maximum of *one* command of each type is allowed, e.g. you cannot send two `context_change-currency` commands in one response.
- Only a maximum of *one* `context_register-customer` or `context_login-customer` command is allowed in one response.

## Event

Plugins can listen to the `Shopware\Core\Framework\Gateway\Context\Command\Event\ContextGatewayCommandsCollectedEvent`.
This event is dispatched after the Context Gateway has collected all commands from an app server.
It allows plugins to manipulate the commands before they are executed, based on the same payload the app servers retrieved.

## Special considerations

The `context_login-customer` allows your app to log in customers **without their password**.
This is a powerful feature and should be used with caution in respect to the shops security and privacy.

The `context_register-customer` command will create a new customer account and **log them in automatically**. Be sure to validate the data beforehand.
See the [RegisterCustomerCommand reference](./command-reference.md#available-data-for-registercustomercommand) for the available data fields.

When using these commands, you must ensure that the customer has given their consent to be registered or logged in to the shop.
