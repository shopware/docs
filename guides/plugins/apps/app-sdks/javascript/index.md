---
nav:
  title: JavaScript App Server SDK
  position: 10

---

# JavaScript App Server SDK

The [JavaScript App Server SDK](https://github.com/shopware/app-sdk-js) provides the building blocks for developing Shopware apps. Written in pure Typescript, the SDK is built on the standard JavaScript Request/Response APIs and therefore can run in environments such as Node.js. Deno, Bun, and Cloudflare Workers.

The SDK provides a context object that grants access to relevant information and services within the Shopware environment. This context is essential for interacting with Shopware's APIs, accessing database entities, and executing various operations.

To ensure secure communication between the application and Shopware, this SDK supports signing mechanisms that allow developers to validate the authenticity and integrity of requests and responses.

It also includes an HTTP client that simplifies making API requests to Shopware endpoints. It provides methods for handling authentication, executing HTTP requests, and processing responses.
