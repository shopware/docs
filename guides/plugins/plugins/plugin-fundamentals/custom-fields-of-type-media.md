# Using Custom Fields of Type Media

After you have added a custom field of type media, with the Administration or via plugin, you can assign media objects to the different entities. This is often used for products to add more images to the product detail page. If you want to learn more about custom fields you might want to take a look at this guide: [Adding custom fields](../framework/custom-field/add-custom-field).

## Overview

In the product detail page template, the key `page.product.translated.customFields.xxx` with the `xxx`, which is replaced with the corresponding custom field, contains the UUID of the media. Now the ID has just to be resolved with the function [searchMedia](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Framework/Adapter/Twig/Extension/MediaExtension.php#L31-L45):

```php
// platform/src/Core/Framework/Adapter/Twig/Extension/MediaExtension.php
public function searchMedia(array $ids, Context $context): MediaCollection { ... }
```

This function resolves out the corresponding media objects for the given IDs in order to continue working with them afterwards. Here is an example with a custom field \(`custom_sports_media_id`\) on the product detail page:

```twig
// <plugin root>/src/Resources/views/storefront/page/content/product-detail.html.twig
{% sw_extends '@Storefront/storefront/page/product-detail/index.html.twig' %}

{% block page_product_detail_media %}
    {# simplify ID access #}
    {% set sportsMediaId = page.product.translated.customFields.custom_sports_media_id %}

    {# fetch media as batch - optimized for performance #}
    {% set mediaCollection = searchMedia([sportsMediaId], context.context) %}

    {# extract single media object #}
    {% set sportsMedia = mediaCollection.get(sportsMediaId) %}

    {{ dump (sportsMedia) }}
{% endblock %}
```

## Avoid loops

This function performs a query against the database on every invocation and should therefore not be used within a loop. To resolve multiple ID's at once just pass it an array of ID's instead.

To read the media objects within the product listing we recommend the following procedure:

```twig
// <plugin root>/src/Resources/views/storefront/component/product/listing.html.twig
{% sw_extends '@Storefront/storefront/component/product/listing.html.twig' %}

{% block element_product_listing_col %}
    {# initial ID array #}
    {% set sportsMediaIds = [] %}

    {% for product in searchResult %}
        {# simplify ID access #}
        {% set sportsMediaId = product.translated.customFields.custom_sports_media_id %}

        {# merge IDs to a single array #}
        {% set sportsMediaIds = sportsMediaIds|merge([sportsMediaId]) %}
    {% endfor %}

    {# do a single fetch from database #}
    {% set mediaCollection = searchMedia(sportsMediaIds, context.context) %}

    {% for product in searchResult %}
        {# simplify ID access #}
        {% set sportsMediaId = product.translated.customFields.custom_sports_media_id %}

        {# get access to media of product #}
        {% set sportsMedia = mediaCollection.get(sportsMediaId) %}

        {{ dump(sportsMedia) }}
    {% endfor %}
{% endblock %}
```
