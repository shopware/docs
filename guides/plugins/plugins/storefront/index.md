---
nav:
  title: Storefront
  position: 70

---

# Storefront

The [Storefront](../../../../concepts/framework/architecture/storefront-concept.md) is the customer-facing layer of Shopware. When building a plugin, you extend the Storefront to:

* Add new pages or endpoints
* Modify templates and layouts
* Inject dynamic data
* Add JavaScript behavior
* Customize styling and assets

This section follows a practical development workflow and mirrors the folder structure inside `/storefront`.

## How to use this section

Most Storefront customizations follow this sequence:

1. Add or extend a controller
2. Render or override a template
3. Inject data into the page
4. Enhance behavior with JavaScript
5. Apply styling and assets

Start with the `/controllers` folder and move downward as needed.

## Section structure

## Advanced

Infrastructure and optimization topics.

* [Add caching to custom controller](../storefront/advanced/add-caching-to-custom-controller.md)
* [Add cookie to manager](../storefront/advanced/add-cookie-to-manager.md)
* [Reacting to cookie consent changes](../storefront/advanced/reacting-to-cookie-consent-changes.md)
* [Remove unnecessary JavaScript plugin](../storefront/advanced/remove-unnecessary-js-plugin.md)

### Controllers

Create new routes and pages, or extend existing ones.

* [Add custom controller](../storefront/controllers/add-custom-controller.md)
* [Add custom page](../storefront/controllers/add-custom-page.md)
* [Add custom pagelet](../storefront/controllers/add-custom-pagelet.md)
* [Add data to a storefront page](../storefront/controllers/add-data-to-storefront-page.md)
* [Add Dynamic Content via AJAX Calls](../storefront/controllers/add-dynamic-content-via-ajax-calls.md)

## How-to

Feature-specific examples and focused use-cases.

* [Add custom captcha](../storefront/howto/add-custom-captcha.md)
* [Add custom sorting for product listing](../storefront/howto/add-custom-sorting-product-listing.md)
* [Add listing filters](../storefront/howto/add-listing-filters.md)
* [Use media thumbnails](../storefront/howto/use-media-thumbnails.md)
* [Use nested line items](../storefront/howto/use-nested-line-items.md)
* [Using a modal window](../storefront/howto/using-a-modal-window.md)
* [Using custom fields in storefront](../storefront/howto/using-custom-fields-storefront.md)
* [Using the datepicker plugin](../storefront/howto/using-the-datepicker-plugin.md)

### JavaScript

Extend or override frontend behavior.

* [Add custom JavaScript](../storefront/javascript/add-custom-javascript.md)
* [Add JavaScript as script tag](../storefront/javascript/add-javascript-as-script-tag.md)
* [Fetch data dynamically](../storefront/javascript/fetching-data-with-javascript.md)
* [Override existing JavaScript](../storefront/javascript/override-existing-javascript.md)
* [React to JavaScript events](../storefront/javascript/reacting-to-javascript-events.md)
* [Storefront Plugins and Helper Reference](../storefront/javascript/plugin-reference.md)

### Styling and assets

Control appearance and resources.

* [Add custom assets](../storefront/styling/add-custom-assets.md)
* [Add custom styling](../storefront/styling/add-custom-styling.md)
* [Add icons](../storefront/styling/add-icons.md)
* [Add SCSS variables](../storefront/styling/add-scss-variables.md)
* [Add SCSS variables via subscriber](../storefront/styling/add-scss-variables-via-subscriber.md)
* [Add translations](../storefront/styling/add-translations.md)

### Templates

Override or extend Twig templates and layout blocks.

* [Add Twig function](../storefront/templates/add-custom-twig-function.md)
* [Customize header & footer](../storefront/templates/customize-header-footer.md)
* [Customize templates](../storefront/templates/customize-templates.md)
* [Twig functions reference](../storefront/templates/twig-function-reference.md)

## Next steps

* After modifying Storefront code, [rebuild your assets](../../../development/tooling/using-watchers.md)
* [Visit the Composable Frontends guide](https://developer.shopware.com/frontends/) when building headless frontends instead of extending the default Storefront
