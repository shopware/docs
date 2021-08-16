# Store API

Every interaction between the store and a customer can be modeled using the Store API. It serves as a normalised layer or interface to communicate between customer-facing applications and the Shopware Core. It can be used to build custom frontends like single page applications, native apps or simple catalog apps. It really doesn't matter, what you want to build, as long as you're able to consume a JSON API via HTTP.

![Data and logic flow in Shopware 6 \(top to bottom and vice versa\)](../../.gitbook/assets/image%20%283%29.png)

Whenever additional logic is added to Shopware, the method of the corresponding service is exposed via a dedicated HTTP route. At the same time it can be programmatically used to provide data to a controller or other services in the stack. This way we can ensure that there is always common logic between the API and the storefront and almost no redundancy. It also allows us to build core functionalities into our storefront without compromising support for our API consumers.

## Extensibility

Using plugins you can add custom routes to the Store API \(as well as any other routes\) and also register custom services. We don't force developers to provide API coverage for their functionalities, however if you want to support headless applications, make sure that your plugin provides its functionalities through dedicated routes.

{% page-ref page="../../guides/plugins/plugins/framework/store-api" %}

## What next?

If you want to start working with the Store API, check out our guide below or find a structured list of endpoints in our endpoint reference.
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://shopware.stoplight.io/docs/store-api/docs/guides/quick-start/README.md" caption="Quickstart Guide" %}

An interesting project based \(almost\) solely on the Store API is Shopware PWA.

{% page-ref page="../../products/pwa" %}

Explore all endpoints of our Store API in our reference
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://shopware.stoplight.io/docs/store-api/storeapi.json" caption="Endpoint Reference" %}

