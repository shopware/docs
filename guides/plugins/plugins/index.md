---
nav:
  title: Plugins
  position: 20

---

# Plugins

Plugins are an advanced way of extending Shopware 6. They can be installed in self-hosted and PaaS environments.

## Framework

Plugins are implemented in PHP and based around the extension principles of the [Symfony framework](https://symfony.com/). It is useful, but not required to have a basic understanding of Symfony before starting to develop plugins. Furthermore, plugins are based on Symfony Packages and Composer.

We strongly recommend reading our base guide to get started with plugin development:

<PageRef page="plugin-base-guide" sub="Learn the basics of plugin development in Shopware 6" />

For developers with prior experience in Symfony, there's a shortcut to get started:

<PageRef page="plugins-for-symfony-developers" sub="Learn how Symfony bundles are used to extend Shopware 6" />

Developing more sophisticated plugins also requires a profound understanding of the Shopware 6 architecture, as Core services will be used extensively. Our guides will help you dive into these concepts and provide you with the necessary knowledge.

Compared to [Apps](../apps/capabilities.md), Plugins capabilities don't map to a specific use case, but provide very generic APIs that can be used to implement a wide range of use cases.

## Plugin Capabilities

Plugins provide various capabilities (or extension APIs) to extend the Shopware 6 platform. These capabilities are grouped into the following categories:

| Capability | Description | Use cases |
| :--- | :--- | :--- |
| [Service Decoration](/docs/resources/references/adr/2020-11-25-decoration-pattern) | Create, decorate or replace Shopware services | <ul style="margin-bottom: 0;"><li><a href="checkout/cart/customize-price-calculation">Cart calculation</a></li><li><a href="framework/store-api/add-caching-for-store-api-route">Route caching</a></li><li><a href="content/sitemap/modify-sitemap-entries">Sitemap modification</a></li></ul> |
| Events | Listen to and trigger events | <ul style="margin-bottom: 0;"><li><a href="checkout/order/listen-to-order-changes">Order changes</a></li><li><a href="storefront/add-data-to-storefront-page">Storefront data loading</a></li><li><a href="storefront/add-listing-filters">Listing filters</a></li><li><a href="framework/event/add-custom-event.html">Add custom event</a></li></ul> |
| Commands | Add custom CLI commands | [Create custom jobs](plugin-fundamentals/add-custom-commands) or actions for CI, deployment, indexing, imports/exports |
| Controllers | Add custom pages and Admin API endpoints | <ul style="margin-bottom: 0"><li><a href="storefront/add-custom-controller">Storefront controller</a></li><li><a href="storefront/add-custom-page">Custom page</a></li></ul> |
| Routes | Add Store API endpoints | Add [custom endpoints](framework/store-api/add-store-api-route) for headless consumers |
| [Migrations](/docs/concepts/framework/migrations) | Add custom database migrations | [Create database tables](plugin-fundamentals/database-migrations), add new columns, etc. |
| Entities | Represent database records as objects | <ul style="margin-bottom: 0;"><li><a href="framework/data-handling/add-custom-complex-data">Custom entities</a></li><li><a href="framework/data-handling/add-complex-data-to-existing-entities">Extend entities</a></li><li><a href="framework/data-handling/versioning-entities">Versioning</a></li></ul> |
| Twig | Extend the storefront | Override the [storefront logo](storefront/customize-templates) |
| Themes | Create custom storefront themes | Create reusable themes, configurations and template multi-inheritance |
| [Admin Extension SDK](https://shopware.github.io/admin-extension-sdk/) | Integrate with the admin panel | <ul style="margin-bottom: 0;"><li>Custom <a href="https://shopware.github.io/admin-extension-sdk/docs/guide/api-reference/ui/mainModule">admin modules</a></li><li>admin <a href="starter/starter-admin-extension">notifications</a></li><li><a href="https://shopware.github.io/admin-extension-sdk/docs/guide/api-reference/ui/component-section">component section</a></li></ul> |
