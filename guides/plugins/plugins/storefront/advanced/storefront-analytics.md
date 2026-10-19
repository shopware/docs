---
nav:
  title: Storefront analytics with Google Analytics 4
  position: 180

---

# Storefront analytics with Google Analytics 4

The Storefront reports ecommerce events to Google Analytics 4 (GA4) when analytics are active for a sales channel. This guide describes the data the Storefront sends, the identifiers your Google Tag Manager setup can rely on, and how an extension makes its own products and lists visible to analytics.

::: info
This guide describes the behavior of Shopware 6.7.16.0 and later. Earlier versions send a different payload. The release notes of 6.7.16.0 list what changed.
:::

## Prerequisites

Analytics are configured per sales channel in the Administration, in the analytics settings of the sales channel. The Storefront only loads the analytics script when a tracking ID is set and analytics are active. With the default cookie consent, the script only starts after the shopper accepted the Google Analytics or Google Ads cookie.

A sales channel without active analytics renders none of the analytics attributes described in this guide, loads no analytics script, and answers the analytics routes with a 404.

## Delivery

The Storefront chooses the transport by the tracking ID:

* A Google tag ID, such as `G-XXXXXXX`, sends every event with `gtag('event', name, parameters)`.
* A Google Tag Manager ID, such as `GTM-XXXXXXX`, pushes ecommerce events to `window.dataLayer` in the format Google documents for GA4. The previous ecommerce object is cleared first.

```javascript
window.dataLayer.push({ ecommerce: null });
window.dataLayer.push({
    event: 'add_to_cart',
    ecommerce: {
        currency: 'EUR',
        value: 39.98,
        items: [{ item_id: 'SW10001', item_name: 'Shirt', price: 19.99, quantity: 2 }],
    },
});
```

Events without ecommerce data, such as `login`, `sign_up` and `search`, are pushed with their parameters at the top level, for example `{ event: 'login', method: 'mail' }`.

In Google Tag Manager, read the parameters with data layer variables such as `ecommerce.items` or `ecommerce.value`, and use the GA4 event tag with "Send Ecommerce data" enabled.

## Events

| Event                  | Reported when                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `view_item_list`       | A product listing is shown, filtered, sorted or paginated                                                                              |
| `select_item`          | The shopper follows a product link in a list                                                                                           |
| `view_item`            | A product detail page is shown                                                                                                         |
| `add_to_cart`          | A product is added to the cart. Repeating an order in the account reports one event with all its line items                            |
| `remove_from_cart`     | A product is removed from the cart                                                                                                     |
| `add_to_wishlist`      | A product is added to the wishlist                                                                                                     |
| `remove_from_wishlist` | A product is removed from the wishlist                                                                                                 |
| `view_cart`            | The cart page is shown, or the off-canvas cart opens when its tracking is enabled in the analytics settings                            |
| `begin_checkout`       | The shopper starts the checkout                                                                                                        |
| `add_shipping_info`    | A shipping method is selected, once per method and checkout                                                                            |
| `add_payment_info`     | A payment method is selected, once per method and checkout                                                                             |
| `purchase`             | An order is placed                                                                                                                     |
| `login`                | A login succeeded. Reported on the page after the login, so a wrong password reports nothing                                           |
| `sign_up`              | A customer account was created, also by a guest with "Create account" on the checkout finish page. Reported on the page after the registration. A guest checkout and a failed registration report nothing |
| `search`               | The shopper searches                                                                                                                   |

## Event and item parameters

Items use the GA4 property names, and all numeric values are numbers:

