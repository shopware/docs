# Customizing components

The Shopware 6 Administration allows you to override twig blocks to change its content.
This guide will teach you the basics of overriding parts of the Administration.

## Prerequisites

All you need for this guide is a running Shopware 6 instance, the files and preferably a registered module.
Of course, you'll have to understand JavaScript and have a basic familiarity with TwigJS, the templating engine, used in the Administration.
However, that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation.

## Finding the block to override

In this guide we want to change the heading of the Shopware 6 dashboard to be `Welcome to a customized Administration` instead of `Welcome to Shopware 6`.
To do this we first need to find an appropriate twig block to override.
We don't want to replace too much but also to not override too little of the Administration.
In this case we only want to override the headline and not links or anything else on the page.
Looking at the twig markup for the dashboard [here](https://github.com/shopware/platform/blob/trunk/src/Administration/Resources/app/administration/src/module/sw-dashboard/page/sw-dashboard-index/sw-dashboard-index.html.twig),
suggests that we only need to override the Twig block with the name `sw_dashboard_index_content_intro_content_headline` to achieve our goal.

## Preparing the override

Now that we know where to place our override, we need to decide what to override it with.
In this very simple example it suffices to create a twig file, declare a block with the name we previously found and to insert our new header into the block.

```text
<!-- <plugin root>/src/Resources/app/administration/src/sw-dashboard-index-override/sw-dashboard-index.html.twig -->
{% block sw_dashboard_index_content_intro_content_headline %}
    <h1>
        Welcome to a customized component
    </h1>
{% endblock %}
```

This overrides the entire Twig block with our new markup.
However, if we want to retain the original content of the Twig block and just add our markup to the existing one, we can do that by including a {% raw %}`{% parent %}`{% endraw %} somewhere in the Twig block.
Learn more about the capabilities of twig.js [here](https://github.com/twigjs/twig.js/wiki).

As you might have noticed the heading we just replaced had a `{ $tc() }` [string interpolation](https://vuejs.org/v2/guide/syntax.html#Text) which is used to make it multilingual.
Learn more about internationalization in the Shopware 6 Administration and about adding your own snippets to the Administration [here](adding-snippets).

## Applying the override

Registering the override of the Vue component is done by using the override method of our ComponentFactory.
This could be done in any `.js` file, which then has to be later imported, but we'll place it in `<plugin root>/src/Resources/app/administration/src/sw-dashboard-index-override/index.js`.

```javascript
import template from './sw-dashboard-index.html.twig';

Shopware.Component.override('sw-dashboard-index', {
    template
});
```

The first parameter matches the component to override, the second parameter has to be an object containing the actually overridden properties , e.g. the new twig template extension for this component.

## Loading the JavaScript File

The main entry point to customize the Administration via a plugin is the `main.js` file.
It has to be placed into the `<plugin root>/src/Resources/app/administration/src` directory in order to be automatically found by Shopware 6.

The only thing now left to just add an import for our of previously created `./sw-dashboard-index-override/index.js` in the `main.js`:

```javascript
import './sw-dashboard-index-override/';
```

## More interesting topics

* [Customizing templates](writing-templates)
* [Customizing via custom styles](add-custom-styles)
* [Using base components](using-base-components)
