---
nav:
  title: Signing
  position: 40

---

# Signing of responses

The Shopware App System requires you to sign your responses to the Shopware server.

The signing is required for all responses that are sent to the Shopware server. The signature is used to verify the authenticity of the response and to ensure that the response was not tampered with.

To sign the response, you can call the signer with `signResponse` method. The signer will sign the response with the provided shop.

```php
import { AppServer } from '@shopware-ag/app-server-sdk'

const app = new AppServer(/** ... */);

// Or you get it from the context resolver
const shop = await app.repository.getShopById('shop-id');

const response = new Response('Hello World', {
    headers: {
        'Content-Type': 'text/plain',
    },
});

const signedResponse = await app.signer.signResponse(response, shop);
```

Next, we will look into the [Making HTTP requests to the Shop](./05-http-client).
