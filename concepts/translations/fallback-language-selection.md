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

## Migration and linting via command

To support these processes, the `LintTranslationFilesCommand` can be executed using `bin/console translation:lint-filenames` to validate translation filenames.

The command outputs tables for each domain (Administration, Core/base files, and Storefront) containing the following information:

- **Filename** – The name of the translation file, e.g. `storefront.de.json`.
- **Path** – The file path where this translation file was found, e.g. `src/Storefront/Resources/snippet`.
- **Domain** – The prefix of the corresponding storefront translation file. For administration files, `administration` is shown in this column. For extensions, it can be helpful to name storefront files accordingly, for example `cms-extensions.en.json`. Please note: language-defining base files **must always** use `messages` here, like in `messages.fr.base.json`!
- **Locale** – The language code following [IETF BCP 47](https://www.rfc-editor.org/info/bcp47), restricted to [ISO 639-1 (2-letter) language codes](https://en.wikipedia.org/wiki/ISO_639-1). Example: `de-DE` for German (Germany).
- **Language** – The first part of the locale, representing the language used. Example: `de` (German) when the full locale is `de-DE`.
- **Script** – Specifies the writing system used for the language when multiple scripts exist. This part is optional and rarely used, as Shopware processes currently do not support or distinguish between scripts and only offer it for extensibility. For example, Serbian (Serbia) can be written in both Cyrillic and Latin (`sr-Cyrl-RS` vs. `sr-Latn-RS`).
- **Region** – The suffix of the locale, used to specify a regional variant of a language. Shopware’s best practice is to avoid using regional locales for the base language so that regional differences can be handled through overrides. Example: `de-AT` (German for Austria) can be used to patch differences from the base `de` locale.

### Command parameters

The command supports several options:

- **`--fix`** – This parameter helps you **migrate** to Shopware's best practices by automatically renaming files to their agnostic equivalents. If multiple country-specific candidates exist for a single agnostic file, you’ll need to select one manually via prompt.
- **`--all`** – Includes the `custom` directory in the linting of filenames to **include all extensions as well**. If specified, the `extensions` option will be ignored.
- **`--extensions`** – Restricts the search to the given **technical** extension names (for example: `SwagCmsExtensions`), if provided. Multiple values can be passed as a comma-separated list.
- **`--ignore`** – Excludes the specified paths relative to `src`, or, if applicable, the provided (bundle) paths. Multiple values can be passed as a comma-separated list.
- **`--dir`** – Limits the search to a specific directory for translation files, **taking precedence over** the `ignore` parameter.

## Implementation guidelines for extension developers

For detailed instructions, see the [Extension Translation Migration](/resources/references/upgrades/core/translation/extension-translation.md) guide. In short:

- **Create a complete base file** (`messages.<language>.base.json`) for each supported language.
- **Add patch files only when needed** – keep them minimal.
- **Aim for neutrality** – Avoid country-specific terminology in the fallback files.
- **Properly select which dialect is your standard** — for example, looking at Spanish, a neutral Castilian is recommended to maximize comprehension.
- **Follow naming conventions** – E.g., agnostic file: `storefront.nl.json`; patch file: `storefront.nl-BE.json`.
- **Validate your translations** – clear the cache and run `bin/console translation:validate`, as well as `bin/console translation:lint-filenames` to be ready to go.

## Conclusion

The country-independent snippet layer streamlines translation maintenance by consolidating common strings into a neutral fallback file and isolating regional vocabulary into small patch files.
For further examples, refer to [Built-in Translation Handling](/concepts/translations/built-in-translation-system.md) and [Extension Translation Migration](/resources/references/upgrades/core/translation/extension-translation.md).
