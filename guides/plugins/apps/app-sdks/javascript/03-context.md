---
nav:
  title: Context
  position: 30

---

# Context

The ContextResolver helps you to validate the Request, resolve the Shop and provide types for the Context.

## Usage

```javascript
import { AppServer } from '@shopware-ag/app-server-sdk'

const app = new AppServer(/** ... */);

// Resolve the context from the request like iframe
app.contextResolver.fromBrowser(/** Request */);

// Resolve the context from the request like webhook, action button
app.contextResolver.fromAPI(/** Request */);
```

Both methods accepts a Type to specify the context type.

```ts
import { BrowserAppModuleRequest } from '@shopware-ag/app-server-sdk/types'

const ctx = await app.contextResolver.fromBrowser<BrowserAppModuleRequest>(/** Request */);

// This is now typed
console.log(ctx.payload['sw-version']);
```

You can checkout the [types.ts](https://github.com/shopware/app-sdk-js/blob/main/src/types.ts) to see all available types.

If you miss a type, feel free to open a PR or an issue. Otherwise you can also specify the type also in your project.

```ts
type MyCustomWebHook = {
  foo: string;
}

const ctx = await app.contextResolver.fromBrowser<MyCustomWebHook>(/** Request */);

ctx.payload.foo; // This is now typed and the IDE will help you
```

Next, we will look into the [Signing of responses](./04-signing).
