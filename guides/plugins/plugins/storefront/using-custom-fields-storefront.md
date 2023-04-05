# Add Custom Field in the Storefront

## Overview

This guide will show you how to use custom fields, e.g., labels in the Storefront.

## Prerequisites

You won't learn to create a plugin in this guide, head over to our [Plugin base guide](../plugin-base-guide.md) to create a plugin first, if you don't know how it's done yet.

Needless to say, you need a custom field itself to add to the Storefront via your own plugin. Head over to the guide on [adding custom fields to Shopware](../framework/custom-field/add-custom-field.md) to be able to prepare your own custom field.

## Use snippets of custom fields

First, if you add a custom field via API or Administration, automatically snippets for all languages are created. The naming of the snippet is like the following template: `customFields.` as prefix and then the name of the custom field. For example, if the name of the created custom field is `my_test_field`, then the created snippet name will be `customFields.my_test_field`.

::: info
In the snippet settings in the Administration you're able to edit and translate the snippet.
:::

## Storefront usage of custom fields

Adding custom fields in the Storefront is quite simple. You basically use Twig this way:

```text
{{ "customFields.my_test_field"|trans|sw_sanitize }}: {{ page.product.translated.customFields.my_test_field }}
```

::: info
Did you notice the Twig function `sw_sanitize`? It's a Twig function we wrote, customized for Shopware's needs. It filters tags and attributes from a given string optimized for Shopware usage.
:::

Imagine you want to add a text field to the product description. If you want to use the snippet in the Storefront, you have to extend a template file first. Let's say we want to add our custom field to the product description's text. The block of this element is `page_product_detail_description_content_text`, so we'll use it in our example. As we want to add our custom field in there, we use `parent` Twig function to keep the original template:

```twig
// <plugin root>/src/Resources/views/storefront/page/product-detail/description.html.twig
{% sw_extends '@Storefront/storefront/page/product-detail/description.html.twig' %}

{% block page_product_detail_description_content_text %}
    {{ parent() }}
{% endblock %}
```

Now, we finally add our custom field as explained before:

```twig
// <plugin root>/src/Resources/views/storefront/page/product-detail/description.html.twig
{% sw_extends '@Storefront/storefront/page/product-detail/description.html.twig' %}

{% block page_product_detail_description_content_text %}
    {{ parent() }}

    {# Insert your custom field here, as seen below: #}
    {{ "customFields.my_test_field"|trans|sw_sanitize }}: {{ page.product.translated.customFields.my_test_field }}
{% endblock %}
```
