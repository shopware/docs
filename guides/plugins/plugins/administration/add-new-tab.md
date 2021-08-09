# Add tab to existing module

## Overview

You want to create a new tab in the administration? This guide gets you covered on this subject. A realistic example would be adding a new association for an entity, which you want to configure on a separate tab on the entity detail page.

## Prerequisites

This guide requires you to already have a basic plugin running. If you don't know how to do this in the first place, have a look at our plugin base guide:

{% page-ref page="../plugin-base-guide.md" %}

In the course of this guide, you need to create a custom route. If you want to learn on how to create a custom component, please refer to the guide on it:

{% page-ref page="add-custom-route.md" %}

Also, we will use a small, custom component to fill our custom tab. In order to get used to that, it might come in handy to read the corresponding guide first:

{% page-ref page="add-custom-component.md" %}

{% hint style="info" %}
### Please remember

The main entry point to customize the administration via plugin is the `main.js` file. It has to be placed into a `<plugin root>/src/Resources/app/administration/src` directory in order to be found by Shopware 6. So please use the file accordingly and refer to the [plugin base guide](../plugin-base-guide.md) for more details.
{% endhint %}

## Creating a custom tab

### Find the block to extend

For this guide, we'll think about the following example: The product detail page is extended by a new tab, which then only contains a 'Hello world!'. In order to refer to this example, let's have a look at the twig code of the product detail page found here:
<!-- markdown-link-check-disable-next-line -->
{% embed url="https://github.com/shopware/platform/blob/552675ba24284dec2bb01c2107bf45f86b362550/src/Administration/Resources/app/administration/src/module/sw-product/page/sw-product-detail/sw-product-detail.html.twig\#L120" caption="" %}

Let's imagine your first goal is to create a new tab on the product detail page. Having a look at the template, you might find the block `sw_product_detail_content_tabs`, which seems to contain all available tabs. It starts by creating a new `<sw-tabs>` element to contain all the tabs available. Here you can see excerpt of this block:

{% code title="platform/src/Administration/Resources/app/administration/src/module/sw-product/page/sw-product-detail/sw-product-detail.html.twig" %}
```text
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
{% endcode %}

Unfortunately, you cannot use the block mentioned above, because then your new tab wouldn't be inside the `<sw-tabs>` element. Instead, you can choose the last available block inside the element, which is `sw_product_detail_content_tabs_reviews` at this moment.

### Create custom tab

Knowing the block you have to override in your plugin, you can now start doing exactly this: Add your custom tab by overriding this block called `sw_product_detail_content_tabs_reviews`.

{% hint style="danger" %}
However, please keep in mind that "overriding" doesn't mean we want to replace the block completely with our new one. We want to add our tab, thus only extending the template. This will have some implications on our implementation.
{% endhint %}

First, please re-create the directory structure from the core code in your plugin. In this case, you'll have to create a directory structure like the following: `<plugin root>/src/Resources/app/administration/src/page/sw-product-detail`

In there you create a new file `index.js`, which then contains the following code:

{% code title="<plugin root>/src/Resources/app/administration/src/page/sw-product-detail/index.js" %}
```javascript
import template from './sw-product-detail.html.twig';

