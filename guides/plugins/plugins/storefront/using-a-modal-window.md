# Using a Modal Window

## Overview

This guide explains how you can use a modal window in your plugin in different scenarios.

## Prerequisites

This guide requires you to already have a basic plugin running. This guide **does not** explain how to create a new plugin for Shopware 6. Head over to our Plugin base guide to learn how to create a plugin at first:

<PageRef page="../plugin-base-guide" />

While this is not mandatory, having read the guide about adding custom JavaScript plugins beforehand might help you understand this guide a bit further:

<PageRef page="./add-custom-javascript" />

## Create a modal manually from the DOM using Bootstrap

The simples solution to create a modal is by using Bootstrap. More info: [Modal Bootstrap](https://getbootstrap.com/docs/4.0/components/modal/#live-demo)
Here is a basic implementation as an example. We override the `base_main_inner` from the `@Storefront/storefront/page/content/index.html.twig` template to insert the modal specific DOM elements.

```twig
// <plugin root>/src/Resources/views/storefront/page/content/index.html.twig
{% sw_extends '@Storefront/storefront/page/content/index.html.twig' %}

{% block base_main_inner %}
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
        Launch demo modal
    </button>

    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- insert your content here -->
                    ...
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>

    {{ parent() }}
{% endblock %}
```

## Create a modal using AjaxModalPlugin

When setting a `data-url` in addition to `data-toggle="modal"` shopware automatically uses the `PseudoModalUtil` and the pseudo modal template from the `base.html.twig` to render a modal:

```twig
// <plugin root>/src/Resources/views/storefront/page/content/index.html.twig
{% sw_extends '@Storefront/storefront/page/content/index.html.twig' %}

{% block base_main_inner %}
    <!-- This uses `AjaxModalPlugin` -->
    <button class="btn"
            data-toggle="modal"
            data-url="https://example.org/ajax-url">

    {{ parent() }}
{% endblock %}
```

::: warning
This does not work when the trigger selector is being changed via JavaScript, e.g. because of an AJAX call which replaces the content.
:::

## Advanced / manual using Pseudo Modal Utility

To create a modal window you can use the `PseudoModalUtil` in your plugin.

As explained in the guide on [adding custom javascript](./add-custom-javascript) we load our JavaScript plugin by creating `index.html.twig` template in the `<plugin root>/src/Resources/views/storefront/page/content/` folder.
Inside this template, extend from the `@Storefront/storefront/page/content/index.html.twig` and overwrite the `base_main_inner` block. After the parent content of the blog, add a template tag with the `data-example-plugin` attribute.

```twig
// <plugin root>/src/Resources/views/storefront/page/content/index.html.twig
{% sw_extends '@Storefront/storefront/page/content/index.html.twig' %}

{% block base_main_inner %}
    {{ parent() }}

    <template data-example-plugin></template>
{% endblock %}
```

Now we need to register the plugin which should create a modal in the `PluginManager`. To achieve this you can add the following code to the `main.js` file.

```javascript
// <plugin root>/src/Resources/app/storefront/src/main.js
 // Import all necessary Storefront plugins
 import ExamplePlugin from './example-plugin/example-plugin.plugin';

 // Register your plugin via the existing PluginManager
 const PluginManager = window.PluginManager;
 PluginManager.register('ExamplePlugin', ExamplePlugin, '[data-example-plugin]');
```

Now let's get started with the modal window. First we have to import the `PseudoModalUtil` class in our plugin.

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';
import PseudoModalUtil from 'src/utility/modal-extension/pseudo-modal.util';

export default class ExamplePlugin extends Plugin {
    init() {
        // ...
    }
}
```

Now we create a new modal instance using `new PseudoModalUtil()` and assign to a property of our plugin for later usage.
We also call the method `open()` to make it visible.

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';
import PseudoModalUtil from 'src/utility/modal-extension/pseudo-modal.util';

export default class ExamplePlugin extends Plugin {
    init() {
        this.openModal();
    }
    
    openModal() {
        // create a new modal instance
        this.modal = new PseudoModalUtil();
        
        // open the modal window and make it visible
        this.modal.open();
    }
}
```

To see your changes you have to build the storefront. Use the following command to build your storefront and reload it afterwards:

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

You can now see a blank modal which contains `undefined`. This is because we have not added any content to show inside the modal.

The constructor method of `PseudoModalUtil()` expects some HTML `content` to display. To keep this guide simple, we are only including sample code here.
Of course, the content can also be generated via an API and inserted via AJAX requests.

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';
import PseudoModalUtil from 'src/utility/modal-extension/pseudo-modal.util';

export default class ExamplePlugin extends Plugin {
    init() {
        // declaring some basic content
        const content = `
            <div class="js-pseudo-modal-template">
                <div class="js-pseudo-modal-template-title-element">Modal title</div>
                <div class="js-pseudo-modal-template-content-element">Modal content</div>
            </div>
        `;
        
        this.openModal(content);
    }
    
    openModal(content) {
        // create a new modal instance
        this.modal = new PseudoModalUtil(content);
        
        // open the modal window and make it visible
        this.modal.open();
    }
}
```

## Closing the modal

The `PseudoModalUtil` class also provide a `close()` method. Same as with opening the modal by calling `this.modal.open()`, you can simply close the modal with `this.modal.close()`.

## Callback when opening a modal

The `open()` method of the `PseudoModalUtil` class supports a callback function as an argument. So if you need to perform some action when your modal opens, you can implement a callback like this:

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';
import PseudoModalUtil from 'src/utility/modal-extension/pseudo-modal.util';

export default class ExamplePlugin extends Plugin {
    init() {
        // declaring some basic content
        const content = `
            <div class="js-pseudo-modal-template">
                <div class="js-pseudo-modal-template-title-element">Modal title</div>
                <div class="js-pseudo-modal-template-content-element">Modal content</div>
            </div>
        `;
        
        this.openModal(content);
    }
    
    openModal(content) {
        // create a new modal instance
        this.modal = new PseudoModalUtil(content);
        
        // open the modal window and fire a callback function
        this.modal.open(this.onOpenModal.bind(this));
    }
    
    onOpenModal() {
        console.log('the modal is opened');
    }
}
```

## Updating the modal content

To update the content of a modal, `PseudoModalUtil` provides a method `updateContent()` to which you can pass the updated template string. The method also accepts a callback function as a second argument, which is called after the content has been updated.
Here is an example how to use it:

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';
import PseudoModalUtil from 'src/utility/modal-extension/pseudo-modal.util';

export default class ExamplePlugin extends Plugin {
    init() {
        // declaring some basic content
        const content = `
            <div class="js-pseudo-modal-template">
                <div class="js-pseudo-modal-template-title-element">Modal title</div>
                <div class="js-pseudo-modal-template-content-element">Modal content</div>
            </div>
        `;
        
        this.openModal(content);
        
        // ... do some stuff

        const updatedContent = `
            <div class="js-pseudo-modal-template">
                <div class="js-pseudo-modal-template-title-element">Modal title</div>
                <div class="js-pseudo-modal-template-content-element">Updated content</div>
            </div>
        `;
        
        this.modal.updateModal(updatedContent, this.onUpdateModal.bind(this));
    }
    
    openModal(content) {
        // create a new modal instance
        this.modal = new PseudoModalUtil(content);
        
        // open the modal window and fire a callback function
        this.modal.open(this.onOpenModal.bind(this));
    }
    
    onOpenModal() {
        console.log('the modal is opened');
    }

    onUpdateModal() {
        console.log('the modal was updated');
    }
    
}
```

## Customize the modal appearance

The constructor method of `PseudoModalUtil` provides optional configuration. If you don't need backdrop of the modal for example just turn it off by instantiating the modal like this

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
import Plugin from 'src/plugin-system/plugin.class';
import PseudoModalUtil from 'src/utility/modal-extension/pseudo-modal.util';

export default class ExamplePlugin extends Plugin {
    init() {
        // declaring some basic content
        const content = `
            <div class="js-pseudo-modal-template">
                <div class="js-pseudo-modal-template-title-element">Modal title</div>
                <div class="js-pseudo-modal-template-content-element">Modal content</div>
            </div>
        `;
        
        this.openModal(content);
    }
    
    openModal(content) {
        // disable backdrop
        const useBackrop = false;
        
        // create a new modal instance
        this.modal = new PseudoModalUtil(content, useBackrop);
        
        // open the modal window and make it visible
        this.modal.open();
    }
}
```

As you can see in the sample code, we are using the `js-pseudo-modal-template-title-element` class to style the title text of the modal.
It also tells the `PseudoModalUtil` class that the content of the `div` holds the title text.
Furthermore there are two more css selectors `js-pseudo-modal-template` and `js-pseudo-modal-template-content-element` to define the structure of the template string.

If you want to customize your modal by using different style classes, you can do that by overriding the defaults while instantiating `PseudoModalUtil`.

Here is an example which shows how to override the CSS class names.

```javascript
// <plugin root>/src/Resources/app/storefront/src/example-plugin/example-plugin.plugin.js
// ...
export default class ExamplePlugin extends Plugin {
    init() {
        // ...
    }

    openModal(content) {
        // enable backdrop
        const useBackrop = true;

        // create a new modal instance
        this.modal = new PseudoModalUtil(
            content,
            useBackrop,
            '.custom-js-pseudo-modal-template',
            '.custom-js-pseudo-modal-template-content-element',
            '.custom-js-pseudo-modal-template-title-element'
        );

        // open the modal window and make it visible
        this.modal.open();
    }
}
```
