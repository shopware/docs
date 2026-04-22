---
nav:
  title: Signing Responses
  position: 40

---

# Signing Responses

Shopware requires signed responses for requests that are handled server-to-server. The signature is used to verify the authenticity of the response and to ensure that the response was not tampered with.

Use the `signResponse()` method to sign a `Response` with the corresponding shop.

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

Next, we will look into [Making HTTP requests to the Shop](./05-http-client).
