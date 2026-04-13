---
nav:
  title: Context
  position: 30

---

# Context

The `ContextResolver` validates incoming requests, resolves the corresponding shop, and returns a typed context for further processing.

- `fromBrowser()` resolves requests coming from browser-based app modules, such as iframes.
- `fromAPI()` resolves requests coming from Shopware server-to-server calls, such as webhooks or action buttons.

## Usage

```javascript
import { AppServer } from '@shopware-ag/app-server-sdk'

const app = new AppServer(/** ... */);

// Resolve the context from the request like iframe
app.contextResolver.fromBrowser(/** Request */);

// Resolve the context from the request like webhook, action button
app.contextResolver.fromAPI(/** Request */);
```

Both methods accept a generic type parameter to define the expected context payload.

```ts
import { BrowserAppModuleRequest } from '@shopware-ag/app-server-sdk/types'

const ctx = await app.contextResolver.fromBrowser<BrowserAppModuleRequest>(/** Request */);

// This is now typed
console.log(ctx.payload['sw-version']);
```

See the [types.ts](https://github.com/shopware/app-sdk-js/blob/main/src/types.ts) for the available built-in types.

If a type is missing, either file an issue on the SDK repository or define your own in your project.

```ts
type MyCustomWebHook = {
  foo: string;
}

const ctx = await app.contextResolver.fromBrowser<MyCustomWebHook>(/** Request */);

ctx.payload.foo; // This is now typed and the IDE will help you
```

Next, we will look into [Signing Responses](./04-signing).
