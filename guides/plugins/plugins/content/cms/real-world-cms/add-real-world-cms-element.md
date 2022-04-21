# Add a real world CMS element

## Overview

This guide is based on the [Add a real-world CMS block](add-real-world-cms-block.md) guide. We will create a real-world CMS element in this guide.
That means we are creating an element with a config that fits our CMS-Button block.

## Prerequisites

We assume that you know the basics for about creating a CMS element from [Creating a custom CMS element](../add-cms-element.md). So if you don't understand
something please make sure to take a look at that guide as well.

## Creating your custom CMS element

Imagine you want to create a new element to display a fully configurable button by the shop manager. We have already built a CMS-Block for the button in the
last guide, but if you just have a block, you don't have a configuration. That's why you need a CMS element

## Administration Code

We will look at the code briefly since you already know the basics from [Add CMS Element](../add-cms-element.md).
If you followed the real-world block guide, you already should have a `main.js` in the `<plugin root>/src/Resources/app/administration/src` directory.
In this file, we need to import our new element's directory. So let's do it:

{% code title="<plugin root>/src/Resources/app/administration/src/main.js" %}

```javascript
/* Import the block directory */
import './module/sw-cms/blocks/text/cms-button';

/* Import the elements directory */
import './module/sw-cms/elements/cms-button';
```

{% endcode %}

Of course, we need to create the directory we just imported now. So let's do that and place an `index.js` in your `<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/cms-button/index.js`. We need to register our element here, and we will do it like this:

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/dailymotion/index.js" %}

```javascript
import './component';
import './config';
import './preview';

Shopware.Service('cmsService').registerCmsElement({
    name: 'cms-button',
    label: 'sw-cms.blocks.text.ninja-cms-button.label',
    component: 'sw-cms-el-cms-button',
    configComponent: 'sw-cms-el-config-cms-button',
    previewComponent: 'sw-cms-el-preview-cms-button',
    defaultConfig: {
        title: {
            source: 'static',
            value: 'ButtonText',
        },
        textColor: {
            source: 'static',
            value: '#fff',
        },
        url: {
            source: 'static',
            value: '',
        },
        newTab: {
            source: 'static',
            value: 'true',
        },
        buttonAlign: {
            source: 'static',
            value: 'center',
        },
        buttonColor: {
            source: 'static',
            value: '#4492ed',
        },
        buttonWidth: {
            source: 'static',
            value: '',
        },
        buttonHeight: {
            source: 'static',
            value: '',
        },
    },
});
```

{% endcode %}

Of course, you could add a bit more configuration, but we want to keep everything good to understand in this guide. Now we also need to create the component, preview, and the config. Let's start with the component.

### Element component

In the component folder we have 3 different files. The index.js

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/cms-button/component/index.js" %}

```javascript
import template from './sw-cms-el-cms-button.html.twig';
import './sw-cms-el-cms-button.scss';

const { Component, Mixin } = Shopware;

Component.register('sw-cms-el-cms-button', {
    template,

    inject: ['repositoryFactory'],

    mixins: [Mixin.getByName('cms-element')],

    created() {
        this.createdComponent();
    },

    computed: {
        buttonStyles() {
            const styles = {};
            if (
                this.element.config.textColor.value &&
                this.element.config.buttonColor.value
            ) {
                styles.color = `${this.element.config.textColor.value}`;
                styles.backgroundColor = `${this.element.config.buttonColor.value}`;
            }
            if (this.element.config.buttonWidth.value) {
                styles.width = `${this.element.config.buttonWidth.value}px`;
            } else {
                styles.width = "auto";
            }

            if (this.element.config.buttonHeight.value) {
                styles.height = `${this.element.config.buttonHeight.value}px`;
            } else {
                styles.height = "auto";
            }

            return styles;
        },
        buttonAlignStyle() {
            const styles = {};
            if (this.element.config.buttonAlign.value) {
                styles.justifyContent = `${this.element.config.buttonAlign.value}`;
            }

            return styles;
        },
    },

    methods: {
        createdComponent() {
            this.initElementConfig('cms-button');
            this.initElementData('cms-button');
        },

        onInputText(text) {
            this.emitChanges(text);
        },
    },
});
```

{% endcode %}

As you can see, we add computed properties that will handle the styling in that file. If you don't know how computed properties work take a look at [computed property](https://vuejs.org/v2/guide/computed.html)

The twig file for your element:

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/cms-button/component/sw-cms-el-cms-button.html.twig" %}
{% raw %}

```markup
{% block sw_cms_element_ninja_cms_button %}
	<div class="sw-cms-el-ninja-cms-button" v-model="element.config.buttonAlign.value" :style="buttonAlignStyle">
		<a href="{{element.config.url.value}}" target="_blank" v-model="element.config.title.value" @input="onInputText">
			<button class="sw-el-ninja-btn" :style="buttonStyles">{{element.config.title.value}}</button>
		</a>
	</div>
{% endblock %}
```

