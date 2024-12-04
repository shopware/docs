---
nav:
  title: Webhook
  position: 20

---

# Webhook

With webhooks, you can subscribe to events occurring in Shopware. Whenever such an event occurs, a `POST` request will be sent to the URL specified for this particular event.

## Prerequisites

You should be familiar with the concept of Apps, especially their registration flow as well as signing and verifying requests and responses between Shopware and the App backend server, as that is required to authenticate the webhooks coming from the shops and showing the correct content in your modules.

<PageRef page="app-base-guide" />

## Webhook configuration

To use webhooks in your app, you need to implement a `<webhooks>` element in your manifest file as shown below:

<<< @/docs/snippets/config/app/webhooks.xml

This example illustrates how to define a webhook with the name `product-changed` and the URL `https://example.com/event/product-changed`, which will be triggered if the event `product.written` is fired. So every time a product is changed, your custom logic will get executed. Further down, you will find a list of the most important events you can hook into.

An event contains as much data as is needed to react to that event. The data is sent as JSON in the request body:

<Tabs>

<Tab title="HTTP">

```json
{
  "data":{
    "payload":[
      {
        "entity":"product",
        "operation":"delete",
        "primaryKey":"7b04ebe416db4ebc93de4d791325e1d9",
        "updatedFields":[
        ]
      }
    ],
    "event":"product.written"
  },
  "source":{
    "url":"http:\/\/localhost:8000",
    "appVersion":"0.0.1",
    "shopId":"dgrH7nLU6tlE",
    "eventId": "7b04ebe416db4ebc93de4d791325e1d9"
  },
  "timestamp": 123123123
}
```

</Tab>

<Tab title="App PHP SDK">

```php
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Shopware\App\SDK\Shop\ShopResolver;
use Shopware\App\SDK\Context\ContextResolver;

function webhookController(RequestInterface $request): ResponseInterface
{
    // injected or build by yourself
    $shopResolver = new ShopResolver($repository);
    $contextResolver = new ContextResolver();
    
    $shop = $shopResolver->resolveShop($serverRequest);
    $webhook = $contextResolver->assembleWebhook($serverRequest, $shop);
    
    // do something with the parsed webhook
}
```

</Tab>

<Tab title="Symfony Bundle">

```php
use Shopware\App\SDK\Context\Webhook\WebhookAction;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class WebhookController {
    #[Route('/webhook/product.created')]
    public function handle(WebhookAction $webhook): Response
    {
        // handle webhook action
        
        return new Response(null, 204);
    }
}
```

</Tab>

</Tabs>

The `source` property contains all necessary information about the Shopware instance that sent the request:

* `url` is the URL under which your app can reach the Shopware instance and its API.
* `appVersion` is the version of the app that is installed.
* `shopId` is the id by which you can identify the Shopware instance.
* `eventId` is a unique identifier of the event. This id will not change if sending of the webhook is retried, etc. **Since 6.4.11.0**.

The next property, `data` contains the name of the event so that a single endpoint can handle several different events. `data` also contains the event data in the `payload` property. Due to the asynchronous nature of these webhooks, the `payload` for `entity.written` events does not contain complete entities as these might become outdated. Instead, the entity in the payload is characterized by its id, stored under `primaryKey`, so the app can fetch additional data through the shop API. This also has the advantage of giving the app explicit control over the associations that get fetched instead of relying on the associations determined by the event. Other events, in contrast, contain the entity data that defines the event but keep in mind that the event might not contain all associations.

The next property, `timestamp` is the time at which the webhook was handled. This can be used to prevent replay attacks, as an attacker cannot change the timestamp without making the signature invalid. If the timestamp is too old, your app should reject the request. This property is only available from 6.4.1.0 onwards

::: info
Starting from Shopware version 6.4.1.0, the current Shopware version will be sent as a `sw-version` header.
Starting from Shopware version 6.4.5.0, the current language id of the shopware context will be sent as a  `sw-context-language` header, and the locale of the user or locale of the context language is available under the `sw-user-language` header.
:::

You can verify the authenticity of the incoming request by checking the `shopware-shop-signature` every request should have a SHA256 HMAC of the request body that is signed with the secret your app assigned the shop during the [registration](app-base-guide#setup). The mechanism to verify the request is exactly the same as the one used for the [confirmation request](app-base-guide#confirmation-request).

You can use a variety of events to react to changes in Shopware that way. See that table [Webhook-Events-Reference](../../../resources/references/app-reference/webhook-events-reference) for an overview.

## Webhooks for live version only

::: info
This feature has been introduced with Shopware version 6.5.7.0
:::

There might be cases when you only want to call the webhook when an entry is written to the database with live version ID (`Shopware\Core\Defaults::LIVE_VERSION`). For example when orders are created, you want to filter out drafts and only call your webhook when an order is actually placed. See more on versioning entities [here](../plugins/framework/data-handling/versioning-entities.md).

You can achieve this by adding the option `onlyLiveVersion` to your webhook definition in the manifest file:

```xml
<webhook name="order-created" url="https://example.com/event/order-created" event="order.written" onlyLiveVersion="true"/>
```

By default, this option is set to `false` and the webhook will be called for every version of the entity.

This option is only checked for instances of `HookableEntityWrittenEvent`. For other events, the option is ignored.

If this option is enabled the payload of your webhook will also be filtered to only contain entries that have live version id.
