---
nav:
  title: Apps
  position: 10

---

# Apps

Apps are the extension mechanism designed for Shopware’s [Cloud environment](../../../products/saas.md). Unlike [plugins](../plugins/index.md), they don't run code directly inside the shop system. Instead, they follow an event-driven, remote-extension model and communicate with external services through APIs. This makes them less intrusive while still highly flexible.

Apps are well-suited for use cases such as:

- Integrating with third-party services (e.g., ERP, CRM, marketing tools)
- Providing payment methods and forwarding to external payment providers
- Adding storefront customizations, including themes
- Handling data or processes outside the shop system (e.g., product synchronization, advanced shipping logic, analytics workflows)
- Extending or modifying core functionality such as checkout behavior, pricing and discount logic, payment flows, product catalog management, or search behavior
- Customizing the Storefront or Administration; creating custom themes, adding custom blocks or Storefront elements, or modifying the appearance and layout of the Administration panel
- Facilitating integration with external systems to allow seamless data synchronization, order and product management, and cross-platform workflows

You can develop apps using the Shopware [App SDKs](../apps/app-sdks/index.md), [App Scripts](./app-scripts/index.md), and external services with the Shopware app system and its [reference documentation](../../../resources/references/app-reference/index.md). Apps offer a modular and scalable way to extend and customize the platform according to specific business requirements.

Some app extension points use a [gateway pattern](../apps/gateways/index.md), where Shopware delegates a specific task to an external app service and continues processing based on the returned result. A prominent example is the [checkout gateway](../apps/gateways/checkout/checkout-gateway.md).

For comparison, [App Scripts](./app-scripts/index.md) cover synchronous, sandboxed logic inside the app system, but come with caveats.

::: info
Apps also provide theme support, so everything you can do with a theme plugin is also possible in an app. This makes them the preferred option for customizing design in Cloud shops.
:::

To understand how apps differ from other extension types, see the [Overview table](../../plugins/index.md#which-type-to-build).

## Start here

If you are new to Shopware apps, begin with the [App Base Guide](../apps/app-base-guide.md). It covers the common foundation for all apps, including:

- creating an app in `custom/apps`
- adding a valid `manifest.xml`
- refreshing the app registry
- installing and activating the app

## Build path by use case

After the base setup, continue with the path that fits your app:

- **Administration extensions:** Use [Build an Admin UI App Locally](create-admin-extension.md) if you want to add a custom Administration UI module and develop it locally with the [Meteor Admin SDK](../apps/administration/meteor-admin-sdk.md) and [Vite](https://vite.dev/), without setting up an app backend first.

- **Apps with a backend:** Use [App Registration & Backend Setup](app-registration-setup.md) if your app needs registration, authenticated server-to-server communication, webhooks, signing, Admin API credentials, payment methods, tax providers, or other backend-driven features.

- **Request signing and verification:** See [Signing & Verification in the App System](app-signature-verification.md) for secure request validation and response signing.

- **Event-based integrations:** See [Webhook](webhook.md) to react to Shopware events asynchronously.

- **Feature-specific integrations:** Continue with the dedicated guides for [Payment](payment.md), [Shipping methods](shipping-methods.md), [Tax provider](tax-provider.md), or [Configuration](configuration.md), depending on your app’s capabilities.
