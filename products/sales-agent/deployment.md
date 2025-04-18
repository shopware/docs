---
nav:
title: Deployment
position: 70

---

## Deployment

For general information about running a Nuxt application in production, refer to the [official docs](https://nuxt.com/docs/getting-started/deployment).

In addition, the Sales Agent is using a configurable storage adapter for persisting data (`server/infrastructure/StorageAdapter.ts`). During local development, there is a file-based fallback storage adapter. However, in production, you need to configure a proper storage adapter.
The corresponding configuration can be found in `nuxt.config.ts` in the `nitro.storage` object.

For the usage, please read the [nitro unstorage documentation](https://nitro.build/guide/storage).

For a list of supported storage drivers and more detailed information, please refer to the [unstorage documentation](https://unstorage.unjs.io/).

## Production build

To build and start the project in production mode:

```bash
pnpm run build
pnpm run start
```

There is also a docker compose configuration to start the project in production mode:

```bash
docker compose -f docker-compose.prod.yml up
```
