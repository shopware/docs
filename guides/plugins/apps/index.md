---
nav:
  title: Apps
  position: 30

---

# Apps

Apps are the extension mechanism designed for Shopware’s [Cloud environment](../../../products/saas.html). Unlike [plugins](../plugins/plugins/), they don't run code directly inside the shop system. Instead, they work in an event-driven way and communicate with external services through APIs. This makes them less intrusive while still highly flexible.

Apps are well-suited for use cases such as:

- Integrating with third-party services (e.g., ERP, CRM, marketing tools)
- Providing payment methods and forwarding to external payment providers
- Adding storefront customizations, including themes
- Handling data or processes outside of the shop system (e.g., product synchronization, advanced shipping logic, analytics workflows)
- Extending or modifying core functionality such as checkout behavior, pricing and discount logic, payment flows, product catalog management, or search behavior
- Customizing the Storefront or Administration; creating custom themes, adding custom blocks or Storefront elements, or modifying the appearance and layout of the Administration panel
- Facilitating integration with external systems to allow seamless data synchronization, order and product management, and cross-platform workflows

You can develop apps using the Shopware [App SDK](app-sdks), [App Scripts](app-scripts), and external services via the [App API](../../../resources/references/app-reference). Apps offer a modular and scalable way to extend and customize the platform according to specific business requirements.

Follow our [App Base Guide](app-base-guide) and [App Starter Guide](starter) to learn how to develop an app.

::: info
Apps also provide theme support, so everything you can do with a theme plugin is also possible in an app. This makes them the preferred option for customizing design in Cloud shops.
:::

To understand how apps differ from other extension types, see the [Overview table](../../../guides/plugins/index).
