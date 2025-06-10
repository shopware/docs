# Context Gateway

::: danger
**Security and privacy**

With the context gateway, Shopware allows your app to manipulate the customer context, which includes sensitive information like customer addresses, payment methods, and more.
It is your responsibility to ensure that the commands are valid and do not compromise the security or privacy of customers.

Due to the powerful nature of this feature, it should only be used if your app server is properly secured and the commands it sends are fully trusted and validated.

:::

## Context

As of Shopware version 6.7.1.0, the Context Gateway has been introduced.

The Context Gateway is a powerful feature that enables apps to securely access and interact with the customer context — based on the current cart and sales channel — allowing for more informed decision-making on the app server.
This enhancement empowers app developers to dynamically tailor the shopping experience by manipulating the customer context.

It serves as the bridge between your app’s JavaScript and your app server.

## Prerequisites

You should be familiar with the concept of Apps, their registration flow as well as signing and verifying requests and responses between Shopware and the App backend server.

<PageRef page="../../app-base-guide.md" title="App base guide" />

Your app server must also be accessible to the Shopware server.
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

After the successful installation of your app, the context gateway is ready to be called by Shopware.

## Context Gateway Endpoint

To trigger the context gateway, your integration can call the additional Store API route: <nobr>`store-api.context.gateway`</nobr>.  
This endpoint will forward the request to your app server’s context gateway endpoint, which must be [configured in your app's manifest](#manifest-configuration).

To allow the shop to identify your app, the request must include the `appName`, which is defined in your [app’s `manifest.xml`](../../app-base-guide.md#manifest-file).

Your app server will receive the following payload:

- The request source, including:
  - The URL of the Shopware shop
  - The Shop ID
  - The app version
  - Any active [in-app purchase](../../in-app-purchase/index.md).
- The current `SalesChannelContext`
- The current `Cart`
- Any custom data you include in the request body

::: info

Communication between Shopware and your app server is secured via the [app signature verification mechanism](../../app-signature-verification), ensuring that only your app server can respond to context gateway requests.

:::

### Storefront Integration

To trigger the context gateway from the Storefront, use the <nobr>`frontend.gateway.context`</nobr> endpoint. This route is automatically registered by Shopware.

You can include any custom data in the request body - Shopware will forward this data to your app server.

To simplify this integration, Shopware provides the `ContextGatewayClient` service.
This JavaScript client is intended for use within your app and handles communication with the context gateway endpoint.
It returns a response containing:

- A (new) context token
- An optional redirect URL

Here is an example JavaScript plugin that triggers the context gateway when a button is clicked in the Storefront:

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
**Navigation `customTarget` Behavior**

The `customTarget` parameter allows you to optionally control the redirect path used by the `navigate` method.

- If `customTarget` is an **absolute path** (starts with `/`), it completely replaces the path portion of the `redirectUrl`.  
  This can be used to override sales channel subpaths in the `redirectUrl`.  
  _Example:_ `https://example.com/en` → `https://example.com/custom/target/path`

- If `customTarget` is a **relative path**, it is appended to the existing path of the `redirectUrl`.

- If `customTarget` is `null`, the behavior depends on whether a `redirectUrl` is present:
  - If present: the `redirectUrl` is used as-is.
  - If not: the current page is reloaded to apply context changes.

Trailing slashes are automatically removed to ensure clean and consistent URLs.
:::

### App server response

::: warning
**Connection timeouts**

The Shopware shop will wait for a response for 5 seconds.
Be sure that your context gateway implementation on your app server responds in time, otherwise Shopware will time out and drop the connection.
:::

Your app server can respond with a list of commands to modify the current sales channel context.  
These commands can be used to perform actions such as:

- Changing aspects of the customer context, like:
  - Changing the active currency
  - Changing the active language and more
- Registering a new customer
- Logging in an existing customer

You can find a complete reference of all available commands in the [command reference](./command-reference.md).

For example, you might want to update the context to a different currency and language if the current currency is not GBP.

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

### Command Validation

Shopware performs basic validation on the commands returned by your app server to ensure they are reasonable to execute.

The following checks are enforced:

- The command must be recognized as valid, e.g. <nobr>`context_change-currency`</nobr>.
  See the [full list of available commands](./command-reference.md#available-commands).
- The payload must be valid for the respective command type.
- Only **one command per type** is allowed. For example, you cannot include two <nobr>`context_change-currency`</nobr> commands in a single response.
- A maximum of **one <nobr>`context_register-customer`</nobr> or <nobr>`context_login-customer`</nobr>** command is allowed per response.

## Event

Plugins can listen to the `Shopware\Core\Framework\Gateway\Context\Command\Event\ContextGatewayCommandsCollectedEvent`.
This event is dispatched after all commands have been collected from the app server and allow plugins to modify or add commands based on the same payload the app received. 

## Special Considerations

- The `context_login-customer` command allows your app to log in a customer **without requiring their password**.
  Use this feature with caution to uphold the shop’s security and privacy standards.

- The `context_register-customer` command will create a new customer account and **automatically log them in**.
  Make sure to validate the provided data before issuing this command.
  See the [RegisterCustomerCommand reference](./command-reference.md#available-data-for-registercustomercommand) for the list of accepted fields.

In both cases, your app must ensure that the customer has **explicitly consented** to be registered or logged in.
