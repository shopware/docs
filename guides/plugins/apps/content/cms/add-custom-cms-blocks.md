---
nav:
  title: Add custom CMS blocks
  position: 10

---

# Add custom CMS blocks

::: info
This functionality is available starting with Shopware 6.4.4.0.

You can [add custom CMS blocks](../../../plugins/content/cms/add-cms-block) using the plugin system, however these will not be available in Shopware cloud stores.
:::

Didn't get in touch with Shopware's Shopping Experiences \(CMS\) yet? Check out the concept behind it first:

<PageRef page="../../../../../concepts/commerce/content/shopping-experiences-cms" />

## Prerequisites

This guide is based on our [App Base Guide](../../app-base-guide) and assumes you have already set up an app.

## Overview

Adding custom CMS blocks from an app works a bit differently than [adding them from a plugin](../../../plugins/content/cms/add-cms-block).
Custom CMS blocks are added by providing a `cms.xml` in the `Resources/` directory of your app.
The basic directory structure looks as follows:

```text
├── Resources
│   ├── app
│   │   └── storefront
│   │       └── src
│   │           └── scss
│   │               └── base.scss
│   ├── cms
│   │   └── blocks
│   │       └── swag-image-text-reversed
│   │           ├── preview.html
│   │           └── styles.css
│   ├── views
│   │   └── storefront
│   │       └── block
│   │           └── cms-block-swag-image-text-reversed-component.html.twig
│   └── cms.xml
└── manifest.xml
```

Each CMS block defined within your `cms.xml` must have a directory matching the block's name in `Resources/cms/blocks/`.
In those directories you shape your blocks for the CMS module in the Administration by supplying a `preview.html` containing the template used for displaying a preview.
Styling the preview in the sidebar and the component in the CMS editor is possible from the `styles.css`.

::: info
Due to technical limitations it's not possible to use templating engines \(like Twig\) or preprocessors \(like Sass\) for rendering and styling the preview.
:::

The Storefront representations of your blocks reside in `Resources/views/storefront/block/`.

## Defining blocks

As already mentioned above and similar to an app's `manifest.xml`, CMS blocks also require some definition done in the `cms.xml`.
In this example we will define a custom CMS block that will extend the default block `image-text` and reverse its elements:

```xml
// <app root>/Resources/cms.xml
<?xml version="1.0" encoding="utf-8" ?>
<cms xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Cms/Schema/cms-1.0.xsd">
    <blocks>
        <block>
            <!-- A unique technical name for your block. We recommend to use a shorthand prefix for your company, e.g. "Swag" for shopware AG. -->
            <name>swag-image-text-reversed</name>

            <!-- The category your block is associated with. See the XSD for available categories. -->
            <category>text-image</category>

            <!-- Your block's label which will be shown in the CMS module in the Administration. -->
            <label>Two columns, text &amp; boxed image</label>
            <label lang="de-DE">Zwei Spalten, Text &amp; gerahmtes Bild</label>

            <!-- The slots that your block holds which again hold CMS elements. -->
            <slots>
                <!-- A slot requires a unique name and a type which refers to the CMS element it shows. Right now you can only use the CMS elements provided by Shopware but at a later point you will be able to add custom elements too. -->
                <slot name="left" type="text">
                    <!-- The slot requires some basic configuration. The following config-value elements highly depend on which element the slot holds. -->
                    <config>
                        <!-- The following config-value will be interpreted as 'verticalAlign: { source: "static", value: "top"}' in the JavaScript. -->
                        <config-value name="vertical-align" source="static" value="top"/>
                    </config>
                </slot>

                <slot name="right" type="image">
                    <config>
                        <config-value name="display-mode" source="static" value="auto"/>
                        <config-value name="vertical-align" source="static" value="top"/>
                    </config>
                </slot>
            </slots>

            <!-- Each block comes with a default configuration which is pre-filled and customizable when adding a block to a section in the CMS module in the Administration. -->
            <default-config>
                <margin-top>20px</margin-top>
                <margin-right>20px</margin-right>
                <margin-bottom>20px</margin-bottom>
                <margin-left>20px</margin-left>
                <!-- The sizing mode of your block. Allowed values are "boxed" or "full_width". -->
                <sizing-mode>boxed</sizing-mode>
            </default-config>
        </block>
    </blocks>
</cms>
```

