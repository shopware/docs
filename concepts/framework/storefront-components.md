---
nav:
  title: Storefront Components
  position: 90

---

# Storefront Components

Since Shopware 6.7.9.0, the default Storefront includes a new component system based on [Symfony UX Twig Components](https://symfony.com/bundles/ux-twig-component/current/index.html).
It enables developers to build reusable, atomic component templates in Twig and introduces additional Shopware-specific features for handling SCSS and JavaScript, bringing a more modern, framework-like development experience to the Storefront.

## Creating Components

Creating a new component is very simple. All you need to do is create the corresponding files for your component in the right directory. All components live in `views/components/` of their specific Symfony bundle, like the Shopware Storefront, or your own extension. There are two different ways to define a component, which will be covered in the following:

### 1. Anonymous Components

The easiest way to define a new component is via a single template file, which is the common way for our Storefront Components. These are called anonymous components and all information for your component can directly be defined in the Twig template file.

**Example Structure:**

```Plaintext
MyExtension/
  src/
    Resources/
      views/
        commponents/
          Button/
            Primary.html.twig
```

The directory and file structure of your component also defines the name of your component. Components from Shopware extensions are also automatically namespaced with the name of the extension (bundle). The shown example will create the component `MyExtension:Button:Primary`.

There is also the option to name the template file `index.html.twig` to just use the directory name as the component name. This can be usefull if you have a larger namespace with several sub-components, or you just want to avoid the nesting but still keep all files of your component in one place.

**Example Structure:**

```Plaintext
MyExtension/
  src/
    Resources/
      views/
        commponents/
          Button/
            index.html.twig
```

This example will create the component `MyExtension:Button`.

In anonymous components you can define properties for your component right within the template. Properties are configuration options that can be used to pass data to your component. You can define default values for these properties and use the data within your component template as usual Twig variables.

**Component Template:**

```Twig
{# components/Button/Primary.html.twig #}

{% props
    label = 'Click here!',
    size = 'md',
%}

<button class="my-extension-button size-{{ size }}">
    {% block content %}
        {{ label }}
    {% endblock %}
</button>
```

Your component can then be used in any other template by using the component name. This can be done via a specific Twig call or by using the new HTML syntax of Twig components.

**Component Usage:**

```Twig
{# Any other template file #}

<div class="my-extension-card">

    <twig:MyExtension:Button:Primary label="Buy now!" size="lg" />

</div>
```

This is just a very basic example of a component and there are a lot of more features available for Twig components. Please refer to the [official documentation](https://symfony.com/bundles/ux-twig-component/current/index.html) for all details.

### 2. PHP Class

The second, more advanced way for creating a component is by PHP class. In Shopware we decided that these PHP classes should be placed right where your component template and other files of your component are located. This provides the epxerience of a real comopnent system and you have all component related files in one place. Therefore you can simply add the PHP class to the described directory structure.

**Note:** As this method requires a PHP file, it is only available for [Shopware Plugins](../../guides/plugins/index.md), but not for Apps. If you want to create components in your App, use anonymous components instead.

**Example Structure:**

```Plaintext
MyPlugin/
  src/
    Resources/
      views/
        commponents/
          Button/
            Primary.html.twig
            Primary.php

```

The loading and template matching is already solved by placing the file in the right directory, so you don't have to define a specific name or template path in your component class.

**Component Class:**

```PHP
<?php declare(strict_types=1);

namespace MyPlugin\Resources\views\components\Button;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

#[AsTwigComponent()]
class Primary
{
    public string $label = 'Click me!';

    public string $size = 'md';

    // Add more public props and logic here.
}
```

This creates the same component as the example in the anonymous components section, but here the component's properties are defined in the PHP class as public attributes.

To learn what kind of possibilities the PHP implementation of your component offers, you can just refer to the [official documentation](https://symfony.com/bundles/ux-twig-component/current/index.html).

## Adding Component Styles

By default, there is no corresponding style system in Twig components, but we wanted to provide a seamless component system, like other modern frontend frameworks. Therefore, we added automated style handling to the Storefront Components, which works similarly to other theme styles in Shopware. All you need to do is create a matching SCSS file for your component, which follows the same naming pattern.

**Example Structure:**

```Plaintext
MyExtension/
  src/
    Resources/
      views/
        commponents/
          Button/
            Primary.html.twig
            Primary.scss
```

Within that SCSS file, you can add your component-specific styles and also access the default SCSS variables of Shopware.

For the future we have ideas on how to load component styles more dynamically based on their usage. For now, component styles are not compiled automatically. They must be referenced by a theme to be added to the compiled `all.css` file. This can be done in two different ways.

### Adding Global Reference

The simplest way to add all relevant component styles to your theme is to reference the global component alias in your theme's style configuration.

**Example Configuration:**

```JSON
{
  "name": "MyExtensionTheme",
  "style": [
    "app/storefront/src/scss/overrides.scss",
    "@Storefront",
    "@Components",
    "app/storefront/src/scss/base.scss"
  ],
}
```

By adding the `@Components` global alias to your style configuration, all component styles from all bundles will be added to your theme.

### Single File Reference

If you don't want to compile all component styles in your theme, you can reference only specific files via a single file reference.

**Example Configuration:**

```JSON
{
  "name": "MyExtensionTheme",
  "style": [
    "app/storefront/src/scss/overrides.scss",
    "@Storefront",
    "@Components/Button/Primary.scss",
    "app/storefront/src/scss/base.scss"
  ],
}
```

With this method you can add only specific component syles in a defined order to the compiled styles of your theme. As there might be components from different bundles with the same naming pattern, you can also explicitly reference a component from a specific namespace.

**Example Configuration:**

```JSON
{
  "name": "MyExtensionTheme",
  "style": [
    "app/storefront/src/scss/overrides.scss",
    "@Storefront",
    "@Components:MyExtension/Button/Primary.scss",
    "app/storefront/src/scss/base.scss"
  ],
}
```

## Adding Component JavaScript

For Twig components that have to implement interactive funcationality via JavaScript, we introduce a corresponding JavaScript component system, which can be seen as the successor of the former JS plugin system. There are some parts which will seem familiar if you aleady know the plugin system, but some parts were changed and improved.

### Major differences between plugin and component system

1. **Automatic initialization**
    If the component is implemented properly it will automatically be initialized on the corresponding elements. Even if the DOM tree changes and elements are added or removed, the component will automatically be initiallized on added elements or destroyed for removed elements. No more manual re-initialization of plugins that have to work in conjunction after dynamic DOM changes.

2. **No registration needed**
    The component system uses native ES module loading that does everyhting for you, if you follow the conventions. The script will automatically be loaded and initialized on corresponding elements just based on the component's name.

3. **Better events instead of overrides**
    The current override technique of the plugin system was not reintroduced to the component system, as it showed some major flaws, as overrides could only happen once which can lead to conflicts between different Shopware exntensions. Instead there is a central event system which is easier to use and offers a more robust public interface. In addtion, it offers special interception events, for example, to manupilate request data before it is send.

4. **No imports**
    We decided to make everything related to the component system available via global scope. This means it is available at the `window` object level and can directly be used in plain JavaScript. No imports or bundling is necessary. You can still use the bundling as it is avialable today or use your own build processes if desired, but the component scripts target for plain JavaScript that don't need to be build in conjuction with our core files.

### Component Script Files

Similar to other component files, you can place the JavaScript file in the directory of your component.

**Example Structure:**

```Plaintext
MyExtension/
  src/
    Resources/
      views/
        commponents/
          Button/
            Primary.html.twig
            Primary.scss
            Primary.js
```

Also, JavaScript files of components are only made available if the theme references the file in the script configuration. Other then the style files, the script files are not compiled into the main script file of the theme, but are separately loaded via **native ES module loading**. Shopware creates an import map for all referenced component script files and the corresponding files are loaded dynamically, only if the component is rendered on the actual page. But for component script files to be added to the import map, they need to be referenced in the theme script configuration. Again, the global alias or single-file references are possible.

**Global Component Script Reference:**

```JSON
{
  "name": "MyExtensionTheme",
  "script": [
    "@Storefront",
    "@Plugins",
    "@Components",
  ],
}
```

**Single File Reference:**

```JSON
{
  "name": "MyExtensionTheme",
  "script": [
    "@Storefront",
    "@Plugins",
    "@Components:MyExtension/Button/Primary.js",
  ],
}
```

### Creating a JavaScript Component

Inside your component script file you export a new class that extends the central `ShopwareComponent` class, which is globally available. The name of the component class does not have to follow a particular pattern, but the name of the script file should have the same name as your Twig component and should be located right beside the template file.

```JavaScript
// components/Button/Primary.js

export default class ButtonPrimary extends ShopwareComponent {

    // Define default options
    static options = {
        label: 'Click me!',
        size: 'md'
    };

    // Component initialization logic
    init() {
        // e.g. registering event listeners.
        this.setupEventListeners();
    }

    // Cleanup logic when component is destroyed
    destroy() {
        // e.g. remove event listeners.
    }

    // Custom methods
    setupEventListeners() {
        this.el.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(event) {
        // Custom logic
    }
}
```

### Automatic Initialization

Components don't have to be registered manually. If the script file of your component follows the rules of the Twig component directory structure, they are automatically loaded via ES module loading.

Shopware generates an importmap for all components based on the Twig component tag name. On initialization, Shopware will search for all elements with a `data-component` attribute and will try to load the corresponding script file, if necessary. Just make sure to add the data attribute, including the tag name of your Twig component, to the root element of your component.

```Twig
{# components/Button/Primary.html.twig #}

{% props
    label = 'Click here!',
    size = 'md',
%}

<button data-component="MyExtension:Button:Primary">

    {% block content %}
        {{ label }}
    {% endblock %}

</button>
```

When the script is loaded, Shopware will automatically initialize the component class on all elements matching the selector. This also applies to elements that might be added later. You do not need to do this manually. Shopware will observe the DOM tree and initialize components also on elements that are dynamically added to the document.

### Component Configuration

Components can be configured through a data attribute named `data-component-options`. For example, you can pass information form Twig into your component. The options should be passed as a JSON string.

```Twig
{# components/Button/Primary.html.twig #}

{% props
    label = 'Click here!',
    size = 'md',
%}

{% set componentOptions = {
    size: size
} %}

<button
  data-component="MyExtension:Button:Primary"
  data-component-options="{{ componentOptions|json_encode }}">

    {% block content %}
        {{ label }}
    {% endblock %}

</button>
```

The passed options are merged with the default options that you define as static properties in your component class.

If you want to have an even more component-style approach, you can simply pass through the Twig component properties to your JavaScript component.

```Twig
{# components/Button/Primary.html.twig #}

{% props
    label = 'Click here!',
    size = 'md',
%}

<button
  data-component="MyExtension:Button:Primary"
  data-component-options="{{ this.props|json_encode }}">

    {% block content %}
        {{ label }}
    {% endblock %}

</button>
```

### Event System

To react to actions from other components, there is a new central event system available which can be accessed via the global `window.Shopware` singleton.

In your component you can emit events to inform others about an action and pass additional data via the event.

```JavaScript
// components/Button/Primary.js

export default class ButtonPrimary extends ShopwareComponent {

    // ...

    doSomething() {
        const message = 'Hello World!';

        window.Shopware.emit('ButtomPrimary:DoSomething', message);
    }
}
```

Other components can then subscribe to this event to react to that.

```JavaScript
// components/Some/Other/Component.js

export default class SomeOtherComponent extends ShopwareComponent {

    init() {
        window.Shopware.on('ButtomPrimary:DoSomething', (message) => {
            this.el.innerText = message;
        });
    }
}
```

Of course, you can also register to events from anywhere else, also from outside of the component system. For example, if you just want to extend the logic of an existing component.

### Event Interception

In addition to the normal asynchronous events, there is a seprate event type which expects a return value that gets further processed within the component. These events make it even easier to extend a components logic and offers a bunch of different use cases, like manipulating request data before it gets send.

For example the BuyButton component offers an event `BuyButton:PreSubmit` which is interceptable, as it is called via `emitInterception()`. It is triggered when a user clicks the buy button of a product.

```JavaScript
// BuyButton.js

export default class BuyButton extends ShopwareComponent {

    // ...

    onFormSubmit(event) {
        event.preventDefault();

        let requestUrl = this.el.getAttribute('action');
        let formData = window.Shopware.serializeForm(this.el);

        ({ requestUrl, formData } = window.Shopware.emitInterception('BuyButton:PreSubmit', { requestUrl, formData }));

        window.Shopware.emit('BuyButton:Submit', requestUrl, formData);

        window.Shopware.callPluginMethod('OffCanvasCart', 'openOffCanvas', requestUrl, formData);
    }
}
```

You can see that the event `BuyButton:PreSubmit` offers the opportunity to manipulate the `formData` before it gets sent. From any other script you can intercept this event and work with the arguments send via the event.

```JavaScript
// Intercept the buy button event
window.Shopware.intercept('BuyButton:PreSubmit', (data) => {

    data.formData.append('foo', 'bar');

    return data;
});
```

Don't forget to return the data again, so the component logic can work with it.

There can be multiple subscribers to a single event. They will all be executed in the order as they are registered. You can change the order by passing a priority parameter as an optional third option, when registering an event. By default all subscribers have the priority `0`. The higher the priority the earlier the subscriber is called in the chain. Also negative values are possible to move a subscriber further down the chain.

```JavaScript
// Another interceptor to the buy button event
window.Shopware.intercept('BuyButton:PreSubmit', (data) => {

    data.formData.delete('foo');
    data.formData.append('bar', 'baz')

    return data;
}, -10);
```

### Method Calling

Besides the event system you can also access other component instances directly, or call methods for all active instances of a component.

```JavaScript
// Call a method on all instances of a component
Shopware.callMethod('MyExtension:Button:Primary', 'doSomething');

// Get all instances of a component
const instances = Shopware.getComponentInstances('MyExtension:Button:Primary');

// Get a specific instance by element
const instance = Shopware.getComponentInstanceByElement('MyExtension:Button:Primary', element);
```

### Mutation Observation

Components can observe DOM and attribute changes on their elements and children. The component base class offers an optional mutation observer that can be started separately if needed.

You can call `initializeObserver()` in your component to start the observer and pass the desired observer configuration. If you want to use this, there are two additional lifecycle methods available to react to content and attribute changes.

```JavaScript
class ButtonPrimary extends ShopwareComponent {

    init() {
        // Enable observation for content and attribute changes
        this.initializeObserver({
            childList: true,
            attributes: true,
            subtree: true
        });
    }

    onContentUpdate(mutationRecord) {
        // Handle content changes
        this.refreshContent();
    }

    onAttributeUpdate(mutationRecord) {
        // Handle attribute changes
        this.updateFromAttributes();
    }
}
```

## Component Documentation (Experimental)

There is support for a component library based on Storybook. This feature is still experimental and will be improved in the future. If you want to provide component documentation for the library, you can place a story definition in your component directory.

**Example Structure:**

```Plaintext
MyExtension/
  src/
    Resources/
      views/
        commponents/
          Button/
            Primary.html.twig
            Primary.scss
            Primary.js
            Primary.stories.json
```

Within the stories file you can add the Storybook configuration for your component.

**Example Story:**

```JSON
{
    "title": "MyExtension/Button/Primary",
    "parameters": {
        "server": {
            "id": "MyExtension:Button:Primary"
        },
        "template": "<twig:MyExtension:Button:Primary size=\"lg\" />"
    },
    "argTypes": {
        "size": {
            "control": "select",
            "options": ["md", "lg"],
            "description": "The size of the button."
        },
        "label": {
            "control": "text",
            "description": "The button label."
        },
    },
    "stories": [
        {
            "name": "Primary",
            "args": {
                "size": "md",
                "label": "Click me!"
            }
        }
    ]
}
```

The component library can be started in your local Shopware development environment with the following command.

```Bash
composer storefront:storybook
```

**Note:** Because the component preview in the documentation requires a controller to render the Twig template it is only available in local development setups and not in production environments.