{% endraw %}
{% endcode %}

And of course, you also have a .scss file for your element in the component folder:

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/cms-button/component/sw-cms-el-cms-button.scss" %}

```css
.sw-cms-el-ninja-cms-button {
    display: flex;
    width: 100%;

    button {
        outline: none;
    }
}

.sw-el-ninja-btn {
    padding: 1rem;
}

.sw-el-ninja-btn:focus {
    outline: none;
}
```

{% endcode %}

Let's move on with the preview component.

### Element preview component

The preview directory is not much different. We also have 3 files here. Let's start with the `index.js` again:

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/cms-button/preview/index.js" %}

```javascript
import template from './sw-cms-el-preview-cms-button.html.twig';
import './sw-cms-el-preview-cms-button.scss';

const { Component } = Shopware;

Component.register('sw-cms-el-preview-cms-button', {
    template,
});
```

{% endcode %}

We registered the preview. Now we only have to do the template and some styles. So we create a new file, `sw-cms-el-preview-cms-button.html.twig`.

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/cms-button/preview/sw-cms-el-preview-cms-button.html.twig" %}
{% raw %}

```markup
{% block sw_cms_element_ninja_button_preview %}
	<div class="ninja-button-preview">
		<button class="ninja-btn">Button</button>
	</div>
{% endblock %}

```

{% endraw %}
{% endcode %}

We only display a simple button right here. Let's add some styles so people can take a look at it:

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/cms-button/preview/sw-cms-el-preview-cms-button.scss" %}

```css
.ninja-button-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    .ninja-btn {
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
```

{% endcode %}

The preview for the element is visible when you just drag and drop in an element and hit the exchange button. A modal will open up and show you some elements, and this is where your element preview should be visible now.

### Element config component

The last thing you need for the CMS element in the administration is the config. And it's about the same here as well. We create a `config` directory and place 3 different files here. Let's start with the `index.js`

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/cms-button/config/index.js" %}

```javascript
import template from './sw-cms-el-config-cms-button.html.twig';

const { Component, Mixin } = Shopware;

Component.register('sw-cms-el-config-cms-button', {
    template,

    inject: ['repositoryFactory'],

    mixins: [Mixin.getByName('cms-element')],

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.initElementConfig('cms-button');
        },

        onElementUpdate(element) {
            this.$emit('element-update', element);
        },
        onInputText(title) {
            this.emitChanges(title);
        },
    },
});
```

{% endcode %}

Let's create the twig file as well real quick, so we have the option to configure the button:

{% code title="<plugin root>/src/Resources/app/administration/src/module/sw-cms/elements/cms-button/config/sw-cms-el-config-cms-button.html.twig" %}
{% raw %}

