# Defining Base Languages in Shopware’s Region-Independent Snippet Layer

With Shopware 6.7 a **region-independent snippet layer** was introduced to reduce duplicate translations.  
In this model the snippet loader first attempts to load a region-specific variant (e.g. `de-DE`), then falls back to a **base language** (e.g. `de`), and finally falls back to `en` as a universal default.  
The base layer concept and fallback order are explained in detail in the [Built-in Translation Handling](built-in-translation-system.html) page, which you should read alongside this guide.

## Why a base layer?

Before v6.7, Shopware shipped only region-specific snippet files. Developers often duplicated an existing file (for example `en-GB`) and changed a handful of keys for another locale.  
This practice led to bloated repositories and inconsistent fallbacks. The **region-independent layer** centralizes common translations into a neutral base file (`en`, `de`, `pt`, etc.) and isolates regional differences in small patch files.  
Detailed examples of how Shopware resolves translations are available in the [Built-in Translation Handling](built-in-translation-system.html) guide.

## Criteria for selecting a base language

A base language is a **language code without a regional sub-tag** (for example `en`, `de` or `pt`).  
Shopware’s core repository defines which languages have a base file; if your language appears only as a single locale (such as `sv-SE`), that file serves as both the base and regional variant.  
To decide whether your language needs a base file and which variant defines it, follow these principles:

* **Use the standard variant** – The base file should reflect the official standard form of a language. Shopware uses British English (en-GB) as the basis for `en` and European Portuguese (pt-PT) for `pt`.
* **Create a base only when multiple regional variants exist** – If there is only one supported locale (for example Czech), you don’t need a separate `cs` file.
* **Aim for neutrality** – Avoid region-specific terminology in the base file. For Spanish, a neutral Castilian register is recommended to maximize comprehension.

## Base languages

The **base code** is the plain language code (e.g. `en` or `de`), and the **defining dialect** is the standard locale from which the base translations derive.  
The table shows some examples of common cases:

| Base code | Standard variant (defining dialect) | Example dialects |
|-----------|-------------------------------------|------------------|
| **en**    | en-GB (British English)             | en-US, en-CA, en-IN |
| **de**    | de-DE (German in Germany)           | de-AT, de-CH |
| **es**    | es-ES (Castilian Spanish)           | es-AR, es-MX |
| **pt**    | pt-PT (European Portuguese)         | pt-BR |
| **fr**    | fr-FR (French in France)            | fr-CA, fr-CH |
| **nl**    | nl-NL (Dutch in the Netherlands)    | nl-BE |

## Implementation guidelines for extension developers

For detailed instructions, see the [Extension Translation Migration](/resources/references/upgrades/core/translation/extension-translation.md) guide. In short:

* **Create a complete base file** (`messages.<language>.base.json`) for each supported language.
* **Add patch files only when needed** – keep them minimal.
* **Follow naming conventions** – base file: `messages.<language>.base.json`; patch file: `messages.<locale>.base.json`.
* **Validate your snippets** – clear the cache and run `bin/console snippet:validate`.

## Conclusion

The region-independent snippet layer streamlines translation maintenance by consolidating common strings into a neutral base file and isolating regional vocabulary into small patch files.   
For further examples, refer to [Built-in Translation Handling](/concepts/translations/built-in-translation-system.md) and [Extension Translation Migration](/resources/references/upgrades/core/translation/extension-translation.md).
