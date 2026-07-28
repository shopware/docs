---
nav:
  title: Extension points
  position: 60

---

# Extension points of the translation system

The translation system is made up of several cooperating parts, each with its own extension points:

* **Snippets** — the snippet files that ship with the platform and extensions, plus the database overrides
  managed in the Administration.
* **Built-in translation handling** — the [download system](built-in-translation-system.md) that fetches community
  translations from a repository.
* **Storefront snippet module** — the runtime that assembles the final set of strings for a request.

The right extension point depends on what you want to achieve. The table below lists them from the lightest
option to the most involved.

| Goal | Mechanism |
|------|-----------|
| Override individual translations, or ship them with an extension | [Snippets](#override-snippets-the-snippet-module) |
| Change the storefront snippets programmatically | [Storefront snippet module](#change-storefront-snippets-programmatically) |
| React when a language is installed or removed | [Translation events](#react-to-translation-events) |
| Automate installation and updates | [CLI commands and scheduled task](#automate-installation-and-updates) |
| Store downloaded translations somewhere other than the local disk | [Storage backend](#storage-backend-flysystem) |
| Point the download system at a different repository or language set | [Configure the download system](#configure-the-download-system) |
| Replace the loading or validation logic | [Service decoration](#service-decoration) |

## Override snippets (the snippet module)

The lightest way to change translations is the snippet system. It needs no download configuration and no PHP:

* **Edit individual strings** in the Administration under *Settings → Snippets*. These database overrides take
  precedence over everything else (see [Loading priority](built-in-translation-system.md#loading-priority)).
* **Ship snippet files with an extension.** Every bundle directory named `Resources/snippet` is scanned
  automatically — there is no service to register.

Storefront snippet files use the `<domain>.<locale>.json` naming, where `<domain>` is your own prefix (for
example `storefront.fr-FR.json`). The `messages` domain is reserved for language-defining base files
(`messages.<language>.base.json`) and must not be used for regular snippet files.

For the file layout, the country-agnostic base layer, and validation, follow:

<PageRef page="../../../guides/plugins/plugins/storefront/styling/add-translations" title="Add storefront translations" />

<PageRef page="../../../guides/plugins/plugins/administration/templates-styling/adding-snippets" title="Add Administration snippets" />

<PageRef page="./fallback-language-selection" title="Fallback language selection" />

## Change storefront snippets programmatically

Overriding snippets through the [snippet module](#override-snippets-the-snippet-module) above covers most needs.
For cases that need runtime logic — for example computing a value per sales channel — the storefront also
publishes a `StorefrontSnippetsExtension`
(`Shopware\Core\System\Snippet\Extension\StorefrontSnippetsExtension`, dispatched in
`SnippetService::getStorefrontSnippets()`). It uses the [extension event system](../../../guides/plugins/plugins/framework/extension/finding-extensions.md),
which dispatches a `pre` and a `post` event around the resolution. The current `locale`, `snippetSetId`,
`salesChannelId`, and `fallbackLocale` are available as public properties in both:

* Subscribe to `onPre()` to adjust the input `$extension->snippets` before the database overrides are
  applied — or call `$extension->stopPropagation()` and set `$extension->result` to replace the resolution
  entirely.
* Subscribe to `onPost()` to inspect or modify the fully resolved array in `$extension->result`.

```php
use Shopware\Core\System\Snippet\Extension\StorefrontSnippetsExtension;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class StorefrontSnippetSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            StorefrontSnippetsExtension::onPost() => 'afterSnippetsResolved',
        ];
    }

    public function afterSnippetsResolved(StorefrontSnippetsExtension $extension): void
    {
        if ($extension->locale === 'fr-FR') {
            // $extension->result holds the fully resolved snippet array
            $extension->result['header.search.placeholder'] = 'Rechercher…';
        }
    }
}
```

The extension exposes `snippets`, `locale`, `catalog`, `snippetSetId`, `fallbackLocale`, `salesChannelId`,
and `unusedThemes` as public properties, plus `result` for the resolved output. The class is `final` and
Shopware owns its constructor, so treat it as a read/mutate surface, not something to extend.

A related event, `SnippetsThemeResolveEvent`
(`Shopware\Core\System\Snippet\Event\SnippetsThemeResolveEvent`), lets you influence which themes are
considered used or unused when resolving storefront snippets for a sales channel.

## React to translation events

The download system dispatches two events you can subscribe to:

| Event                     | Dispatched                                                                                | Payload                     |
|---------------------------|-------------------------------------------------------------------------------------------|-----------------------------|
| `TranslationLoadedEvent`  | After a locale has been installed (`TranslationLoader::load()`)                           | `locale`, `Context`         |
| `TranslationRemovedEvent` | After a locale has been removed (`TranslationRemover`)                                     | `locale`                    |

Both live in `Shopware\Core\System\Snippet\Event`. Subscribe to them to trigger follow-up work such as cache
warming, notifications, or synchronising a downstream system when the set of installed languages changes.

Snippet database entities additionally dispatch the standard DAL entity lifecycle events collected in
`Shopware\Core\System\Snippet\SnippetEvents` (for example `SNIPPET_WRITTEN_EVENT`).

## Automate installation and updates

The download system can be driven entirely from the command line, which suits managing languages during
deployment or image builds. See the [built-in translation handling](built-in-translation-system.md#how-to-install-and-update-translations)
page for the `translation:install` and `translation:update` details:

| Command | Purpose |
|---------|---------|
| `translation:install` | Download and install translations for the given `--locales` or `--all` |
| `translation:update` | Update all installed translations from the repository |
| `translation:list` | List the locales configured for installation and update |
| `translation:lint-filenames` | Validate (and with `--fix` migrate) snippet file names |
| `snippet:validate` | Validate snippet files for missing or extraneous keys |

Updates also run automatically through the `UpdateTranslationsTask` scheduled task
(`Shopware\Core\System\Snippet\ScheduledTask`), so installations stay current without manual intervention.

## Storage backend (Flysystem)

Downloaded translations are written through the `shopware.filesystem.private` Flysystem adapter rather than
directly to disk, so you can keep them on the local file system or move them to a shared backend. See
[Built-in translation system and Flysystem](built-in-translation-system.md#built-in-translation-system-and-flysystem)
for the supported backends, and the [filesystem configuration guide](../../../guides/hosting/infrastructure/filesystem.md)
for adapter options.

## Configure the download system

The built-in translation handling reads its configuration from the shipped `translation.yaml`. A host or
extension can override any field from a standard Symfony configuration file in `config/packages` through the
`shopware.translation` section, without decorating any service. This is the entry point for changing the
repository URL, restricting the offered languages, or adding the plugins whose translations are downloaded.

For the syntax, the replace semantics of the list options, and the full field reference, see
[Configuration override](built-in-translation-system.md#configuration-override) and the
[field reference](built-in-translation-system.md#translation-configuration) on the built-in translation
handling page.

To distribute your own extension's translations through the download system, host them in a translation repository,
point `repository_url` at it, and add your plugin to the `plugins` list (plus a `plugin_mapping` entry if the
technical name differs from the name in the repository).

## Service decoration

To change behaviour that configuration and events do not cover, the loading and validation services can be
replaced through Shopware's [decoration pattern](../../../guides/plugins/plugins/services/adjusting-service.md).
Decorate the **service ID** in the first column and delegate to the injected inner instance.

| Service ID to decorate | Base type | Responsibility |
|------------------------|-----------|----------------|
| `Shopware\Core\System\Snippet\Service\AbstractTranslationConfigLoader` | abstract class, uses `getDecorated()` | Reads and validates the translation configuration into a `TranslationConfig` |
| `Shopware\Core\System\Snippet\Service\TranslationLoader` | extends `AbstractTranslationLoader`, uses `getDecorated()` | Downloads translation files for a locale and creates the language and snippet set |
| `Shopware\Core\System\Snippet\Files\SnippetFileLoader` | implements `SnippetFileLoaderInterface` | Discovers the snippet files shipped by bundles and apps |
| `Shopware\Core\System\Snippet\SnippetValidatorInterface` | interface | Validates snippet files for missing or superfluous keys |

The two abstract-class services use the `getDecorated()` convention: your decorator extends the abstract class
and returns the injected inner instance from `getDecorated()`. The interface-based services only require
implementing the interface and delegating to the inner instance.

Example — replacing the configuration loader (the
[configuration override](#configure-the-download-system) covers the same field values without a decorator):

```xml
<service id="MyPlugin\Service\CustomTranslationConfigLoader"
         decorates="Shopware\Core\System\Snippet\Service\AbstractTranslationConfigLoader">
    <argument type="service" id="MyPlugin\Service\CustomTranslationConfigLoader.inner"/>
</service>
```

Notes:

* The concrete `TranslationConfigLoader` is marked `@internal` and its `getDecorated()` throws a
  `DecorationPatternException`. Decorate the `AbstractTranslationConfigLoader` ID (an alias to the concrete
  service), never the concrete class.
* `TranslationLoader` is registered and consumed under its own concrete ID (there is no abstract alias), and
  its `getDecorated()` likewise throws. Decorate the `Shopware\Core\System\Snippet\Service\TranslationLoader`
  ID and return the injected inner instance from your override.
* `AbstractTranslationLoader::pluginTranslationExists()` is deprecated for removal in v6.8.0. Override
  `pluginTranslationExistsForLocale()` instead for locale-aware behaviour.

## What you cannot extend

* `TranslationConfigLoader` is `@internal` and refuses decoration of the concrete class — use the
  `AbstractTranslationConfigLoader` alias or the configuration override.
* `StorefrontSnippetsExtension` is `final`. Interact with it through its events and public properties, not by
  extending it.
