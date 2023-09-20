# Add CMS Element

## Overview

This article will teach you how to create a new CMS element via plugin. The plugin in this example will be named `SwagBasicExample`, similar to the other guides.

## Prerequisites

You won't learn how to create a plugin in this guide, head over to our Plugin base guide to create your first plugin.

This guide will also not explain how a custom component can be created in general, so head over to the official guide about creating a custom component to learn this first.

<PageRef page="../../administration/add-custom-component" />

## Creating your custom element

Imagine you want to create a new element to display a Dailymotion video. The shop manager can configure the link of the video to be shown. That's exactly what you're going to build in this guide.

Creating a new element requires you to extend the Administration.

### Injecting into the Administration

The main entry point to customize the Administration via plugin is the `main.js` file. It has to be placed into a `<plugin root>/src/Resources/app/administration/src` directory in order to be automatically found by the Shopware platform.

## Registering a new element

Your plugin's structure should always match the core's structure. When thinking about creating a new element, it's a recommendation to recreate the file tree like in the core for your plugin. Thus, recreate this structure in your plugin: `<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements`

In there, you create a directory for each new element you want to create. In this example a directory `dailymotion` is created.

Now create a new file `index.js` inside the `dailymotion` directory, since it will be loaded when importing this element in your `main.js`. Speaking of that, right after having created the `index.js` file, you can actually import your new element's directory in the `main.js` file already:

```javascript
// <plugin root>/src/Resources/app/administration/src/main.js
import './module/sw-cms/elements/dailymotion';
```

Now open up your empty `dailymotion/index.js` file. In order to register a new element to the system, you have to call the method `registerCmsElement` of the [cmsService](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/module/sw-cms/service/cms.service.js). Since it's available in the Dependency Injection Container, you can fetch it from there.

First of all, access our `Application` wrapper, which will grant you access to the DI container. So go ahead and fetch the `cmsService` from it and call the mentioned `registerCmsElement` method.

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/index.js
Shopware.Service('cmsService').registerCmsElement();
```

The method `registerCmsElement` takes a configuration object, containing the following necessary data:

| Key | Description |
| :--- | :--- |
| name | The technical name of your element. Will be used for the template loading later on. |
| label | A name to be shown for your element in the User Interface. Preferably as a snippet key. |
| component | The Vue component to be used when rendering your actual element in the Administration. |
| configComponent | The Vue component defining the "configuration detail" page of your element. |
| previewComponent | The Vue component to be used in the "list of available elements". Just shows a tiny preview of what your element would look like if it was used. |
| defaultConfig | A default configuration to be applied to this element. Must be an object containing properties matching the used variable names, containing the default values. |
| hidden (optional) | Hides the element in the replace element modal. |
| removable (optional) | Removes the replace element icon. |

Go ahead and create this configuration object yourself. Here's what it should look like after having set all of those options:

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/index.js
Shopware.Service('cmsService').registerCmsElement({
    name: 'dailymotion',
    label: 'sw-cms.elements.customDailymotionElement.label',
    component: 'sw-cms-el-dailymotion',
    configComponent: 'sw-cms-el-config-dailymotion',
    previewComponent: 'sw-cms-el-preview-dailymotion',
    defaultConfig: {
        dailyUrl: {
            source: 'static',
            value: ''
        }
    }
});
```

The property name does not require further explanation. However, you need to create a snippet file in your plugin directory for the label property.

To do this, create a folder with the name snippet in your `sw-cms` folder. After that, create the files for the languages, e.g. `de-DE.json` and `en-GB.json`. The content of your snippet file should look something like this:

```json
{
  "sw-cms": {
    "elements": {
      "customDailymotionElement": {
        "label": "Dailymotion video"
      }
    }
  }
}
```

To learn more about adding own snippets, please refer to [Add snippets to Administration](../../administration/adding-snippets) for more information.

For all three fields `component`, `configComponent` and `previewComponent`, components that do not _yet_ exist were applied. Those will be created in the next few steps as well. The `defaultConfig` defines the default values for the element's configuration. There will be a text field to enter a Dailymotion video ID called `dailyUrl`.

Now you have to create the three missing components, let's start with the preview component.

## Building the preview

Create a new directory preview in your element's directory dailymotion. In there, create a new file `index.js`, just like for all components. Then register your component, using the `Shopware.Component` wrapper:

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/preview/index.js
import template from './sw-cms-el-preview-dailymotion.html.twig';
import './sw-cms-el-preview-dailymotion.scss';

