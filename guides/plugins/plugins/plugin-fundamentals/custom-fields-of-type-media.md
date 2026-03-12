---
nav:
  title: Using custom fields of type media
  position: 110
---

# Using Custom Fields of Type Media

After adding a custom field of type media in the Administration or via a plugin, you can assign media objects to different entities.
This is often used on products to add additional images to the product detail page.
If you want to learn more about custom fields, take a look at [Adding custom fields](../framework/custom-field/add-custom-field).

## Overview

In the product detail page template, `page.product.translated.customFields.xxx` (where `xxx` is your custom field name) contains the media UUID.
Resolve this UUID by using Twig's `searchMedia` function:

```php
// platform/src/Core/Framework/Adapter/Twig/Extension/MediaExtension.php
public function searchMedia(array $ids, Context $context): MediaCollection { ... }
```

This function resolves the corresponding media entities for the given IDs.
Here is an example with a custom field \(`custom_sports_media_id`\) on the product detail page:

```twig
// <plugin root>/src/Resources/views/storefront/page/content/product-detail.html.twig
{% sw_extends '@Storefront/storefront/page/product-detail/index.html.twig' %}

{% block page_product_detail_media %}
 {# simplify ID access #}
 {% set sportsMediaId = page.product.translated.customFields.custom_sports_media_id %}

 {% if sportsMediaId %}
 {# fetch media as batch - optimized for performance #}
 {% set mediaCollection = searchMedia([sportsMediaId], context.context) %}

 {# extract single media object #}
 {% set sportsMedia = mediaCollection.get(sportsMediaId) %}
 {% endif %}
{% endblock %}
```

After loading the entity, you can use fields like `sportsMedia.url`, `sportsMedia.alt`, or `sportsMedia.title` in your template.

## Avoid loops

This function performs a database query on every invocation and should therefore not be used inside a loop.
To resolve multiple IDs at once, pass them as one array.

To read the media objects within the product listing, we recommend the following procedure:

```twig
// <plugin root>/src/Resources/views/storefront/component/product/listing.html.twig
{% sw_extends '@Storefront/storefront/component/product/listing.html.twig' %}

{% block element_product_listing_col %}
 {# initial ID array #}
 {% set sportsMediaIds = [] %}

 {% for product in searchResult %}
 {# simplify ID access #}
 {% set sportsMediaId = product.translated.customFields.custom_sports_media_id %}

 {% if sportsMediaId %}
 {# merge IDs to a single array #}
 {% set sportsMediaIds = sportsMediaIds|merge([sportsMediaId]) %}
 {% endif %}
 {% endfor %}

 {# do a single fetch from database #}
 {% set mediaCollection = searchMedia(sportsMediaIds, context.context) %}

 {% for product in searchResult %}
 {# simplify ID access #}
 {% set sportsMediaId = product.translated.customFields.custom_sports_media_id %}

 {% if sportsMediaId %}
 {# get access to media of product #}
 {% set sportsMedia = mediaCollection.get(sportsMediaId) %}
 {% endif %}
 {% endfor %}
{% endblock %}
```

## Display image

Use a direct HTML `img` tag to load the original image.

```twig
<img src="{{ sportsMedia.url }}" alt="{{ sportsMedia.alt }}">
```

You can also use the `sw_thumbnails` Twig function to load viewport-specific images.

```twig
{% sw_thumbnails 'my-sportsMedia-thumbnails' with {
 media: sportsMedia
} %}
```
