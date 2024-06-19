---
nav:
  title: Using custom fields of type media
  position: 110

---

# Using Custom Fields of Type Media

After you have added a custom field of type media, with the Administration or via plugin, you can assign media objects to the different entities. This is often used for products to add more images to the product detail page. If you want to learn more about custom fields you might want to take a look at this guide: [Adding custom fields](../framework/custom-field/add-custom-field).

## Overview

In the product detail page template, the key `page.product.translated.customFields.xxx` with the `xxx`, which is replaced with the corresponding custom field, contains the UUID of the media. Now the ID has just to be resolved with the function [searchMedia](https://github.com/shopware/shopware/blob/v6.3.4.1/src/Core/Framework/Adapter/Twig/Extension/MediaExtension.php#L31-L45):

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

```text
//dump() output
Shopware\Core\Content\Media\MediaEntity {#5302 ▼
  #extensions: array:1 [▶]
  #_uniqueIdentifier: "f69ab8ae42d04e17b2bab5ec2ff0a93c"
  #versionId: null
  #translated: array:3 [▶]
  #createdAt: DateTimeImmutable @1691755154 {#7298 ▶}
  #updatedAt: DateTimeImmutable @1691755154 {#6848 ▶}
  -_entityName: "media"
  -_fieldVisibility: Shopware\Core\Framework\DataAbstractionLayer\FieldVisibility {#4511 ▶}
  #userId: "0189e47673a671198c21a14f15cf563e"
  #mimeType: "image/jpeg"
  #fileExtension: "jpg"
  #fileSize: 21914
  #title: null
  #metaDataRaw: null
  #mediaTypeRaw: "O:47:"Shopware\Core\Content\Media\MediaType\ImageType":3:{s:13:"\x00*\x00extensions";a:0:{}s:7:"\x00*\x00name";s:5:"IMAGE";s:8:"\x00*\x00flags";a:0:{}}"
  #metaData: array:3 [▶]
  #mediaType: Shopware\Core\Content\Media\MediaType\ImageType {#6626 ▶}
  #uploadedAt: DateTimeImmutable @1691755154 {#7376 ▶}
  #alt: null
  #url: "http://YOUR_SHOP_URL.TEST/media/f5/d3/45/1691755154/shirt_red_600x600.jpg"
  #fileName: "shirt_red_600x600"
  #user: null
  #translations: null
  #categories: null
  #productManufacturers: null
  #productMedia: null
  #avatarUsers: null
  #thumbnails: Shopware\Core\Content\Media\Aggregate\MediaThumbnail\MediaThumbnailCollection {#7086 ▶}
  #mediaFolderId: "0189e474eda5709fb8ef632219dd6fc0"
  #mediaFolder: null
  #hasFile: true
  #private: false
  #propertyGroupOptions: null
  #mailTemplateMedia: null
  #tags: null
  #thumbnailsRo: "O:77:"Shopware\Core\Content\Media\Aggregate\MediaThumbnail\MediaThumbnailCollection":2:{s:13:"\x00*\x00extensions";a:0:{}s:11:"\x00*\x00elements";a:4:{s:32:"018 ▶"
  #documentBaseConfigs: null
  #shippingMethods: null
  #paymentMethods: null
  #productConfiguratorSettings: null
  #orderLineItems: null
  #cmsBlocks: null
  #cmsSections: null
  #cmsPages: null
  #documents: null
  #appPaymentMethods: null
  #productDownloads: null
  #orderLineItemDownloads: null
  #customFields: null
  #id: "f69ab8ae42d04e17b2bab5ec2ff0a93c"
}
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

## Display image

Use a direct html `img` tag to load the original image.

```twig
<img src="{{ sportsMedia.url }}" alt="{{ sportsMedia.alt }}">
```

You can also use the `sw_thumbnails` twig function to load viewport specific images.

```twig
{% sw_thumbnails 'my-sportsMedia-thumbnails' with {
media: sportsMedia
} %}
```
