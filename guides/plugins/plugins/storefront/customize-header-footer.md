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

But if you need to customize the header or footer depending on the current page data you need to adjust the ESI loading with additional parameters.
This happens in the `Storefront/Resources/views/storefront/base.html.twig` [file](https://github.com/shopware/shopware/blob/6.7.0.0/src/Storefront/Resources/views/storefront/base.html.twig#L38).
The needed block names are `base_esi_header` and `base_esi_footer`.
Extend the `base.html.twig` in your plugin and overwrite for example the header block.

::: code-group

```twig [PLUGIN_ROOT/src/Resources/views/storefront/base.html.twig]
{% sw_extends '@Storefront/storefront/base.html.twig' %}

{% block base_esi_header %}
    {% set headerParameters = headerParameters|merge({ 'vendorPrefixPluginName': { 'activeRoute': activeRoute } }) %}
    {{ parent() }}
{% endblock %}
```

:::

The `headerParameters` are passed to the header route as query parameters and after that passed through to the header template.
With this change you are now able to access the current route in your header template:

::: code-group

```twig [PLUGIN_ROOT/src/Resources/views/storefront/layout/header.html.twig]
{% sw_extends '@Storefront/storefront/layout/header.html.twig' %}

{% block header %}
    {{ dump(headerParameters.vendorPrefixPluginName.activeRoute) }}
    {{ parent() }}
{% endblock %}
```

:::

This approach works both in plugins and apps.
In plugins, you can also use the `StorefrontRenderEvent`, to add custom data to the header and footer:

::: code-group

```php [PLUGIN_ROOT/src/StorefrontSubscriber.php]
class StorefrontSubscriber
{
    public function __invoke(StorefrontRenderEvent $event): void
    {
        if ($event->getRequest()->attributes->get('_route') !== 'frontend.header') {
            return;
        }

        $headerParameters = $event->getParameter('headerParameters') ?? [];
        $headerParameters['vendorPrefixPluginName']['salesChannelId'] = $event->getSalesChannelContext()->getSalesChannelId();

        $event->setParameter('headerParameters', $headerParameters);
    }
}
```

```twig [PLUGIN_ROOT/src/Resources/views/storefront/layout/header.html.twig]
{% sw_extends '@Storefront/storefront/layout/header.html.twig' %}

{% block header %}
    {{ dump(headerParameters.vendorPrefixPluginName.salesChannelId) }}
    {{ parent() }}
{% endblock %}
```

:::

::: warning
Please be aware, that `headerParameters` and `footerParameters` can only contain scalar values, as they are also query parameters for the ESI routes.
:::

It is also possible to load your custom header or footer templates.
This is also done in the core itself within the checkout process.
See e.g. the [checkout confirm page](https://github.com/shopware/shopware/blob/6.7.0.0/src/Storefront/Resources/views/storefront/page/checkout/confirm/index.html.twig#L3-L5).
Please be aware, that this will overwrite customizations from every other extension.
You also need to make sure, that the `header` and `footer` data is available, if your custom template extends from the original header or footer template.
See e.g. the [checkout confirm controller](https://github.com/shopware/shopware/blob/6.7.0.0/src/Storefront/Controller/CheckoutController.php#L152-L159).
