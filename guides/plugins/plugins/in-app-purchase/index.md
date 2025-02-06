# In-App Purchases

In-App Purchases are a way to lock certain features behind a paywall within the same extension.
This is useful for developers who want to offer a free version of their extension with limited features,
and then offer a paid version with more features.

## Active In-App Purchases

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

## Allow users to buy an In-App Purchase

```js
{
    computed: {
        inAppPurchaseCheckout() {
            return Shopware.Store.get('inAppPurchaseCheckout');
        }
    },

    methods: {
        onClick() {
            this.inAppPurchaseCheckout.request({ identifier: 'my-iap-identifier' }, 'MyExtensionName');
        }
    }
}
```

## Event

Apps are also able to manipulate the available In-App Purchases as described in <PageRef page="../../apps/gateways/in-app-purchase/in-app-purchase-gateway.md" title="In App purchase gateway" />.

Plugins can listen to the `Shopware\Core\Framework\App\InAppPurchases\Event\InAppPurchasesGatewayEvent`.
This event is dispatched after the In-App Purchases Gateway has received the app server response from a gateway
and allows plugins to manipulate the available In-App Purchases.
