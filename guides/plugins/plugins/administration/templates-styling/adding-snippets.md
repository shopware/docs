---
nav:
  title: Adding snippets
  position: 60

---

# Adding snippets

## Overview

By default Shopware 6 uses the [Vue I18n](https://kazupon.github.io/vue-i18n/started.html#html) plugin in the `Administration` to deal with translation.

## Creating snippet files

Normally you use snippets in your custom module. To keep things organized, create a new directory named `snippet` inside module directory `<plugin root>/src/Resources/app/administration/src/module/<your-module>/snippet`. For each language you want to support, you need a JSON file inside it, e.g., `de-DE.json`, `en-GB.json`. For more details on selecting a fallback language and structuring your snippet files, see the [Fallback Languages guide](./../../../../../concepts/translations/fallback-language-selection).

::: info
Providing snippets for apps works the same as in plugins but it has a more simplistic file structure. Also, unlike plugins, App-Snippets **are not allowed** to override existing snippet keys. So, use the following path for vendor-prefixed app snippet files: `<app root>/Resources/app/administration/snippet`
:::

Each language then receives a nested object of translations, so let's have a look at an example `snippet/en-GB.json`:

```json
{
    "swag-example": {
        "nested": {
            "value": "example",
            "examplePluralization": "1 Product | {n} Products"
        },
        "foo": "bar"
    }
}
```

In this example you would have access the two translations by the following paths: `swag-example.nested.value` to get the value 'example' and `swag-example.foo` to get the value 'bar'. You can nest those objects as much as you want.

By default, Shopware 6 will collect those files automatically when your plugin is activated.

::: info
When you do not build a module and therefore do not fit into the suggested directory structure, you can still place the translation files anywhere in `<plugin root>/src/Resources/app/administration/src/`.
:::

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

Or use `Shopware.Snippet.tc('swag-example.general.myCustomText')` when `this` doesn't point to a component (see also [Vue3 upgrade](../../../../../resources/references/upgrades/administration/vue3.md))

## Using the snippets in templates

The same `$tc` helper function can be used in the templates to access translations.

```twig
{% block my_custom_block %}
    <p>
       {{ $tc('swag-example.general.myCustomText') }}
    </p>
{% endblock %}
```

Another feature of `$tc` is pluralization. Use a `|` in snippets to provide translations depending on the number. The first part shows singular expression, while the second takes care of plural cases.
Let's have a look at this example of `"examplePluralization": "One Product | {n} Products"` with the following implementation:

```twig
{% block my_custom_block %}
    <p>
       {{ $tc('swag-example.nested.examplePluralization', products.length) }}
    </p>
{% endblock %}
```

If you provide `1` as the second parameter to `$tc()`, the text `One Product` would be rendered. For any other value greater than 1, the number itself is shown — for example, `4 Products`.

## More interesting topics

* [Learning about the global Shopware object](../data-handling-processing/the-shopware-object.md)
* [Learning about the VueX state](https://github.com/shopware/docs/blob/575c2fa12ef272dc25744975e2f1e4d44721f0f1/guides/plugins/plugins/administration/using-vuex-state.md)