Let's have a look at how to configure a CMS block from your app's `cms.xml`:

`<name>` : A **unique** technical name for your block.

`<category>` : Blocks are divided into categories. Available categories can be found in the [plugin guide](../../../plugins/content/cms/add-cms-block#custom-block-in-the-administration).

`<label>` : The **translatable** label will be shown in the Administration.

`<default-config>` : Some default configuration for the block.

`<slots>` : Each block holds slots that configure which element they show.

The full CMS reference is available here:

<PageRef page="../../../../../resources/references/app-reference/cms-reference" />

### Block preview

The preview template for `swag-image-text-reversed` looks like this:

```html
// <app root>/Resources/cms/blocks/swag-image-text-reversed/preview.html
<div class="sw-cms-preview-swag-image-text-reversed">
    <div>
        <h2>Lorem ipsum dolor</h2>
        <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</p>
    </div>

    <!-- Alternatively you might e.g. also use a base64 encoded preview image instead of an external resource. -->
    <img src="https://example.com/preview.jpg" alt="Preview image">
</div>
```

::: info
For security reasons you can only use pure HTML in the preview template.
The template will be sanitized from possibly malicious tags like `<script>` or attributes like `:src="'/administration/static/img/cms/preview_mountain_small.jpg' | asset"`.
:::

The styling of the preview looks as follows:

```css
// <app root>/Resources/cms/blocks/swag-image-text-reversed/styles.css
/* 
 * Styling of your block preview in the CMS sidebar
 */
.sw-cms-preview-swag-image-text-reversed {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 20px;
    padding: 15px;
}

/*
 * Styling of your block in the CMS editor
 * Pattern: sw-cms-block-${block.name}-component
 */
.sw-cms-block-swag-image-text-reversed-component {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(195px, 1fr));
    grid-gap: 40px;
}

/*
 * Each slot will have an additional class
 * Pattern: sw-cms-slot-${slot.name}
 */
.sw-cms-block-swag-image-text-reversed-component .sw-cms-slot-left {
    
}

/*
 * Each slot will have an additional class
 * Pattern: sw-cms-slot-${slot.name}
 */
.sw-cms-block-swag-image-text-reversed-component .sw-cms-slot-right {

}
```

The DOM structure of the block in the CMS editor will look like this:

```html
<div class="sw-cms-block-swag-image-text-reversed-component">
    <div class="sw-cms-slot sw-cms-slot-left"></div>
    <div class="sw-cms-slot sw-cms-slot-right"></div>
</div>
```

## Defining slots

Each slot has a **unique** `name` and a `type` that refers to which element it shows.
All available elements can be found in [src/Administration/Resources/app/administration/src/module/sw-cms/elements](https://github.com/shopware/platform/tree/trunk/src/Administration/Resources/app/administration/src/module/sw-cms/elements).
At a later point you will also be able to define custom elements but for now you can use the elements shipped by Shopware.

The `config` of a slot is very dynamic as it highly depends on which `type` you have chosen.
A good starting point to find out which elements require which configuration is each element's `index.js` in the corresponding directory in [src/Administration/Resources/app/administration/src/module/sw-cms/blocks](https://github.com/shopware/platform/tree/trunk/src/Administration/Resources/app/administration/src/module/sw-cms/blocks).

## Registering blocks

Unlike adding blocks from a plugin, blocks provided from an app will be automatically registered during runtime - so all you need to take care of is to properly define and configure them.

## Storefront representation

Providing the Storefront representation of your blocks works very similarly as in the [plugin example](../../../plugins/content/cms/add-cms-block#storefront-representation).
In `Resources/views/storefront/block/` a Twig template matching the pattern `cms-block-${block.name}-component.html.twig` is expected.

So in this example, it's sufficient to simply extend the existing `image-text` element:

```twig
// <app root>/Resources/views/storefront/block/cms-block-swag-image-text-reversed-component.html.twig
{% sw_extends '@Storefront/storefront/block/cms-block-image-text.html.twig' %}
```

Styling of your blocks in the Storefront can then be done in `Resources/app/storefront/src/scss/base.scss`.

## Further reading

<PageRef page="../../../../../resources/references/app-reference/cms-reference" />
