# Add custom styles

## Overview

All components contain own templates and some style. Of course, you may want to use your custom styles in your component or module. In this guide, we got you covered on how to add those custom styles to your components.

## Prerequisites

However, this guide does not explain how to create a custom component, so head over to the official guide about creating a custom component to learn this first.

<PageRef page="add-custom-component" />

In addition, you need to have a basic knowledge of CSS and SCSS in order to use custom styles. This is though considered a basic requirement and won't be taught in this guide.

### Example: Custom cms block

We will base our guide on an example: Let's use a custom component printing out "Hello world!". So first of all, create a new directory for your`sw-hello-world`. As said before, more information about that topic, such as where to create this directory, can be found in [Add a custom component](add-custom-component).

In your component's directory, create a new `index.js` file and register your custom component `sw-hello-world`:

```javascript
Shopware.Component.register('sw-hello-world', {
    template
});
```

Just like most components, it has a custom template. First we create the template file named `sw-hello-world.html.twig`:

This template now has to define the basic structure of your component. In this simple case, you only need a parent container and two sub-elements, whatever those are.

```html
{% block example_block %}
    <div class="sw-hello-world">
        <p>Hello world!</p>
    </div>
{% endblock %}
```

You've got a parent `div` containing the content of your template, an abstract with the text "Hello world!" in this case. Next up, you need to import that template in your `index.js` file of your component:

```javascript
// Import for your template
import template from './sw-hello-world.html.twig';

Shopware.Component.register('sw-sw-hello-world', {
    template
});
```

## Add custom styles to your component

Your component should come with a custom `.scss` file, which you need to create now. Don't forget to import it in your `index.js` file, if not done yet:

```javascript
import template from './sw-hello-world.html.twig';

// Import for your custom styles
import './sw-hello-world.scss';

Shopware.Component.register('sw-sw-hello-world', {
    template
});
```

In there, simply use a grid to display your elements next to each other. You set a CSS class for your block, which is named after the component. In there, you can set your styles as you need. To mention an example, we want the text in the `div` with the class `sw-hello-world` to have a blue color:

```css
.sw-hello-world {
    color: blue;
}
```

That's it for this component! This way, you're able to add your own styles to your component now.

### Import variables

Because of [Sass](https://sass-lang.com/) usage, you are able to import external variables and use them in your classes. Below you see an example which uses Shopware's SCSS variables to color the text of the component in shopware's shade of blue.

```css
/* Import statement */
@import "~scss/variables";

.sw-hello-world {
  /* Usage of variable */
  color: $color-shopware-brand-500;
}
```

## More interesting topics

* [Writing templates](writing-templates)
* [Add shortcuts](https://github.com/shopware/docs/tree/575c2fa12ef272dc25744975e2f1e4d44721f0f1/guides/plugins/plugins/administration/add-shortcuts.md)
