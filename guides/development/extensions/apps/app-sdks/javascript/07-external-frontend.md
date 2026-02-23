---
nav:
  title: External Frontend
  position: 60

---

Some times apps consists of a frontend to render the admin interface using the admin-extension-sdk. Mostly it is easier to create an second application and use that as the frontend. This way you can use the full power of the frontend frameworks like Next.js, Nuxt.js, Angular, React, Vue.js, etc.

To verify that the request is from a registered shop and gather further information from the app-server backend, you can use Hono integration to authenticate the request.

So the idea is that the Browser makes a request against our app server and this verifies the request, sets a cookie and forwards the request to the frontend. The frontend can do then regular ajax requests against the app server and the app server uses the cookie to verify the request.

```ts
import { Hono } from "hono/tiny";
import { configureAppServer } from "@shopware-ag/app-server-sdk/integration/hono";

const app = new Hono();

configureAppServer(app, {
  /** ... */
  appIframeEnable: true,
  appIframeRedirects: {
    '/app/browser': '/client'
  }
});

app.get('/client-api/test', (c) => {
  console.log(c.get('shop').getShopId());

  return c.json({ shopId: c.get('shop').getShopId() });
});
```

Now we can configure in the manifest.xml the URL to `/app/browser` and the app server will verify and afterwards redirect to `/client`.

And in the frontend application we can just do a regular `fetch("/client-api/test")` and the app server will verify the request and return the shopId.

The path `/client-api/*` is automatically protected for you by a Hono middleware. The path `/client-app/*` can be changed in the `configureAppServer` function with `appIframePath`.
