---
nav:
  title: Use nested line items
  position: 280

---

# Use Nested Line Items

## Overview

This guide will show you how to use the nested line items in the Storefront.

## Prerequisites

As most guides, this guide is also built upon the [Plugin base guide](../plugin-base-guide), but you don't necessarily need that. This guide will only extend views and shows how the Custom Product plugin handles this.

## Make nested line item removable

If the nested line item should be removable in the cart, the `removable` property has to be set, either via view, or in an own controller action. Also, a form with an own path action has to be added:

```twig
{% block page_checkout_item_remove_icon %}
    {% do nestedLineItem.setRemovable(true) %}
    <form action="{{ path('/mycontroller/nested/remove', { 'id': nestedLineItem.id }) }}" method="post">
        {{ parent() }}
    </form>
{% endblock %}
```

## Make nested line item changeable

Most of the time, the root line item defines the nested line items, therefore there is a change button for its root line item in the cart.
In the block of the change button, the variable `isChangeable` has to be set, and the button has to be surrounded with a link to the action like this:

```twig
{% block component_offcanvas_item_children_header_content_change_button %}
    {% set isChangeable = true %}
    {% set seo = seoUrl('frontend.detail.page', {
            'productId': lineItem.children.first.referencedId,
            'swagCustomizedProductsConfigurationEdit': lineItem.extensions.customizedProductConfiguration.id
        })
    %}
    
    <a href="{{ seo }}" class="order-item-product-name" title="{{ label }}">
        {{ parent() }}
    </a>
{% endblock %}
```

## About extended functionality

Please notice: Nested line items can be implemented in various ways, so there's no telling what a __default handling__ could be. Therefore, it is necessary to implement a change or remove handling by yourself.