Shopware.Component.register('sw-cms-el-preview-dailymotion', {
    template
});
```

Just like most components, it has a custom template and some styles. Focus on the template first, create a new file `sw-cms-el-preview-dailymotion.html.twig`.

So, for instance, if you want to show the default 'mountain' preview image as an example, then copy it from `<Shopware root>/public/bundles/administration/static/img/cms/preview_mountain_small.jpg` to your static folder. You can also replace it with something of your own. Additionally, you can place icons `multicolor-action-play`. Head over to [icon library](https://component-library.shopware.com/icons/) to access them.

That means: You'll need a container to contain both the image and the icon. In there, you create an `img` tag and use the [sw-icon component](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/app/component/base/sw-icon/index.js) to display the icon.

```twig
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/preview/sw-cms-el-preview-dailymotion.html.twig
{% block sw_cms_element_dailymotion_preview %}
    <div class="sw-cms-el-preview-dailymotion">
        <img class="sw-cms-el-preview-dailymotion-img"
             :src="'customcmselement/static/img/background_dailymotion_preview.jpg' | asset">

        <sw-icon class="sw-cms-el-preview-dailymotion-icon"
                 name="multicolor-action-play"></sw-icon>
    </div>
{% endblock %}
```

The icon would now be displayed beneath the image, so let's add some styles for this by creating the file `sw-cms-el-preview-dailymotion.scss`.

The container needs to have a `position: relative;` style. This is necessary, so the child can be positioned absolutely and will do so relative to the container's position. Thus, the icon receives a `position: absolute; style`, plus some top and left values to center it.

```css
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/preview/sw-cms-el-preview-dailymotion.scss
.sw-cms-el-preview-dailymotion {
    position: relative;

    .sw-cms-el-preview-dailymotion-img {
        display: block;
        max-width: 100%;
    }

    .sw-cms-el-preview-dailymotion-icon {
        $icon-height: 50px;
        $icon-width: $icon-height;
        position: absolute;
        height: $icon-height;
        width: $icon-width;

        left: calc(50% - #{$icon-width/2});
        top: calc(50% - #{$icon-height/2});
    }
}
```

The centered positioning will be done by translating the elements by 50% via `top` and `left` properties. Since that would be 50% from the upper left corner of the icon, this wouldn't really center the icon yet. Subtract the half of the icon's width and height and then you're fine.

One last thing: Import your preview component in your element's `index.js` file, so it's loaded.

## Rendering the component

The next would be the main component `sw-cms-el-dailymotion`, the one to be rendered when the shop manager actually decided to use your element by clicking on the preview. Now, you want to show the actually configured video here now. Start with the basic again, create a new directory `component`, in there a new file `index.js` and then register your component `sw-cms-el-dailymotion`.

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/component/index.js
import template from './sw-cms-el-dailymotion.html.twig';
import './sw-cms-el-dailymotion.scss';

Shopware.Component.register('sw-cms-el-dailymotion', {
    template
});
```

In addition, create the template file `sw-cms-el-dailymotion.html.twig` and the `.scss` file `sw-cms-el-dailymotion.scss`.

The template doesn't have to include a lot. Having a look at how Dailymotion video embedding works, you just have to add an `iframe` with a src attribute pointing to the video.

```twig
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/component/sw-cms-el-dailymotion.html.twig
{% block sw_cms_element_dailymotion %}
    <div class="sw-cms-el-dailymotion">
        <div class="sw-cms-el-dailymotion-iframe-wrapper">
            <iframe frameborder="0"
                    type="text/html"
                    width="100%"
                    height="100%"
                    :src="dailyUrl">
            </iframe>
        </div>
    </div>
{% endblock %}
```

You can't just use a static `src` here, since the shop manager wants to configure the video he wants to show. Thus, we're fetching that link via VueJS now.

Let's add the code to provide the src for the iframe. For this case you're going to use a [computed property](https://vuejs.org/v2/guide/computed.html).

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/component/index.js
import template from './sw-cms-el-dailymotion.html.twig';
import './sw-cms-el-dailymotion.scss';

Shopware.Component.register('sw-cms-el-dailymotion', {
    template,

    computed: {
        dailyUrl() {
            return `https://www.dailymotion.com/embed/video/${this.element.config.dailyUrl.value}`;
        }
    },    
});
```

The link being used has to follow this pattern: `https://www.dailymotion.com/embed/video/<videoId>`, so the only variable you need from the shop manager is the video ID. That's what you're doing here - you're building the link like mentioned above and you add the value of `dailyUrl` from the config. This value will be provided by the config component, that you're going to create in the next step.

In order for this to work though, you have to call the method `initElementConfig` from the `cms-element` mixin. This will take care of dealing with the `configComponent` and therefore providing the configured values.

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/component/index.js
import template from './sw-cms-el-dailymotion.html.twig';
import './sw-cms-el-dailymotion.scss';

Shopware.Component.register('sw-cms-el-dailymotion', {
    template,

    mixins: [
        'cms-element'
    ],

    computed: {
        dailyUrl() {
            return `https://www.dailymotion.com/embed/video/${this.element.config.dailyUrl.value}`;
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.initElementConfig('dailymotion');
        }
    }
});
```

Now, the method `initElementConfig` is immediately executed once this component is created.

Time to add the last remaining part of this component: The styles to be applied. Since Dailymotion takes care of responsive layouts itself, you just have to scale the iFrame to 100% width and 100% height. Yet, there's a recommended `min-height` of 315px, so add that one as well.

```css
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/component/sw-cms-el-dailymotion.scss
.sw-cms-el-dailymotion {
    height: 100%;
    width: 100%;
    min-height: 315px;

    .sw-cms-el-dailymotion-iframe-wrapper {
        position: relative;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;

        iframe {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            overflow: hidden
        }
    }
}
```

That's it for this component! Import it in your element's `index.js` file.

## The configuration

Let's head over to the last remaining component. Create a directory `config`, an `index.js` file in there and register your config component `sw-cms-el-config-dailymotion`.

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/config/index.js
import template from './sw-cms-el-config-dailymotion.html.twig';

Shopware.Component.register('sw-cms-el-config-dailymotion', {
    template,

    mixins: [
        'cms-element'
    ],

    computed: {
        dailyUrl: {
            get() {
                return this.element.config.dailyUrl.value;
            },

            set(value) {
                this.element.config.dailyUrl.value = value;
            }
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.initElementConfig('dailymotion');
        },

        onElementUpdate(value) {
            this.element.config.dailyUrl.value = value;

            this.$emit('element-update', this.element);
        }
    }
});
```

Just like always, it comes with a template, no styles necessary here though. Create the template file now. Also, the `initElementConfig` method has to be called in here as well, just the same way you've done it in your main component. A little spoiler: This file will remain like this already, you can close it now.

Open the template `sw-cms-el-config-dailymotion.html.twig` instead. To be displayed in the config, we just need a text element, so the shop manager can apply a Dailymotion video ID.

```twig
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/config/sw-cms-el-config-dailymotion.html.twig
{% block sw_cms_element_dailymotion_config %}
    <sw-text-field
          v-model="dailyUrl"
          class="swag-dailymotion-field"
          label="Dailymotion video link"
          placeholder="Enter dailymotion link..."
          @input="onElementUpdate"
          @change="onElementUpdate">
    </sw-text-field>
{% endblock %}
```

The `v-model` takes care of binding the field's values to the values from the config. Don't forget to include your config in your `index.js`:

```javascript
// <plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/index.js
import './component';
import './config';
import './preview';

Shopware.Service('cmsService').registerCmsElement({
    // ...
});
```

That's it! You could now go ahead and fully test your new element! Install this plugin via `bin/console plugin:install --activate SwagBasicExample`, rebuild the Administration using the following command and then start using your new element in the Administration.

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

Of course, the Storefront implementation is still missing, so your element wouldn't be rendered in the Storefront yet.

## Storefront implementation

Just like the CMS blocks, each element's storefront representation is always expected in the directory `platform/src/Storefront/Resources/views/storefront/element`. In there, a twig template named after your custom element is expected, in this case a file named `cms-element-dailymotion.html.twig`.

So go ahead and re-create that structure in your plugin: `<plugin root>/src/Resources/views/storefront/element/`

In there create a new twig template named after your element, so `cms-element-dailymotion.html.twig` that is.

The template for this is super easy though, just like it's been in your main component for the Administration. Just add an iFrame again. Simply apply the same styles like in the Administration, 100% to both height and width that is.

```twig
// platform/src/Storefront/Resources/views/storefront/element/cms-element-dailymotion.html.twig
{% block element_dailymotion %}
    <div class="cms-element-dailymotion" style="height: 100%; width: 100%">

        {% block element_dailymotion_image_inner %}
            <div class="cms-el-dailymotion">
                <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden;">
                    <iframe style="width:100%; height:100%; position:absolute; left:0px; top:0px; overflow:hidden"
                            src="https://www.dailymotion.com/embed/video//{{ element.config.dailyUrl.value }}"
                            frameborder="0"
                            type="text/html"
                            width="100%"
                            height="100%">
                    </iframe>
                </div>
            </div>
        {% endblock %}
    </div>
{% endblock %}
```

The URL is parsed here using the twig variable element, which is automatically available in your element's template.

Once more: That's it! Your element is now fully working! The shop manager can choose your new element in the 'Shopping Experiences' module, he can configure it and even see it being rendered live in the Administration. After saving and applying this layout to e.g. a category, this element will also be rendered into the Storefront.

## Next steps

There are many possibilities to extend Shopware's CMS. If you haven't done so already, consider using your element in a cms block. To learn how to do this, take a look at the guide on [Add custom cms block](add-cms-block).
