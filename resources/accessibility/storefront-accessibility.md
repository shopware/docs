---
nav:
  title: Storefront Accessibility
  position: 30
---

# Accessibility in the Storefront

At Shopware, we are committed to creating inclusive and barrier-free shopping experiences for our merchants and their customers.

## What shopware does to ensure accessibility?

* Shopware is committed to fulfill the [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/) accessibility guidelines and Barrier-Free Information Technology Regulation (BITV 2.0) in the Storefront.
    * You can find more information on [shopware.design](https://shopware.design/foundations/accessibility.html) and [in our blog post](https://www.shopware.com/en/news/accessible-online-store-by-2025/).
* The Storefront is using [Bootstrap components](https://getbootstrap.com/docs/5.3/getting-started/accessibility/) that already consider good accessibility practices, for example, using aria roles.
* Much of the HTML structure and CSS styling already fulfill accessibility guidelines. However, there are still [open accessibility issues](#Overview-of-known-accessibility-issues) that will be addressed.
* Automated [E2E testing with playwright](https://github.com/shopware/shopware/tree/trunk/tests/acceptance) and axe reporter are used to ensure future accessibility.

## How are core accessibility improvements released?

Starting from **Shopware 6.6+,** accessibility improvements have been introduced, and **6.7+** includes further enhancements. Accessibility improvements are rolled out in regular minor releases, similar to other improvements or bug-fixes.
There is no large "accessibility release" planned that ships all accessibility improvements at once.

## How to deal with breaking accessibility changes?

Ensuring an accessible shop page can require changes in the HTML/Twig structure or the CSS. This can cause unintended behavior for an extension that is modifying an area that is being changed to improve accessibility.

Because of this, breaking accessibility changes are not enabled by default. All accessibility changes that include breaking changes are implemented behind a feature flag:

```env
ACCESSIBILITY_TWEAKS=1
```

However, breaking accessibility changes are still released regularly inside minor releases. They are just not active by default to not cause a breaking change.

The feature flag `ACCESSIBILITY_TWEAKS` can be activated inside your `.env`, similar to the major feature flags like `V6_7_0_0`. When the feature flag is enabled, all available accessibility improvements are activated.
This allows you to check if your project or extension is effected by the change and already prepare an adaptation to the change if it is necessary.

::: warning
With the major version v6.7.0 all accessibility improvements will become the default.
:::

### Example of a breaking accessibility change

Let's say, for example, that a list is not using a proper markup, and it is changed to improve accessibility.

This is what a suboptimal HTML structure could look like:

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

If the block `component_list_items` is being extended, the new accessibility change can already be considered. If the change was rolled out without a feature flag, the extension still assumes a `<div class="list-item">` which would likely result in incorrect HTML:

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

## Overview of accessibility issues for iteration 1

::: info
With accessibility iteration 1 we have addressed the most critical accessibility problems and implemented multiple improvements.
You can find an overview of the accessibility iteration 1 epic in the following ticket: [NEXT-37039](https://docs.shopware.com/en/shopware-6-en/tutorials-and-faq/GithubIssues)
:::

### Continuous efforts to ensure accessibility

We are continuously testing our core Storefront to meet accessibility requirements. This includes screen reader usage, keyboard-operation or color contrast analyzes.
We are using the [WCAG 2.1 Level AA](https://www.w3.org/TR/WCAG21/) standard and do our best to solve all issues to meet the WCAG 2.1 requirements.

### Overview of released accessibility improvements

* Below, you find a list of recent accessibility improvements. The list includes a changelog and the release versions for each improvement.
* Enable the feature flag `ACCESSIBILITY_TWEAKS` to activate all breaking accessibility changes.

| Topic                                                                                           | Breaking changes | Changelog                                                                                                                                                 | Release versions                                                                                 |
|-------------------------------------------------------------------------------------------------|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Missing semantic markup of form address headings                                                | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.6.0/changelog/release-6-6-6-0/2024-08-13-registration-form-fieldset-improvement.md)            | [v6.6.6.0](https://github.com/shopware/shopware/releases/tag/v6.6.6.0)                           |
| Product image zoom modal keyboard accessibility                                                 | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.6.0/changelog/release-6-6-6-0/2024-08-08-improve-image-zoom-modal-accessibility.md)            | [v6.6.6.0](https://github.com/shopware/shopware/releases/tag/v6.6.6.0)                           |
| Focused slides in the carousel are not being moved into the visible area                        | Yes              | [Changelog](https://github.com/shopware/shopware/blob/v6.6.6.0/changelog/release-6-6-6-0/2024-08-05-improve-slider-element-accessibility.md)              | [v6.6.6.0](https://github.com/shopware/shopware/releases/tag/v6.6.6.0)                           |
| Focus jumps to the top of the page after closing a modal                                        | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.6.0/changelog/release-6-6-6-0/2024-08-01-add-focus-handling-to-storefront.md)                  | [v6.6.6.0](https://github.com/shopware/shopware/releases/tag/v6.6.6.0)                           |
| Ensure that resizing content up to 200% does not cause breaks                                   | Yes              | [Changelog](https://github.com/shopware/shopware/blob/v6.6.6.0/changelog/release-6-6-6-0/2024-08-13-Improved-storefront-text-scaling.md)                  | [v6.6.6.0](https://github.com/shopware/shopware/releases/tag/v6.6.6.0)                           |
| Language of each Storefront passage or phrase in the content can be programmatically determined | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.6.0/changelog/release-6-6-6-0/2024-08-05-add-language-to-reviews.md)                           | [v6.6.6.0](https://github.com/shopware/shopware/releases/tag/v6.6.6.0)                           |
| Check Lighthouse Accessibility Score                                                            | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.6.0/changelog/release-6-6-6-0/2024-08-21-fix-scroll-up-button-accessibility.md)                | [v6.6.6.0](https://github.com/shopware/shopware/releases/tag/v6.6.6.0)                           |
| Pagination does not have links                                                                  | Yes              | [Changelog](https://github.com/shopware/shopware/blob/v6.6.6.0/changelog/release-6-6-6-0/2023-08-31-pagination-with-links.md)                             | [v6.6.6.0](https://github.com/shopware/shopware/releases/tag/v6.6.6.0)                           |
| Non-informative document title                                                                  | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.1.0/changelog/release-6-6-1-0/2024-03-12-distinctive-document-titles.md)                       | [v6.6.6.0](https://github.com/shopware/shopware/releases/tag/v6.6.1.0)                           |
| The form element quantity selector is not labeled                                               | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.5.0/changelog/release-6-6-5-0/2024-07-15-the-form-element-quantity-selector-is-not-labeled.md) | [v6.6.5.0](https://github.com/shopware/shopware/releases/tag/v6.6.5.0)                           |
| Slider reports confusing status changes to screen readers                                       | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.4.0/changelog/release-6-6-4-0/2024-05-31-remove-unwanted-aria-live-attributes-from-sliders.md) | [v6.6.4.0](https://github.com/shopware/shopware/releases/tag/v6.6.4.0)                           |
| The user needs to be able to close triggered, additional content                                | No               | [Changelog](https://github.com/shopware/shopware/blob/trunk/changelog/release-6-6-3-0/2024-05-03-esc-key-for-nav-flyout-close.md)                         | [v6.6.3.0](https://github.com/shopware/shopware/releases/tag/v6.6.3.0)                           |
| Improve "Remove Product" button labeling in checkout                                            | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.3.0/changelog/release-6-6-3-0/2024-05-03-improve-line-item-labels-and-alt-texts.md)            | [v6.6.3.0](https://github.com/shopware/shopware/releases/tag/v6.6.3.0)                           |
| Missing alternative text for product images in the shopping cart                                | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.3.0/changelog/release-6-6-3-0/2024-05-03-improve-line-item-labels-and-alt-texts.md)            | [v6.6.3.0](https://github.com/shopware/shopware/releases/tag/v6.6.3.0)                           |
| A closing mechanism for the navigation                                                          | No               | [Changelog](https://github.com/shopware/shopware/blob/trunk/changelog/release-6-6-3-0/2024-05-03-esc-key-for-nav-flyout-close.md)                         | [v6.6.3.0](https://github.com/shopware/shopware/releases/tag/v6.6.3.0)                           |
| Change shipping toggle in OffCanvas cart to button element                                      | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.2.0/changelog/release-6-6-2-0/2024-04-17-change-shipping-costs-toggle-to-button-element.md)    | [v6.6.2.0](https://github.com/shopware/shopware/releases/tag/v6.6.2.0)                           |
| Add heading elements for account login page                                                     | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.2.0/changelog/release-6-6-2-0/2024-04-15-heading-elements-on-registration-page.md)             | [v6.6.2.0](https://github.com/shopware/shopware/releases/tag/v6.6.2.0)                           |
| Provide distinctive document titles for each page                                               | No               | [Changelog](https://github.com/shopware/shopware/blob/v6.6.1.0/changelog/release-6-6-1-0/2024-03-12-distinctive-document-titles.md)                       | [v6.6.1.0](https://github.com/shopware/shopware/releases/tag/v6.6.1.0)                           |
| No empty nav element in top-bar                                                                 | Yes              | [Changelog](https://github.com/shopware/shopware/blob/v6.6.1.0/changelog/release-6-6-1-0/2023-03-05-no-empty-nav.md)                                      | [v6.6.1.0](https://github.com/shopware/shopware/releases/tag/v6.6.1.0)                           |
| Update the focus states so that they are clearly visible                                        | No               | [Multiple changes](https://github.com/search?q=repo%3Ashopware%2Fshopware+NEXT-26712&type=commits)                                                        | [Multiple releases](https://github.com/search?q=repo%3Ashopware%2Fshopware+NEXT-26712&type=code) |
| Increase compatibility of Storefront with future assistance technologies                        | No               | [Multiple changes](https://github.com/search?q=repo%3Ashopware%2Fshopware+NEXT-26717&type=commits)                                                        | [Multiple releases](https://github.com/search?q=repo%3Ashopware%2Fshopware+NEXT-26717&type=code) |
| Content functionality operable through keyboard                                                 | Yes              | [Multiple changes](https://github.com/search?q=repo%3Ashopware%2Fshopware+NEXT-26705&type=commits)                                                        | [Multiple releases](https://github.com/search?q=repo%3Ashopware%2Fshopware+NEXT-26705&type=code) |
| No keyboard traps should occur in the Storefront                                                | -                | Verification work without released code changes                                                                                                           | -                                                                                                |
| Mechanism for the user to pause, stop, or hide moving content                                   | -                | Verification work without released code changes                                                                                                           | -                                                                                                |
| Add text to components that only work with icons to identify their purpose                      | -                | -                                                                                                                                                         |
| Check if all non-text content has text alternative and provide if necessary                     | -                | -                                                                                                                                                         |
| Provide error correction suggestions                                                            | -                | -                                                                                                                                                         |
| Text styles needs to be adjusted (line height, paragraph spacing)                               | -                | -                                                                                                                                                         |
| Keyboard/Tabs should work for nav main-navigation-menu                                          | -                | -                                                                                                                                                         |

### Overview of known accessibility issues

To report any new accessibility issues, click the New Issue button, select Bug Report, fill out the require fields and make sure to add the area/accessibility label.
Here is a reference to the existing [accessibility Issues](https://github.com/shopware/shopware/issues?q=state%3Aopen%20label%3Aarea%2Faccessibility).

## Best practices for accessibility (a11y) in Shopware extensions

Ensuring accessibility in your Shopware extension improves **usability, inclusivity, and compliance** with standards like **WCAG 2.1** and the **EU Web Accessibility Directive**. Below are best practices to help you build accessible extensions and themes.

### 1. Setting up for accessibility testing

#### Activate the accessibility feature flag

Enable the **feature flag** to test changes before release by activating the feature flag in your local environment, modify your `project-root/.env`.

```env
ACCESSIBILITY_TWEAKS=1
```

Once enabled, the `ACCESSIBILITY_TWEAKS` feature flag, a re-compilation of the theme is needed to enable all styling improvements like adjusted font-sizes.

```text
bin/console theme:compile
```

Now you can:

* Preview upcoming a11y improvements before they become mandatory.
* Identify potential breaking changes in your theme or extension.  
* Ensure your UI remains functional with new [accessibility enhancements](./accessibility-checklist.md).

### 2. Testing for accessibility compliance

#### Automated testing tools

Use automated tools to **detect common accessibility issues** in your extension:  

* **[Google Lighthouse](https://developer.shopware.com/docs/resources/guidelines/testing/store/quality-guidelines-apps/#lighthouse-a-b-testing)** – Run audits in Chrome DevTools.
* **AXE DevTools** – More detailed accessibility testing.
* **WAVE (WebAIM Tool)** – Identifies HTML structure and ARIA misuses.  

#### Manual Testing

While automation helps, **manual checks** ensure real-world usability:  

✔ **Keyboard Navigation** – Ensure users can navigate your store using `Tab`, `Enter`, and `Esc`.  
✔ **Screen Readers** – Test with **NVDA (Windows)** or **VoiceOver (Mac/iOS)**.  
✔ **Color Contrast Checks** – Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify readability.  

### 3. Validating accessibility in extensions

#### Common a11y issues to fix before release

* Misuse of **HTML & ARIA roles** (Ensure correct semantic structure).  
* Missing **form labels & alt text** for images/icons.  
* Improper **focus management** in modals, dropdowns, and popups.  
* **Dynamic content updates** not announced to screen readers.  

#### Shopware QA and self-certification

* Developers can **self-certify** an extension as a11y-compliant.  
* Shopware **QA verification** may be required for listing in the store.  

### 4. Accessibility support in Shopware versions

| **Shopware version** | **Accessibility support** |  
|---------------------|------------------------|  
| **6.7+** | Full A11y improvements available for testing |  
| **6.6+** | Accessibility features introduced (use `ACCESSIBILITY_TWEAKS` feature flag) |  
| **Shopware 5** | 🚫 **No accessibility support** |  

### 5. Getting help with accessibility

* Work with **Shopware-certified agencies** for A11y audits.  
* Stay updated with Shopware's **developer guidelines**.  
* Discuss A11y best practices with other developers in the **Shopware community**.

## Conclusion

Understanding accessibility best-practices is just the beginning. To truly create an inclusive storefront, these ideas must be translated into practice. To help you turn these into action, we have created a comprehensive [Storefront Accessibility Checklist](./accessibility-checklist.md). It outlines the key technical and design practices needed to build accessible interfaces—from semantic HTML to keyboard navigation and ARIA usage.
