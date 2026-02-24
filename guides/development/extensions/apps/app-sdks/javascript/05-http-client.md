---
nav:
  title: HTTP-client
  position: 50

---

# Making HTTP requests to the Shop

The SDK offers a simple HTTP client for sending requests to the Shopware server. You can access the HTTP client when you resolved a context using ContextResolver or create it manually.
The client will automatically fetch the OAuth2 token for the shop and add it to the request.

## Using ContextResolver

```ts
import { AppServer } from '@shopware-ag/app-server-sdk'

const app = new AppServer(/** ... */);

const ctx = await app.contextResolver.fromBrowser<BrowserAppModuleRequest>(/** Request */);

const response = await ctx.httpClient.get<{version: string}>('/_info/version')

console.log(response.body.version)
```

## Creating the client manually

```ts
import { HttpClient } from "@shopware-ag/app-server-sdk"

// Get the shop by repository directly
const shop = ...;

const httpClient = new HttpClient(shop);

const response = await httpClient.get<{version: string}>('/_info/version')

console.log(response.body.version)
```

## Abstraction to EntityRepository

The SDK offers an abstraction to the EntityRepository. This offers a much simpler way to interact with the Shopware API and fetch entities by the generic Shopware API.

```ts
import { HttpClient } from "@shopware-ag/app-server-sdk"
import { EntityRepository } from "@shopware-ag/app-server-sdk/helper/admin-api";
import { Criteria } from "@shopware-ag/app-server-sdk/helper/criteria";

// Get the shop by repository directly
const shop = ...;

const httpClient = new HttpClient(shop);

type Product = {
  id: string;
  name: string;
};

const repository = new EntityRepository<Product>(httpClient, "product");

// Fetch all products
const products = await repository.search(new Criteria());

// Get the first product and print the name
console.log(products.first().name);
// Same as above
console.log(products.data[0].name);

// Fetch a single product

const product = await repository.search(new Criteria(['my-uuid'])).first();

// Product can be null
console.log(product.name);

// Upserts update the given product if found, otherwise creates it
await repository.upsert(['id': 'my-uuid', 'name': 'My Product']);

// This would try to create a product, but fail as not all required fields are provided
await repository.upsert(['name': 'My Product']);

// Delete a product
await repository.delete([{id: 'my-uuid'}]);
```

## Abstraction of Sync API

The Sync API offers to create/update/delete entities in the Shopware API in a batch. This is useful for syncing data from your app to the Shopware API.

The EntityRepository `upsert` and `delete` uses the Sync API under the hood as the traditional API does not support batch operations. You can use also the Sync API directly.

```ts
import { SyncOperation, SyncService } from "@shopware-ag/app-server-sdk/helper/admin-api";

// The same http client as usual
const httpClient = ...;

const syncService = new SyncService(httpClient);

await syncService.sync([
  // the key will be shown in the error response if that failed
  new SyncOperation('my-custom-key', 'product', 'upsert', [{id: 'my-uuid', name: 'My Product'}]),

  // delete a product
  new SyncOperation('my-custom-key', 'product', 'delete', [{id: 'my-uuid'}]),
]);
```

The second argument also allows a ApiContext to be passed to configure the API behaviour like disable indexing, or do it using queue asynchronous, disable triggering of flows, etc.

## Abstraction of Media APIs

The SDK offers helpers to manage the Shopware Media Manager. This allows you to easily upload an media, lookup folders or create new folder.

```ts
import { createMediaFolder, uploadMediaFile, getMediaFolderByName } from '@shopware-ag/app-server-sdk/helper/media';

// The same http client as usual
const httpClient = ...;

// Create a new folder
const folderId = await createMediaFolder(httpClient, 'My Folder', {});

// Create a new folder with parent folder id
const folderId = await createMediaFolder(httpClient, 'My Folder', {parentId: "parent-id"});

// Lookup a folder by name
const folderId = await getMediaFolderByName(httpClient, 'My Folder');

// Lookup a folder by default folder for an entity
// Returns back the folderId to be used when using a media for a product
const folderId = await getMediaDefaultFolderByEntity(httpClient, 'product');

// Upload a file to the media manager
await uploadMediaFile(httpClient, {
    file: new Blob(['my text'], { type: 'text/plain' }),
    fileName: `foo.text`,
    // Optional, a folder id to upload the file to
    mediaFolderId: folderId
});
```

Next, we will look into the [Integrations](./06-integration).
