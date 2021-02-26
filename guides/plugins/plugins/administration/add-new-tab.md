# Add tab to existing module

## Overview

You want to create a new tab in the administration for the product detail page? This guide gets you covered on this subject. A realistic example would be adding a new association for an entity, which you want to configure on a separate tab on the entity detail page.

Here is an explanation on how this can be achieved. In this example, the product detail page is extended by a new tab, which then only contains a 'Hello world!'.

## Prerequisites

This guide requires you to already have a basic plugin running.
If you don't know how to do this in the first place, have a look at our [Plugin base guide](../plugin-base-guide.md).

### Entrypoint for injecting custom javascript

Please remember: The main entry point to customize the administration via plugin is the `main.js` file. It has to be placed into a `<plugin root>/src/Resources/app/administration/src` directory in order to be found by Shopware 6. So please use the file accordingly and refer to the \[PLACEHOLDER: Plugin base guide\] for more detail.

## Creating a custom tab

In order to refer to a real world example, let's have a look at the twig code of the product detail page found [here](https://github.com/shopware/platform/blob/master/src/Administration/Resources/app/administration/src/module/sw-product/page/sw-product-detail/sw-product-detail.html.twig). Let's imagine your first goal is to create a new tab on the product detail page.

Having a look at the template, you might find the block `sw_product_detail_content_tabs`, which seems to contain all available tabs. It starts by creating a new `<sw-tabs>` element to contain all the tabs available. Here you can see excerpt of this block:

```markup
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

Unfortunately, you cannot use the block mentioned above, because then your new tab wouldn't be inside the `<sw-tabs>` element. Instead, you can choose the last available block inside the element, which is `sw_product_detail_content_tabs_reviews`.

Knowing the block you have to override in your plugin, you can now start doing exactly this. First re-create the directory structure from the core code in your plugin. In this case, you'll have to create a directory structure like the following: `<plugin root>/src/Resources/app/administration/src/page/sw-product-detail`

In there you create a new file `index.js`, which then contains the following code:

```javascript
import template from './sw-product-detail.html.twig';

Shopware.Component.override('sw-product-detail', {
    template
});
```

All it's doing, is to basically override the `sw-product-detail` component with a new template. The new template does not exist yet though, so create a new file `sw-product-detail.html.twig` in the same directory as your `index.js` file.

It then has to use the block we figured out earlier and override it by adding a new tab element:

```markup
{% block sw_product_detail_content_tabs_reviews %}
    {% parent %}

    <sw-tabs-item :route="{ name: 'sw.product.detail.custom', params: { id: $route.params.id } }" title="Custom">
        Custom
    </sw-tabs-item>
{% endblock %}
```

The block gets overridden and immediately the parent block is called, since you do not want to replace the 'Review' tab, you want to add a new tab instead.

Following then is the actual `sw-tabs-item` element, which, as the name suggests, represents a new tab item. You want the tab to have a custom route, so you're also adding this directly. The product detail page's route contain the product's ID, which you also want to have in your custom tab, so make sure to also pass the ID in like shown in the example above.

The route being used here has the name `sw.product.detail.custom`, this will become important again later on.

### Loading the new tab

You've now created a new tab, but your new template is not yet loaded. Remember, that the main entry point for custom javascript for the administration is the your plugin's `main.js` file. And that's also the file you need to adjust now, so it loads your `sw-product-detail` override.

This is an example of what your `main.js` should look like in order to load your override:

```javascript
import './page/sw-product-detail';
```

### Registering the new route

Your new tab should now already show up on the product detail page, but clicking it should always result in an error. It's basically pointing to a new route, which you never defined yet.

Next step would be the following: Create a new route and map it to your own component. This is done by registering a new dummy module, which then overrides the method `routeMiddleware` of a module. It gets called for each and every route that is called in the administration. Once the `sw.product.detail` route is called, you want to add your new child route to it.

You can add those changes to your `main.js` file, which could then look like this:

```javascript
import './page/sw-product-detail';
import './view/sw-product-detail-custom';

Shopware.Module.register('sw-new-tab-custom', {
    routeMiddleware(next, currentRoute) {
        if (currentRoute.name === 'sw.product.detail') {
            currentRoute.children.push({
                name: 'sw.product.detail.custom',
                path: '/sw/product/detail/:id/custom',
                component: 'sw-product-detail-custom',
                meta: {
                    parentPath: "sw.product.index"
                }
            });
        }
        next(currentRoute);
    }
});
```

As already mentioned, you need to create a dummy module in order to override the `routeMiddleware` method. In there, you're listening for the current route, that got called. If the current route matches `sw.product.detail`, you want to add your new child route to it, and that's what's done here.

Your child route defines the routes name, so make sure to use the name you're already defined earlier! The path should be identical to the default ones, which look like this: `/sw/product/detail/:id/base` Just replace the `base` here with `custom` or anything you like.

It then points to a component, which represents the routes actual content - so you'll have to create a new component in the next step. Note the new import that's already part of this example: `view/sw-product-detail-custom`

### Creating your new component

As shown in the previous example, your custom component is expected to be in a directory `view/sw-product-detail-custom`, so create this directory in your plugin now. The directory structure inside of your administration directory should then look like this:

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

Here's what your new template could then look like:

```text
<sw-card title="Custom">
    Hello world!
</sw-card>
```

It simply creates a new card with a title, which only contains a 'Hello world!' string. And that's it - your tab should now be fully functional.

## Next steps

As you might have noticed, we are just adding a custom tab to the module. However, there's a lot more possible when it comes to extending the Adminsitration. You may want to try the following things:

* If you want to learn about other possibilities to extend the Administration, we got you covered with other guides:
  * [Writing templates](writing-templates.md)
  * [Add custom module](add-custom-module.md)
  * [Add menu entry](./add-menu-entry.md)
  * [Add custom routes](./add-custom-route.md)

