# Adding snippets

## Overview

By default Shopware 6 uses the [Vue I18n](https://kazupon.github.io/vue-i18n/started.html#html) plugin in the `Administration` to deal with translation.

## Creating snippet files

Normally you want to use snippets in you custom module. To keep things organized, create a new directory named `snippet` inside your module directory `<plugin root>/src/Resources/app/administration/src/module/<your-module>/snippet`. For each language you want to support, you need a JSON file inside here, e.g. `de-DE.json` and of course `en-GB.json`.

Each language then receives a nested object of translations, so let's have a look at an example `snippet/en-GB.json`:

```javascript
{
    "swag-example": {
        "nested": {
            "value": "example"
        },
        "foo": "bar"
    }
}
```

In this example you would have access the two translations by the following paths: `swag-example.nested.value` to get the value 'example' and `swag-example.foo` to get the value 'bar'. You can nest those objects as much as you want.

By default, Shopware 6 will collect those files automatically when your plugin is activated.

## Using the snippets in JavaScript

Since snippets are automatically registered in the scope of your module, you can use them directly:

```javascript
Component.register('my-custom-page', {
    ...

    methods: {
        createdComponent() {
            // call the $tc helper function provided by Vue I18n 
            const myCustomText = this.$tc('swag-example.general.myCustomText');

            console.log(myCustomText);
        }
    }
    ...
});
```

## Using the snippets in templates

The same `$tc` helper function can be used in the templates to access translations.

{% raw %}
```text
{% block my_custom_block %}
    <p>
       {{ $tc('swag-example.general.myCustomText') }}
    </p>
{% endblock %}
```
{% endraw %}

## More interesting topics

* [Learning about the global Shopware object](the-shopware-object.md)
* [Learning about the VueX state](https://github.com/shopware/docs/tree/575c2fa12ef272dc25744975e2f1e4d44721f0f1/guides/plugins/plugins/administration/using-vuex-state.md)

