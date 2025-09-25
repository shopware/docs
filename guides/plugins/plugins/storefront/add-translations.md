---
nav:
  title: Add translations
  position: 120

---

# Add translations

## Overview

In this guide, you'll learn how to add translations to the Storefront and how to use them in your twig templates.
To organize your snippets you can add them to `.json` files, so structuring and finding snippets you want to change is very easy.

## Prerequisites

To add your own custom translations for your plugin or app, you first need a base.
Refer to either the [Plugin Base Guide](../plugin-base-guide) or the [App Base Guide](../../apps/app-base-guide) to create one.

## Snippet file structure

Shopware 6 automatically loads your snippet files when a standard file structure and a naming convention are followed.
To do so, store your snippet files in the `<extension root>/src/Resources/snippet/` directory of your plugin or `<extension root>/Resources/snippet/` for your app or theme.
Also, you can use further subdirectories if you want to.
Use `<name>.<locale>` as the naming pattern for the file.
The name can be freely defined, while the locale **must** map to the ISO string of the supported locale in this snippet file - for example `example.de-DE.json`.
More precisely, the ISO string is a combination of "ISO 639-1" language codes and "ISO 3166-1 alpha-2" country codes.
Later, this will be converted to the ICU format (`de_DE`), which is also used by [Symfony](https://symfony.com/doc/current/reference/constraints/Locale.html).

In case you want to provide base translations (ship translations for a whole new language), indicate it with the suffix `.base` in your file name.
Now the filename convention to be followed looks like this `<name>.<locale>.base.json` - for example, `example.de-AT.base.json`.

For more details on selecting a fallback language and structuring your snippet files, see the [Fallback Languages guide](/concepts/translations/fallback-language-selection.md).

So your structure could then look like this:

```text
└── SwagBasicExample
    └── src // Without `src` in apps / themes
        ├─ Resources
        │  └─ snippet
        │     ├─ example.de-DE.json
        │     └─ some-directory // optional
        │        └─ example.en-GB.json
        └─ SwagBasicExample.php
```

## Creating translations

Now that we know how the structure of snippets should be, we can create a new snippet file.
In this example we are creating a snippet file for British English called `example.en-GB.json`.
If you are using nested objects, you can access the values with `exampleOne.exampleTwo.exampleThree`.
We can also use template variables, which we can assign values later in the template.
There is no explicit syntax for variables in the Storefront.
However, it is recommended to enclose them with `%` symbols to make their purpose clear.

Here's an example of an English translation file:

```json
// <extension root>/src/Resources/snippet/en_GB/example.en-GB.json
{
  "header": {
    "example": "Our example header"
  },
  "soldProducts": "Sold about %count% products in %country%"
}
```

## Using translations in templates

Now we want to use our previously created snippet in our twig template, we can do this with the `trans` filter.
Below, you can find two examples where we use our translation with placeholders and without.

Translation without placeholders:

```twig
<div class="product-detail-headline">
    {{ 'header.example' | trans }}
</div>
```

Translation with placeholders:

```twig
<div class="product-detail-headline">
    {{ 'soldProducts' | trans({'%count%': 3, '%country%': 'Germany'}) }}
</div>
```

## Using translations in controllers

If we want to use our snippet in a controller, we can use the `trans` method,
which is available if our class is extending from `Shopware\Storefront\Controller\StorefrontController`.
Or use injection via [DI container](#using-translation-generally-in-php).

Translation without placeholders:

```php
$this->trans('header.example');
```

Translation with placeholders:

```php
$this->trans('soldProducts', ['%count%' => 3, '%country%' => 'Germany']);
```

## General usage of translations in PHP

If we need to use a snippet elsewhere in PHP,
we can use [Dependency Injection](../plugin-fundamentals/dependency-injection) to inject the `translator` service,
which implements Symfony's `Symfony\Contracts\Translation\TranslatorInterface`:

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

Then, call the `trans` method, which has the same parameters as the method from controllers.

```php
$this->translator->trans('soldProducts', ['%count%' => 3, '%country%' => 'Germany']);
```