```markup
{% block sw_cms_el_ninja_cms_button %}
	<sw-tabs class="sw-cms-el-config-ninja-cms-button__tabs" defaultItem="content">

		<template slot-scope="{ active }">
			{% block sw_cms_el_config_ninja_button_tab_content %}
				<sw-tabs-item :title="$tc('sw-cms.elements.general.config.tab.content')" name="content" :activetab="active">
					{{ $tc('sw-cms.elements.general.config.tab.content') }}
				</sw-tabs-item>
			{% endblock %}
			{% block sw_cms_el_ninja_button_config_tab_options %}
				<sw-tabs-item :title="$tc('sw-cms.elements.general.config.tab.settings')" name="settings" :activetab="active">
					{{ $tc('sw-cms.elements.general.config.tab.settings') }}
				</sw-tabs-item>
			{% endblock %}
		</template>

		<template slot="content" slot-scope="{ active }">
			{% block sw_cms_el_ninja_cms_button_config_content %}
				<sw-container v-if="active === 'content'" class="sw-cms-el-config-ninja-button__tab-content">
					<sw-text-field :label="$tc('sw-cms.elements.ninja-cms-button.config.label.buttonText')" :placeholder="$tc('sw-cms.elements.ninja-cms-button.config.placeholder.buttonText')" v-model="element.config.title.value" @element-update="onElementUpdate" :helpText="$tc('sw-cms.elements.ninja-cms-button.config.helpText.buttonText')"></sw-text-field>
					<sw-colorpicker v-model="element.config.textColor.value" :label="$tc('sw-cms.elements.ninja-cms-button.config.label.buttonTextColor')" coloroutput="hex" :zIndex="1001" :alpha="true" :helpText="$tc('sw-cms.elements.ninja-cms-button.config.helpText.buttonTextColor')"></sw-colorpicker>

					<sw-field v-model="element.config.url.value" :label="$tc('sw-cms.elements.ninja-cms-button.config.label.buttonUrl')" :placeholder="$tc('sw-cms.elements.ninja-cms-button.config.placeholder.buttonUrl')" :helpText="$tc('sw-cms.elements.ninja-cms-button.config.helpText.buttonUrl')"></sw-field>
					<sw-field v-model="element.config.newTab.value" type="switch" :label="$tc('sw-cms.elements.ninja-cms-button.config.label.newTab')"></sw-field>
				</sw-container>
			{% endblock %}

			{% block sw_cms_el_ninja_button_config_settings %}
				<sw-container v-if="active === 'settings'" class="sw-cms-el-config-ninja-button__tab-settings">
					{% block sw_cms_el_cms_ninja_button_config_settings_horizontal_align %}
						<sw-select-field :label="$tc('sw-cms.elements.ninja-cms-button.config.label.hAlignment')" v-model="element.config.buttonAlign.value" :placeholder="$tc('sw-cms.elements.ninja-cms-button.config.placeholder.hAlignment')">
							<option value="flex-start">left</option>
							<option value="center">center</option>
							<option value="flex-end">right</option>
						</sw-select-field>
						<sw-colorpicker v-model="element.config.buttonColor.value" :label="$tc('sw-cms.elements.ninja-cms-button.config.label.buttonColor')" coloroutput="hex" :zIndex="1001" :alpha="true" :helpText="$tc('sw-cms.elements.ninja-cms-button.config.helpText.buttonColor')"></sw-colorpicker>
						<sw-field v-model="element.config.buttonWidth.value"
                                      type="number"
                                      :label="$tc('sw-cms.elements.ninja-cms-button.config.label.width')"
                                      :placeholder="$tc('sw-cms.elements.ninja-cms-button.config.placeholder.width')">
                                <template #suffix>px</template>
                        </sw-field>
						<sw-field v-model="element.config.buttonHeight.value"
                                      type="number"
                                      :label="$tc('sw-cms.elements.ninja-cms-button.config.label.height')"
                                      :placeholder="$tc('sw-cms.elements.ninja-cms-button.config.placeholder.height')">
                                <template #suffix>px</template>
                        </sw-field>

					{% endblock %}
				</sw-container>
			{% endblock %}
		</template>
	</sw-tabs>
{% endblock %}


```

{% endraw %}
{% endcode %}

Now we are pretty much done. We could also add a .scss file if we need to style the configuration, but it's not necessary in this case. So we skip that. Before we see anything changing in the administration, we still need to change one little line of code from our [Add a real-world CMS block](add-real-world-cms-block.md) guide. Our code should be like this:

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
        sizingMode: 'boxed',
    },
    /* Changed this line of code */
    slots: {
        button: 'cms-button',
    },
});
```

{% endcode %}

#### Build the administration

Your element in the administration is almost ready. The only thing you need to do now is building the administration again!

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

### The storefront view

First let"s adjust the code for our block from our last guide.

{% code title="<plugin root>/src/Resources/views/storefront/block/cms-block-cms-button.html.twig" %}
{% raw %}

```text
{% block block_cms_button_block %}
	{% set element = block.slots.getSlot('button') %}
	{% set columns = 1 %}

	<div class="col-12" data-cms-element-id="{{ element.id }}">
		{% block block_text_inner %}
			{% sw_include "@Storefront/storefront/element/cms-element-" ~ element.type ~ ".html.twig" ignore missing %}
		{% endblock %}
	</div>
{% endblock %}
```

{% endraw %}
{% endcode %}

Now we want to react to the configuration we gave the element in the backend so we need to create a new file `cms-element-cms-button.html.twig`

{% code title="<plugin root>/src/Resources/views/storefront/element/cms-element-cms-button.html.twig" %}
{% raw %}

```text
{% block element_text %}
	{%  set config = element.fieldConfig.elements %}

	<div class="cms-element-{{ element.type }} ninja-cms-button-flex ninja-cms-button-flex{% if config.buttonAlign.value == "center" %}-center{% elseif config.buttonAlign.value == "flex-end" %}-end{% else %}-start{% endif %}">
		{% block element_text_button %}
			<a href="{{config.url.value}}" {% if config.newTab.value %} target="_blank" {% endif %}>
				<button class="ninja-cms-btn" style="color: {{ config.textColor.value }}; background-color: {{ config.buttonColor.value }}; {% if config.buttonWidth.value != 0 %}width: {{config.buttonWidth.value}}px;{% else %}width: auto{% endif %}">
                    {{ config.title.value }}
                </button>
			</a>
		{% endblock %}
	</div>
{% endblock %}
```

{% endraw %}
{% endcode %}

And that's it! Now we created our very first own real world CMS-Element.
You also can see the code for this guide here [shopware-real-world-cms-block](https://github.com/NinjaArmy/shopware-real-world-cms/tree/02-add-real-world-CMS element)
