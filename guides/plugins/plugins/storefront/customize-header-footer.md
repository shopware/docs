---
nav:
  title: Customize Header/Footer
  position: 160

---

# Customize Header/Footer

## Overview

With the introduction of ESI loading for the header and footer, the way how to customize the header and footer has changed.
E.g. it is no longer possible to customize the header and footer depending on the current page data.
This guide will show you how to customize the header and footer in your plugin.

## Prerequisites

As most guides, this guide is built upon the [Plugin Base Guide](../plugin-base-guide), so you might want to have a look at it.
Other than that, knowing [Twig](https://twig.symfony.com/) is a big advantage for this guide, but that's not necessary.

## Customizing by bypassing the ESI loading

The ESI loading of header and footer was introduced as they are parts of the page that usually do not change that often and could therefore stay cached for a longer time.
The header and footer are now loaded with sub-requests and are therefore no longer dependent on the current page data.
It is still possible to add custom data to the header and footer directly, see ["Add data to storefront page"](add-data-to-storefront-page) guide for more information.

But if you need to customize the header or footer depending on the current page data you need to overwrite the ESI loading.
This happens in the `Storefront/Resources/views/storefront/base.html.twig` [file](https://github.com/shopware/shopware/blob/v6.7.0.0-rc2/src/Storefront/Resources/views/storefront/base.html.twig#L38).
The needed block names are `base_esi_header` and `base_esi_footer`.
Extend the `base.html.twig` in your plugin and overwrite the blocks.

::: code-group

```twig [PLUGIN_ROOT/src/Resources/views/storefront/base.html.twig]
{% sw_extends '@Storefront/storefront/base.html.twig' %}

{% block base_esi_header %}
    {% sw_include '@Storefront/storefront/layout/header/header.html.twig' %}
{% endblock %}

{% block base_esi_footer %}
    {% sw_include '@Storefront/storefront/layout/footer/footer.html.twig' %}
{% endblock %}
```

:::

It is also possible to load your custom header or footer templates. 
This is also done in the core itself within the checkout process.
See e.g. [checkout confirm page](https://github.com/shopware/shopware/blob/v6.7.0.0-rc2/src/Storefront/Resources/views/storefront/page/checkout/confirm/index.html.twig#L3-L5).
