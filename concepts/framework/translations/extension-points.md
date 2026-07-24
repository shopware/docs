---
nav:
  title: Extension points
  position: 60

---

# Extension points of the translation system

Shopware's translation system is made up of several cooperating parts: the snippet files that
ship with the platform and extensions, the [built-in translation handling](built-in-translation-system.md)
that downloads community translations, and the storefront snippet resolution that assembles the final
set of strings for a request. Each part offers dedicated extension points, so the right one depends on
what you want to achieve.

Use the table below to jump to the mechanism that fits your use case. The entries are ordered from the
lightest option (configuration only) to the most invasive one (service decoration).

| Goal | Mechanism |
|------|-----------|
| Point the download system at a different repository or language set | [Configuration override](#configuration-override-shopware-translation) |
| Distribute translations for my extension | [Ship snippets with an extension](#ship-snippets-with-an-extension) |
| Change the resolved storefront snippets at runtime | [Storefront snippet extension](#storefront-snippet-resolution) |
| React when a language is installed or removed | [Translation events](#translation-events) |
| Store downloaded translations somewhere other than the local disk | [Storage backend](#storage-backend-flysystem) |
| Replace the loading or validation logic entirely | [Service decoration](#service-decoration) |
| Automate installation and updates | [CLI commands and scheduled task](#cli-commands-and-scheduled-task) |

## Configuration override (`shopware.translation`)

The preferred and code-free way to influence the [built-in translation handling](built-in-translation-system.md)
is the `shopware.translation` configuration section. It lets a host or extension override any field of the
shipped `translation.yaml` from a standard Symfony configuration file in `config/packages`, without decorating
any service.

```yaml
# config/packages/translation.yaml
shopware:
    translation:
        # change where translations are fetched from
        repository_url: 'https://raw.githubusercontent.com/my-org/translations/main/translations'
        metadata_url: 'https://raw.githubusercontent.com/my-org/translations/main/crowdin-metadata.json'
        # add a plugin so its translations are downloaded alongside Shopware's
        plugins:
            - 'SwagCommercial'
            - 'MyCustomPlugin'
        # map an internal plugin name to its name in the translation repository
        plugin_mapping:
            - plugin: 'MyCustomPlugin'
              name: 'CustomPluginTranslations'
        # restrict the offered languages
        languages:
            - name: 'Français'
              locale: 'fr-FR'
```

Key points:

* Any option you leave unset falls back to the value shipped in `translation.yaml`.
* The list options (`plugins`, `excluded_locales`, `plugin_mapping`, `languages`) **replace** the shipped
  default rather than merging into it. Provide the complete list you want, or an empty list (`[]`) to clear
  the default entirely.
* Configuration keys use `snake_case` (for example `repository_url`), whereas the shipped `translation.yaml`
  uses dash-separated keys (`repository-url`). Both describe the same fields.

See the [field reference](built-in-translation-system.md#translation-configuration) for the meaning of every
field. For scenarios that configuration cannot express, fall back to [service decoration](#service-decoration).

## Ship snippets with an extension

### Snippet files

Plugins, apps, and themes ship their own translations as JSON snippet files. Every bundle directory named
`Resources/snippet` is scanned automatically — there is no service to register. Storefront files follow the
`<domain>.<locale>.json` naming (for example `storefront.fr-FR.json`), and language-defining base files use
`messages.<language>.base.json`.

For the file layout, the country-agnostic base layer, and validation, follow:

<PageRef page="../../../guides/plugins/plugins/storefront/styling/add-translations" title="Add storefront translations" />

<PageRef page="./fallback-language-selection" title="Fallback language selection" />

### Distributing translations through the built-in system

The built-in download system can also fetch translations for extensions from the
[shopware/translations](https://github.com/shopware/translations) repository. To have your plugin's
translations distributed this way:

1. Contribute your plugin's translations to the `shopware/translations` repository.
2. Add the plugin's technical name to the `plugins` list — either via the
   [configuration override](#configuration-override-shopware-translation) for a single installation, or by
   contributing it to the shipped `translation.yaml`.
3. If the plugin's technical name differs from its name in the repository, add a `plugin_mapping` entry.

## Storefront snippet resolution

When the storefront assembles the snippets for a request, it publishes a `StorefrontSnippetsExtension`
(`Shopware\Core\System\Snippet\Extension\StorefrontSnippetsExtension`, dispatched in
`SnippetService::getStorefrontSnippets()`). This uses the [extension event system](../../../guides/plugins/plugins/framework/extension/finding-extensions.md),
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

## Translation events

The download system dispatches two events you can subscribe to:

| Event                     | Dispatched                                                                                | Payload                     |
|---------------------------|-------------------------------------------------------------------------------------------|-----------------------------|
| `TranslationLoadedEvent`  | After a locale has been installed (`TranslationLoader::load()`)                           | `locale`, `Context`         |
| `TranslationRemovedEvent` | After a locale has been removed (`TranslationRemover`)                                     | `locale`                    |

Both live in `Shopware\Core\System\Snippet\Event`. Subscribe to them to trigger follow-up work such as cache
warming, notifications, or synchronising a downstream system when the set of installed languages changes.

Snippet database entities additionally dispatch the standard DAL entity lifecycle events collected in
`Shopware\Core\System\Snippet\SnippetEvents` (for example `SNIPPET_WRITTEN_EVENT`).

## Storage backend (Flysystem)

Downloaded translations are written through the `shopware.filesystem.private` Flysystem adapter rather than
directly to disk. By configuring that adapter you can keep translations on the local file system (the default)
or move them to a shared backend such as Amazon S3, Google Cloud Storage, or Azure Blob Storage — useful when
several application nodes must share the same installed translations. See the
[filesystem configuration guide](../../../guides/hosting/infrastructure/filesystem.md) for adapter options.

## Service decoration

When configuration and events are not enough, the loading and validation services can be replaced through
Shopware's [decoration pattern](../../../guides/plugins/plugins/services/adjusting-service.md). Decorate the
**service id** in the first column and delegate to the injected inner instance.

| Service id to decorate | Base type | Responsibility |
|------------------------|-----------|----------------|
| `Shopware\Core\System\Snippet\Service\AbstractTranslationConfigLoader` | abstract class, uses `getDecorated()` | Reads and validates the translation configuration into a `TranslationConfig` |
| `Shopware\Core\System\Snippet\Service\TranslationLoader` | extends `AbstractTranslationLoader`, uses `getDecorated()` | Downloads translation files for a locale and creates the language and snippet set |
| `Shopware\Core\System\Snippet\Files\SnippetFileLoader` | implements `SnippetFileLoaderInterface` | Discovers the snippet files shipped by bundles and apps |
| `Shopware\Core\System\Snippet\SnippetValidatorInterface` | interface | Validates snippet files for missing or superfluous keys |

The two abstract-class services use the `getDecorated()` convention: your decorator extends the abstract class
and returns the injected inner instance from `getDecorated()`. The interface-based services only require
implementing the interface and delegating to the inner instance.

Example — replacing the configuration loader (prefer the
[configuration override](#configuration-override-shopware-translation) unless you need runtime logic):

```xml
<service id="MyPlugin\Service\CustomTranslationConfigLoader"
         decorates="Shopware\Core\System\Snippet\Service\AbstractTranslationConfigLoader">
    <argument type="service" id="MyPlugin\Service\CustomTranslationConfigLoader.inner"/>
</service>
```

Notes:

* The concrete `TranslationConfigLoader` is marked `@internal` and its `getDecorated()` throws a
  `DecorationPatternException`. Decorate the `AbstractTranslationConfigLoader` id (an alias to the concrete
  service), never the concrete class.
* `TranslationLoader` is registered and consumed under its own concrete id (there is no abstract alias), and
  its `getDecorated()` likewise throws. Decorate the `Shopware\Core\System\Snippet\Service\TranslationLoader`
  id and return the injected inner instance from your override.
* `AbstractTranslationLoader::pluginTranslationExists()` is deprecated for removal in v6.8.0. Override
  `pluginTranslationExistsForLocale()` instead for locale-aware behaviour.

## CLI commands and scheduled task

The download system can be driven entirely from the command line, which is the recommended way to manage
languages during deployment or image builds:

| Command | Purpose |
|---------|---------|
| `translation:install` | Download and install translations for the given `--locales` or `--all` |
| `translation:update` | Update all installed translations from the repository |
| `translation:list` | List the locales configured for installation and update |
| `translation:lint-filenames` | Validate (and with `--fix` migrate) snippet file names |
| `snippet:validate` | Validate snippet files for missing or extraneous keys |

Updates also run automatically through the `UpdateTranslationsTask` scheduled task
(`Shopware\Core\System\Snippet\ScheduledTask`), so installations stay current without manual intervention.

## What you cannot extend

* `TranslationConfigLoader` is `@internal` and refuses decoration of the concrete class — use the
  `AbstractTranslationConfigLoader` alias or the configuration override.
* `StorefrontSnippetsExtension` is `final`; interact with it through its events and public properties, not by
  extending it.
