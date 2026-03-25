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

You can develop apps using the Shopware [App SDK](app-sdks/index.md), [App Scripts](app-scripts/), and external services via the [App API](../../../resources/references/app-reference/). Apps offer a modular and scalable way to extend and customize the platform according to specific business requirements.

Some app extension points use a **gateway pattern**, where Shopware delegates a specific task to an external app service and continues processing based on the returned result. A prominent example is the [checkout gateway](https://github.com/shopware/shopware/blob/238a60c273ea74bc06c7edb0c1f49706e8ff778e/adr/2024-04-01-checkout-gateway.md). For comparison, [App Scripts](https://github.com/shopware/shopware/blob/238a60c273ea74bc06c7edb0c1f49706e8ff778e/adr/2021-10-21-app-scripting.md) cover synchronous, sandboxed logic inside the app system, but come with caveats.

Follow our [App Base Guide](app-base-guide/) and [App Starter Guide](starter/) to learn how to develop an app.

::: info
Apps also provide theme support, so everything you can do with a theme plugin is also possible in an app. This makes them the preferred option for customizing design in Cloud shops.
:::

To understand how apps differ from other extension types, see the [Overview table](../../../guides/plugins/index/).

## Start here

If you are new to Shopware apps, begin with the [App Base Guide](app-base-guide/). It covers the common foundation for all apps, including:

- creating an app in `custom/apps`
- adding a valid `manifest.xml`
- refreshing the app registry
- installing and activating the app

## Build path by use case

After the base setup, continue with the path that fits your app:

- **Build an Admin UI app:** Use [Build an Admin UI App Locally](create-admin-extension.md) if you want to add a custom Administration module and develop it locally with a frontend dev server, without setting up an app backend first.

- **Apps with a backend:** Use [App Registration & Backend Setup](app-registration-setup.md) if your app needs registration, authenticated server-to-server communication, webhooks, signing, Admin API credentials, payment methods, tax providers, or other backend-driven features.

- **Administration extensions:** Use the [App Base Guide](app-base-guide/) if your immediate goal is to add an Administration UI and iterate locally with Vite and the Admin Extension SDK.

- **Request signing and verification:** See [Signing & Verification in the App System](app-signature-verification.md) for secure request validation and response signing.

- **Event-based integrations:** See [Webhook](webhook.md) to react to Shopware events asynchronously.

- **Feature-specific integrations:** Continue with the dedicated guides for [Payment](payment.md), [Shipping methods](shipping-methods.md), [Tax provider](tax-provider.md), or [Configuration](configuration.md), depending on your app’s capabilities.
