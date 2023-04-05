# Add tab to existing module

## Overview

You want to create a new tab in the Administration? This guide gets you covered on this subject. A realistic example would be adding a new association for an entity, which you want to configure on a separate tab on the entity detail page.

## Prerequisites

This guide requires you to already have a basic plugin running. If you don't know how to do this in the first place, have a look at our plugin base guide:

<PageRef page="../plugin-base-guide" />

In the course of this guide, you need to create a custom route. If you want to learn on how to create a custom component, please refer to the guide on it:

<PageRef page="add-custom-route" />

Also, we will use a small, custom component to fill our custom tab. In order to get used to that, it might come in handy to read the corresponding guide first:

<PageRef page="add-custom-component" />

::: info

### Please remember

The main entry point to customize the Administration via plugin is the `main.js` file. It has to be placed into a `<plugin root>/src/Resources/app/administration/src` directory in order to be found by Shopware 6. So please use the file accordingly and refer to the [plugin base guide](../plugin-base-guide) for more details.
:::

## Creating a custom tab

### Find the block to extend

For this guide, we'll think about the following example: The product detail page is extended by a new tab, which then only contains a 'Hello world!'. In order to refer to this example, let's have a look at the twig code of the product detail page found here:

<PageRef page="https://github.com/shopware/platform/blob/552675ba24284dec2bb01c2107bf45f86b362550/src/Administration/Resources/app/administration/src/module/sw-product/page/sw-product-detail/sw-product-detail.html.twig\#L120" title="shopware/platform - sw-product-detailhtml.twig @ GitHub" target="_blank" />

Let's imagine your first goal is to create a new tab on the product detail page. Having a look at the template, you might find the block `sw_product_detail_content_tabs`, which seems to contain all available tabs. It starts by creating a new `<sw-tabs>` element to contain all the tabs available. Here you can see excerpt of this block:

```twig
// platform/src/Administration/Resources/app/administration/src/module/sw-product/page/sw-product-detail/sw-product-detail.html.twig
{% block sw_product_detail_content_tabs %}
    <sw-tabs class="sw-product-detail-page__tabs" v-if="productId">
        {% block sw_product_detail_content_tabs_general %}
            <sw-tabs-item
                class="sw-product-detail__tab-general"
                :route="{ name: 'sw.product.detail.base', params: { id: $route.params.id } }"
                :hasError="swProductDetailBaseError"
                :title="$tc('sw-product.detail.tabGeneral')">
                {{ $tc('sw-product.detail.tabGeneral') }}
            </sw-tabs-item>
        {% endblock %}

        ...

        {% block sw_product_detail_content_tabs_reviews %}
            <sw-tabs-item
                class="sw-product-detail__tab-reviews"
                :route="{ name: 'sw.product.detail.reviews', params: { id: $route.params.id } }"
                :title="$tc('sw-product.detail.tabReviews')">
                {{ $tc('sw-product.detail.tabReviews') }}
            </sw-tabs-item>
        {% endblock %}
    </sw-tabs>
{% endblock %}
```

Unfortunately, you cannot use the block mentioned above, because then your new tab wouldn't be inside the `<sw-tabs>` element. Instead, you can choose the last available block inside the element, which is `sw_product_detail_content_tabs_reviews` at this moment.

### Create custom tab

Knowing the block you have to override in your plugin, you can now start doing exactly this: Add your custom tab by overriding this block called `sw_product_detail_content_tabs_reviews`.

::: danger
However, please keep in mind that "overriding" doesn't mean we want to replace the block completely with our new one. We want to add our tab, thus only extending the template. This will have some implications on our implementation.
:::

First, please re-create the directory structure from the core code in your plugin. In this case, you'll have to create a directory structure like the following: `<plugin root>/src/Resources/app/administration/src/page/sw-product-detail`

In there you create a new file `index.js`, which then contains the following code:

```javascript
// <plugin root>/src/Resources/app/administration/src/page/sw-product-detail/index.js
import template from './sw-product-detail.html.twig';

// Override your template here, using the actual template from the core
Shopware.Component.override('sw-product-detail', {
    template
});
```

All this file is doing is to basically override the `sw-product-detail` component with a new template. The new template does not exist yet though, so create a new file `sw-product-detail.html.twig` in the same directory as your `index.js` file. It then has to use the block we figured out earlier and override it by adding a new tab element:

```twig
// <plugin root>/src/Resources/app/administration/src/page/sw-product-detail/sw-product-detail.html.twig
{% block sw_product_detail_content_tabs_reviews %}

    {# This parent is very important as you don't want to override the review tab completely #}
    {% parent %}

{% endblock %}
```

::: warning
The block gets overridden and immediately the parent block is called, since you do not want to replace the 'Review' tab, you want to add a new tab instead.
:::

