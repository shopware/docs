# Add Custom Javascript

## Overview

If you want to add interactivity to your Storefront you probably have to write your own JavaScript plugin. Here you will be guided through the process of writing and registering your own JavaScript plugins. You will write a plugin that simply checks if the user has scrolled to the bottom of the page and then creates an alert.

## Prerequisites

You need for this guide a running plugin and therefore a running Shopware 6 instance, with full access to all files. This also includes access to the command line to execute a command, which then builds the Storefront. A general understanding of vanilla JavaScript ES6 is also mandatory. Everything else is explained in this guide itself.

## Writing a JavaScript plugin

Storefront JavaScript plugins are vanilla JavaScript ES6 classes that extend from our Plugin base class. For more information, refer to [JavaScript classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) section.

The directory to create custom javascript plugins should be the following, which represents the same structure like the core: `<plugin root>/src/Resources/app/storefront/src/`

In there, you create a new directory, named after your plugin. In this guide, this will be called `example-plugin`, so the full path would look like this: `<plugin root>/src/Resources/app/storefront/src/example-plugin`

Now create an actual file for your JavaScript plugin, in this example it will be called `example-plugin.plugin.js`.

Inside this file create and export an ExamplePlugin class that extends the base Plugin class:

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';

export default class ExamplePlugin extends Plugin {
}
```

This is just a basic vanilla JavaScript ES6 class, which extends the `Plugin` class.

Each plugin has to implement the `init()` method. This method will be called when your plugin gets initialized and is the entrypoint to your custom logic. The plugin initialization runs on `DOMContentLoaded` event, so you can be sure, that the dom is already completely loaded. In your case you add a callback to the `scroll` event from the window and check if the user has scrolled to the bottom of the page. If so we display an alert. Your full plugin now looks like this:

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';

export default class ExamplePlugin extends Plugin {
    init() {
        window.addEventListener('scroll', this.onScroll.bind(this));
    }

    onScroll() {
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
            alert('Seems like there\'s nothing more to see here.');
        }
    }
}
```

A short explanation what the condition is doing here: The `window.innerHeight` contains the height of the window, as you might have guessed.

This is added to `window.pageYOffset`, which contains the current scroll position on the Y-axis. It represents the **top** value of the current scroll, which basically means: If your website is 5000px high and you scroll to the very bottom, the value would **not** be 5000px, but rather `5000px - window.innerHeight`. Thus, we have to add up the `innerHeight` to actually get the bottom of the website.

Well, and then we check if this sum is bigger or equal the total size of your website, by fetching the height of your website's `body` tag. If it is higher or equal the total height of the website, you reached the end of the website.

## Registering your plugin

Next you have to tell Shopware that your plugin should be loaded and executed. Therefore you have to register your plugin in the PluginManager.

Shopware is automatically looking for a `main.js` file in a directory `<plugin root>/src/Resources/app/storefront/src`, which then will be loaded automatically. Consider this to be your main storefront JavaScript entrypoint.

Create a `main.js` file inside your `<plugin root>/src/Resources/app/storefront/src` folder and get the PluginManager from the global window object. Then register your own plugin:

```javascript
// <plugin root>/src/Resources/app/storefront/src/main.js
// Import all necessary Storefront plugins
import ExamplePlugin from './example-plugin/example-plugin.plugin';

// Register your plugin via the existing PluginManager
const PluginManager = window.PluginManager;
PluginManager.register('ExamplePlugin', ExamplePlugin);
```

Right now, your plugin will automatically be loaded once you load the website.

## Binding your plugin to the DOM

You can also bind your plugin to a DOM element by providing a css selector:

```javascript
// <plugin root>/src/Resources/app/storefront/src/main.js
 // Import all necessary Storefront plugins
 import ExamplePlugin from './example-plugin/example-plugin.plugin';

 // Register your plugin via the existing PluginManager
 const PluginManager = window.PluginManager;
 PluginManager.register('ExamplePlugin', ExamplePlugin, '[data-example-plugin]');
```

In this case the plugin just gets executed if the HTML document contains at least one element with the `data-example-plugin` attribute. You can then use `this.el` inside your plugin to access the DOM element your plugin is bound to.

### Loading your plugin

The following will create a new template with a very short explanation. If you're looking for more information on what's going on here, head over to our guide about [Customizing templates](customize-templates).

You bound your plugin to the css selector `[data-example-plugin]`, so you have to add DOM elements with this attribute on the pages you want your plugin to be active.

Create a `<plugin root>/src/Resources/views/storefront/page/content/` folder and create a `index.html.twig` template. Inside this template, extend from the `@Storefront/storefront/page/content/index.html.twig` and overwrite the `base_main_inner` block. After the parent content of the blog, add a template tag that has the `data-example-plugin` attribute.

