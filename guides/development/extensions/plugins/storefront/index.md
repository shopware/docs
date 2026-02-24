---
nav:
  title: Storefront
  position: 70

---

# Storefront

The [Storefront](https://developer.shopware.com/docs/concepts/framework/architecture/storefront-concept.html) is the customer-facing layer of Shopware. When building a plugin, you extend the Storefront to:

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

### Controllers

Create new routes and pages, or extend existing ones.

* [Add custom controller](controllers/add-custom-controller.md)
* [Add custom page](controllers/add-custom-page.md)
* [Add data to a storefront page](controllers/add-data-to-storefront-page.md)

### Templates

Override or extend Twig templates and layout blocks.

* [Customize templates](templates/customize-templates.md)
* [Customize header & footer](templates/customize-header-footer.md)
* [Add Twig function](templates/add-custom-twig-function.md)

### JavaScript

Extend or override frontend behavior.

* [Add custom JavaScript](javascript/add-custom-javascript.md)
* [Override existing JavaScript](javascript/override-existing-javascript.md)
* [React to JavaScript events](javascript/reacting-to-javascript-events.md)
* [Fetch data dynamically](javascript/fetching-data-with-javascript.md)
* [Add JavaScript as script tag](javascript/add-javascript-as-script-tag.md)

### Styling and assets

Control appearance and resources.

* [Add custom styling](styling/add-custom-styling.md)
* [Add custom assets](styling/add-custom-assets.md)
* [Add icons](styling/add-icons.md)
* [Add translations](styling/add-translations.md)
* [Add SCSS variables](styling/add-scss-variables.md)
* [Add SCSS variables via subscriber](styling/add-scss-variables-via-subscriber.md)

## Advanced

Infrastructure and optimization topics.

* [Add caching to custom controller](advanced/add-caching-to-custom-controller.md)
* [React to cookie consent changes](advanced/reacting-to-cookie-consent-changes.md)
* [Remove unnecessary JS plugin](advanced/remove-unnecessary-js-plugin.md)
* [Add cookie to manager](advanced/add-cookie-to-manager.md)

## How-to

Feature-specific examples and focused use-cases.

* [Custom captcha](howto/add-custom-captcha.md)
* [Listing filters](howto/add-listing-filters.md)
* [Custom sorting for product listing](howto/add-custom-sorting-product-listing.md)
* [Use nested line items](howto/use-nested-line-items.md)
* [Using a modal window](howto/using-a-modal-window.md)
* [Using custom fields in storefront](howto/using-custom-fields-storefront.md)
* [Use media thumbnails](howto/use-media-thumbnails.md)
* [Using the datepicker plugin](howto/using-the-datepicker-plugin.md)

## Build and watch

After modifying Storefront code, [rebuild your assets](using-watchers.html).

## Headless storefront

[Visit these pages](https://developer.shopware.com/frontends/) if you are building a headless frontend instead of extending the default Storefront.
