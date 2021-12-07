# Add translations

## Overview

In this guide you'll learn how to add translations to the storefront and how to use them in your twig templates. To organize your snippets you can add them to `.json` files, so structuring and finding snippets you want to change is very easy.

## Prerequisites

In order to add your own custom translations for your plugin, you first need a plugin as base. Therefore, you can refer to the [Plugin Base Guide](../plugin-base-guide.md).

## Snippet file structure

Shopware 6 is able to load your snippet files automatically if you stick to a convention regarding file structure and naming. You have to store your snippet files in the `<plugin root>/src/Resources/snippet` directory of your plugin, but you can use further subdirectories if you want to. Use the naming pattern `<name>.<locale>`, where you can freely define the name part. The locale part must map to the ISO string of the supported locale in this snippet file. If you provide base translations, meaning that you ship translations for a whole new language, you indicate it with a `.base` suffix in your file name. Keep in mind that in this case you also have to use the name, so your complete filename may look like this: `<name>.<locale>.base.json`.

So your structure could then look like this:

```text
└── plugins
    └── SwagBasicExample
        └── src
            ├─ Resources
            │  └─ snippet
            │     ├─ de_DE
            │     │  └─ example.de-DE.json
            │     └─ en_GB
            │        └─ example.en-GB.json
            └─ SwagBasicExample.php
```

## Creating the translation

Now that we know how the structure of snippets should be, we can create a new snippet file. In this example we are creating a snippet file for British English called `example.en-GB.json`. If you are using nested objects, you can access the values with `exampleOne.exampleTwo.exampleThree`. We can also use template variables, which we can assign values later in the template. There is no explicit syntax for variables in the storefront. However, it is recommended to enclose them with `%` symbols to make their purpose clear.

Here's an example of an English translation file:

{% code title="<plugin root>/src/Resources/snippet/en\_GB/example.en-GB.json" %}
```javascript
{
  "header": {
    "example": "Our example header"
  },
  "soldProducts": "Sold about %count% products in %country%"
}
```
{% endcode %}

## Using the translation in templates

Now we want to use our previously created snippet in our twig template, we can do this with the `trans` filter. Below you can find two examples where we use our translation with placeholders and without.

Translation without placeholders:

```text
<div class="product-detail-headline">
    {{ 'header.example' | trans }}
</div>
```

Translation with placeholders:

```text
<div class="product-detail-headline">
    {{ 'soldProducts' | trans({'%count%': 3, '%country%': 'Germany'}) }}
</div>
```

## Using the translation in controllers

If we want to use our snippet in a controller, we have to use the `trans` function. Note that we have to extend our class from `Shopware\Storefront\Controller\StorefrontController`.

Translation without placeholders:

```php
$this->trans('header.example');
```

Translation with placeholders:

```php
$this->trans('soldProducts', ['%count%' => 3, '%country%' => 'Germany']);
```

## Using translation generally in PHP

If we need to use a snippet elsewhere in PHP, we can use [Dependency Injection](../plugin-fundamentals/dependency-injection.md) to inject the `translator`, which implements Symfony's `Symfony\Contracts\Translation\TranslatorInterface`:

```xml
<service id="Swag\Example\Service\SwagService" public="true" >
    <argument type="service" id="translator" />
</service>
```

```php
private TranslatorInterface $translator;

public function __construct(TranslatorInterface $translator)
{
    $this->translator = $translator;
}
```

Your class can then use translation similarly to controllers:

```php
$this->translator->trans('soldProducts', ['%count%' => 3, '%country%' => 'Germany']);
```
