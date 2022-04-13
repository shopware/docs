# Add a real world CMS block

## Overview

This guide will teach you how to create a CMS-Block with your plugin. This guide will cover a real world example to keep everything easy we will just create a simple button. The CMS-block for the button we will cover right here.

## Prerequisites

This plugin is built based on the [Add CMS block](../add-cms-block.md) guide. We assume that you know the basics for a CMS-Block from this guide.

## Custom block in the administration

Let's get started with adding the custom block for a button in the administration. Since Shopware 6 already comes with different categories we just have to choose in which category we want to show our block. If you break down what a button is, you should come to the conclusion that a button is just text. So we create the block in the `text` category.

## Administration code

Since you already know the basics from [Add CMS block](../add-cms-block.md), we will just look a quick look at the code.
First we create our `main.js` in the  `<plugin root>/src/Resources/app/administration/src` directory.

{% code title="<plugin root>/src/Resources/app/administration/src/main.js" %}
```javascript
import './module/sw-cms/blocks/text/cms-button';
```
{% endcode %}

### Block category
We decided to create our block in the text category, so we place our first `index.js` in `<plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text`

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text/cms-button/index.js" %}
```javascript
import './component';
import './preview';

Shopware.Service('cmsService').registerCmsBlock({
    name: 'cms-button',
    label: 'sw-cms.blocks.text.ninja-cms-button.label',
    category: 'text',
    component: 'sw-cms-block-button',
    previewComponent: 'sw-cms-preview-button',
    defaultConfig: {
        marginBottom: '20px',
        marginTop: '20px',
        marginLeft: '20px',
        marginRight: '20px',
        sizingMode: 'boxed'
    },
    /* The slot config is important!
       We give the slot button the element text in this tutorial because we haven't defined a button element yet.
       You can use the existing blocks and elements out of the box but it gets interesting if you want to create your very own element with an own config.
       We'll take a look at this later in this guide.
    */
    slots: {
        button: 'text'
    }
});
```
{% endcode %}


### Block component

Luckily we are just creating a simple button in this guide so the code will be very simple.

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text/cms-button/component/sw-cms-block-button.html.twig" %}
{% raw %}
```text
{% block sw_cms_block_button %}
	<div class="sw-cms-block-button">
		<slot name="button"></slot>
	</div>
{% endblock %}
```
{% endraw %}
{% endcode %}

We also need to register the component:

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text/cms-button/component/index.js" %}
```javascript
import template from './sw-cms-block-button.html.twig';

const { Component } = Shopware;

Component.register('sw-cms-button', {
    template
});
```
{% endcode %}


### Block preview

We'll keep the preview also very simple in this guide like this:

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text/cms-button/preview/sw-cms-preview-button.html.twig" %}
{% raw %}
```text
{% block sw_cms_block_ninja_button_preview %}
	<div class="ninja-button-flex-center">
		<button class="sw-cms-preview-ninja-button">Button</button>
	</div>
{% endblock %}
```
{% endraw %}
{% endcode %}

Let's register this component as well like this:
{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text/cms-button/preview/index.js" %}
{% raw %}
```text
import template from './sw-cms-preview-button.html.twig';
import './sw-cms-preview-button.scss';

const { Component } = Shopware;

Component.register('sw-cms-preview-button', {
    template
});
```
{% endraw %}
{% endcode %}

And let's add a bit of CSS code (not neccessary)

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text/cms-button/preview/sw-cms-preview-button.scss" %}
```css
.ninja-button-flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    .sw-cms-preview-ninja-button {
        background-color: #4492ed;
        border: none;
        color: white;
        padding: 16px 60px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
    }

}
```
{% endcode %}

### Build administration

You need to build your administration before you can see anything in the shopware backend. Just run the one of the following commands:

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

Note: Your plugin has to be installed and activated. If you still can't see the block make sure to clear your cache as well.

## What about the slots?

If you did everything correct so far, you should see the CMS-Block in your "Shopping Experiences" module in the category text. You also should be able
to drag and drop the block into your CMS-Page but you will not see a button there. Instead you will see the exact same "Lorem Ipsum" text like you do
when you drag and drop a normal text block into your page. Why?

Because of the slot we defined. In our `<plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text/cms-button/index.js`. We gave the slot
the element "text". You can throw in every other element here as well. Since we haven't created a element for the button it's one of our To-Do's now.

We also need a config and we need to react on the settings which are made in the administration to display everything correct in the frontend. First of all
we need to create a simple frontend view first. So let's start with that!

## Frontend implemantation

Creating a frontend view is very simple as you should know from the [Add CMS block](../add-cms-block.md) guide. We only need to create a twig file in the 
correct directory with the same name. It should look like this:


{% code title="<plugin root>/src/Resources/views/storefront/block/cms-block-cms-button.html.twig" %}
{% raw %}
```text
{% block block_cms_button_example %}
    <div class="cms-element ninja-cms-button-flex ninja-cms-button-flex-center">
		{% block element_text_button %}
			<a href="#">
				<button class="ninja-cms-btn">
                    Button
                </button>
			</a>
		{% endblock %}
    </div>
{% endblock %}
```
{% endraw %}
{% endcode %}

Let's do the storefront implementation as previously mentioned in the [Add CMS block](../add-cms-block.md) guide:

{% code title="<plugin root>/src/Resources/views/storefront/block/cms-block-image-text-reversed.html.twig" %}
{% raw %}
```text
{% sw_extends '@Storefront/storefront/block/cms-block-image-text.html.twig' %}
```
{% endraw %}
{% endcode %}

It would be possible to override the code from the [original 'image\_text' file](https://github.com/shopware/platform/blob/v6.3.4.1/src/Storefront/Resources/views/storefront/block/cms-block-image-text.html.twig) file here. We just extend so the code in that file exactly matches 
the code from the original file.

Now we already should see a button in the storefront if we save a page with our new created CMS-Block.
However the view in the administration and in the storefront are completely different. We could simply but our code in the storefront twig file
and display whatever we want. To really create a button with a config we need to create a matching CMS-Element.

Before we do that we quickly add a bit CSS to our storefront like this:

{% code title="<plugin root>/src/Resources/app/storefront/src/scss/cms-block-button/_ninja-cms-button.scss" %}
```css
.ninja-cms-btn {
    padding: 1rem;

    &:hover {
        filter: brightness(110%);
    }
}

.ninja-cms-button-flex {
    display: flex;
    margin: auto;

    &-start {
        justify-content: flex-start;
    }

    &-center {
        justify-content: center;
    }

    &-end {
        justify-content: flex-end;
    }

    a {
        button {
            background-color: #4492ed;
            border: none;
            color: #fff;
            padding: 14px 50px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 30px 0;
        }
    }
}
```
{% endcode %}

As you already may see from the CSS code we want to configure how the button is placed and a bit more. To learn how you can to that please head over
to [Add real world CMS element](add-real-world-cms-element.md)>

You also can see the code for this guide here [shopware-real-world-cms-block](https://github.com/NinjaArmy/shopware-real-world-cms) 