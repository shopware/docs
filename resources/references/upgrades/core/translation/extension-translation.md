---
nav:
title: Migrating Extensions
position: 20
---

# Migrating Extension Translations to the Country-Independent Snippet Layer

Starting with **Shopware 6.7.3**, a new region-independent snippet layer has been introduced to reduce duplicate
translations across similar language variants (e.g., `en-GB`, `en-US`, `en-CA` can share a common "en" base layer).

This change implements a hierarchical fallback system that automatically resolves translations through multiple layers,
significantly reducing maintenance overhead for extension developers.

## How the New System Works

The snippet loading system now follows this resolution order:

1. **Region-specific layer** (e.g., `en-GB`, `de-DE`) — Highest priority
2. **Language base layer** (e.g., `en`, `de`, `es`)  **NEW fallback layer**
3. **British English fallback** (`en-GB`) - Legacy fallback to maximize compatibility
4. **Default fallback** (`en`) - Last resort

When a translation key is requested, Shopware will:

- First check the specific region variant (e.g., `es-AR`)
- If not found, check the base language (e.g., `es`)
- If not found, the legacy fallback will be checked (`en-GB`)
- Finally, fall back to `en` if still not found

**Result**: ~90% reduction in duplicate translations while maintaining full functionality.

## Migrating Your Extensions

### Automatic

Shipping with Shopware **6.7.3**, there's the command line tool `bin/console translation:lint-filenames` that can be used to
check the translation files, or use the `--fix` parameter to even automate the migration process. For more information, see [this migration article](../../../../../concepts/translations/fallback-language-selection.md#migration-and-linting-via-command).

### Manual

#### Step 1: Rename your existing files

Rename your existing files from country-specific naming to the language base layer naming.

```Generic
├── messages.en-GB.base.json ⇒ messages.en.base.json
├── messages.de-DE.base.json ⇒ messages.de.base.json
├── messages.fr-FR.base.json ⇒ messages.fr.base.json
└············
```

#### Step 2: Re-create empty country-specific files

Re-create empty files with the former names of the country-specific naming.

```Generic
├── messages.en-GB.base.json
├── messages.de-DE.base.json
├── messages.fr-FR.base.json
└············
```

#### Step 3: Remove duplicates from other country-specific files

Check for duplicate translations across country-specific files and remove them from the country-specific layer.

Here are some example locales that are a dialect to the generic base layer.

```Generic
├── messages.en-US.base.json (dialect of en-GB with the en base layer)
├── messages.en-IN.base.json (dialect of en-GB with the en base layer)
├── messages.de-AT.base.json (dialect of de-DE with the de base layer)
├── messages.de-CH.base.json (dialect of de-DE with the de base layer)
├── messages.pt-BR.base.json (dialect of pt-PT with the pt base layer)
└············
```

For more details on selecting a fallback language and structuring your snippet files, see the [Fallback Languages guide](../../../../../concepts/translations/fallback-language-selection.md).

## Testing Your Migration

After the snippet files have been renamed, changing the locale to one of the empty snippet sets should still provide all translated strings. Changing to a region-specific locale should also provide all translated strings with just region-specific terms being replaced.

## Best Practices

### 1. Maintain Backward Compatibility

Keep existing country-specific files during transition to ensure compatibility with older Shopware versions that don't
support the base layer.

## Troubleshooting

### Common Migration Issues

#### 1. Translations Not Found After Migration

**Symptoms**: Missing translations in frontend/backend after restructuring
**Solution**:

```bash
bin/console cache:clear
bin/console snippet:validate
```
