# Add CMS element via AdminExtensionSDK
## Overview
This article will teach you how to create a new CMS element via the AdminExtensionSDK. The plugin in this example will be named `SwagBasicAppCmsElementExample`, similar to the other guides.

## Prerequisites
You won't learn how to create a plugin or an app in this guide, head over to our Plugin or App Base Guide to create your first extension.

This guide will also not explain how a custom component can be created in general, so head over to the official guide about creating a custom component to learn this first. It also won't go too much into detail about the AdminExtensionSDK. For that, please have a look at the [AdminExtensionSDK documentation](https://shopware.github.io/admin-extension-sdk/docs/guide/getting-started/installation).

Note: This example uses TypeScript, which is recommended, but not required for developing Shopware.

{% page-ref page="../../administration/app-base-guide.md" %}
{% page-ref page="../../administration/add-custom-component.md" %}

## Creating your custom element
Like in the Plugin Guide for this topic, imagine you want to create a new element to display a Dailymotion video. The shop manager can configure the link of the video to be shown. That's exactly what you're going to build in this guide.

Creating a new element via app requires you to use the AdminExtensionSDK.

### Target structure
It is yours to decide which approach to use when creating apps, since everything we're doing here will be loaded via iFrame, but since Shopware's best practice is a full VueJs approach, this tutorial will do exactly that.

When our extension is finished, you'll get the following file structure:

{% code title="<plugin root>/src/Resources/app/administration/src" %}
```bash
├── base
│   └── mainCommands.ts
├── main.ts
├── viewRenderer.ts
└── views
    └── swag-dailymotion
        ├── swag-dailymotion-config.ts
        ├── swag-dailymotion-element.ts
        └── swag-dailymotion-preview.ts
```
{% endcode %}

## Initial loading of components
Everything starts in the `main.ts` file:

```ts
import 'regenerator-runtime/runtime';
import { location } from '@shopware-ag/admin-extension-sdk';

// Only execute extensionSDK commands when
// it is inside a iFrame (only needed for plugins)
if (location.isIframe()) {
    if (location.is(location.MAIN_HIDDEN)) {
        // Execute the base commands
        import('./base/mainCommands');
    } else {
        // Render different views
        import('./viewRenderer');
    }
}
```

This is main file, which is executed first and functions as our entry point.

We start with `if(location.isIframe())` to make sure we only load content used inside iFrames. The reason for this is that the SDK can be used in apps and plugins, so this check makes sure that your code is executed in the right place.

Next we need `if(location.is(location.MAIN_HIDDEN))` to **load the main commands**, which are defined in the `mainCommands.ts` file. This will only be used to load logic, but not templates into the Administration.

Lastly the `else` case will be responsible for specific loading of views via `viewRenderer.ts`. This is where our view templates will be loaded.

### Loading all required templates
Now we need to create the `viewRenderer.ts` file, which will include the 3 mandatory files needed for a CMS element. We prefix them with `swag-dailymotion`, consisting of a vendor prefix and the component name, to make sure no other developer will accidentally choose the same name as we did:
- `swag-dailymotion-config.ts`, which will handle the content of the CMS element configuration
- `swag-dailymotion-element.ts`, which represents the actual target element in the CMS
- `swag-dailymotion-preview.ts`, which is responsible for the preview, when selecting the CMS element in its selection screen

Let's see how the component loading via `viewRenderer.ts` looks like:
```ts
import Vue from 'vue';
import { location } from '@shopware-ag/admin-extension-sdk';

// watch for height changes
location.startAutoResizer();

// start app views
const app = new Vue({
    el: '#app',
    data() {
        return { location };
    },
    components: {
        'SwagDailymotionElement':
            () => import('./views/swag-dailymotion/swag-dailymotion-element'),
        'SwagDailymotionConfig':
            () => import('./views/swag-dailymotion/swag-dailymotion-config'),
        'SwagDailymotionPreview':
            () => import('./views/swag-dailymotion/swag-dailymotion-preview'),
    },
    template: `
        <SwagDailymotionElement
            v-if="location.is('swag-dailymotion-element')"
        ></SwagDailymotionElement>
        <SwagDailymotionConfig
            v-else-if="location.is('swag-dailymotion-config')"
        ></SwagDailymotionConfig>
        <SwagDailymotionPreview
            v-else-if="location.is('swag-dailymotion-preview')"
        ></SwagDailymotionPreview>
    `,
});
```
Really straight forward, isn't it? As you probably know from vanilla VueJS's Options API, we just need to load, register and use our VueJS component to make them work.

What's especially interesting here is the use of the `location` object. This is a main concept of the AdminExtensionSDK, where Shopware provides dedicated `locationIds` to offer you places to inject your templates into. For further information on that, it is recommend to have a look at the [documentation of the AdminExtensionSDK](https://shopware.github.io/admin-extension-sdk/docs/guide/concepts/locations) to learn more about its concepts.

In our case, we'll get our own **auto generated** `locationIds`, depending on the name of our CMS element plus suffixes `-element`, `-config` and `-preview`.

Those will be available after **registering the component**, which we'll do in the following chapter.

## Registering a new element
For this topic we head to `mainCommands.ts`, since the registration of CMS elements is something to be done in a global scope.

```ts
import { cms } from '@shopware-ag/admin-extension-sdk';

const CMS_ELEMENT_NAME = 'swag-dailymotion';
const CONSTANTS = {
    CMS_ELEMENT_NAME,
    PUBLISHING_KEY: `${CMS_ELEMENT_NAME}__config-element`,
};

void cms.registerCmsElement({
    name: CONSTANTS.CMS_ELEMENT_NAME,
    label: 'Dailymotion video',
    defaultConfig: {
        dailyUrl: {
            source: 'static',
            value: '',
        },
    },
});

export default CONSTANTS;
```

