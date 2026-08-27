---
nav:
  title: Plain vs translated entity fields
  position: 20

product: shopware
lifecycle: reference
---

# Plain vs translated entity fields

When you read translatable entity data—via the DAL (`EntityRepository`), the Admin API, the Store API, or Twig templates (storefront, documents, mail)—you can access a field in two ways:

* `salesChannel.name` — the **plain** value for the current language of the context
* `salesChannel.translated.name` — the **resolved** value after language inheritance

The same pattern applies to every translatable field (`product.name`, `category.description`, custom fields on the `translated` object, and so on).

## Why both exist

The Data Abstraction Layer is built for Shopware’s CRUD-style Admin API and Administration UI. Editors need to see **what is actually stored for the language they are editing**, including empty overrides, versus **what the customer would see** after fallbacks. The following table summarizes what each variant means.

| Access                    | Meaning                                                                                                        |
|---------------------------|----------------------------------------------------------------------------------------------------------------|
| `entity.field`            | Value stored for the **current context language** only. May be `null` if that language has no own translation. |
| `entity.translated.field` | Value after walking the language inheritance chain. Prefer this whenever you need a displayable string.        |

## Inheritance example

Assume this language chain:

```text
EN (root) → DE → AT
```

And these stored names for a sales channel:

| Language | Stored `name`        |
|----------|----------------------|
| EN       | `SalesChannel`       |
| DE       | `Verkaufskanal`      |
| AT       | *(not set / `null`)* |

### Austrian context (`AT` inherits from `DE`)

| Access                         | Result          | Reason              |
|--------------------------------|-----------------|---------------------|
| `salesChannel.name`            | `null`          | AT has no own value |
| `salesChannel.translated.name` | `Verkaufskanal` | Falls back to DE    |

### Austrian context when DE is also empty

If DE is also `null`:

| Access                         | Result                   |
|--------------------------------|--------------------------|
| `salesChannel.name`            | `null`                   |
| `salesChannel.translated.name` | `SalesChannel` (EN root) |

### German context (`DE`)

| Access                         | Result          |
|--------------------------------|-----------------|
| `salesChannel.name`            | `Verkaufskanal` |
| `salesChannel.translated.name` | `Verkaufskanal` |

When the current language has its own translation, plain and translated values are the same.

The DAL resolves up to three language levels when reading: current language, optional parent language, then system language. See [Data Abstraction Layer — Translations](../data-abstraction-layer.md#translations).

## Which variant to use

### Prefer `translated` (default for display)

Use `entity.translated.field` in almost every **consumer** or **sales-channel** context:

* Storefront Twig templates
* Document and mail templates (including merchant-edited ones)
* Store API clients and headless storefronts
* PHP code that runs in a sales-channel / storefront context and only needs a value to show or send

In these contexts you almost always want a resolved label, never an empty field that only exists because the current language inherits from another.

```twig
{# Storefront / mail / document — always prefer translated #}
{{ salesChannel.translated.name }}
{{ product.translated.name }}
{{ product.translated.customFields.my_field }}
```

```php
// Sales-channel / storefront PHP — prefer the translated value
$name = $salesChannel->getTranslation('name'); // resolved via inheritance
// Not: $salesChannel->getName(); // plain value for the current language only (may be null)
```

### Prefer plain `field` (Admin / editing)

Use `entity.field` when you must know **whether this language has its own value**:

* Administration forms and listings that edit translations per language
* Admin API integrations that write or diff language-specific payloads
* Logic that decides “override vs inherit” for a given language

There, `null` is meaningful: it means “not set in this language; inherit from the parent language.”

```js
// Admin / CRUD: plain field shows the language-specific stored value
salesChannel.name; // may be null while translated.name is filled
salesChannel.translated.name; // resolved preview for the same row
```

## API responses

Both Admin API and Store API entity payloads expose the plain fields and a nested `translated` object. Selecting the language (for example with the [`sw-language-id`](../../../guides/development/integrations-api/request-headers.md#sw-language-id) header) changes which language the plain fields refer to; `translated` still applies inheritance for missing values.

::: tip
When building storefronts or integrations that only **display** data, always read from `translated`. Relying on the plain field leads to empty labels for inherited languages.
:::

## Related guides

* [Data Abstraction Layer — Translations](../data-abstraction-layer.md#translations)
* [Adding data translations](../../../guides/plugins/plugins/framework/data-handling/add-data-translations.md)
* [Field inheritance](../../../guides/plugins/plugins/framework/data-handling/field-inheritance.md) (parent–child entity inheritance, including translated fields)
* [Request headers — `sw-language-id`](../../../guides/development/integrations-api/request-headers.md#sw-language-id)
