---
nav:
  title: Add custom listing filters
  position: 130

---

# Add Custom Listing Filters

## Overview

In an online shop, filters are an important feature. So you might use filters in your custom plugin. This guide will get you covered on how to implement your own, custom filters in Shopware's Storefront.

## Prerequisites

Before you start reading this guide, make sure you got an own plugin installed to work with. If you need a starting point for that, see this guide:

<PageRef page="../plugin-base-guide" />

## Create new Filter

At first, you need to create a subscriber. In this example, we will call it `ExampleListingSubscriber`. If you are not sure on working with subscribers, please refer to the guide on working with events in Shopware:

<PageRef page="../plugin-fundamentals/listening-to-events" />

As usual, we will start by creating this new class in the same path as you're seeing in Shopware's core - `/src/Subscriber/ExampleListingSubscriber.php`.

New listing filters, e.g. for your product listing, can be registered via the event `\Shopware\Core\Content\Product\Events\ProductListingCollectFilterEvent` This event was introduced to enable every developer to specify the metadata for a filter. The handling, meaning if and how a filter is added, is done by Shopware's core:

```php
    public static function getSubscribedEvents(): array
    {
        return [
            ProductListingCollectFilterEvent::class => 'addFilter'
        ];
    }
```

After that, you can start to actually add your custom filters. Arguably an important step is to define your filter. Therefore, you're able to use the `Filter` class, including the parameters below:

| Parameter | Description |
| :--- | :--- |
| `name` | Unique name of the filter |
| `filtered` | Set this option to `true` if this filter is active |
| `aggregations` | Defines aggregations behind a filter. Sometimes a filter contains multiple aggregations like properties |
| `filter` | Sets the DAL filter which should be added to the criteria |
| `values` | Defines the values which will be added as `currentFilter` to the result |
| `exclude` | Configure exclusions |

As a result, an example filter could look like this:

```php
$filter = new Filter(
    // name
    'manufacturer',

    // filtered
    !empty($ids),

    // aggregations
    [new EntityAggregation('manufacturer', 'product.manufacturerId', 'product_manufacturer')],

    // filter
    new EqualsAnyFilter('product.manufacturerId', $ids),

    // values
    $ids
);
```

Inside the `ProductListingCollectFilterEvent`, you get the existing filters, can define your new custom filters and merge them into the existing ones. Here is a complete example implementation, adding a filter on the product information `isCloseout`. Please note the comments for explanation:

```php
// <plugin root>/src/Subscriber/ExampleListingSubscriber.php
class ExampleListingSubscriber implements EventSubscriberInterface
{
    // register event
    public static function getSubscribedEvents(): array
    {
        return [
            ProductListingCollectFilterEvent::class => 'addFilter'
        ];
    }

    public function addFilter(ProductListingCollectFilterEvent $event): void
    {
        // fetch existing filters
        $filters = $event->getFilters();
        $request = $event->getRequest();

        $filtered = (bool) $request->get('isCloseout');

        $filter = new Filter(
            // unique name of the filter
            'isCloseout',

            // defines if this filter is active
            $filtered,

            // Defines aggregations behind a filter. A filter can contain multiple aggregations like properties
            [
                new FilterAggregation(
                    'active-filter',
                    new MaxAggregation('active', 'product.isCloseout'),
                    [new EqualsFilter('product.isCloseout', true)]
                ),
            ],

            // defines the DAL filter which should be added to the criteria   
            new EqualsFilter('product.isCloseout', true),

            // defines the values which will be added as currentFilter to the result
            $filtered
        );

        // Add your custom filter
        $filters->add($filter);
    }
}
```

## Add your filter to the Storefront UI

Well, fine - you successfully created a filter via subscriber. However, you want to enable your shop customer to use it, right? Now you need to integrate your filter in the Storefront. Let's start by searching the template file you need to extend in Shopware's Storefront. It's this one - `src/Storefront/Resources/views/storefront/component/listing/filter-panel.html.twig`.

In this template, the existing filters are contained in the block `component_filter_panel_items`. We are going to extend this block with our new filter. If you're not sure on how to customize templates in the Storefront, we got you covered with another guide:

<PageRef page="customize-templates" />

::: info
The block `component_filter_panel_items` is available from Shopware Version 6.4.8.0
:::

Including our filter will be done as seen below, please take the comments into account:

```twig
// <plugin root>/src/Resources/views/storefront/component/listing/filter-panel.html.twig
{% sw_extends '@Storefront/storefront/component/listing/filter-panel.html.twig' %}

{% block component_filter_panel_items %}
    {{ parent() }}

    {# We'll include our filter element here #}
    {% sw_include '@Storefront/storefront/component/listing/filter/filter-boolean.html.twig' with {
        name: 'isCloseout',
        displayName: 'Closeout'
    } %}
{% endblock %}
```

As we want to filter a boolean value, we choose the `filter-boolean` component here. Sure, there are some more you can use - dependent on your filter's values:

| Name | Description |
| :--- | :--- |
| `filter-boolean` | A filter to display boolean values |
| `filter-multi-select` | Filters with multiple values |
| `filter-property-select` | A filter tailored specifically for properties |
| `filter-range` | Displays a range which can be used for filtering |
| `filter-rating-select` and `filter-rating-select-item` | Filter component for rating |

Extending  `component_filter_panel_items` as shown above puts our filter *after* the already existing ones. We could put it at the beginning by moving the `parent()` call to the end of the block.

If we instead want our filter to be placed before or after a specific filter in the middle of the list, we can instead extend the block for that filter. For example, if we want our filter to be displayed after the price filter, we would extend the block `component_filter_panel_item_price`:

```twig
// <plugin root>/src/Resources/views/storefront/component/listing/filter-panel.html.twig
{% sw_extends '@Storefront/storefront/component/listing/filter-panel.html.twig' %}

{% block component_filter_panel_item_price %}
    {{ parent() }}

    {# We'll include our filter element here #}
    {% sw_include '@Storefront/storefront/component/listing/filter/filter-boolean.html.twig' with {
        name: 'isCloseout',
        displayName: 'Closeout'
    } %}
{% endblock %}
```

## Next steps

Are you interested in adding custom sorting options to your listing in the Storefront as well? Head over to the corresponding guide to learn more about that:

<PageRef page="add-custom-sorting-product-listing" />
