---
nav:
  title: Extending search template
  position: 70

---

# Extend Search Template

To show the results in the search overview, you have to extend the `search/index.html.twig` and then apply the results in your desired styling.
You can take a look at an example of `custom/plugins/SwagCommercial/src/AdvancedSearch/Resources/views/storefront/page/search/index.html.twig`.

The manufacturers and categories or your custom search result could be realized in the template as:

```twig
{% set searchResult = page.listing.extensions.multiSearchResult %}
{% set products = page.listing %}
{% set manufacturers = searchResult.getResult('product_manufacturer') %}
{% set categories = searchResult.getResult('category') %}
{% set customEntities = searchResult.getResult('custom_entity') %}
```

## How to extend the suggest template

To show the results in the suggest dropdown, you have to extend `Storefront/storefront/layout/header/search-suggest.html.twig` like the Advanced Search does in `custom/plugins/SwagCommercial/src/AdvancedSearch/Resources/views/storefront/layout/header/search-suggest.html.twig`.

The completion, manufacturers and categories or your custom search result could be realized in the template as:

```twig
{% set suggestResult = page.searchResult.extensions.multiSuggestResult %}
{% set products = page.searchResult %}
{% set completions = page.searchResult.extensions.completionResult %}
{% set manufacturers = suggestResult.getResult('product_manufacturer') %}
{% set categories = suggestResult.getResult('category') %}
{% set customEntities = suggestResult.getResult('custom_entity') %}
```
