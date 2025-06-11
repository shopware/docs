# In-App Purchases

::: info
In-App Purchase is available since Shopware version 6.6.9.0
:::

In-App Purchases are a way to lock certain features behind a paywall within the same extension.
This is useful for developers who want to offer a free version of their extension with limited features and a paid version with more features.

<PageRef page="../../../concepts/framework/in-app-purchases.md" title="In-App purchases concept" />

## Allow users to buy an In-App Purchase

In order to enable others to purchase your In-App Purchase, you must request a checkout for it via the `sw.iap.purchase()` function of the [Meteor Admin SDK](https://github.com/shopware/meteor/tree/main/packages/admin-sdk).
The checkout process itself is provided by Shopware.
As this is purely functional, it is your responsibility to provide a button and hide it if the IAP cannot be purchased more than once.

```vue
<template>
    <!-- ... -->
    <p>
        If you buy this you'll get an incredible useful feature: ...
    </p>
    <mt-button @click="onClick">
        Buy
    </mt-button>
    <!-- ... -->
</template>

<script setup>
import * as sw from '@shopware/meteor-admin-sdk';

function onClick() {
    sw.iap.purchase({ identifier: 'my-iap-identifier' });
}
</script>
```

Alternatively, you can trigger a checkout manually by sending a properly formatted
[post message](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) with an In-App purchase identifier to the Admin.


## Check active In-App Purchases

Whenever Shopware sends you a request, you'll receive a [JWT](../../../../concepts/framework/in-app-purchases.md#token) as a query parameter `in-app-purchases` or in the request body as `inAppPurchases` as part of the `source`, depending on whether the request is a GET or POST. The claims of the JWT will contain all bought In-App Purchases.

### Symfony or PHP app servers

You can use the `shopware/app-php-sdk` for plain PHP or the `shopware/app-bundle` for Symfony to validate and decode the JWT.
An example for plain PHP is available [here](https://github.com/shopware/app-php-sdk/blob/main/examples/index.php).
For Symfony applications, use the appropriate action argument for your route.

#### Admin

You will also receive In-App Purchases with the initial `sw-main-hidden` admin request.
To make them accessible, inject them into your JavaScript application.

Here is an example of retrieving active In-App Purchases in an example `admin.html.twig` using the `shopware/app-bundle`:

```php
#[Route(path: '/app/admin', name: 'admin')]
public function admin(ModuleAction $action): Response {
    return $this->render('admin.html.twig', [
        'inAppPurchases' => $action->inAppPurchases->all(),
    ]);
}
```

```html
<!DOCTYPE html>
<html>
    <head>
        <script>
            try {
                window.inAppPurchases = JSON.parse('{{ inAppPurchases | json_encode | raw }}');
            } catch (e) {
                window.inAppPurchases = {};
                console.error('Unable to decode In-App Purchases', e);
            }
        </script>

        <!-- ... -->
    </head>

    <!-- ... -->
</html>
```

### Non-PHP app servers

To decode the IAP JWT, you must use an appropriate JWT/JOSE library for your language. We also recommend verifying the authenticity of the token by checking the signature against the JWKS provided under `https://api.shopware.com/inappfeatures/jwks`.

## Event

Apps are also able to manipulate the available In-App Purchases as described in
<PageRef page="../../apps/gateways/in-app-purchase/in-app-purchase-gateway.md" title="In App purchase gateway" />
