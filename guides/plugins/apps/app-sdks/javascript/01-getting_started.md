---
nav:
  title: Getting started
  position: 10

---

# Getting Started

The app server written in TypeScript and is an open-source project accessible at [app-sdk-js](https://github.com/shopware/app-sdk-js).

## Installation

Install the App PHP SDK via NPM:

```bash
npm install --save @shopware-ag/app-sdk-server
```

After the installation, you can use the SDK in your project. Here is an example:

## Registration process

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
    } else if (pathname === '/authorize/callback') {
      return app.registration.authorizeCallback(request);
    }

    return new Response('Not found', { status: 404 });
  }
};
```

First we create an AppServer instance with the app name, app secret and the authorize callback URL. The `InMemoryShopRepository` is used to store the shops in memory. You can also use a custom repository to store the shops in a database.

With this code, you can register your app with our custom app backend.

<Tabs>

<Tab title="Bun">

```bash
bun run index.js
```

</Tab>

<Tab title="Deno">

```bash
deno serve index.js
```

</Tab>

<Tab title="Node.js">

Node.JS does not support the `Request` and `Response` objects. You can use [@hono/node-server](https://github.com/honojs/node-server) to run the server.

The recommendation here is to use a Framework like [Hono](https://hono.dev/).

</Tab>

</Tabs>

Next, we will look into the [lifecycle handling](./02-lifecycle).
