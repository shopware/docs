# Built-in Translation Handling

## Overview

The built-in translation system allows you to install and update translations that are not shipped with Shopware by
default.
It provides the same set of translations as the **Language Pack** plugin and is planned to fully replace it.

> **Note:** The Language Pack plugin is deprecated and will be removed with Shopware version **6.8.0.0**.
> If you are currently using the Language Pack plugin, please refer to
> the [Migration guide][migration-guide] for instructions
> on switching to the new system.

## Where do the translations come from?

Translations are fetched from a public GitHub
repository: [shopware/translations](https://github.com/shopware/translations).
This repository is managed using [Crowdin](https://crowdin.com/project/shopware6) and contains translations for Shopware
as well as for some official plugins. The repository syncs with Crowdin every day to ensure that the latest translations
are always available.

## How to Install and Update Translations?

To use the built-in translation system, you can use the following console commands:

### Install translations

The `translation:install` command is used to download and install translations for Shopware and its plugins from the
configured GitHub repository. It allows you to specify which locales to install, whether to install all available
locales, and whether to skip activation of the installed translations.
Re-installing an already installed locale will override its translations.

```bash
$ php bin/console translation:install [--all, --locales, --skip-activation]

# example
$ php bin/console translation:install --locales=fr-FR,pl-PL --skip-activation
```

### Update command

The `translation:update` command is used to update existing translations for Shopware and its plugins from the
configured GitHub repository.

```bash
$ php bin/console translation:update
```

## Language activation

By default, installed translations are automatically activated, making them available for use in Shopware.
If you want to install translations without activating them, you can use the `--skip-activation` option with the
`translation:install` command.
The `active` flag in the `language` table indicates whether a language is active or not. If a language is not active, it
will not be available for selection in the storefront.

## How does the system recognize new updates?

The `translations` repository
includes [metadata](https://github.com/shopware/translations/blob/main/crowdin-metadata.json)
that provides information about the translations, such as available locales, last update timestamps, and completion
percentages for each language. The `updatedAt` field in the metadata is used to determine if a translation needs to be
updated. Installing or updating translations will create or update a `crowdin-metadata.lock` file on your private
filesystem which stores the last known update timestamps for each locale.
This file is used to compare the last update timestamps of installed locales with the ones in the metadata file to
determine if an update is necessary.

## Loading priority

When loading translations, the system follows a defined priority order to resolve conflicts:

1. Database translations – These have the highest priority. You can define them to override all other translations.
2. Region-specific translations (e.g. `en-GB`, `en-US` or `de-DE`) – These can be provided for country-dependent
   translations or dialects as small patch files. For more information about the language-layer changes, you can have a
   look at its documentation.
3. Region-agnostic translations (`en` and `de`) – These are shipped with Shopware and its plugins. They ensure that the
   system always has a reliable fallback language and provide a consistent developer experience without requiring you
   to wait until your translations are accepted at [translate.shopware.com](https://translate.shopware.com). For more details on selecting a fallback language and structuring your snippet files, see the [Fallback Languages guide](/concepts/translations/fallback-language-selection.md).
4. Built-in translation system – Finally, the translations installed via the built-in translation system are applied.

## Built-in translation system and Flysystem

The built-in translation system relies on Flysystem for storage abstraction. This allows great flexibility when working
with translations, as Flysystem supports multiple storage backends. For example, external systems can configure the
translation storage to use:

- Local file system (default)
- Cloud storage services such as Amazon S3, Google Cloud Storage, or Azure Blob Storage
- Custom storage adapters that integrate with other systems

This means you can adapt translation storage to your infrastructure needs, whether you want to keep everything local or
centralize it in a cloud-based storage solution.

## Translation configuration

This configuration file is in YAML format and defines how translations for Shopware core and plugins are managed and
retrieved.
It specifies the repository sources, supported plugins and languages, and more.
You can find the configuration file at `src/Core/System/Resources/translation.yaml`.

### Fields

#### `repository-url`

**Type:** `string`  
**Example:**

```yaml
repository-url: https://raw.githubusercontent.com/shopware/translations/main/translations
```

**Description:**  
The base URL of the translation repository. Translation files for different languages and plugins are fetched from here.

---

#### `metadata-url`

**Type:** `string`  
**Example:**

```yaml
metadata-url: https://raw.githubusercontent.com/shopware/translations/main/crowdin-metadata.json
```

**Description:**  
The URL for [metadata information](#how-does-the-system-recognize-new-updates) about the translations.

---

#### `plugins`

**Type:** `array[string]`  
**Example:**

```yaml
plugins: [
  'PluginPublisher',
  'SwagB2bPlatform',
  'SwagCmsExtensions'
]
```

**Description:**  
A list of supported plugins for which translations are available.

---

#### `excluded-locales`

**Type:** `array[string]`  
**Example:**

```yaml
excluded-locales: [ 'de-DE', 'en-GB' ]
```

**Description:**  
A list of language locales to be excluded from translation processing. German (Germany) and English (UK) are excluded by
default since they are shipped with Shopware. The exclusion applies to plugins too.

---

#### `plugin-mapping`

**Type:** `array[object]`  
**Example:**

```yaml
plugin-mapping:
  - plugin: 'SwagPublisher'
    name: 'PluginPublisher'
```

**Fields:**

- `plugin` (`string`): The internal plugin identifier (e.g., directory or code name).
- `name` (`string`): The corresponding plugin name in the translation repository.

**Description:**  
Allows mapping between internal plugin identifiers and repository names in case they differ.

---

#### `languages`

**Type:** `array[object]`  
**Example:**

```yaml
languages:
  - name: 'Français'
    locale: 'fr-FR'
```

**Fields:**

- `name` (`string`): Human-readable language name (preferably in the native script).
- `locale` (`string`): Language code according to [IETF BCP 47](https://datatracker.ietf.org/doc/html/bcp47), restricted to [ISO 639-1 (2-letter) language codes](https://en.wikipedia.org/wiki/ISO_639-1), used by
  Shopware for translations.

**Description:**  
Defines the set of supported languages for which translations should be retrieved. Each entry specifies a display name
and a locale code.

---

## How to extend or modify the configuration handling

### TranslationConfigLoader

The `TranslationConfigLoader` (`src/Core/System/Snippet/Service/TranslationConfigLoader.php`) is part of the Shopware
core and is responsible for loading and validating the `translation.yaml` file. It provides a `TranslationConfig` object
that contains all configured fields from the `translation.yaml`. It ensures that URLs are valid, languages and plugins
are properly structured, and plugin mappings are resolved. Errors such as missing files or invalid configuration values
are raised as `SnippetException`.
To extend or modify its behavior, the decoration pattern is used: services should depend on the abstract class
`AbstractTranslationConfigLoader`, and custom decorators can override methods like `load()` or the configuration path
while delegating to the original loader.

### TranslationConfig

The `TranslationConfig` (`src/Core/System/Snippet/Service/TranslationConfig.php`) is a data structure that holds the
configuration details loaded from the `translation.yaml` file.
You can require it via dependency injection and because of the usage of the `TranslationConfigLoader` with lazy loading,
the configuration is always available when needed.

[migration-guide]: ../../resources/references/upgrades/core/translation/language-pack-migration.md
[language-layer-docs]: TODO