| Parameter                                 | Content                                                        |
| ----------------------------------------- | -------------------------------------------------------------- |
| `item_id`                                 | The product number, or the product ID without a product number |
| `item_name`                               | The translated product name                                    |
| `item_brand`                              | The translated manufacturer name                               |
| `item_variant`                            | The selected options of a variant, for example `Red, L`        |
| `item_category` to `item_category5`       | The category path of the product, at most five levels          |
| `price`                                   | The unit price before discounts                                |
| `quantity`                                | The quantity of the line item                                  |
| `item_list_id`, `item_list_name`, `index` | The list the product was presented in, see [Lists](#lists)     |

The cart, checkout and `purchase` events report these event parameters:

* `value` is the position price: all line items including promotion discounts, without shipping.
* `coupon` holds the codes of the applied promotions, separated by a comma.
* `shipping` and `tax` of `purchase` are reported separately from `value`.
* Discounts and other line items that are not products are not reported as items.

`add_to_cart` reports the unit price of the graduated price that applies to the quantity the cart holds after the add, and the value of the added quantity.

### Categories

On a category page, the products of the category listing take their categories from the breadcrumb. On a product detail page, the main product does. For every other product, such as on the homepage, a landing page or the wishlist, in a product slider of a category page, or in the cross selling of a product detail page, the analytics script requests the path of the product when the shopper adds or removes it. The route `frontend.analytics.product-categories` answers `GET /widgets/analytics/product-categories?productId=<id>` with the breadcrumb of the product detail page as a list of names. It is HTTP cached, and its URL is only added to `window.router` when analytics are active.

Products added from a product box post their brand and categories in the line item payload, as `manufacturerName` and `categoryNames`. The cart, checkout and purchase events read them from there, so neither the cart nor the checkout loads anything for analytics.

A product added on a page without a breadcrumb about it has no categories in its payload. The browser keeps the categories requested for it in the local storage under `swGaProductCategories` for 30 days, and the cart, checkout and purchase events fill missing categories from there. The order removes them. A line item added in another browser or through the API is reported without categories.

## Lists

`view_item_list` and `select_item` report the list a product was presented in as `item_list_id` and `item_list_name`, and its position as `index`. The index counts from zero across the pages of a paginated listing. `view_item` repeats the list the product was selected from on its item, also when the shopper opened the product in another tab.

The list IDs are a contract that Google Tag Manager triggers can rely on:

| List                                   | `item_list_id`                     | `item_list_name`                                |
| -------------------------------------- | ---------------------------------- | ----------------------------------------------- |
| Category listing                       | `category:<category ID>`           | Translated category name                        |
| Listing outside a category             | `cms:<slot ID>`                    | None                                            |
| Search results                         | `search`                           | Translated snippet `search.analyticsListName`   |
| Wishlist                               | `wishlist`                         | Translated snippet `wishlist.analyticsListName` |
| Cross selling tab                      | `cross_selling:<cross selling ID>` | Translated name of the cross selling group      |
| Product slider                         | `slider:<element ID>`              | Title of the slider                             |
| Any other Shopping Experiences element | `cms:<element ID>`                 | None                                            |

For the search results, `view_item_list` and `select_item` also report the query as `search_term`, and `view_item` repeats it for a product selected from the search results. GA4 needs an event-scoped custom dimension for `search_term` to show it in reports of these events.

The list of a selected product is kept in the local storage of the browser under `swGaSelectedItemLists` for 30 minutes and is removed by the first view of the product.

## Make extension markup visible to analytics

### Products

Analytics treat every element with a `data-product-information` attribute as a product, not only the `.product-box` of the default theme. The attribute holds a JSON object with at least the product `id`:

```twig
{# a matching price rule or graduated prices replace the default price #}
{% set price = product.calculatedPrices.count > 0
    ? product.calculatedPrices.first.unitPrice
    : product.calculatedPrice.unitPrice %}

{% set productInformation = {
    id: product.id,
    sku: product.productNumber,
    name: product.translated.name,
    brand: product.manufacturer.translated.name|default(''),
    price: price
} %}

<article class="my-product-teaser" data-product-information="{{ productInformation|json_encode }}">
    <a href="{{ seoUrl('frontend.detail.page', { productId: product.id }) }}">{{ product.translated.name }}</a>
</article>
```

| Property  | Required | Reported as                                               |
| --------- | -------- | --------------------------------------------------------- |
| `id`      | Yes      | Used to match the product, and as `item_id` without `sku` |
| `sku`     | No       | `item_id`                                                 |
| `name`    | No       | `item_name`                                               |
| `brand`   | No       | `item_brand`                                              |
| `price`   | No       | `price`                                                   |
| `variant` | No       | `item_variant`                                            |

Report the price the shopper pays for one piece, as in the example: `calculatedPrices.first` when a price rule or graduated prices apply, otherwise `calculatedPrice`. The product box and the product detail page do the same.

Only these properties are reported. Other keys of the object are ignored, so the attribute can carry data for your own scripts.

A link inside the element reports `select_item`. Buttons and forms inside the element, such as the buy button, are not reported as a selection.

### Lists

A product element inside a Shopping Experiences element is attributed to that element as `cms:<element ID>` without any change. To report your own list ID and name, set `data-list-id` and `data-list-name` on an element that contains the product elements:

```twig
{% set analyticsActive = storefrontAnalytics and storefrontAnalytics.isActive() %}

<div class="my-recommendations"
     {% if analyticsActive %}
         data-list-id="my-extension:recommendations"
         data-list-name="{{ 'my-extension.recommendations'|trans }}"
     {% endif %}>
    {# product elements #}
</div>
```

Prefix your list IDs with the name of your extension, so they cannot collide with the IDs of Shopware or other extensions.

A list that is paginated can set `data-list-start` on itself or on an element inside it, with the position of its first product. The index then continues across pages.

A theme that renders `@Storefront/storefront/component/product/listing.html.twig` can pass the list through the `listId` and `listName` variables instead.

::: warning
Render analytics attributes only when `storefrontAnalytics and storefrontAnalytics.isActive()` is true, as Shopware does. A sales channel without analytics must not carry analytics data in its HTML.
:::

## Checkout steps

The shipping and payment method forms of the confirm page reload the page on every change. `add_shipping_info` and `add_payment_info` are therefore reported once per selected method of a checkout. A reload that keeps the method reports nothing, and selecting another method reports it. The reported steps are kept in the session storage under `swGaReportedCheckoutSteps` and are cleared by `begin_checkout` and `purchase`.

A new customer reports `add_shipping_info` with the shipping method of the context when submitting the registration on the checkout register page.

## Custom events

To report your own events, extend `AnalyticsEvent` from `src/plugin/google-analytics/analytics-event` and call `pushEvent()`. It chooses the transport of the sales channel and normalizes the item parameters. Pass `{ ecommerce: false }` as the third argument for an event without ecommerce data.

```javascript
import AnalyticsEvent from 'src/plugin/google-analytics/analytics-event';

export default class GenerateLeadEvent extends AnalyticsEvent {
    supports() {
        return true;
    }

    execute() {
        document.addEventListener('submit', (event) => {
            if (!this.active || !event.target.matches('.my-lead-form')) {
                return;
            }

            this.pushEvent('generate_lead', { currency: 'EUR', value: 50 });
        });
    }
}
```

Register the event by overriding the `GoogleAnalytics` plugin. The plugin is only registered when analytics are active, so the override does nothing in other sales channels:

```javascript
// <plugin root>/src/Resources/app/storefront/src/my-google-analytics.plugin.js
import GoogleAnalyticsPlugin from 'src/plugin/google-analytics/google-analytics.plugin';
import GenerateLeadEvent from './generate-lead.event';

export default class MyGoogleAnalyticsPlugin extends GoogleAnalyticsPlugin {
    registerDefaultEvents() {
        super.registerDefaultEvents();

        this.registerEvent(GenerateLeadEvent);
    }
}
```

```javascript
// <plugin root>/src/Resources/app/storefront/src/main.js
if (window.gtagActive) {
    window.PluginManager.override('GoogleAnalytics', () => import('./my-google-analytics.plugin'));
}
```

The guide [Override existing JavaScript](../javascript/override-existing-javascript.md) explains plugin overrides in detail.

## More information

* [Google Analytics 4 ecommerce events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
* [Cookie consent management](../../../../../concepts/commerce/content/cookie-consent-management.md)
* [Reacting to cookie consent changes](./reacting-to-cookie-consent-changes.md)
