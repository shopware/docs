---
nav:
  title: Agentic Files
  position: 15

---

# Agentic Files

Agentic files are public sales-channel files that help AI assistants understand
how they should interact with a shop.

Shopware ships the `agentic` file family with these default files:

* [`/llms.txt`](https://llmstxt.org/): A concise entry point to public
  sales-channel resources.
* [`/agents.md`](https://agents.md/): Guidance for AI agents interacting with
  the shop.
* [`/.well-known/ai-catalog.json`](https://agenticresourcediscovery.org/spec/):
  An Agentic Resource Discovery catalog for machine-readable resources, such as
  available MCP servers.

The files are generated from Twig templates and can be enabled per sales
channel in the Administration. Merchants can also add custom notes or override
individual content sources from the sales-channel detail page.

::: info
The core agentic files feature is available since Shopware 6.7.12.0. Older
Shopware versions can serve compatible `/llms.txt`, `/agents.md`, and
`/.well-known/ai-catalog.json` files through the Agentic Commerce plugin
fallback. See
[Agentic Commerce plugin compatibility](#agentic-commerce-plugin-compatibility)
for details.
:::

## Public paths

Templates are registered below `Resources/views/files/<file-family>/`.
Shopware derives the public path by removing the `files/<file-family>/` prefix and the `.twig` suffix.
The following table shows example mappings from template paths to public paths.

| Template path                                    | Public path                    |
|--------------------------------------------------|--------------------------------|
| `files/agentic/llms.txt.twig`                    | `/llms.txt`                    |
| `files/agentic/agents.md.twig`                   | `/agents.md`                   |
| `files/agentic/.well-known/ai-catalog.json.twig` | `/.well-known/ai-catalog.json` |

Files are served only for sales channels where the file is enabled. Disabled
files and unknown files behave like regular 404 responses.

## Extend default files

Plugins, apps, and themes can contribute to existing agentic files by shipping
templates at the same path. Use `sw_extends` with the unqualified template path
so the normal Shopware Twig inheritance chain can resolve the next template in
both core and compatibility modes.

When you use one of the dedicated extension blocks, always render
<code v-pre>{{ parent() }}</code>. This keeps multi inheritance intact when
several extensions contribute content to the same file.

::: code-group

```twig [PLUGIN_ROOT/src/Resources/views/files/agentic/llms.txt.twig]
{% sw_extends 'files/agentic/llms.txt.twig' %}

{% block agentic_llms_extensions %}
    {{ parent() }}

    ## My integration

    - [Integration profile](/.well-known/my-integration): Machine-readable
      capabilities for this sales channel.
{% endblock %}
```

```twig [PLUGIN_ROOT/src/Resources/views/files/agentic/agents.md.twig]
{% sw_extends 'files/agentic/agents.md.twig' %}

{% block agentic_agents_extensions %}
    {{ parent() }}

    ## My integration

    - Only use this integration when it is explicitly available for this sales
      channel.
    - Follow the user's explicit intent before performing state-changing
      actions.
{% endblock %}
```

```twig [PLUGIN_ROOT/src/Resources/views/files/agentic/.well-known/ai-catalog.json.twig]
{% sw_extends 'files/agentic/.well-known/ai-catalog.json.twig' %}

{% block agentic_ai_catalog_entries %}
    {% set entries = entries|merge([{
        identifier: 'urn:ai:example.com:resource:my-integration',
        displayName: 'My integration',
        type: 'application/json',
        url: '/.well-known/my-integration',
        description: 'Machine-readable capabilities for this sales channel.',
        tags: ['integration'],
    }]) %}

    {{ parent() }}
{% endblock %}
```

:::

Prefer the dedicated extension blocks for additive content:

* `agentic_llms_extensions`
* `agentic_agents_extensions`
* `agentic_ai_catalog_entries`

## Add custom files

Extensions can also add new files by shipping new templates below
`Resources/views/files/<file-family>/`.

For example, a plugin can add `/my-integration.md` with this template path:

```text
PLUGIN_ROOT/src/Resources/views/files/agentic/my-integration.md.twig
```

Use the `agentic` file family when your file belongs to the public AI and agent
guidance surface. Use another file family only when the feature owns a separate
file group and matching Administration support.

Custom files should expose a `user_provided_content` block near the end of the
template. This allows the Administration to offer merchant custom notes without
requiring merchants to replace the whole template.

```twig
{% block my_integration_md %}
    # My integration

    This file explains how AI agents can use the custom public resource.

    {% block user_provided_content %}{% endblock %}
{% endblock %}
```

## Template variables

The following table lists the variables that agentic file templates receive.

| Variable                  | Description                                                                                                                          |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `context`                 | The current sales-channel context                                                                                                    |
| `salesChannel`            | The sales channel, including languages and currencies needed by the default templates                                                |
| `salesChannelFile`        | Read-only metadata for the rendered file, such as file family, file name, template path, content type, and resolved template sources |
| `salesChannelFileContext` | Additional array context for file-specific data, such as base URL and publisher for `/.well-known/ai-catalog.json`                   |

Use normal Twig functions such as `path()` and `seoUrl()` to build links.

To add file-specific template context, subscribe to
`SalesChannelFileRenderParametersExtension::onPost()`:

```php
use Shopware\Core\System\SalesChannel\File\Discovery\SalesChannelFile;
use Shopware\Core\System\SalesChannel\File\Rendering\Extension\SalesChannelFileRenderParametersExtension;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class MyAgenticFileSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            SalesChannelFileRenderParametersExtension::onPost() => 'addContext',
        ];
    }

    public function addContext(SalesChannelFileRenderParametersExtension $extension): void
    {
        if ($extension->file->fileFamily !== SalesChannelFile::DEFAULT_FILE_FAMILY
            || $extension->file->fileName !== '.well-known/ai-catalog.json'
            || !\is_array($extension->result)
        ) {
            return;
        }

        $context = $extension->result['salesChannelFileContext'] ?? [];
        $context = \is_array($context) ? $context : [];
        $context['myIntegrationUrl'] = '/.well-known/my-integration';

        $extension->result['salesChannelFileContext'] = $context;
    }
}
```

## Add Administration descriptions

The Administration can show a description for discovered files. Add snippets
with the predefined key pattern:

```json [PLUGIN_ROOT/src/Resources/app/administration/src/module/my-module/snippet/en-GB.json]
{
  "sw-sales-channel": {
    "detail": {
      "agenticFiles": {
        "descriptions": {
          "agentic": {
            "my-file.txt": "Explains how AI agents should use the custom public resource."
          }
        }
      }
    }
  }
}
```

If no snippet exists, the description stays empty.

## Agentic Commerce plugin compatibility

The [Agentic Commerce plugin](https://store.shopware.com/de/swag705756117823f/agentic-commerce-beta.html) is compatible with shops that already provide the
core agentic files feature and with older Shopware versions that do not.

When the core feature is available:

* Core handles discovery, Administration enablement, rendering, cache
  invalidation, and public serving.
* The plugin only contributes UCP sections through the templates
  `files/agentic/llms.txt.twig`, `files/agentic/agents.md.twig`, and
  `files/agentic/.well-known/ai-catalog.json.twig`.
* When UCP is activated for a sales channel, the plugin automatically enables
  `/llms.txt`, `/agents.md`, and `/.well-known/ai-catalog.json` for that sales
  channel.
* After a shop is upgraded to a Shopware version with the core feature, the
  plugin enables the files for sales channels that already have UCP configured.

When the core feature is not available:

* The plugin provides fallback routes for `GET /llms.txt`, `GET /agents.md`,
  and `GET /.well-known/ai-catalog.json`.
* Fallback files are served only for sales channels where UCP is active.
* The fallback mode does not backport the core Administration file-management UI,
  merchant template overrides, discovery API, or cache tagging.
* Third-party templates should still use unqualified `sw_extends`, for example
  `{% sw_extends 'files/agentic/llms.txt.twig' %}`. The same template then works
  when the shop later switches from plugin fallback mode to the core feature.

After an upgrade, clear the cache and rebuild the Storefront or Administration
assets as usual. The plugin then switches from fallback serving to
template-extension-only mode.
