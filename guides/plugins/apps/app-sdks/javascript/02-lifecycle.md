---
nav:
  title: Lifecycle
  position: 20

---

# Lifecycle

The Shopware App System manages the lifecycle of an app.
Shopware will send any change if registered a webhook to our backend server.

To track the state in our Database correctly, we need to implement some lifecycle methods.

## Lifecycle Methods

* `activate`
* `deactivate`
* `uninstall`

The lifecycle registration in the `manifest.xml` would look like this:

```xml
<webhooks>
    <webhook name="appActivate" url="https://app-server.com/app/activate" event="app.activated"/>
    <webhook name="appDeactivated" url="https://app-server.com/app/deactivate" event="app.deactivated"/>
    <webhook name="appDelete" url="https://app-server.com/app/delete" event="app.deleted"/>
</webhooks>
```

## Usage

The implementation is similar to [Registration](./01-getting_started),

```javascript
import { AppServer, InMemoryShopRepository } from '@shopware-ag/app-server-sdk'

const app = new AppServer({
  appName: 'MyApp',
  appSecret: 'my-secret',
  authorizeCallbackUrl: 'http://localhost:3000/authorize/callback',
}, new InMemoryShopRepository());

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === '/authorize') {
      return app.registration.authorize(request);
    } if (pathname === '/authorize/callback') {
      return app.registration.authorizeCallback(request);
    } if (pathname === '/app/activate') {
      return app.registration.activate(request);
    } if (pathname === '/app/deactivate') {
      return app.registration.deactivate(request);
    } if (pathname === '/app/delete') {
      return app.registration.delete(request);
    }

    return new Response('Not found', { status: 404 });
  }
};
```

So, in this case, our backend gets notified of any app change, and we can track the state in our database.

Next, we will look into the [Context resolving](./03-context).
