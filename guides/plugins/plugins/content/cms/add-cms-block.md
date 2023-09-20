---
nav:
  title: Add CMS block
  position: 10

---

# Add CMS Block

## Overview

This guide will teach you how to create your very own CMS block with your plugin.

## Prerequisites

This plugin is built upon our plugin from the [Plugin base guide](../../plugin-base-guide), but the examples mentioned here are applicable to every valid Shopware 6 plugin. Also, you should know how to handle the "Shopping Experiences" module in the Administration first. Furthermore, you definitely need to know how to create a custom component in the Administration, which is covered here [Creating a component](../../administration/add-custom-component).

## Custom block in the Administration

Let's get started with adding your first custom block. By default, Shopware 6 comes with several blocks, such as a block called `image_text`. It renders an image element on the left side and a simple text element on the right side. In this guide, you're going to create a new block to swap those two elements, so the text is on the left side and the image on the right side.

All blocks can be found in the directory [/src/Administration/Resources/app/administration/src/module/sw-cms/blocks](https://github.com/shopware/platform/tree/v6.3.4.1/src/Administration/Resources/app/administration/src/module/sw-cms/blocks). In there, they are divided into the categories `commerce`, `form`, `image`, `sidebar`, `text-image`, `text` and `video`.

`commerce` : Blocks using a special template can be found here, e.g. a product slider block.

`form` : A single block displaying a form, mainly the `contact` or the `newsletter` form.

`image` : Only image elements are used by these blocks.

`sidebar` : Blocks for the sidebar, such as the listing filters or the category navigation.

`text-image` : Blocks, that are making use of both, text and images, belong here.

`text` : Blocks only using text elements are located here.

`video` : Our blocks for youtube and vimeo videos reside here.

### Injecting into the Administration

The main entry point to customize the Administration via plugin is the `main.js` file. It has to be placed into a `<plugin root>/src/Resources/app/administration/src` directory in order to be automatically found by Shopware 6.

Create this `main.js` file for now, it will be used later.

### Registering a new block

Your plugin's structure should always match the core's structure. When thinking about creating a new block, you should recreate the directory structure of core blocks in your plugin. The block, which you're going to create, consists of an `image` and a `text` element, so it belongs to the category `text-image`. Thus, create the directory `<plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image`.

In there, you have to create a new directory for each block you want to create, the directory's name representing the block's name. For this example, the name `my-image-text-reversed` is going to be used, so create this directory in there.

Now create a new file `index.js` inside the `my-image-text-reversed` directory, since it will be automatically loaded when importing this block in your `main.js`. Speaking of that, right after having created the `index.js` file, you can actually import your new block directory in the `main.js` file already:

```javascript
// <plugin root>/src/Resources/app/administration/src/main.js
import './module/sw-cms/blocks/text-image/my-image-text-reversed';
```

Back to your `index.js`, which is still empty. In order to register a new block, you have to call the `registerCmsBlock` method of the [cmsService](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/module/sw-cms/service/cms.service.js). Since it's available in the Dependency Injection Container, you can fetch it from there.

First of all, access our `Application` wrapper, which will grant you access to the DI container. This `Application` wrapper has access to the DI container, so go ahead and fetch the `cmsService` from it and call the mentioned `registerCmsBlock` method.

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/my-image-text-reversed/index.js
Shopware.Service('cmsService').registerCmsBlock();
```

#### The configuration object

The method `registerCmsBlock` takes a configuration object, containing the following necessary data:

`name` : The technical name of your block. Will be used for the template and component loading later on.

`label` : A name to be shown for your block in the User Interface.

`category` : The category this block belongs to.

`component` : The Vue component to be used when rendering your actual block in the Administration sidebar.

`previewComponent` : The Vue component to be used in the "list of available blocks". Just shows a tiny preview of what your block would look like if it was used.

`defaultConfig` : A default configuration to be applied to this block. Must be an object containing those default values.

`slots` : Key-value pair to configure which element to be shown in which slot. Will be explained in the next few steps when creating a template for this block.

Go ahead and create this configuration object yourself. Here's what it should look like after having set all of those options:

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/my-image-text-reversed/index.js
Shopware.Service('cmsService').registerCmsBlock({
    name: 'my-image-text-reversed',
    category: 'text-image',
    label: 'My Image Text Block!',
    component: 'sw-cms-block-my-image-text-reversed',
    previewComponent: 'sw-cms-preview-my-image-text-reversed',
    defaultConfig: {
        marginBottom: '20px',
        marginTop: '20px',
        marginLeft: '20px',
        marginRight: '20px',
        sizingMode: 'boxed'
    },
    slots: {
        left: 'text',
        right: 'image'
    }
});
```

The `component` and `previewComponent` do not exist yet, but they are created later in this guide. The `defaultConfig` just gets some minor margins and the sizing mode 'boxed', which will result in a CSS class [is--boxed](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/module/sw-cms/component/sw-cms-block/sw-cms-block.scss) being applied to that block later. The slots are defined by an object, where the key represents the slot's name and the value being the technical name of the element to be used in this slot. This will be easier to understand when having a look at the respective template in a few minutes. Also you might want to have a look at the [Vue documentation regarding slots](https://vuejs.org/v2/guide/components-slots.html).

### Rendering the block

You've set the `name` of the component to be used when rendering your block to be 'sw-cms-block-my-image-text-reversed'. This component does not exist yet, so let's create this one real quick. As already mentioned, creating a component is not explained by this guide in detail, so you might want to head over to our guide about [Creating a component](../../administration/add-custom-component) first.

First of all, create a new directory `component` in your block's directory. In there, create a new `index.js` file and register your custom component `sw-cms-block-my-image-text-reversed`.

**Keep in mind: The component name consists of `sw-cms-block-` and the `name` property mentioned in your `index.js`, while registering your cms block component via `registerCmsBlock()`!**

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/my-image-text-reversed/component/index.js
import template from './sw-cms-block-my-image-text-reversed.html.twig';
import './sw-cms-block-my-image-text-reversed.scss';

Shopware.Component.register('sw-cms-block-my-image-text-reversed', {
    template
});
```

Just like most components, it has a custom template and also some styles. Focus on the template first, create a new file `sw-cms-block-my-image-text-reversed.html.twig`.

This template now has to define the basic structure of your custom block. In this simple case, you only need a parent container and two sub-elements, whatever those are. That's also were the slots come into play: You've used two slots in your block's configuration, `left` and `right`. Make sure to create those slots in the template as well now.

```twig
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/my-image-text-reversed/component/sw-cms-block-my-image-text-reversed.html.twig
{% block sw_cms_block_my_image_text_reversed %}
    <div class="sw-cms-block-my-image-text-reversed">
        <slot name="left">{% block sw_cms_block_my_image_text_reversed_slot_left %}{% endblock %}</slot>
        <slot name="right">{% block sw_cms_block_my_image_text_reversed_slot_right %}{% endblock %}</slot>
    </div>
{% endblock %}
```

You've got a parent `div` containing the two required [slots](https://vuejs.org/v2/guide/components-slots.html). If you were to rename the first slot `left` to something else, you'd have to adjust this in your block's configuration as well.

Those slots would be rendered from top to bottom now, instead of from left to right. That's why your block comes with a custom `.scss` file, create it now by adding the file `sw-cms-block-my-image-text-reversed.scss` to your `component` directory.

In there, use a grid to display your elements next to each other. You've set a CSS class for your block, which is the same as its name.

```css
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/my-image-text-reversed/component/sw-cms-block-my-image-text-reversed.scss
.sw-cms-block-my-image-text-reversed {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 40px;
}
```

That's it for this component! Make sure to import your `component` directory in your `index.js` file, so your new component actually gets loaded.

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/my-image-text-reversed/index.js
import './component'; // <- Right here!

Shopware.Service('cmsService').registerCmsBlock({
    ...
});
```

Your block can now be rendered in the designer. Let's continue with the preview component.

### Block preview

You've also set a property `previewComponent` containing the value `sw-cms-preview-my-image-text-reversed`. Time to create this component as well. For this purpose, stick to the core structure again and create a new directory `preview`. In there, again, create an `index.js` file, register your component by its name and load a template and a `.scss` file.

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/my-image-text-reversed/preview/index.js
import template from './sw-cms-preview-my-image-text-reversed.html.twig';
import './sw-cms-preview-my-image-text-reversed.scss';

Shopware.Component.register('sw-cms-preview-my-image-text-reversed', {
    template
});
```

The preview element doesn't have to deal with mobile viewports or anything alike, it's just a simplified preview of your block. Thus, create a template containing a text and an image and use the styles to place them next to each other. Create a `sw-cms-preview-my-image-text-reversed.html.twig` file in your `preview` directory with the following content.

```twig
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/my-image-text-reversed/preview/sw-cms-preview-my-image-text-reversed.html.twig
{% block sw_cms_block_my_image_text_reversed_preview %}
    <div class="sw-cms-preview-my-image-text-reversed">
        <div>
            <h2>Lorem ipsum dolor</h2>
            <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</p>
        </div>
        <img :src="'/administration/static/img/cms/preview_mountain_small.jpg' | asset">
    </div>
{% endblock %}
```

Just a div containing some text and an example image next to that. For the styles, you can simply use the grid property of CSS again. Since you don't have to care about mobile viewports, this is even easier this time.

Now create the styles file `sw-cms-preview-my-image-text-reversed.scss` with the following styles:

```css
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/my-image-text-reversed/preview/sw-cms-preview-my-image-text-reversed.scss
.sw-cms-preview-my-image-text-reversed {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 20px;
    padding: 15px;
}
```

A two-column layout, some padding and spacing here and there, done.

Now, import this component in your block's `index.js` as well. This is, what your final block's `index.js` file should look like now:

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/my-image-text-reversed/index.js
import './component';
import './preview';

Shopware.Service('cmsService').registerCmsBlock({
    name: 'my-image-text-reversed',
    category: 'text-image',
    label: 'My Image Text Block!',
    component: 'sw-cms-block-my-image-text-reversed',
    previewComponent: 'sw-cms-preview-my-image-text-reversed',
    defaultConfig: {
        marginBottom: '20px',
        marginTop: '20px',
        marginLeft: '20px',
        marginRight: '20px',
        sizingMode: 'boxed'
    },
    slots: {
        left: 'text',
        right: 'image'
    }
});
```

In order to test your changes now, you should rebuild your Administration. This can be done with the following command:

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

You should now be able to use your new block in the "Shopping Experiences" module.

## Storefront representation

While your new block is fully functional in the Administration already, you've never defined a template for it for the Storefront.

A block's Storefront representation is always expected in the directory [platform/src/Storefront/Resources/views/storefront/block](https://github.com/shopware/platform/tree/v6.3.4.1/src/Storefront/Resources/views/storefront/block). In there, a twig template named after your block is expected.

So go ahead and re-create that structure in your plugin: `<plugin root>/src/Resources/views/storefront/block/`

In there create a new twig template named after your block, so `cms-block-my-image-text-reversed.html.twig` it is.

Since the [original 'image\_text' file](https://github.com/shopware/platform/blob/v6.3.4.1/src/Storefront/Resources/views/storefront/block/cms-block-image-text.html.twig) is already perfectly fine, you can go ahead and extend from it in your storefront template.

```twig
// <plugin root>/src/Resources/views/storefront/block/cms-block-my-image-text-reversed.html.twig
{% sw_extends '@Storefront/storefront/block/cms-block-image-text.html.twig' %}
```

And that's it for the Storefront as well in this example! Make sure to have a look at the other original templates to get and understand how the templating for blocks works.

## Next steps

Now you've got your very own CMS block running, what about a custom CMS element? Head over to our guide, which will explain exactly that: [Creating a custom CMS element](add-cms-element)
