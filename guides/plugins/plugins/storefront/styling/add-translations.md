---
nav:
  title: Add Translations
  position: 120

---

# Add Translations

## Overview

In this guide, you'll learn how to add translations to the Storefront and how to use them in your twig templates.
To organize your snippets you can add them to `.json` files, so structuring and finding snippets you want to change is very easy.

## Prerequisites

To add your own custom translations for your plugin or app, you first need a base.
Refer to either the [Plugin Base Guide](../../plugin-base-guide.md) or the [App Base Guide](../../../apps/app-base-guide.md) to create one.

## Snippet file structure

Shopware 6 automatically loads your snippet files when you follow the standard file structure and naming convention.
To enable this, store your snippet files in the `<extension root>/src/Resources/snippet/` directory of your plugin or `<extension root>/Resources/snippet/` for your app or theme.

You can also use subdirectories if you prefer, although we recommend keeping a flat structure for better maintainability.
Use `<domain>.<locale>.json` as the naming pattern for the file.

The domain can be freely defined (we recommend your extension name in kebab case), while the locale **must** map to the ISO string of the supported locale in this snippet file — for example: `my-app.de.json`.
Locales should follow the ISO string of the supported language, such as `de`, `en`, or `es-AR`.
This format follows [IETF BCP 47](https://datatracker.ietf.org/doc/html/bcp47), restricted to [ISO 639-1 (2-letter) language codes](https://en.wikipedia.org/wiki/ISO_639-1) as used by [Symfony](https://symfony.com/doc/current/reference/constraints/Locale.html), but with dashes (`-`) instead of underscores (`_`).

For more information on selecting proper locales, see our documentation on [Fallback language selection](../../../../../concepts/framework/translations/fallback-language-selection.md).

In case you want to provide base translations (ship translations for a whole new language), indicate it with the suffix `.base` in your file name.
Now the filename convention to be followed looks like this `<name>.<locale>.base.json` - for example, `my-app.de.base.json`.

So your structure could then look like this:

```text
└── SwagBasicExample
    └── src // Without `src` in apps / themes
        ├─ Resources
        │  └─ snippet
        │     ├─ my-app.de.json
        │     ├─ my-app.en.json
        │     └─ some-directory // optional
        │        └─ some-special-case.en.json
        └─ SwagBasicExample.php
```

### Snippet files in the private filesystem

::: info
Available starting with Shopware 6.7.16.0.
:::

Besides the files shipped by extensions, Shopware also loads Storefront snippet files from the private filesystem (`shopware.filesystem.private`, by default the `files/` directory of your installation). This allows integrations or deployments to provide snippets without shipping an extension.

Place the files below `snippets/storefront/`, using the same `<domain>.<locale>.json` naming convention:

```text
└── files
    └── snippets
        └── storefront
            ├─ my-integration.en.json          // author "custom", technical name "my-integration"
            └─ MyIntegration                   // optional source directory
               ├─ storefront.de.json           // author and technical name "MyIntegration"
               └─ storefront.de.base.json
```

Files placed directly in `snippets/storefront/` are attributed to the author `custom` and use their domain as technical name. Files inside a subdirectory use the directory name as author and technical name, which is how they show up in the snippet set overview of the Administration.

These files are loaded as the lowest-priority snippet layer: snippet files shipped by the core, plugins or apps always override them. The Storefront caches its translation catalogues, so clear the cache after adding or changing files:

```bash
bin/console cache:clear
```

## Creating translations

Now that we know how the structure of snippets should be, we can create a new snippet file.
In this example we are creating a snippet file for (British) English called `example.en.json`.
If you are using nested objects, you can access the translation values with `exampleOne.exampleTwo.exampleThree`.
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
Or use injection via [DI container](#general-usage-of-translations-in-php).

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
we can use [Dependency Injection](../../services/dependency-injection.md) to inject the `translator` service,
which implements Symfony's `Symfony\Contracts\Translation\TranslatorInterface`:

```php
$services->set(Swag\Example\Service\SwagService::class)
    ->args([service('translator')]);
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