After that, we'll create the actual `sw-tabs-item` element, which, as the name suggests, represents a new tab item. We want this tab to have a custom route, so we're also adding this route directly. Don't worry, we'll explain this custom route in a bit. The product detail page's route contain the product's ID, which you also want to have in your custom tab: So make sure to also pass the ID in, like shown in the example above.

```twig
// <plugin root>/src/Resources/app/administration/src/page/sw-product-detail/sw-product-detail.html.twig
{% block sw_product_detail_content_tabs_reviews %}

    {% parent %}

    <!-- We'll define a custom route here, an explanation will follow later -->
    <sw-tabs-item :route="{ name: 'sw.product.detail.custom', params: { id: $route.params.id } }" title="Custom">
        Custom
    </sw-tabs-item>
{% endblock %}
```

The [route](add-custom-route) being used here has the name `sw.product.detail.custom`, this will become important again later on.

### Loading the new tab

You've now created a new tab, but your new template is not yet loaded. Remember, that the main entry point for custom javascript for the Administration is the your plugin's `main.js` file. And that's also the file you need to adjust now, so it loads your `sw-product-detail` override.

This is an example of what your `main.js` should look like in order to load your override:

```javascript
import './page/sw-product-detail';
```

::: info
Don't forget to rebuild the Administration after applying changes to your `main.js`.

<Tabs>
<Tab title="Template">

```bash
./bin/build-administration.sh
```

</Tab>
<Tab title="platform only (contribution setup)">

```bash
composer run build:js:admin
```

</Tab>
</Tabs>
:::

## Registering the tab's new route

Your new tab should now already show up on the product detail page, but clicking it should always result in an error. It's basically pointing to a new route, which you never defined yet.

Next step would be the following: Create a new route and map it to your own component. This is done by registering a new dummy module, which then overrides the method `routeMiddleware` of a module. It gets called for each and every route that is called in the Administration. Once the `sw.product.detail` route is called, you want to add your new child route to it.

You can add those changes to your `main.js` file, which could then look like this:

```javascript
// <plugin root>/src/Resources/app/administration/src/main.js
import './page/sw-product-detail';
import './view/sw-product-detail-custom';

// Here you create your new route, refer to the mentioned guide for more information
Shopware.Module.register('sw-new-tab-custom', {
    routeMiddleware(next, currentRoute) {
        const customRouteName = 'sw.product.detail.custom';
    
        if (
            currentRoute.name === 'sw.product.detail' 
            && currentRoute.children.every((currentRoute) => currentRoute.name !== customRouteName)
        ) {
            currentRoute.children.push({
                name: customRouteName,
                path: '/sw/product/detail/:id/custom',
                component: 'sw-product-detail-custom',
                meta: {
                    parentPath: 'sw.product.index'
                }
            });
        }
        next(currentRoute);
    }
});
```

As already mentioned, you need to create a dummy module in order to override the `routeMiddleware` method. In there, you're listening for the current route, that got called. If the current route matches `sw.product.detail`, you want to add your new child route to it, and that's what's done here.

::: warning
Your child route defines the routes name, so make sure to use the name you're already defined earlier!
:::

The path should be identical to the default ones, which look like this: `/sw/product/detail/:id/base` Just replace the `base` here with `custom` or anything you like.

It then points to a component, which represents the routes actual content - so you'll have to create [a new component](add-custom-component) in the next step. Note the new import that's already part of this example: `view/sw-product-detail-custom`

## Creating your new component

As shown in the previous example, your custom component is expected to be in a directory `view/sw-product-detail-custom`, so create this directory in your plugin now. The directory structure inside of your Administration directory should then look like this:

```text
administration
├── page
│   └── sw-product-detail
│       └── sw-product-detail
│           ├── index.js
│           └── sw-product-detail.html.twig
├── view
│   └── sw-product-detail-custom
└── main.js
```

Since a component always gets initiated by a file called `index.js`, create such a new file in the `sw-product-detail-custom` directory:

```javascript
// <plugin root>/src/Resources/app/administration/src/view/sw-product-detail-custom/index.js
import template from './sw-product-detail-custom.html.twig';

Shopware.Component.register('sw-product-detail-custom', {
    template,

    metaInfo() {
        return {
            title: 'Custom'
        };
    },
});
```

This file mainly registers a new component with a custom title and a custom template. Once more, the referenced template is still missing, so make sure to create the file `sw-product-detail-custom.html.twig` next to your `index.js` file.

Here's what this new template could look like:

```text
// <plugin root>/src/Resources/app/administration/src/view/sw-product-detail-custom/sw-product-detail-custom.html.twig
<sw-card title="Custom">
    Hello world!
</sw-card>
```

It simply creates a new card with a title, which only contains a 'Hello world!' string. And that's it - your tab should now be fully functional.
