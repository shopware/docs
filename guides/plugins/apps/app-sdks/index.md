---
nav:
  title: App SDKs
  position: 20

---

# App SDKs

The Shopware app SDK enables you to build applications and plugins that extend the functionality of the Shopware e-commerce platform. It provides the necessary resources and tools to simplify the development process and integrate custom logic into the Shopware environment.

| **Layer** | **Type** | **Core strengths** | **Security / ops** | **What it lacks** | **Registration flow** | **Lifecycle handling** | **Webhook handling** | **Authenticated HTTP client** | **Storage / persistence** | **Storage backends** | **Structured errors** | **Framework integration** | **Agnostic core** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [Meteor Admin SDK](../administration/meteor-admin-sdk.md) | Frontend | Admin UI extensions for apps and plugins | Extends the Shopware Admin UI; notifications, context/location access, UI/data integration; TypeScript; dependency-free; tree-shakable | Not relevant as a backend/ops SDK | No backend capabilities such as registration, webhook verification, lifecycle handling, or shop persistence | No | No| No | No | No | None | No | N/A | Yes, as a frontend TS SDK |
| [App SDK PH](../app-sdks/php/index.md) | Backend | PHP / Symfony-style app backends | Strong core backend coverage: registration, lifecycle, action parsing into structs, events, signing, context handling, HTTP client; PSR-based; Symfony Bundle available | Solid fundamentals, but less explicitly productized around ops/security than Go | Less explicit support for replay protection, storage backends, response builders, structured errors, and middleware/extensibility | Yes | Yes | Yes | Yes | Some abstraction, but not a major productized feature | Not prominently surfaced | Not prominently surfaced | Symfony Bundle | Yes, via PSR Request/Response/HttpClient/Repository |
| [App SDK JS](../app-sdks/javascript/index.md) | Backend | TS/JS backends, Node, Deno, Cloudflare Workers, serverless / edge | Runtime portability; strong story around registration, signing/verification, preconfigured API client, complete registration handshake | Good portability, but thinner explicit ops/security story than Go SDK | Less explicit coverage for lifecycle handling, webhook ergonomics, storage/persistence, structured errors, and response helpers | Yes | Not strongly surfaced | Not strongly surfaced | Yes | Not clearly surfaced | Not prominently surfaced | Not prominently surfaced | Example-led, less framework-focused | Yes, across Node, Deno, Workers, and similar runtimes |