A lot of text, here is the respective example:

```twig
// <plugin root>/src/Resources/views/storefront/page/content/index.html.twig
{% sw_extends '@Storefront/storefront/page/content/index.html.twig' %}

{% block base_main_inner %}
    {{ parent() }}

    <template data-example-plugin></template>
{% endblock %}
```

With this template extension your plugin is active on every content page, like the homepage or category listing pages.

## Configuring your plugins

You can configure your plugins from inside the templates via data-options. First you have to define a static `options` object inside your plugin and assign your options with default values to it. In your case define a `text` option and as a default value use the text you previously directly prompted to the user. And instead of the hard coded string inside the `alert()`, use your new option value.

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';

export default class ExamplePlugin extends Plugin {
    static options = {
        /**
         * Specifies the text that is prompted to the user
         * @type string
         */
        text: 'Seems like there\'s nothing more to see here.',
    };

    init() {
        window.addEventListener('scroll', this.onScroll.bind(this));
    }

    onScroll() {
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
            alert(this.options.text);
        }
    }
}
```

Now you are able to override the text that is prompted to the user from inside your templates. For this example we're going to display another message on product detail pages.

Therefore create a `product-detail` folder inside your `<plugin root>/src/Resources/views/storefront/page` folder and add an `index.html.twig` file inside that folder. In your template extend from the default `@Storefront/storefront/page/product-detail/index.html.twig` and override the block `page_product_detail_content`.

After the parent content add a template tag with the `data-example-plugin` tag to activate your plugin on product detail pages as well. Next add a `data-{your-plugin-name-in-kebab-case}-options` \(in this example: `data-example-plugin-options`\) attribute to the DOM element you registered your plugin on \(the template tag\). The value of this attribute are the options you want to override as a JSON object.

```twig
// <plugin root>/src/Resources/views/storefront/page/product-detail/index.html.twig
{% sw_extends '@Storefront/storefront/page/product-detail/index.html.twig' %}

{% set examplePluginOptions = {
    text: "Are you not interested in this product?"
} %}

{% block page_product_detail_content %}
    {{ parent() }}

    <template data-example-plugin data-example-plugin-options='{{ examplePluginOptions|json_encode }}'></template>
{% endblock %}
```

It is best practice to use a variable for the options because this is extendable from plugins.

## Modify existing options

We've just mentioned the best practice to use a template variable for setting plugin options, so other plugins can extend those options. This section will explain how to do actually achieve that.

You can use the `replace_recursive` Twig filter for this case.

Imagine the following example can be found in the core:

```text
{% set productSliderOptions = {
    productboxMinWidth: sliderConfig.elMinWidth.value ? sliderConfig.elMinWidth.value : '',
    slider: {
        gutter: 30,
        autoplayButtonOutput: false,
        nav: false,
        mouseDrag: false,
        controls: sliderConfig.navigation.value ? true : false,
        autoplay: sliderConfig.rotate.value ? true : false
    }
} %}

{% block element_product_slider_slider %}
    <div class="base-slider"
         data-product-slider="true"
         data-product-slider-options="{{ productSliderOptions|default({})|json_encode|escape('html_attr') }}">
    </div>
{% endblock %}
```

Now you want to overwrite the value `slider.mouseDrag` with your plugin. The variable can be overwritten with `replace_recursive`:

```text
{% block element_product_slider_slider %}
    {% set productSliderOptions = productSliderOptions|replace_recursive({
        slider: {
            mouseDrag: true
        }
    }) %}

    {{ parent() }}
{% endblock %}
```

## Plugin script path

For JavaScript you normally would have two locations where your `*.js` files are located. You have your `main.js` as an entry point inside of the following directory: `<plugin root>/src/Resources/app/storefront/src`.

Shopware will then compile the JavaScript and save the compiled version at `<plugin root>/src/Resources/app/storefront/dist/storefront/js/<plugin-name>.js`. This file will be recognized automatically by Shopware.

Make sure to ship the compiled file with your plugin as well.

## Testing your changes

To see your changes you have to build the Storefront. Use the following command and reload your Storefront:

<Tabs>
<Tab title="Template">

```bash
./bin/build-storefront.sh
```

</Tab>
<Tab title="platform only (contribution setup)">

```bash
composer run build:js:storefront
```

</Tab>
</Tabs>

If you now scroll to the bottom of your page an alert should appear.

## Next steps

You've got your own first javascript plugin running. You might want to start [listening to javascript events](reacting-to-javascript-events) now, or even [override other javascript plugins](override-existing-javascript) instead.
