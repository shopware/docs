---
nav:
  title: Add translations for apps
  position: 30
---

# Adding translations for apps

Adding snippets to the administration works the same way for plugins and apps. The only difference is the file structure and that apps are not allowed to override existing snippet keys. The only thing to do, therefore, is to create new files in the following directory: `<app root>/Resources/app/administration/snippet`
Additionally, you need JSON file for each language you want to support, using its specific language locale, e.g. `de-DE.json`, `en-GB.json`. For more details on selecting a fallback language and structuring your snippet files, see the [Fallback Languages guide](/concepts/translations/fallback-language-selection.md).

Since everything else works the same, please refer to our [Adding translations for plugins](../../plugins/administration/templates-styling/adding-snippets) guide for more information.
