---
nav:
  title: Integrations
  position: 60

---

The SDK offers many optional integrations into several JavaScript ecosystems, so you can easily integrate your app into your existing project.

## Hono

The SDK offers a simple integration into the Hono ecosystem. It will register automatically all necessary routes and provide a simple way to interact with the Hono API.

```ts
import { InMemoryShopRepository } from '@shopware-ag/app-server-sdk'
import type {
  AppServer,
  ShopInterface,
  Context,
} from "@shopware-ag/app-server-sdk";
import { Hono } from "hono";
import { configureAppServer } from "@shopware-ag/app-server-sdk/integration/hono";

const app = new Hono();

// You can configure all registered routes here
configureAppServer(app, {
  appName: "Test",
  appSecret: "Test",
  shopRepository: new InMemoryShopRepository(),
});

declare module "hono" {
  interface ContextVariableMap {
    app: AppServer;
    shop: ShopInterface;
    context: Context;
  }
}

export default app;
```

The `configureAppServer` will automatically register following routes:

- `/app/register` - Registration URL
- `/app/register/confirm` - Registration Confirmation
- `/app/activate` - Notify using app.activated webhook
- `/app/deactivate` - Notify using app.deactivated webhook
- `/app/delete` - Notify using app.delete webhook

This could look like this in the `manifest.xml`:

```xml
<setup>
    <registrationUrl>http://localhost:3000/app/register</registrationUrl>
</setup>
<webhooks>
    <webhook name="appActivated" url="http://localhost:3000/app/activate" event="app.activated"/>
    <webhook name="appDeactivated" url="http://localhost:3000/app/deactivate" event="app.deactivated"/>
    <webhook name="appDeleted" url="http://localhost:3000/app/delete" event="app.deleted"/>
</webhooks>
```

Additionally a middleware is configured to automatically validate the incoming requests and resolve the called Shop. This is my default configured to `/app/*` routes.

```ts
import { createNotificationResponse } from "@shopware-ag/app-server-sdk/helper/app-actions";

app.post("/app/action-button", async (c) => {
  const ctx = c.get("context") as Context<SimpleShop, ActionButtonRequest>;

  // Do something with the context, this is typed by second generic argument of Context
  console.log(ctx.payload.data.ids);

  return createNotificationResponse("success", "Yeah, it worked!");
});
```

So in this case the Request will be validated by the shop secret and the shop will be resolved by the shopId in the request. Additionally the response will be signed by the app secret. This is all done by the Integration, so you don't have to worry about it.

## Various Repositories (DynamoDB, Deno KV, Cloudflare KV, Bun SQLite, Better SQLite3)

The SDK offers a ready-to-use Repository for several storage solutions to store the shops.

<Tabs>
<Tab title="DynamoDB">
The AWS SDK needs to be installed separately:

```bash
npm install --save @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

```ts
import { DynamoDBRepository } from '@shopware-ag/app-server-sdk/integration/dynamodb';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient();

// Usage with Hono
configureAppServer(app, {
  appName: "Test",
  appSecret: "Test",
  shopRepository: new DynamoDBRepository(client, 'my-table-name'),
});

// Without Hono
const appServer = new AppServer(..., new DynamoDBRepository(client, 'my-table-name'));
```

</Tab>

<Tab title="Deno KV">

```ts
import { DenoKVRepository } from '@shopware-ag/app-server-sdk/integration/deno-kv';

// Usage with Hono
configureAppServer(app, {
  appName: "Test",
  appSecret: "Test",
  shopRepository: new DenoKVRepository('my-namespace'),
});

// Without Hono
const appServer = new AppServer(..., new DenoKVRepository('my-namespace'));
```

</Tab>

<Tab title="Cloudflare KV">

```ts
import { CloudflareShopRepository } from '@shopware-ag/app-server-sdk/integration/cloudflare-kv';

// Usage with Hono
configureAppServer(app, {
  appName: "Test",
  appSecret: "Test",
  shopRepository: new CloudflareShopRepository(env.KV_BINDING),
});

// Without Hono
const appServer = new AppServer(..., new CloudflareShopRepository(env.KV_BINDING));
```

</Tab>

<Tab title="Bun SQLite">

```ts
import { BunSqliteRepository } from '@shopware-ag/app-server-sdk/integration/bun-sqlite';

// Usage with Hono
configureAppServer(app, {
  appName: "Test",
  appSecret: "Test",
  shopRepository: new BunSqliteRepository('my-sqlite.db'),
});

// Without Hono
const appServer = new AppServer(..., new BunSqliteRepository('my-sqlite.db'));
```

</Tab>

<Tab title="Better SQLite (Node)">

The package `better-sqlite3` needs to be installed separately:

```bash
npm install --save better-sqlite3
```

```ts
import { BetterSqlite3Repository } from '@shopware-ag/app-server-sdk/integration/better-sqlite3';

// Usage with Hono
configureAppServer(app, {
  appName: "Test",
  appSecret: "Test",
  shopRepository: new BetterSqlite3Repository('my-sqlite.db'),
});

// Without Hono
const appServer = new AppServer(..., new BetterSqlite3Repository('my-sqlite.db'));
```

</Tab>

</Tabs>

Next, we will look into the [External Frontend](./07-external-frontend.md).
