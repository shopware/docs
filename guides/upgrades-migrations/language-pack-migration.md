---
nav:
  title: Language Pack Migration
  position: 10
---

# Migration Guide: Language Pack Plugin → Integrated Translation Handling

Starting with Shopware **6.7.3.0**, translations are managed directly in Shopware. From **6.8.0.0**, the
[Language Pack plugin][language-pack-plugin] will no longer be compatible. Follow this guide to migrate safely.

## What changes

- **From Shopware 6.7.3.0 onward**

  - Translations can be installed via Shopware itself, the [Language Pack plugin][language-pack-plugin] is not required to fetch the
    newest [Shopware translations][shopware-translations].
  - A new CLI command is available:

```bash
  bin/console translation:install --locales it-IT
```

- The [Language Pack plugin][language-pack-plugin] still works but is not recommended.
- Languages now have an active flag which can be toggled in the Administration under `Settings → Languages`
- Languages installed/managed from other sources do not need to register their locales in the admin anymore.
- **Other translation plugins or snippets in themes are not affected and can still be used alongside the integrated handling.**

- **Shopware 6.8.0.0 and later**

  - The [Language Pack plugin][language-pack-plugin] is **not compatible**.
    - The [integrated language handling][translation-system] should be used to fetch the newest [Shopware translations][shopware-translations].
  - **Other translation plugins or snippets in themes are not affected and can still be used alongside the integrated handling.**

## Migration paths

### 1. You are **not using the Language Pack plugin**

- Nothing changes.
- To install additional languages, use the CLI command:

```bash  
  bin/console translation:install --locales <locale-code>
```

Example: `bin/console translation:install --locales it-IT,fr-FR` will install Italian and French.

### 2. You are **currently using the Language Pack plugin**

1. Run the translation command and install every language you are using in your shop

    ```bash
      bin/console translation:install --locales <locale-code>,<locale-code>
    ```

2. The command uses the **same source ([translate.shopware.com][shopware-translations])** as the [Language Pack plugin][language-pack-plugin] but is
   updated more frequently. So it's essentially identical – or even more up to date!
3. You can safely uninstall and remove the Language Pack plugin. Your **custom snippets** created in the Snippet module
   remain intact since they are saved in the database.
4. Make sure that all languages you need are **active** in the Administration:
   `Settings → Languages`

## New installations

- During a fresh Shopware installation, you can select desired languages directly in the installer. They will be
  downloaded and installed automatically.
- No additional language plugin is required.

## More information

- Additional details about the new translation handling are available in the [integrated language handling][translation-system] guide.

[translation-system]: ../../../../../concepts/translations/built-in-translation-system.md
[language-pack-plugin]: https://store.shopware.com/en/swag338126230916f/shopware-language-pack.html
[shopware-translations]: https://translate.shopware.com
