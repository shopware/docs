# Add Translations

## Overview

In this guide you'll learn how to add translations to the Storefront and how to use them in your twig templates. To organize your snippets you can add them to `.json` files, so structuring and finding snippets you want to change is very easy.

## Prerequisites

To add your own custom translations for your plugin or app, you first need a base. Refer to either the [Plugin Base Guide](../plugin-base-guide) or the [App Base Guide](../../apps/app-base-guide) to create one.

## Snippet file structure

Shopware 6 automatically loads your snippet files when a standard file structure and a naming convention are followed. To do so, store your snippet files in the `<extension root>/src/Resources/snippet/<locale>/` directory of your extension. Also, you can further use subdirectories if you want to. Use `<name>.<locale>` as the naming pattern. The name can be freely defined, while the locale must map to the ISO string of the supported locale in this snippet file - for example `example.de-DE.json`.

In case you want to provide base translations (ship translations for a whole new language), indicate it with the suffix `.base` in your file name. Now the filename convention to be followed looks like this `<name>.<locale>.base.json` - for example, `example.de-AT.base.json`.

So your structure could then look like this:

```text
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

Now that we know how the structure of snippets should be, we can create a new snippet file. In this example we are creating a snippet file for British English called `example.en-GB.json`. If you are using nested objects, you can access the values with `exampleOne.exampleTwo.exampleThree`. We can also use template variables, which we can assign values later in the template. There is no explicit syntax for variables in the Storefront. However, it is recommended to enclose them with `%` symbols to make their purpose clear.

Here's an example of an English translation file:

```js
// <extension root>/src/Resources/snippet/en\_GB/example.en-GB.jsonon
{
  "header": {
    "example": "Our example header"
  },
  "soldProducts": "Sold about %count% products in %country%"
}
```

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

If we need to use a snippet elsewhere in PHP, we can use [Dependency Injection](../plugin-fundamentals/dependency-injection) to inject the `translator`, which implements Symfony's `Symfony\Contracts\Translation\TranslatorInterface`:

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
