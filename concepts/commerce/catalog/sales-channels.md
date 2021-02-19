# Sales Channels

Sales channels allow you to operate multiple, separate stores from a single Shopware instance.

These stores can have different configurations with regard to

* Channel type \(Storefront, API consumer, feed export, social channels\)
* Appearance \([Themes](../../../guides/plugins/themes.md) for [Storefront](../../framework/architecture/storefront.md) sales channels\)
* [Payment methods](../checkout/payments.md)
* Languages
* Currencies
* Domains
* [Prices](prices.md)
* [Products](products.md) & [categories](categories.md)

## Store separation

Whilst using sales channels you can achieve a logical separation of stores facing customers, they are technically not separated within your store backend. Any admin user can still see orders, products, prices etc. from every sales channel.

Usually, sales channels are \(if possible identified by there URL\), however there can also be clients that don't have any URL, like mobile applications or integrations to other distribution channels \(e.g. social media platforms\). These integration points can use an **access key** when they [use the API](../../../guides/integrations-api/store-api-guide/#authentication-and-setup) to identify for the correct sales channel.

## Domains

A sales channel can have multiple associated domain configurations. These domains are used to resolve pre-configurations for currencies, snippet sets and languages based on routes. This way you can configure various domains such as:

* https://fruitsandveggies.com/
  * Locale en-GB, British English, Pounds
* https://fruitsandveggies.com/de
  * Locale de-DE, German, Euro
* https://fruitsandveggies.es/
  * Locale es-ES, Spanish, Euro

