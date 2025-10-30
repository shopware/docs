---
nav:
  title: Store API
  position: 10

---

# Store API

Every interaction between the store and a customer can be modeled using the Store API. It serves as a normalized layer or an interface to communicate between customer-facing applications and the Shopware Core. It can be used to build custom frontends like SPAs, native apps, or simple catalog apps. It doesn't matter what you want to build as long as you are able to consume a JSON API via HTTP.

![Data and logic flow in Shopware 6 \(top to bottom and vice versa\)](../../assets/concepts-api-storeApiLogic.svg)

Whenever additional logic is added to Shopware, the method of the corresponding service is exposed via a dedicated HTTP route. At the same time, it can be programmatically used to provide data to a controller or other services in the stack. This way, you can ensure that there is always common logic between the API and the Storefront and almost no redundancy. It also allows us to build core functionalities into our Storefront without compromising support for our API consumers.

## Extensibility

Using plugins, you can add custom routes to the Store API \(as well as any other routes\) and also register custom services. We don't force developers to provide API coverage for their functionalities. However, if you want to support headless applications, ensure that your plugin provides its functionalities through dedicated routes.

<PageRef page="../../guides/plugins/plugins/framework/store-api/" />


## Store API and the traditional TWIG storefront

When using the server-side rendered TWIG storefront, the Store API is not used.
Instead, the storefront uses custom [storefront controllers](../../guides/plugins/plugins/storefront/add-custom-controller.md) which internally use the Store API to fetch data.

The storefront controllers are optimized for the usage in our TWIG storefront. And the biggest difference is the way that authentication and authorization are handled.
As the Store-API is a proper REST API, the main design is stateless, which means authentication info needs to be provided via the request headers in form of the `sw-context-token`.
The storefront relies on the session to store the authentication info, that way you do not have to handle the authentication manually with every request.

## What next?

* To start working with the Store API, check out our [Quick Start guide](https://shopware.stoplight.io/docs/store-api/38777d33d92dc-quick-start-guide) and explore all endpoints in our reference guide.

* An interesting project based on the Store API is [Composable Frontends](../../../frontends/).
