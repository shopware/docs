---
nav:
  title: Add CMS block
  position: 10
---

# Add CMS Blocks

## What is a Block?

A CMS block in Shopware is a fundamental structural component of the Shopping Experience (CMS) system. Understanding the hierarchy helps clarify what blocks are:

### CMS Hierarchy

* Page - The top-level container (e.g., category page, shop page, product page)
* Section - Horizontal segments within a page (can be single-column or two-column with sidebar)
* **Block - Units that usually span an entire row with custom layout and styling**
* **Slots - A named container inside a block. Each slot represents a designated area that can hold exactly one CMS element**
* Elements - The actual content primitives (text, image, video, product listing, etc.) placed inside slots

A block represents a reusable layout unit that defines how elements are arranged in slots. For example, Shopware's built-in `image-text` block displays an image on the left and text on the right. Blocks are clustered into categories like Text, Images, Commerce, and Video for organizational purposes in the administration interface.

**Key concept**: Blocks define the structure (layout and slots), while elements provide the actual content. This separation allows the same block to display different types of content in its slots.

> **Learn more**: For a deeper understanding of the CMS architecture, see the [Shopping Experience fundamental guide](https://developer.shopware.com/docs/concepts/commerce/content/shopping-experiences-cms.html).

## Where to Find Blocks

Blocks are located in the Shopping Experience module in the Shopware Administration:

* Navigate to Content → Shopping Experience
* Create a new layout or edit an existing one
* In the layout designer, you'll see a sidebar with available blocks organized by category:
  * Text - Text-only blocks
  * Images - Image-only blocks
  * Text & Images - Combined text and image blocks
  * Commerce - Product sliders, listings, etc.
  * Video - YouTube and Vimeo video blocks
  * Form - Contact and newsletter forms
  * Sidebar - Category navigation and listing filters

Drag and drop blocks from the sidebar into your layout sections.

You can find related block code here:

* Administration: `src/Administration/Resources/app/administration/src/module/sw-cms/blocks/`
* Storefront: `src/Storefront/Resources/views/storefront/block/`
* Core: `\Shopware\Core\Content\Cms\SalesChannel\SalesChannelCmsPageLoader::load`

## How to Create a Block in the Administration

### Directory Structure

We recommend this structure for CMS blocks:

```TEXT
<plugin root>/src/Resources/app/administration/src/
├── main.js
└── module/
    └── sw-cms/
        └── blocks/
            └── text-image/              (category)
                └── image-text-reversed/ (block name)
                    ├── index.js
                    ├── component/
                    │   ├── index.js
                    │   ├── cms-block-image-text-reversed.html.twig
                    │   └── cms-block-image-text-reversed.scss
                    └── preview/
                        ├── index.js
                        ├── cms-block-preview-image-text-reversed.html.twig
                        └── cms-block-preview-image-text-reversed.scss
```

### Step 1: Import Your Block in main.js

```JS
// <plugin root>/src/Resources/app/administration/src/main.js
import './module/sw-cms/blocks/text-image/image-text-reversed';
```

### Step 2: Register the Block

```JS
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/blocks/text-image/image-text-reversed/index.js
import './component';
import './preview';

Shopware.Service('cmsService').registerCmsBlock({
    name: 'image-text-reversed',
    category: 'text-image',
    label: 'cms.blocks.imageTextReversed.label',
    component: 'cms-block-image-text-reversed',
    previewComponent: 'cms-block-preview-image-text-reversed',
    defaultConfig: {
        marginBottom: '20px',
        marginTop: '20px',
        marginLeft: '20px',
        marginRight: '20px',
        sizingMode: 'boxed',
    },
    slots: {
        left: 'text',
        right: 'image',
    },
});
```

| Property         | Description                                                                                   |
|------------------|----------------------------------------------------------------------------------------------|
| `name`           | Technical name of your block                                                                 |
| `category`       | Which category it appears under (`text`, `image`, `text-image`, `commerce`, `form`, `video`, `sidebar`) |
| `label`          | Display name in the UI                                                                       |
| `component`      | Vue component for rendering the block in the designer                                        |
| `previewComponent` | Vue component for the block thumbnail preview                                              |
| `defaultConfig`  | Default styling values                                                                       |
| `slots`          | Defines which element types go in which slots (key = slot name, value = element type)        |

### Step 3: Create the Block Component

It's important to include all slots you defined in the block configuration (Step 2). These are used for configuring elements in the administration interface.

```JS
// image-text-reversed/component/index.js
Shopware.Component.register('cms-block-image-text-reversed', {
    template: `<div style="display: flex; gap: 16px;">
        <slot name="left" />
        <slot name="right" />
    </div>`,
});
```

### Step 4: Create the Preview Component

The preview is shown as a thumbnail when selecting a block from the editor sidebar. You could also display a static image of your final Storefront block here.

```JS
// image-text-reversed/preview/index.js
Shopware.Component.register('cms-block-preview-image-text-reversed', {
    template: `<div style="display: flex; gap: 16px;">
        <h2>Lorem ipsum dolor sit amet</h2>
        <img :src="assetFilter('/administration/administration/static/img/cms/preview_mountain_small.jpg')" />
    </div>`,
    computed: {
        assetFilter() {
            return Shopware.Filter.getByName('asset');
        },
    },
});
```

After this, the block preview should appear in the Shopping Experience block sidebar under the "Text & Images" category and can be added to a layout.

## How to Create a Block in the Storefront

The Storefront template defines how your element appears on the actual storefront. It is expected to be located in the directory `src/Resources/views/storefront/block`. In there, a twig template file has to follow this naming convention:

* **Prefix**: `cms-block-`
* **Technical name**: `image-text-reversed` (The `name` property in Step 2)
* **Extension**: `.html.twig`

**Shopware is expecting the prefix as part of the full filename in `src/Storefront/Resources/views/storefront/section/cms-section-block-container.html.twig`.**

Full example: `cms-block-image-text-reversed.html.twig`

### Basic Template

You can create your own blocks or extend and reuse existing ones. Don't forget to clear the Storefront cache after adding new templates.

```TWIG
{# <plugin root>/src/Resources/views/storefront/block/cms-block-image-text-reversed.html.twig #}
<div class="col-md-6">
    {% set element = block.slots.getSlot('left') %}

    {% sw_include '@Storefront/storefront/element/cms-element-' ~ element.type ~ '.html.twig' with {
        'element': element
     } %}
</div>

<div class="col-md-6">
    {% set element = block.slots.getSlot('right') %}

    {% sw_include '@Storefront/storefront/element/cms-element-' ~ element.type ~ '.html.twig' with {
        'element': element
     } %}
</div>
```

The `block` is automatically passed to the template and contains meta data and configuration values.  See the `CmsBlockDefinition.php` for a full overview.

### How to Render Slots

Slots contain elements that need to be rendered. Here are the key methods:

#### 1. Get a Slot by Name

```TWIG
{% set leftSlot = block.slots.getSlot('left') %}
```

#### 2. Render an Element

Use `sw_include` to dynamically include the correct element template:

```TWIG
{% sw_include "@Storefront/storefront/element/cms-element-" ~ leftSlot.type ~ ".html.twig" with {
   'element': leftSlot
} %}
```

This dynamically builds the template path based on the element type. For example:

* If `leftSlot.type` is text, it renders cms-element-text.html.twig
* If `leftSlot.type` is image, it renders cms-element-image.html.twig

#### 3. Loop Through All Slots

```TWIG
{% for slotName, slot in block.slots %}
    {% sw_include "@Storefront/storefront/element/cms-element-" ~ slot.type ~ ".html.twig" with {
        'element': slot
    } %}
{% endfor %}
```

## Next steps

Now you've got your very own CMS block running, what about a custom CMS element? Head over to our guide, which will explain exactly that: [Creating a custom CMS element](add-cms-element)