At first, you see we're importing the AdminExtensionSDK's cms object, used for `cms.registerCmsElement` to register a new element. 

This part is easier than the plugin-only method of creating CMS elements, because the formerly required view names of element, config and preview components are completely handled internally.

That's about all that is required to register your CMS element. As a best practice, we recommend to create a constant for the CMS element name and publishing key to make it easier to maintain and keep track of changes. The publishing key can be predefined, since the name **has to be a combination of CMS element name and the `__config-element` suffix** as shown above.

## Templates and communitcation with the Administration
The last files are the components inside our `views` folder. Just like you know it from typical CMS element loading, we'll create a folder with the full component name, containing 3 files as shown underneath again:

{% code title="<plugin root>/src/Resources/app/administration/src" %}
```bash
views
└── swag-dailymotion
    ├── swag-dailymotion-config.ts
    ├── swag-dailymotion-element.ts
    └── swag-dailymotion-preview.ts
```
{% endcode %}

You can vary in the exact structure of `swag-dailymotion`'s contents and create folders for each of the three, but in our simplistic example, single file components will do the trick.

### The config file
Let's go through each of the files to talk about it's contents, starting with `swag-dailymotion-config.ts`:

```ts
import Vue from 'vue'
import { data } from "@shopware-ag/admin-extension-sdk";
import CONSTANTS from "../../base/mainCommands";

export default Vue.extend({
    template: `
        <div>
          <h2>
            Config!
          </h2>
          Video-Code: <input v-model="dailyUrl" type="text"/><br/>
        </div>
    `,

    data(): Object {
        return {
            element: null
        }
    },

    computed: {
        dailyUrl: {
            get(): string {
                return this.element?.config?.dailyUrl?.value || '';
            },

            set(value: string): void {
                this.element.config.dailyUrl.value = value;

                data.update({
                    id: CONSTANTS.PUBLISHING_KEY,
                    data: this.element,
                });
            }
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        async createdComponent() {
            this.element = await data.get({ id: CONSTANTS.PUBLISHING_KEY });
        }
    }
});
```
This file is the config component used to define every type of configuration for the CMS element. Most of the code will be common for experienced Shopware 6 developers, so we just want to highlight the important bits right here:
1. We import `data` from the AdminExtensionSDK, which is required for data handling between this app and Shopware
2. The `element` variable, which contains the typical CMS element object and also used to manage the element configuration you want to be edited
3. The `publishingKey`, which is used to tell the AdminExtensionSDK in Shopware what piece of information you want to fetch. In this case, we need the `element` data

In our case, we need a simple input field to get a `dailyUrl` for our Dailymotion video to be displayed. For that, we first fetch the element via `data.get()` as seen in `createdComponent` and then link it to a computed property `dailyUrl` with getters and setters to mutate it. Using `data.update({ id, data })` you provide the publishing key `id` as a target and `data` for the data you want to save in Shopware.

With these small additions to typical CMS element behaviour, we're already done with our config modal.

![Dailymotion config modal](../../../../../.gitbook/assets/add-cms-element-via-admin-sdk-config.png)

### The element file
Now let's have a look at the result of `swag-dailymotion-element.ts`:

```ts
import Vue from 'vue'
import { data } from "@shopware-ag/admin-extension-sdk";
import CONSTANTS from "../../base/mainCommands";

export default Vue.extend({
    template: `
        <div>
            <h2>
              Element!
            </h2>
            <div class="sw-cms-el-dailymotion">
                <div class="sw-cms-el-dailymotion-iframe-wrapper">
                    <iframe
                        frameborder="0"
                        type="text/html"
                        width="100%"
                        height="100%"
                        :src="dailyUrl">
                    </iframe>
                </div>
            </div>
        </div>
    `,

    data(): { element: object|null } {
        return {
            element: null
        }
    },

    computed: {
        dailyUrl(): string {
            return `https://www.dailymotion.com/embed/video/${this.element?.config?.dailyUrl?.value || ''}`;
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        async createdComponent() {
            this.element = await data.get({ id: CONSTANTS.PUBLISHING_KEY });
            data.subscribe(CONSTANTS.PUBLISHING_KEY, this.elementSubscriber);
        },

        elementSubscriber(response: { data: unknown, id: string }): void {
            this.element = response.data;
        }
    }
});
```

In this one, we'll have the main rendering logic for the Administration's CMS element. This file is supposed to show how your element will look like, when it's done. So besides a template and the computed `dailyUrl`, used to correctly load our Dailymotion video player, the only really interesting part is the `createdComponent` method.

It initally fetches the `element` data, as you've already seen it in the config file. After that, using `data.subscribe(id, method)` it subscribes to the publishing key, which will update the element data automatically if something changes. It doesn't matter if the changes originate from our config modal outside Shopware or from somewhere else inside Shopware.

![Dailymotion CMS element](../../../../../.gitbook/assets/add-cms-element-via-admin-sdk-element.png)

### The preview file
Lastly we have a look at `swag-dailymotion-preview.ts`. In most cases, not much logic is to be found here, since this is the preview loaded when choosing a CMS element for your block. It makes sense to show an example preview, a miniature skeleton of the result or just the Dailymotion logo. Therefore, the following code will suffice for our example extension:

```ts
import Vue from 'vue'

export default Vue.extend({
    template: `
        <h2>
          Preview!
        </h2>
    `,
});
```
![Dailymotion element preview](../../../../../.gitbook/assets/add-cms-element-via-admin-sdk-preview.png)

## Storefront implementation
*To be continued*