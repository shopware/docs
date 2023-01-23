# Product Search

Our product search is a small Storefront plugin that allows you to create input fields with autocompletion for products.
A small example is shown below. The plugin deactivates the default autocompletion for this field from your browser.

<!--
```twig
<div class="b2b--search-container">
    <input type="text" name="" data-product-search="{{ path('frontend.b2b.b2bproductsearch.searchProduct') }}" value="" />
</div>
```
-->

## Elasticsearch

While using Elasticsearch, you have to enable the variants filter in the filter menu of the basic settings to show all variants in the product search.

![ProductSearchOptions](../../../../../.gitbook/assets/product-search-options.png)
