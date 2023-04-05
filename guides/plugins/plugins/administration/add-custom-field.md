# Add custom input field to existing component

## Overview

If you were wondering how to add a new input field to an existing module in the Administration via plugin, then you've found the right guide to cover that subject. In the following examples, you'll add a new input field to the product's detail page, to display and configure some other product data not being handled by default.

## Prerequisites

This guide **does not** explain how you can create a new plugin for Shopware 6. Head over to our plugin base guide to learn how to create a plugin at first:

<PageRef page="../plugin-base-guide" />

## Injecting into the Administration

The main entry point to customize the Administration via plugin is the `main.js` file. It has to be placed into a `<plugin root>/src/Resources/app/administration/src` directory in order to be automatically found by Shopware 6.

Your `main.js` file then needs to override the [Vue component](https://vuejs.org/v2/guide/components.html) using the `override` method of our `ComponentFactory`.

The first parameter matches the component to override, the second parameter has to be an object containing the actually overridden properties , e.g. the new twig template extension for this component.

```javascript
// <plugin root>/src/Resources/app/administration/src/main.js
import template from './extension/sw-product-settings-form/sw-product-settings-form.html.twig';

Shopware.Component.override('sw-product-settings-form', {
    template
});
```

In this case, the `sw-product-settings-form` component is overridden, which reflects the settings form on the product detail page. As mentioned above, the second parameter has to be an object, which includes the actual template extension.

## Adding the custom template

Time to create the referenced twig template for your plugin now.

::: info
We're dealing with a [TwigJS](https://github.com/twigjs/twig.js/wiki) template here.
:::

Create a file called `sw-product-settings-form.html.twig` in the following directory: `<plugin root>/src/Resources/app/administration/src/extension/sw-product-settings-form`

::: info
The path starting from 'src' is fully customizable, yet we recommend choosing a pattern like this one.
:::

```twig
// <plugin root>/src/Resources/app/administration/src/extension/sw-product-settings-form/sw-product-settings-form.html.twig
{% block sw_product_settings_form_content %}
    {% parent %}

    <sw-container columns="repeat(auto-fit, minmax(250px, 1fr))" gap="0px 30px">
        <sw-text-field label="Manufacturer ID" v-model="product.manufacturerId" disabled></sw-text-field>
    </sw-container>
{% endblock %}
```

Basically the twig block `sw_product_settings_form_content` is overridden here. Make sure to have a look at the [Twig documentation about the template inheritance](https://twig.symfony.com/doc/2.x/templates.html#template-inheritance), to understand how blocks in Twig work.

This block contains the whole settings form of the product detail page. In order to add a new input field to it, you need to override the block, call the block's original content \(otherwise we'd replace the whole form\), and then add your custom input field to it. Also, the input field is "disabled", since it should be readable only. This should result in a new input field with the label 'Manufacturer ID', which then contains the ID of the actually chosen manufacturer.

## Loading the JS files

As mentioned above, Shopware 6 is looking for a `main.js` file in your plugin. Its contents get minified into a new file named after your plugin and will be moved to the `public` directory of Shopware 6 root directory. Given this plugin would be named "AdministrationNewField", the minified javascript code for this example would be located under `<plugin root>/src/Resources/public/administration/js/administration-new-field.js`, once you run the command following command in your shopware root directory:

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

::: info
Your plugin has to be activated for this to work.
:::

Make sure to also include that file when publishing your plugin! A copy of this file will then be put into the directory `<shopware root>/public/bundles/administration/newfield/administration/js/administration-new-field.js`.

Your minified javascript file will now be loaded in production environments.
