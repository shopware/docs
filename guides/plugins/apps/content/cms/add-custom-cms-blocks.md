# Add custom CMS blocks

{% hint style="info" %}
This functionality is available starting with Shopware 6.4.4.0.
{% endhint %}

Didn't get in touch with Shopware's Shopping Experiences \(CMS\) yet? Check out the concept behind it first:

{% page-ref page="../../../../../concepts/commerce/core/shopping-experiences-cms.md" %}

If you're not yet familiar with custom CMS blocks you might want to head over to the section on adding CMS blocks via plugin to get some basic understanding:

{% page-ref page="../../../plugins/content/cms/add-cms-block.md" %}

## Overview

Adding custom CMS blocks from an app works a bit differently than [adding them from a plugin](../../../plugins/content/cms/add-cms-block.md).
Custom CMS blocks are added by providing a `cms.xml` in the `Resources/` directory of your app.
The basic directory structure looks as follows:

```text
├── Resources
│   ├── cms
│   │   └── blocks
│   │       ├── my-first-block
│   │       │   ├── preview.html
│   │       │   └── styles.css
│   │       └── my-second-block
│   │           ├── preview.html
│   │           └── styles.css
│   ├── views
│   │   └── storefront
│   │       └── cms
│   │           └── block
│   │               ├── my-first-block.html.twig
│   │               └── my-second-block.html.twig
│   └── cms.xml
└── manifest.xml
```

Each CMS block defined within your `cms.xml` must have a directory matching the block's name in `Resources/cms/blocks/`.
In those directories you shape your blocks by supplying a `preview.html` containing the template used for displaying a preview.
Styling the preview is possible from the `styles.css`.

{% hint type=info %}
Due to technical limitations it's not possible to use templating engines \(like Twig\) or preprocessors \(like Sass\) for rendering and styling the preview.
{% endhint %}

## Defining blocks

As already mentioned above and similarly to an app's `manifest.xml` CMS blocks also require some definition which is done in a `cms.xml`.
In our example we will define two custom CMS blocks:

{% code title="<app root>/Resources/cms.xml" %}
```xml
<?xml version="1.0" encoding="utf-8" ?>
<cms xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Cms/Schema/cms-1.0.xsd">
    <blocks>
        <block>
            <!-- A unique technical name for your block. We recommend to use a shorthand prefix for your company, e.g. "Swag" for shopware AG. -->
            <name>my-first-block</name>
            <!-- The category your block is associated with. See the XSD for available categories. -->
            <category>text-image</category>

            <!-- Your block's label which will be shown in the CMS module in the Administration. -->
            <label>First block from app</label>
            <!-- The label is translatable by providing ISO codes. -->
            <label lang="de-DE">Erster Block einer App</label>

            <!-- The slots that your block holds which again hold CMS elements. -->
            <slots>
                <!-- A slot requires a unique name and a type which refers to the CMS element it shows. Right now you can only use the CMS elements provided by Shopware but at a later point you will be able to add custom elements too. -->
                <slot name="left" type="manufacturer-logo">
                    <!-- The slot requires some basic configuration. The following config-value elements highly depend on which element the slot holds. -->
                    <config>
                        <!-- The following config-value will be interpreted as "displayMode: { source: "static", value: "cover"}" in the JavaScript. -->
                        <config-value name="display-mode" source="static" value="cover"/>
                    </config>
                </slot>
                <slot name="middle" type="image-gallery">
                    <config>
                        <config-value name="display-mode" source="static" value="auto"/>
                        <config-value name="min-height" source="static" value="300px"/>
                    </config>
                </slot>
                <slot name="right" type="buy-box">
                    <config>
                        <config-value name="display-mode" source="static" value="contain"/>
                    </config>
                </slot>
            </slots>

            <!-- Each block comes with a default configuration which is pre-filled and customizable when adding a block to a section in the CMS module in the Administration. -->
            <default-config>
                <margin-bottom>20px</margin-bottom>
                <margin-top>20px</margin-top>
                <margin-left>20px</margin-left>
                <margin-right>20px</margin-right>
                <!-- The sizing mode of your block. Allowed values are "boxed" or "full_width". -->
                <sizing-mode>boxed</sizing-mode>
                <background-color>#000</background-color>
            </default-config>
        </block>

        <block>
            <name>my-second-block</name>
            <category>text-image</category>

            <label>Second block from app</label>
            <label lang="de-DE">Zweiter Block einer App</label>

            <slots>
                <slot name="left" type="form">
                    <config>
                        <config-value name="display-mode" source="static" value="cover"/>
                    </config>
                </slot>
                <slot name="right" type="image">
                    <config>
                        <config-value name="display-mode" source="static" value="auto"/>
                        <config-value name="background-color" source="static" value="red"/>
                    </config>
                </slot>
            </slots>

            <default-config>
                <margin-bottom>20px</margin-bottom>
                <margin-top>20px</margin-top>
                <margin-left>20px</margin-left>
                <margin-right>20px</margin-right>
                <sizing-mode>boxed</sizing-mode>
                <background-color>#000</background-color>
            </default-config>
        </block>
    </blocks>
</cms>
```
{% endcode %}

The full CMS reference is available here:

{% page-ref page="../../../../../resources/references/app-reference/cms-reference.md" %}

Let's have a look at how to configure a CMS block from your app's `cms.xml`:

`<name>` : A **unique** technical name for your block. This name is also used to discover the block's `preview.html` and `styles.css` in the `Resources/cms/blocks/` directory.

`<category>` : Blocks are divided into categories. Available categories can be found in the [plugin guide](../../../plugins/content/cms/add-cms-block.md#custom-block-in-the-administration).

`<label>` : The **translatable** label will be shown in the Administration.

`<default-config>` : Some default configuration for the block.

`<slots>` : Each block holds slots that configure which element they show.

### Block preview

A simple preview template for `my-first-block` might look like this:

{% code title="<app root>/Resources/cms/blocks/my-first-block/preview.html" %}
```html
<div id="swag-example--my-first-block">
    <slot name="left"></slot>
    <slot name="middle"></slot>
    <slot name="right"></slot>
</div>
```
{% endcode %}

## Defining slots

Each slot has a **unique** `name` and a `type` that refers to which element it shows.
All available elements can be found in [src/Administration/Resources/app/administration/src/module/sw-cms/elements](https://github.com/shopware/platform/tree/trunk/src/Administration/Resources/app/administration/src/module/sw-cms/elements).
At a later point you will also be able to define custom elements but for now you can use the elements shipped by Shopware.

The `config` of a slot is very dynamic as it highly depends on which `type` you have chosen.

## Registering blocks

Unlike adding blocks from a plugin, blocks provided from an app will be automatically registered during runtime - so all you have to take care of is to properly define and configure them.

## Storefront representation

Providing the storefront representation of your blocks works just the same as in the [plugin example](../../../plugins/content/cms/add-cms-block.md#storefront-representation).
In `<app root>/Resources/views/storefront/block/` a Twig template file matching your block's technical name is expected, e.g.

{% code title="<app root>/Resources/views/storefront/block/my-first-block.html.twig" %}
```text
{% sw_extends '@Storefront/storefront/block/cms-block-image-text.html.twig' %}
```
{% endcode %}

## Further reading

{% page-ref page="../../../../../resources/references/app-reference/cms-reference.md" %}

{% page-ref page="../../../guides/plugins/plugins/content/cms/add-cms-block.md" %}