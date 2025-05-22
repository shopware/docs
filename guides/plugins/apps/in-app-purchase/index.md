# In-App Purchases

::: info
In-App Purchase is available since Shopware version 6.6.9.0
:::

In-App Purchases are a way to lock certain features behind a paywall within the same extension.
This is useful for developers who want to offer a free version of their extension with limited features and a paid version with more features.

## Retrieve In-App Purchases on your app server

Whenever Shopware sends you a request, you'll receive a JWT as a query parameter or in the request body,
depending on whether the request is a GET or POST.
This JWT is signed by our internal systems, ensuring that you, as the app developer, can verify its authenticity and confirm it hasn't been tampered with.

You can use the `shopware/app-php-sdk` for plain PHP or the `shopware/app-bundle` for Symfony to validate and decode the JWT.
An example for plain PHP is available [here](https://github.com/shopware/app-php-sdk/blob/main/examples/index.php).
For Symfony applications, use the appropriate action argument for your route.

### Admin

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
                window.inAppPurchases = [];
                console.error('Unable to decode In-App Purchases', e);
            }
        </script>

        <!-- ... -->
    </head>

    <!-- ... -->
</html>
```

Alternatively you can extract the query parameter from `document.location` on the initial `sw-main-hidden` request,
store it and ask your app-server do properly decode it for you.

## Trigger a purchase of an In-App Purchases

The checkout process itself is provided by Shopware, you only have to trigger it with an identifier of the In-App Purchase.
To do so, create a button and make use of the [Meteor Admin SDK](https://github.com/shopware/meteor/tree/main/packages/admin-sdk):

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
