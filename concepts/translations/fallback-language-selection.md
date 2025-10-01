# Fallback language selection

With Shopware 6.7 a **country-agnostic snippet layer** was introduced to reduce duplicate translations.  
In this model the snippet loader first attempts to load a country-specific variant (e.g. `de-DE`), then looks for an agnostic **fallback language** (e.g. `de`), and as a last resort falls back to `en` as a universal default.  
The fallback layer concept and fallback order are explained in detail in the [Built-in Translation Handling](built-in-translation-system.md) page, which you should read alongside this guide.

## Why an extra fallback layer?

Before v6.7, Shopware shipped only country-specific snippet files. Developers often duplicated existing files (for example `en-GB` to `en-US`) and changed a handful of keys.  
This practice led to bloated repositories and inconsistent fallbacks. The **country-independent layer** centralizes common translations into a neutral fallback file (`en`, `de`, `pt`, etc.) and isolates regional differences in small patch files.  
Detailed examples of how Shopware resolves translations are available in the [Built-in Translation Handling](built-in-translation-system.md) guide.

## Fallback languages

The **fallback code** is the plain language code (e.g. `en` or `de`), and the **defining dialect** is the standard locale from which the fallback translations derive (for example `en` instead of `en-US` or `en-GB`).  
The table shows some examples of common cases:

| Fallback code | Standard variant (defining dialect) | Example dialects          |
|---------------|-------------------------------------|---------------------------|
| **`en`**      | `en-GB` (British English)           | `en-US`, `en-CA`, `en-IN` |
| **`de`**      | `de-DE` (German in Germany)         | `de-AT`, `de-CH`          |
| **`es`**      | `es-ES` (Castilian Spanish)         | `es-AR`, `es-MX`          |
| **`pt`**      | `pt-PT` (European Portuguese)       | `pt-BR`                   |
| **`fr`**      | `fr-FR` (French in France)          | `fr-CA`, `fr-CH`          |
| **`nl`**      | `nl-NL` (Dutch in the Netherlands)  | `nl-BE`                   |

## Implementation guidelines for extension developers

For detailed instructions, see the [Extension Translation Migration](/resources/references/upgrades/core/translation/extension-translation.md) guide. In short:

* **Create a complete base file** (`messages.<language>.base.json`) for each supported language.
* **Add patch files only when needed** – keep them minimal.
* **Aim for neutrality** – Avoid country-specific terminology in the fallback files.
* Properly select which dialect is your standard — for example, looking at Spanish, a neutral Castilian is recommended to maximize comprehension.
* **Follow naming conventions** – E.g., agnostic file: `storefront.nl.json`; patch file: `storefront.nl-BE.json`.
* **Validate your snippets** – clear the cache and run `bin/console translation:validate`.

## Conclusion

The country-independent snippet layer streamlines translation maintenance by consolidating common strings into a neutral fallback file and isolating regional vocabulary into small patch files.
For further examples, refer to [Built-in Translation Handling](/concepts/translations/built-in-translation-system.md) and [Extension Translation Migration](/resources/references/upgrades/core/translation/extension-translation.md).
