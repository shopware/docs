# Modal Component

## Table of contents

* [Description](#description)
* [Modal with simple content](#modal-with-simple-content)
* [Modal with Navigation](#modal-with-navigation)
* [Modal with Navigation and Ajax Panel Content](#modal-with-navigation-and-ajax-panel-content)
  * [Ajax Panel template for modal content](#ajax-panel-template-for-modal-content)

## Description

In this article we explain the B2B modal component. We are using the modal view for an entity detail information window which holds additional content for the selected grid item. We use two different templates for this approach. The base modal template `(components/SwagB2bPlatform/Resources/views/storefront/_partials/_b2bmodal/_modal.html.twig)` is responsible for the base structure of the modal box. In this template you can find multiple twig blocks which are for the navigation inside the modal and the content area.

In the B2B-Suite the content block will be extended with the second modal template (`components/SwagB2bPlatform/Resources/views/storefront/_partials/_b2bmodal/_modal-content.html.twig`). The content template can be configured with different variables to improve the user experience with a fixed top and bottom bar. We are using this bars for filtering, sorting and pagination.

There are many advantages to extend this template instead of building your own modal view.

* Same experience for every view
* No additional CSS classes required
* Easy modal modifications because every view using the same classes

The modal component comes with different states:

* Simple content holder
* Content delivered by an ajax panel
* Split view with sidebar navigation and an ajax ready content
* Fixed top and bottom bar for action buttons and pagination

## Modal with simple content

{% code %}
```text
{% sw_extends '@SwagB2bPlatform/storefront/_partials/_b2bmodal/_modal.html.twig' %}

{% set modalSettings = {
    navigation: false
} %}

{% block b2b_modal_base_navigation_header %}
    Modal Title
{% endblock %}

{% block b2b_modal_base_content_inner %}
    Modal Content
{% endblock %}
```
{% endcode %}

## Modal with Navigation

If you would like to have a navigation sidebar inside the modal window you can set the navigation variable to `true`.

{% code %}
```text
{% sw_extends '@SwagB2bPlatform/storefront/_partials/_b2bmodal/_modal.html.twig' %}

{% set modalSettings = {
    navigation: true
} %}

{% block b2b_modal_base_navigation_header %}
    Modal Title
{% endblock %}

{% block b2b_modal_base_navigation_entries %}
    <li>
        <a class="b2b--tab-link">
            Navigation Link
        </a>
    </li>
{% endblock %}

{% block b2b_modal_base_content_inner %}
    Modal Content
{% endblock %}
```
{% endcode %}

## Modal with Navigation and Ajax Panel Content

{% code %}
```text
{% sw_extends '@SwagB2bPlatform/storefront/_partials/_b2bmodal/_modal.html.twig' %}

{% set modalSettings = {
    navigation: true
} %}

{% block b2b_modal_base_navigation_header %}
    Modal Title
{% endblock %}

{% block b2b_modal_base_navigation_entries %}
    <li>
        <a class="b2b--tab-link">
            Navigation Link
        </a>
    </li>
{% endblock %}

{% block b2b_modal_base_content_inner %}
    <div class="b2b--ajax-panel" data-id="example-panel" data-url="{url}"></div>
{% endblock %}
```
{% endcode %}

### Ajax Panel template for modal content

The modal content template has different options for fixed inner containers. The top and bottom bar can be enabled or disabled. The correct styling for each combination of settings will be applied automatically so u dont have to take care of styling. We use the topbar always for action buttons like "Create element". The bottom bar could be used for pagination for example.

{% code %}
```text
{% sw_extends "@SwagB2bPlatform/storefront/_partials/_b2bmodal/_modal-content.html.twig" %}

{% set modalSettings = {
    navigation: true,
    bottom: true,
    content: {
      padding: true
    }
} %}

{% block b2b_modal_base_content_inner_topbar_headline %}
    Modal Content Headline
{% endblock %}

{% block b2b_modal_base_content_inner_scrollable_inner_actions_inner %}
    Modal Actions
{% endblock %}

{% block b2b_modal_base_content_inner_scrollable_inner_content_inner %}
    Modal Content
{% endblock %}

{% block b2b_modal_base_content_inner_scrollable_inner_bottom_inner %}
    Modal Bottom
{% endblock %}
```
{% endcode %}
