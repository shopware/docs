---
nav:
  title: Data loading
  position: 20

---

# Load additional data for the Storefront with App Scripts

If your app needs additional data in your [customized Storefront templates](../../../plugins/plugins/storefront/customize-templates), you can load that data with app scripts and make it available to your template.

::: info
Note that app scripts were introduced in Shopware 6.4.8.0 and are not supported in previous versions.
:::

## Overview

The app script data loading expands on the general [composite data loading concept](../../../../concepts/framework/architecture/storefront-concept#composite-data-handling) of the storefront.
For each page that is rendered, a hook is triggered, giving access to the current `page` object. The `page` object gives access to all the available data, lets you add data to it, and will be passed directly to the templates.

For a list of all available script hooks that can be used to load additional data, take a look at the [script hook reference](../../../../resources/references/app-reference/script-reference/script-hooks-reference#data-loading).

::: info
Note that all hooks that were triggered during a page rendering are also shown in the [Symfony toolbar](./#developing--debugging-scripts).
This may come in handy if you are searching for the right hook for your script.
:::

For example, if you want to enrich a storefront detail page with additional data, you just set it within a custom app script and attach it to the `page` object.

```twig
// Resources/scripts/product-page-loaded/my-example-script.twig
{% set page = hook.page %}
{# @var page \Shopware\Storefront\Page\Product\ProductPage #}

{# the page object if you access to all the data, e.g., the current product #}
{% do page.product ... %}

{% set myAdditionalData = {
    'example': 'just an example'
} %}

{# it also lets you add data to it, that you can later use in your Storefront templates #}
{% do page.addArrayExtension('swagMyAdditionalData', myAdditionalData) %}
```

In your Storefront templates, you can read the data again from the `page` object:

```twig
// Resources/views/storefront/page/product-detail/index.html.twig
{% sw_extends '@Storefront/storefront/page/product-detail/index.html.twig' %}

{% block page_product_detail %}
    <h1>{{ page.getExtension('swagMyAdditionalData').example }}</h1>
    
    {{ parent() }}
{% endblock %}
```

## Loading data

To load data stored inside Shopware, you can use the `read` features of the [Data Abstraction Layer](../../../../concepts/framework/data-abstraction-layer).
Therefore, in every hook that may be used to load additional data, the `repository` service is available.

The `repository` service provides methods to load exactly the data you need:

* `search()` to load complete entities
* `ids()` to load only the ids of entities, if you don't need all the additional information of the entities
* `aggregate()` to aggregate data if you don't need any data of individual entities but are only interested in aggregated data

All those methods can be used in the same way. First, you pass the entity name the search should be performed on. Next, you pass the criteria that should be used.

```twig
{% set mediaEntities = services.repository.search('media', criteria) %}
```

### Search criteria

The search criteria define how the search is performed and what data is included.
The criteria object that is used inside the app scripts behaves and looks the same as the [JSON criteria used for the API](../../../integrations-api/general-concepts/search-criteria).

So please refer to that documentation to get an overview of what features can be used inside a criteria object.

<PageRef page="../../../integrations-api/general-concepts/search-criteria" />

The criteria object can be assembled inside scripts as follows:

```twig
{% set criteria = {
    'ids': [ 'id1', 'id2' ],
    'associations': {
        'manufacturer': {},
        'cover': {},
    },
    'filter': [
        { 'type': 'equals', 'field': 'active', 'value': true },
    ]
} %}

{% set matchedProducts = services.repository.search('product', criteria) %}
```

### `repository` and `store` services

Besides the `repository` service, a separate `store` service is also available that provides the same basic functionality and the same interface.

The `store` service is available for all "public" entities (e.g. `product` and `category`) and will return a Storefront optimized representation of the entities.
This means that, for example, SEO related data is resolved for `products` and `categories`, loaded over the `store` service, but not over the `repository` service.
Additionally, product prices are only calculated using the `store` service.

::: info
The `store` service only loads "public" entities. This means that the entities only include ones that are active and visible for the current sales channel.
:::

One major difference is that when using the `repository` service, your app needs `read` permissions for every entity it reads, whereas you don't need additional permissions for using the `store` service (as that service only searches for "public" data).

Refer to the [App Base Guide](../app-base-guide#permissions) for more information on how permissions work for apps.

The `repository` service exposes the same data as the CRUD-operations of the [Admin API](../../../integrations-api/#backend-facing-integrations---admin-api), whereas the `store` service gives access to the same data as the [Store API](../../../integrations-api/#customer-facing-interactions---store-api).

For a full description of the `repository` and `store` service, take a look at the [services reference](../../../../resources/references/app-reference/script-reference/data-loading-script-services-reference).

## Adding data to the page object

There are two ways to add data to the page object, either with the `addExtension()` or the `addArrayExtension()` methods.
Both methods expect the name under which the extension should be added as the first parameter. Under that name, you can later access the extension in your Storefront template with the `page.getExtension('extensionName')` call.

::: warning
Note that the extension names need to be unique. Therefore always use your vendor prefix as a prefix for the extension name.
:::

The second argument for both methods is the data you want to add as an extension. The `addExtension` method needs to be a `Struct`, meaning you can only add PHP objects (e.g., the collection or entities returned by the `repository` service) directly as extensions.
If you want to add scalar values or add more than one struct in your extension, you can wrap your data in a JSON-like twig object and use the `addArrayExtension` method.

In your **scripts** that would look something like this:

```twig
{% set products = services.repository.search('product', criteria) %}

{# via addExtension #}
{% do page.addExtension('swagCollection', products) %}
{% do page.addExtension('swagEntity', products.first) %}

{# via addArrayExtension #}
{% set arrayExtension = {
    'collection': products,
    'entity': products.first,
    'scalar': 'a scalar value',
} %}
{% do page.addArrayExtension('swagArrayExtension', arrayExtension) %}
```

You can access the extensions again in your **Storefront templates** like this:

```twig
{# via addExtension #}
{% for product in page.getExtension('swagCollection') %}
    ...
{% endfor %}

{% set product = page.getExtension('swagEntity') %}

{# via addArrayExtension #}
{% for product in page.getExtension('swagArrayExtension').collection %}
    ...
{% endfor %}

{% set product = page.getExtension('swagArrayExtension').entity %}

<h1>{{ page.getExtension('swagArrayExtension').scalar }}</h1>
```

::: info
Note that you can add extensions not only to the page object but to every struct. Therefore you can also add an extension, e.g., to every product inside the page.
:::
