---
nav:
  title: Storefront
  position: 30
---

# Accessibility in the Storefront

At Shopware, we are committed to creating inclusive and barrier-free shopping experiences for our merchants and their customers.

## What shopware does to ensure accessibility

* Shopware is committed to fulfill the [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/) accessibility guidelines and Barrier-Free Information Technology Regulation (BITV 2.0) in the Storefront.
* The Storefront is using [Bootstrap components](https://getbootstrap.com/docs/5.3/getting-started/accessibility/) that already consider good accessibility practices, for example using aria roles.
* Much of the HTML structure and CSS styling already fulfill accessibility guidelines. However, there are still [open accessibility issues](#Overview-of-known-accessibility-issues) that will be addressed. 
* Automated [E2E testing with playwright](https://github.com/shopware/shopware/tree/trunk/tests/acceptance) and axe reporter are used to ensure future accessibility.

## How core accessibility improvements are released

Accessibility improvements are rolled out in regular minor releases, similar to other improvements or bug-fixes. We implement all accessibility improvements in the current major version `6.6.x` and its minor versions.
There is no large "accessibility release" planned that ships all accessibility improvements at once. 

## How to deal with breaking accessibility changes

Ensuring an accessible shop page can require changes in the HTML/Twig structure or the CSS. This can cause unintended behavior for an extension that is modifying an area that is being changed to improve accessibility.

Because of this, breaking accessibility changes are not enabled by default. All accessibility changes that include breaking changes are implemented behind a feature flag: 

```env
ACCESSIBILITY_TWEAKS
```

However, breaking accessibility changes are still released regularly inside minor releases. They are just not active by default to not cause a breaking change.

The feature flag `ACCESSIBILITY_TWEAKS` can be activated inside your `.env`, similar to the major feature flags like `V6_7_0_0`. When the feature flag is enabled, all available accessibility improvements are activated.
This allows you to check if your project or extension is effected by the change and already prepare an adaptation to the change if it is necessary.

::: warning
With the major version v6.7.0 all accessibility improvements will become the default.
:::

### Example of a breaking accessibility change

Let's say for example that a list is not using a proper markup, and it is changed to improve accessibility.

This is how a suboptimal HTML structure could look like:
```twig
<div class="sidebar-list">
    {% block component_list_items %}
        <div class="list-item"><a href="#">Item</a></div>
        <div class="list-item"><a href="#">Item</a></div>
        <div class="list-item"><a href="#">Item</a></div>
    {% endblock %}
</div>
```

Let's assume it should be changed to a proper list. Instead of implementing this right away, it is implemented behind the `ACCESSIBILITY_TWEAKS` flag, including instructions how it should be changed:
```twig
{# @deprecated tag:v6.7.0 - The list will be changed to `<ul>` and `<li>` to improve accessibility #}
{% if feature('ACCESSIBILITY_TWEAKS') %}
    <ul class="sidebar-list">
        {% block component_list_items_inner %}
            <li class="list-item"><a href="#">Item</a></li>
            <li class="list-item"><a href="#">Item</a></li>
            <li class="list-item"><a href="#">Item</a></li>
        {% endblock %}
    </ul>
{% else %}
    <div class="sidebar-list">
        {# @deprecated tag:v6.7.0 - Use `component_list_items_inner` instead with `<li>` #}
        {% block component_list_items %}
            <div class="list-item"><a href="#">Item</a></div>
            <div class="list-item"><a href="#">Item</a></div>
            <div class="list-item"><a href="#">Item</a></div>
        {% endblock %}
    </div>
{% endif %}
```

If the block `component_list_items` is being extended, the new accessibility change can already be considered. If the change was rolled out without feature flag, the extension still assumes a `<div class="list-item">` which would likely result in incorrect HTML:
```twig
{% sw_extends '@Storefront/storefront/component/list.html.twig' %}

{# Consider the new structure already #}
{% block component_list_items_inner %}
    {{ parent() }}
    <li class="list-item"><a href="#">My item</a></li>
{% endblock %}

{# This can be removed after v6.7.0 #}
{% block component_list_items %}
    {{ parent() }}
    <div class="list-item"><a href="#">My item</a></div>
{% endblock %}
```

## Overview of released accessibility improvements

* Below you find a list of recent accessibility improvements. The list includes a changelog and the release versions for each improvement.
* Enable the feature flag `ACCESSIBILITY_TWEAKS` to activate all breaking accessibility changes.

| Issue key                                                        | Topic                                                      | Breaking changes | Changelog                                                                                                                                                | Release versions                                                         |
|------------------------------------------------------------------|------------------------------------------------------------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| [NEXT-33694](https://issues.shopware.com/issues/NEXT-33694)      | Change shipping toggle in OffCanvas cart to button element | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.2.0/changelog/release-6-6-2-0/2024-04-17-change-shipping-costs-toggle-to-button-element.md)   | [v6.6.2.0](https://github.com/shopware/shopware/releases/tag/v6.6.2.0)   |
| [NEXT-35318](https://issues.shopware.com/issues/NEXT-35318)      | Add heading elements for account login page                | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.2.0/changelog/release-6-6-2-0/2024-04-15-heading-elements-on-registration-page.md)            | [v6.6.2.0](https://github.com/shopware/shopware/releases/tag/v6.6.2.0)   |
| [NEXT-34423](https://issues.shopware.com/issues/NEXT-33684)      | No empty nav element in top-bar                            | Yes              | [Changelog](https://github.com/shopware/shopware/blob/v6.6.1.0/changelog/release-6-6-1-0/2023-03-05-no-empty-nav.md)                                     | [v6.6.1.0](https://github.com/shopware/shopware/releases/tag/v6.6.1.0)   |
| [NEXT-33682](https://issues.shopware.com/issues/NEXT-33682)      | Provide distinctive document titles for each page          | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.1.0/changelog/release-6-6-1-0/2024-03-12-distinctive-document-titles.md)                      | [v6.6.1.0](https://github.com/shopware/shopware/releases/tag/v6.6.1.0)   |                                                              |

## Overview of known accessibility issues

::: info
Please note, that only issues that are completely resolved and already released in a shopware version will be in the list of released accessibility improvements. 
The list below will include tickets that are already in progress or finished but not released yet. The list also includes checking and evaluation work. You can see the current status via the links to the issue tracker.
:::

| Issue key                                                      | Topic                                                                                             |
|----------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| [NEXT-33675](https://issues.shopware.com/issues/NEXT-33675)    | Slider reports confusing status changes to screen readers                                         |
| [NEXT-33683](https://issues.shopware.com/issues/NEXT-33683)    | Improve "Remove Product" button labeling in checkout                                              | 
| [NEXT-33685](https://issues.shopware.com/issues/NEXT-33685)    | Missing alternative text for product images in the shopping cart                                  |  
| [NEXT-33689](https://issues.shopware.com/issues/NEXT-33689)    | Missing semantic markup of form address headings                                                  |  
| [NEXT-33693](https://issues.shopware.com/issues/NEXT-33693)    | Product image zoom modal keyboard accessibility                                                   |  
| [NEXT-33695](https://issues.shopware.com/issues/NEXT-33695)    | The form element quantity selector is not labeled                                                 |  
| [NEXT-33696](https://issues.shopware.com/issues/NEXT-33696)    | Focus jumps to the top of the page after closing a modal                                          |  
| [NEXT-33697](https://issues.shopware.com/issues/NEXT-33697)    | Focused slides in the carousel are not being moved into the visible area                          |  
| [NEXT-33879](https://issues.shopware.com/issues/NEXT-33879)    | Close navigation flyout with escape key                                                           |  
| [NEXT-26677](https://issues.shopware.com/issues/NEXT-26677)    | Check if all non-text content has text alternative and provide if necessary                       |  
| [NEXT-26679](https://issues.shopware.com/issues/NEXT-26679)    | Add text to components that only work with icons to identify their purpose                        |  
| [NEXT-26680](https://issues.shopware.com/issues/NEXT-26680)    | Ensure that resizing content up to 200% does not cause breaks                                     |  
| [NEXT-26682](https://issues.shopware.com/issues/NEXT-26682)    | The user needs to be able to close triggered, additional content                                  |  
| [NEXT-26705](https://issues.shopware.com/issues/NEXT-26705)    | Content functionality operable through keyboard                                                   |  
| [NEXT-26707](https://issues.shopware.com/issues/NEXT-26707)    | No keyboard traps should occur in the Storefront                                                  |  
| [NEXT-26709](https://issues.shopware.com/issues/NEXT-26709)    | Mechanism for the user to pause, stop, or hide moving content                                     |  
| [NEXT-26715](https://issues.shopware.com/issues/NEXT-26715)    | Provide error correction suggestions                                                              |  
| [NEXT-26712](https://issues.shopware.com/issues/NEXT-26712)    | Update the focus states so that they are clearly visible                                          |  
| [NEXT-26714](https://issues.shopware.com/issues/NEXT-26714)    | Language of each Storefront passage or phrase in the content can be programmatically determined   |  
| [NEXT-26717](https://issues.shopware.com/issues/NEXT-26717)    | Increase compatibility of Storefront with future assistance technologies                          |  
| [NEXT-33807](https://issues.shopware.com/issues/NEXT-33807)    | Text styles needs to be adjusted (line height, paragraph spacing)                                 |  
| [NEXT-34090](https://issues.shopware.com/issues/NEXT-34090)    | Check Lighthouse Accessibility Score                                                              |  
| [NEXT-36116](https://issues.shopware.com/issues/NEXT-36116)    | Keyboard/Tabs should work for nav main-navigation-menu                                            |  
| [NEXT-21474](https://issues.shopware.com/issues/NEXT-21474)    | Pagination does not have links                                                                    |  
