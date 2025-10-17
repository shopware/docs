---
nav:
  title: Add CMS element
  position: 20
---

# Add CMS Elements

## What is an Element?

A CMS element in Shopware is the smallest content unit in the Shopping Experience (CMS) system. Understanding the hierarchy helps clarify what elements are:

### CMS Hierarchy

* Page - The top-level container (e.g., category page, shop page, product page)
* Section - Horizontal segments within a page (can be single-column or two-column with sidebar)
* Block - Units that usually span an entire row with custom layout and styling
* Slots - Named containers within blocks
* **Elements - The actual content primitives (text, image, video, product listing, etc.) placed inside slots**

Elements are the "primitives" in the CMS hierarchy. They have no knowledge of their context and contain minimal markup. Elements are always rendered inside slots of their parent blocks.

**Key Concept**: Elements provide the actual content, while blocks define the structure and layout. This separation allows different element types to be placed in the same block slot.

> **Learn More**: For a deeper understanding of the CMS architecture, see the [Shopping Experience fundamental guide](https://developer.shopware.com/docs/concepts/commerce/content/shopping-experiences-cms.html).

## Where to Find Elements

Elements are added to blocks within the Shopping Experience module:

* Navigate to Content → Shopping Experience
* Create a new layout or edit an existing one
* Add a block to your layout (blocks contain slots)
  * Blocks usually contain one or more predefined elements
* Click on the arrow icon on a slot within a block to see available elements
* Select an element to place it in the slot

You can find related element code here:

* Administration: `src/Administration/Resources/app/administration/src/module/sw-cms/elements/`
* Storefront: `src/Storefront/Resources/views/storefront/element/`
* Core: `\Shopware\Core\Content\Cms\SalesChannel\SalesChannelCmsPageLoader::load`

## How to Create an Element in the Administration

We recommend this structure for CMS elements.

```TEXT
<plugin root>/src/Resources/app/administration/src/
├── main.js
└── module/
    └── sw-cms/
        └── elements/
            └── dailymotion/              (element name)
                ├── index.js
                ├── component/
                │   ├── index.js
                │   ├── cms-el-dailymotion.html.twig
                │   └── cms-el-dailymotion.scss
                ├── config/
                │   ├── index.js
                │   └── cms-el-config-dailymotion.html.twig
                └── preview/
                    ├── index.js
                    ├── cms-el-preview-dailymotion.html.twig
                    └── cms-el-preview-dailymotion.scss
```

### Step 1: Import Your Element in main.js

```JS
// <plugin root>/src/Resources/app/administration/src/main.js
import './module/sw-cms/elements/dailymotion';
```

### Step 2: Register the Element

```JS
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/index.js
import './component';
import './config';
import './preview';

Shopware.Service('cmsService').registerCmsElement({
    name: 'dailymotion',
    label: 'cms.elements.dailymotion.label',
    component: 'cms-el-dailymotion',
    configComponent: 'cms-el-config-dailymotion',
    previewComponent: 'cms-el-preview-dailymotion',
    defaultConfig: {
        url: {
            source: 'static',
            value: '',
        },
    },
});
```

| Property         | Description                                                                                |
|------------------|--------------------------------------------------------------------------------------------|
| name             | Technical name of your element                                                             |
| label            | Display name in the UI (preferably as a snippet key)                                       |
| component        | Vue component for rendering the element in the Administration                              |
| configComponent  | Vue component for the configuration panel                                                  |
| previewComponent | Vue component for the element thumbnail in the element selector                            |
| defaultConfig    | Default configuration values (key = config property, value = object with source and value) |
| hidden           | (Optional) Hides the element in the "replace element" modal                                |
| removable        | (Optional) Prevents the element from being removed from a slot via UI                      |

### Step 3: Create the Preview Component

The preview is shown as a thumbnail when selecting or swapping elements in block slots. You could also display a static image of your final Storefront element here.

```JS
// dailymotion/preview/index.js
Shopware.Component.register('cms-el-preview-dailymotion', {
    template: `
        <div class="cms-el-preview-dailymotion">
            <h3>Dailymotion Embed</h3>
        </div>
    `,
});
```

### Step 4: Create the Main Component

The main component is displayed in the editor layout. It should provide a good representation of the final Storefront element.

```JS
// dailymotion/component/index.js
Shopware.Component.register('cms-el-dailymotion', {
    template: `
        <iframe 
            v-if="element.config.url.value"
            class="cms-el-dailymotion"
            :src="embedUrl" 
            width="100%" 
            height="480"
        />
        <h3 v-else>Dailymotion</h3>
    `,
    mixins: [
        'cms-element'
    ],
    computed: {
        embedUrl() {
            return `https://www.dailymotion.com/embed/video/${this.element.config.url.value}`;
        },
    },
    created() {
        this.initElementConfig('dailymotion');
    },
});
```

**Key Points**:

* The `cms-element` mixin provides common props and data-mapping for config objects
* Use fallback content to avoid invisible elements in the editor (for example when missing an `iframe` or `img` `src`)

### Step 5: Create the Configuration Component

This component will be displayed in a modal and should provide form fields for all options defined in Step 2 (`defaultConfig`).

```JS
// dailymotion/config/index.js
Shopware.Component.register('cms-el-config-dailymotion', {
    template: `<div class="cms-el-config-dailymotion">
        <mt-text-field
            v-model="element.config.url.value"
            label="Dailymotion video ID"
            placeholder="Enter Dailymotion video ID..."
        />
    </div>`,
    mixins: [
        'cms-element'
    ],
    created() {
        this.initElementConfig('dailymotion');
    },
});
```

**Key Points**:

* The `cms-element` mixin provides common props and data-mapping for config objects
* Use [Shopware meteor components](https://shopware.design/meteor-components/) for a consistent UI

## How to Create an Element in the Storefront

The Storefront template defines how your element appears on the actual storefront. It is expected to be located in the directory `src/Resources/views/storefront/element`. In there, a twig template file has to follow this naming convention:

* **Prefix**: `cms-element-`
* **Technical name**: `dailymotion` (the `name` property defined in Step 2)
* **Extension**: `.html.twig`

Shopware is expecting the prefix as part of the full filename.

Full example: `cms-element-dailymotion.html.twig`

### Basic Template

You can create your own elements or extend and reuse existing ones. Don't forget to clear the Storefront cache after adding new templates.

```TWIG
{# <plugin root>/src/Resources/views/storefront/element/cms-element-dailymotion.html.twig #}

<div class="cms-element-dailymotion">
    <iframe
        src="https://www.dailymotion.com/embed/video/{{ element.config.url.value }}"
        frameborder="0"
        type="text/html"
        width="100%"
        height="480"
    />
</div>
```

The `element` is automatically passed to the template and contains meta data and configuration values.  See the `CmsSlotDefinition.php` for a full overview.

## Next steps

There are many possibilities to extend Shopware's CMS.
If you haven't done so already, consider using your element in a cms block.
To learn how to do this, take a look at the guide on [Add custom cms block](add-cms-block).
