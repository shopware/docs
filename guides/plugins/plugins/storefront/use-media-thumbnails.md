# Working with Media and Thumbnails

## Overview

In Shopware's Storefront, you can assign media objects to the different entities. To name an example, this is often used for products to show more information with images on the product detail page. This guide should give you a starting point on how to use media and thumbnails in your Storefront plugin.

## Prerequisites

In order to use your own media files or thumbnails of your plugin in the Storefront, of course you first need a plugin as base. To create an own plugin, you can refer to the Plugin Base Guide:

<PageRef page="../plugin-base-guide" />

Displaying custom images is often done by using custom fields. To take full advantage of this guide, you might want to read the corresponding guide on using custom fields:

<PageRef page="../administration/add-custom-field" />

## Using searchMedia function

You should be able to store media in your shop and to maintain them in your Administration. It is not possible to display such an image in the Storefront with only its media ID though. To achieve that, the function `searchMedia` exists:

```php
public function searchMedia (array $ids, Context $context): MediaCollection { 
... 
}
```

This `searchMedia` function reads out the corresponding media objects for the given IDs in order to continue working with them afterwards. Here is an example with a custom field \(`custom_sports_media_id`\) on the product detail page:

```text
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

::: danger
Please note that this function performs a query against the database and should therefore not be used within a loop.
:::

The function is already structured in a way that several IDs can be passed. To read the media objects within the product listing we recommend the following procedure:

```text
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

## Working with sw\_thumbnail

A common issue when developing responsive web pages is resizing images properly for different screen widths. By default, Shopware generates various thumbnails for each uploaded image. Normally you would have to manually write large chunks of HTML code to render the needed images with `img` and `srcset`.

Fortunately, you do not need to define these attributes on your own - For that, Shopware introduced the `sw_thumbnails` Twig function: `sw_thumbnails` automatically generates the `img` and `srcset` code. This is the minimal configuration:

```text
{% sw_thumbnails 'my-thumbnails' with {
    media: cover
} %}
```

As you see, `sw_thumbnail` makes use of one required parameter: `media` is required and contains the whole media entity. The string after `sw_thumbnails` is also required but does not render a CSS class. All other parameters are optional.

### Dealing with thumbnail sizes

With the `sizes` parameter you can control the `sizes` attribute of the `img` and define which of the thumbnails should be used in a media query / viewport.

You can find more information on those sizes here:

<PageRef page="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img\#attr-srcset" title="&lt;img&gt;: The Image Embed element - HTML: HyperText Markup Language | MDN" target="_blank" />

E.g. if the browser is in Bootstrap viewport `lg` \(which is 992px - 1199px\) use an image which is closest to 333px. If `sizes` is not set, Shopware will automatically use fallback values from global `shopware.theme.breakpoint`.

Let's think about the snippet below:

```text
{% sw_thumbnails 'my-thumbnails' with {
    media: cover,
    sizes: {
        'xs': '501px',
        'sm': '315px',
        'md': '427px',
        'lg': '333px',
        'xl': '284px',
    }
} %}
```

This example will print out the following output:

```html
<img 
    src="http://shopware.local/media/06/f0/5c/1614258798/example-image.jpg" 
    srcset="http://shopware.local/media/06/f0/5c/1614258798/example-image.jpg 1921w, 
            http://shopware.local/thumbnail/06/f0/5c/1614258798/example-image_1920x1920.jpg 1920w, 
            http://shopware.local/thumbnail/06/f0/5c/1614258798/example-image_800x800.jpg 800w, 
            http://shopware.local/thumbnail/06/f0/5c/1614258798/example-image_400x400.jpg 400w" 
    sizes="(max-width: 1920px) and (min-width: 1200px) 284px,
           (max-width: 1199px) and (min-width: 992px) 333px, 
           (max-width: 991px) and (min-width: 768px) 427px, 
           (max-width: 767px) and (min-width: 576px) 315px, 
           (max-width: 575px) and (min-width: 0px) 501px, 100vw">
```

By giving the `default` size you can override the media queries and always refer to a single image source for all viewports. To give an example, think about always using a small thumbnail closest to 100px regardless of the current viewport:

```text
{% sw_thumbnails 'my-thumbnails' with {
    media: cover,
    sizes: {
        'xs': '501px', {# Will be ignored #}
        'sm': '315px', {# Will be ignored #}
        'md': '427px', {# Will be ignored #}
        'lg': '333px', {# Will be ignored #}
        'xl': '284px', {# Will be ignored #}
        'default': '100px'
    }
} %}
```

This example will create the output below:

```html
<img 
    src="http://shopware.local/media/06/f0/5c/1614258798/example-image.jpg" 
    srcset="http://shopware.local/media/06/f0/5c/1614258798/example-image.jpg 1921w, 
            http://shopware.local/thumbnail/06/f0/5c/1614258798/example-image_1920x1920.jpg 1920w, 
            http://shopware.local/thumbnail/06/f0/5c/1614258798/example-image_800x800.jpg 800w, 
            http://shopware.local/thumbnail/06/f0/5c/1614258798/example-image_400x400.jpg 400w" 
    sizes="100px">
```

::: danger
Please note that those sizes only work with bootstrap viewports, like xs, sm, md, lg and xl. Custom media queries will not work.
:::

### Additional attributes

With the `attributes` param, additional attributes can be applied. Imagine the following example:

```text
{% sw_thumbnails 'my-thumbnails' with {
    media: cover,
    attributes: {
        'class': 'my-custom-class',
        'alt': 'alt tag of image',
        'title': 'title of image'
    }
} %}
```

This will generate the output below:

```html
<img 
    src="..." 
    sizes="..." 
    class="my-custom-class" 
    alt="Image name" 
    title="My beautiful image">
```

### Native lazy loading

With the `attributes` param, it is also possible to enable native lazy loading on the thumbnail element:

```text
{% sw_thumbnails 'my-thumbnails' with {
    media: cover,
    attributes: {
        'loading': 'lazy'
    }
} %}
```

This will generate the below output:

```html
<img 
    src="..." 
    sizes="..." 
    loading="lazy">
```

By default, lazy loading is disabled for newly added `sw_thumbnail` elements. You should consider activating it in the following scenarios:

* When multiple `sw_thumbnail` elements occur on one page while the `sw_thumbnail` s are not in the initial viewport.
* When images rendered by `sw_thumbnail` are within a container hidden by CSS via `display: none`.

## More interesting topics

* [Use custom assets in general](add-custom-assets)
