---
nav:
  title: Sales Channels
  position: 30

---

# Sales Channels

Sales channels allow you to operate multiple separate stores from a single Shopware instance.

These stores can have different configurations based on:

* Channel type \(Storefront, API consumer, feed export, social channels\)
* Appearance \([Themes](../../../guides/plugins/themes/theme-base-guide) for [Storefront](../../../concepts/framework/architecture/storefront-concept) sales channels\)
* [Payment methods](../checkout-concept/payments)
* Languages
* Currencies
* Domains
* Prices
* [Products](products) and [Categories](categories)

## Store separation

While using sales channels, you can achieve a logical separation of stores facing customers. They are technically not separated within your store's backend. Any admin user can still see orders, products, prices, etc., from every sales channel.

Usually, sales channels are identified by their URL; however, some clients don't have any URLs, like mobile applications or integrations to other distribution channels, e.g., social media platforms. These integration points can use an *access key* when they [use the API](../../../guides/integrations-api/) to identify the right sales channel.

## Domains

A sales channel can have multiple associated domain configurations. These domains are used to resolve pre-configurations for currencies, snippet sets, and languages based on routes. This way, you can configure various domains such as:
<!-- markdown-link-check-disable -->
* [https://example.com/](https://example.com/)
  * Locale en-GB, British English, Pounds
* [https://example.com/de](https://example.com/de)
  * Locale de-DE, German, Euro
* [https://example.es/](https://example.es/)
  * Locale es-ES, Spanish, Euro
<!-- markdown-link-check-enable -->
