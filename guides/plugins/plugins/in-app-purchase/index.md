# In-App Purchases

::: info
In-App Purchase is available since Shopware version 6.6.9.0
:::

In-App Purchases are a way to lock certain features behind a paywall within the same extension.
This is useful for developers who want to offer a free version of their extension with limited features,
and then offer a paid version with more features.

<PageRef page="../../../../concepts/framework/in-app-purchases.md" title="In-App purchases concept" />

## Allow users to buy an In-App Purchase

In order to enable others to purchase your In-App Purchase, you must request a checkout for it via the `inAppPurchaseCheckout` store in the administration.
The checkout process itself is provided by Shopware.
As this is purely functional, it is your responsibility to provide a button and hide it if the IAP cannot be purchased more than once.

```ts
{
    computed: {
        inAppPurchaseCheckout() {
            return Shopware.Store.get('inAppPurchaseCheckout');
        },

        hideButton(): boolean {
            return Shopware.InAppPurchase.isActive('MyExtensionName', 'my-iap-identifier');
        }
    },

    methods: {
        onClick() {
            this.inAppPurchaseCheckout.request({ identifier: 'my-iap-identifier' }, 'MyExtensionName');
        }
    }
}
```

## Check active In-App Purchases

The `InAppPurchase` class contains a list of all In-App Purchases.
Inject this service into your class and you can check against it:

```php
class Example
{
    public function __construct(
        private readonly InAppPurchase $inAppPurchase,
    ) {}

    public function someFunction() {
        if ($this->inAppPurchase->isActive('MyExtensionName', 'my-iap-identifier')) {
            // ...
        }

        // ...
    }
}
```

If you want to check an in-app purchase in the administration:

```js
if (Shopware.InAppPurchase.isActive('MyExtensionName', 'my-iap-identifier')) {};
```

## Event

Apps are also able to manipulate the available In-App Purchases as described in
<PageRef page="../../apps/gateways/in-app-purchase/in-app-purchase-gateway.md" title="In App purchase gateway" />

Plugins can listen to the `Shopware\Core\Framework\App\InAppPurchases\Event\InAppPurchasesGatewayEvent`.
This event is dispatched after the In-App Purchases Gateway has received the app server response from a gateway
and allows plugins to manipulate the available In-App Purchases.
