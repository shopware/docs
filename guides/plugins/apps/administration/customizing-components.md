# Overview
The Shopware 6 Administration allows you to override twig blocks to change its content. This guide will teach you the basics of overriding parts of the Administration.

## Prerequisites
All you need for this guide is a running Shopware 6 instance and full access to both the files, as well as the command line and preferably registered module.
Of course you'll have to understand JavaScript and a basic familiarity with TwigJS, the templating engine, used in the Administration, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Finding the block to override
In this guide we want to change the heading of the Shopware 6 dashboard to be `Welcome to a customized component` instead of `Welcome to Shopware 6`. To do this we first need to find a appropriate twig block to override to not replace to much but also to not override to little of the administration.
In this case we only want to override the headline and not links or anything else on the page. Looking at the twig markup for the dashboard [here] (https://github.com/shopware/platform/blob/master/src/Administration/Resources/app/administration/src/module/sw-dashboard/page/sw-dashboard-index/sw-dashboard-index.html.twig), suggests that we only need to override the Twig block with the name `sw_dashboard_index_content_intro_content_headline` to achieve our goal.

## Preparing the override
Now that we now where to place our override, we now need to decide what to override it with. In this very simple example it suffices to create a twig file, declare a block with the name we previously found and to insert our new heading in the block

```twig
{% block sw_product_settings_form_content %}
    <h1>
        Welcome to a customized component
    </h1>
{% endblock %}
```

This overrides the entire Twig block with our new markup. If we however want to retain the original content of the Twig block and just add our markup to the existing markup, then we can do that by including a `{% parent %}` somewhere in the Twig block. Learn more about the capabilities of twig.js [here] (https://github.com/twigjs/twig.js/wiki)

As you might have noticed the heading we just replaced had a `{ $tc() }` insertion wich is used to make it multilingual. Learn more about internationalization here and about adding your own snippets to the administration here.

## Appling the override
The main entry point to customize the administration via plugin is the main.js file. It has to be placed into the `<plugin root>/src/Resources/app/administration/src` directory in order to be automatically found by Shopware 6.
Then you just need to add the override of the Vue component, using the override method, to our ComponentFactory.

``` javascript
import template from './src/extension/sw-product-settings-form/sw-product-settings-form.html.twig';

Shopware.Component.override('sw-product-settings-form', {
    template
});
```

The first parameter matches the component to override, the second parameter has to be an object containing the actually overridden properties , e.g. the new twig template extension for this component.

## Loading the JavaScript File
The only thing now left to just load the `main.js` of our plugin code, learn how to to that [PLACEHOLDER-LINK: Creating administration plugin]

## Next steps
As you might have noticed, your route is just rendering static markup.
But here's a list of things you can do now:
* Creating a new administration component [PLACEHOLDER-LINK: Creating administration component]
* Extending an existing administration component to display [PLACEHOLDER-LINK: Plugin configuration]