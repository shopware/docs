---
nav:
  title: Add Javascript as script tag
  position: 65

---

# Add JavaScript as script tag

## Overview

In many cases you want to add your JavaScript to your main entry point `<plugin root>/src/Resources/app/storefront/src/main.js` in order to automatically compile it alongside with the Storefront JavScript. 
For more information, please refer to [Add custom Javascript](add-custom-javascript.md).

However, you might want to add JavaScript as a separate `<script>` tag in the HTML. For example to load a script from an external CDN.
You will learn how you can extend the template in order to add a `<script>` tag.

## Prerequisites

For this guide you need a running plugin and therefore a running Shopware 6 instance, with full access to all files. You will also need a brief understanding how a [template extension](customize-templates.md) works.

## Adding JavaScript as a separate script tag

You can extend the default template that is including the `<head>` section of the page: `src/Storefront/Resources/views/storefront/layout/meta.html.twig`.
While it is possible to add a `<script>` anywhere in the HTML via template extensions, it is recommended to include your script alongside with the default scripts by extending the block `layout_head_javascript_hmr_mode`.

```twig
{# <plugin root>/src/Resources/views/storefront/layout/meta.html.twig #}
{% sw_extends '@Storefront/storefront/layout/meta.html.twig' %}

{% block layout_head_javascript_hmr_mode %}
    {# Renders Storefront script: <script src="https://your-shop.example/theme/747e1c6a73cf4d70f5e831b30554dd15/js/all.js?1698139296" defer></script> #}
    {{ parent() }}

    {# Your script #}
    <script src="https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js" defer></script>
{% endblock %}
```

This will render:

```html
<head>
    <!-- Other tags are rendered here... -->

    <script src="https://your-shop.example/theme/747e1c6a73cf4d70f5e831b30554dd15/js/all.js?1698139296" defer></script>
    <script src="https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js" defer></script>
</head>
```

::: danger
If you are extending the block `layout_head_javascript_hmr_mode` in order to add your script, you must always use the `{{ parent() }}` function to render the Storefront JavaScript as well.
Otherwise, the core JS functionalities of the Storefront will be overwritten and will stop working. This should only happen when you **explicitly** want this.
:::

### Conditional scripts

Instead of always rendering your `<script>`, you can also put it behind a condition in Twig.
Then the script will only be rendered when the Twig condition is met.

```twig
{# <plugin root>/src/Resources/views/storefront/layout/meta.html.twig #}
{% sw_extends '@Storefront/storefront/layout/meta.html.twig' %}

{% block layout_head_javascript_hmr_mode %}
    {{ parent() }}

    {# Only add script when condition is met #}
    {% if someCondition %}
        <script src="https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js" defer></script>
    {% endif %}
{% endblock %}
```

### Script order

Should your `<script>` tag come before or after the Storefront core JavaScript?
It depends on whether you need to have access to the code added by your `<script>` within the Storefront JavaScript (added by `<plugin root>/src/Resources/app/storefront/src/main.js`).
* If you **don't** need access within the Storefronts JavaScript, you should add the `<script>` **after** the Storefront JavaScript.
* If you **do need** access, your `<script>` should come **before** the Storefront JavaScript.

::: warning
Please consider that non-async `<script src="#">` that are added before the Storefront JavaScript will postpone its execution.
Too many scripts can have a negative effect on the shop's performance.
:::

### Script loading behaviour

It is recommended to use the `defer` attribute to tell the browser that the script is meant to be executed after the document has been parsed.
However, in case you are adding a library as `<script>`, please consult the library documentation. Some libraries are supposed to be loaded with `async` attribute.

::: warning
It should be avoided to add external `<script src="#">` without `defer` or `async` because it will block rendering of the site until the script is executed. 
This can have a negative effect on the shop's performance.
:::

### Alternative script locations

You can also add a `<script>` near the body using block `base_body_script` in `src/Storefront/Resources/views/storefront/base.html.twig`.
Technically, it is possible to add `<script>` at every location the Twig blocks are offering.

::: info
Alternative script locations should only be used when there is a technical reason to do so. 
For example when the documentation of an external library is recommending a specific script location inside the HTML.
:::