// Override your template here, using the actual template from the core
Shopware.Component.override('sw-product-detail', {
    template
});
```
{% endcode %}

All this file is doing is to basically override the `sw-product-detail` component with a new template. The new template does not exist yet though, so create a new file `sw-product-detail.html.twig` in the same directory as your `index.js` file. It then has to use the block we figured out earlier and override it by adding a new tab element:

{% code title="<plugin root>/src/Resources/app/administration/src/page/sw-product-detail/sw-product-detail.html.twig" %}
```text
{% block sw_product_detail_content_tabs_reviews %}

    {# This parent is very important as you don't want to override the review tab completely #}
    {% parent %}

{% endblock %}
```
{% endcode %}

{% hint style="warning" %}
The block gets overridden and immediately the parent block is called, since you do not want to replace the 'Review' tab, you want to add a new tab instead.
{% endhint %}

After that, we'll create the actual `sw-tabs-item` element, which, as the name suggests, represents a new tab item. We want this tab to have a custom route, so we're also adding this route directly. Don't worry, we'll explain this custom route in a bit. The product detail page's route contain the product's ID, which you also want to have in your custom tab: So make sure to also pass the ID in, like shown in the example above.

{% code title="<plugin root>/src/Resources/app/administration/src/page/sw-product-detail/sw-product-detail.html.twig" %}
```text
{% block sw_product_detail_content_tabs_reviews %}

    {% parent %}

    <!-- We'll define a custom route here, an explanation will follow later -->
    <sw-tabs-item :route="{ name: 'sw.product.detail.custom', params: { id: $route.params.id } }" title="Custom">
        Custom
    </sw-tabs-item>
{% endblock %}
```
{% endcode %}

The [route](add-custom-route.md) being used here has the name `sw.product.detail.custom`, this will become important again later on.

### Loading the new tab

You've now created a new tab, but your new template is not yet loaded. Remember, that the main entry point for custom javascript for the administration is the your plugin's `main.js` file. And that's also the file you need to adjust now, so it loads your `sw-product-detail` override.

This is an example of what your `main.js` should look like in order to load your override:

```javascript
import './page/sw-product-detail';
```
{% hint style="info" %}
Don't forget to rebuild the administration after applying changes to your `main.js`.
{% tabs %}
{% tab title="Development template" %}
```bash
./psh.phar administration:build
```
{% endtab %}

{% tab title="Production template" %}
```bash
./bin/build-administration.sh
```
{% endtab %}
{% endtabs %}
{% endhint %}

## Registering the tab's new route

Your new tab should now already show up on the product detail page, but clicking it should always result in an error. It's basically pointing to a new route, which you never defined yet.

Next step would be the following: Create a new route and map it to your own component. This is done by registering a new dummy module, which then overrides the method `routeMiddleware` of a module. It gets called for each and every route that is called in the administration. Once the `sw.product.detail` route is called, you want to add your new child route to it.

You can add those changes to your `main.js` file, which could then look like this:

{% code title="<plugin root>/src/Resources/app/administration/src/main.js" %}
```javascript
import './page/sw-product-detail';
import './view/sw-product-detail-custom';

// Here you create your new route, refer to the mentioned guide for more information
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
{% endcode %}

As already mentioned, you need to create a dummy module in order to override the `routeMiddleware` method. In there, you're listening for the current route, that got called. If the current route matches `sw.product.detail`, you want to add your new child route to it, and that's what's done here.

{% hint style="warning" %}
Your child route defines the routes name, so make sure to use the name you're already defined earlier!
{% endhint %}

The path should be identical to the default ones, which look like this: `/sw/product/detail/:id/base` Just replace the `base` here with `custom` or anything you like.

It then points to a component, which represents the routes actual content - so you'll have to create [a new component](add-custom-component.md) in the next step. Note the new import that's already part of this example: `view/sw-product-detail-custom`

## Creating your new component

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

{% code title="<plugin root>/src/Resources/app/administration/src/view/sw-product-detail-custom/index.js" %}
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
{% endcode %}

This file mainly registers a new component with a custom title and a custom template. Once more, the referenced template is still missing, so make sure to create the file `sw-product-detail-custom.html.twig` next to your `index.js` file.

Here's what this new template could look like:

{% code title="<plugin root>/src/Resources/app/administration/src/view/sw-product-detail-custom/sw-product-detail-custom.html.twig" %}
```text
<sw-card title="Custom">
    Hello world!
</sw-card>
```
{% endcode %}

It simply creates a new card with a title, which only contains a 'Hello world!' string. And that's it - your tab should now be fully functional.
