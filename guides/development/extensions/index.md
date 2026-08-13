---
nav:
  title: Extensions
  position: 10

---

# Extensions

As a Shopware developer, your primary focus is on developing extensions that enhance or modify Shopware's functionality.

Shopware offers two extension types:

- **Plugins**: full system access (self-hosted only)
- **Apps**: API-based, cloud-compatible

Plugins and apps are installed and activated for the whole Shopware instance.

:::info
Before choosing an extension type, review the recommended [Code structure](code-structure.md) to proactively reduce upgrade friction and prevent long-term maintenance issues.
:::

A storefront theme is *not* a distinct extension type, but a stripped-down plugin consisting of a customized storefront UI. In Cloud environments, storefront themes are delivered via apps.

## Monetization

To sell an extension or offer paid features, see the [Monetization guide](../../development/monetization/index.md) for available models such as paid extensions, In-App Purchases, and commission-based integrations.

## Which type to build?

This comparison table helps you decide which Shopware extension type best fits your use case.

| Task                                    | Plugin (incl. Theme) | App | Remarks                                                                                                             |
|:----------------------------------------|:---------------------|:----|:--------------------------------------------------------------------------------------------------------------------|
| Change Storefront appearance            | ✅                    | ✅   | Themes are storefront-focused plugins. In Cloud, themes are delivered via Apps.                                     |
| Add admin modules                       | ✅                    | ✅   | Themes do not add admin modules.                                                                                    |
| Execute webhooks                        | ✅                    | ✅   | Apps are webhook-first. Plugins can also call external services.                                                    |
| Add custom entities                     | ✅                    | ✅   | —                                                                                                                   |
| Modify database structure               | ✅                    | ❌   | Apps cannot modify the database schema.                                                                             |
| Integrate payment providers             | ✅                    | ✅   | —                                                                                                                   |
| Publish in the Shopware Store           | ✅                    | ✅   | —                                                                                                                   |
| Install in Shopware 6 Cloud shops       | ❌                    | ✅   | Plugins (including theme plugins) cannot run in Cloud.                                                              |
| Install in Shopware 6 self-hosted shops | ✅                    | ✅   | Since Shopware 6.4.0.0, apps can be installed and used in self-hosted shops.                                        |
| Add custom logic/routes/commands        | ✅                    | ⚠️  | Apps implement logic externally via services and webhooks; they cannot add internal Symfony routes or CLI commands. |
| Control style/template inheritance      | ✅                    | ✅   | This capability is specific to theme plugins.                                                                       |

:::info Version compatibility
Extensions must explicitly support target Shopware versions. Review the [Upgrades and Migrations](../../upgrades-migrations/index.md) section before releasing updates to ensure compatibility with upcoming core changes.
:::

## Common extension workflows

Use these entry points for common development and maintenance tasks:

- **Create a plugin**: Start with the [Plugin base guide](../../plugins/plugins/plugin-base-guide.md). If you use PHPStorm, the [Shopware 6 Toolbox](../tooling/shopware-toolbox.md) can generate plugins and common extension components directly from the IDE.
- **Validate one extension**: Use [`extension validate`](../../../products/tools/cli/validation.md#validating-an-extension) during development and against the packaged ZIP before a Store upload.
- **Validate extensions assembled in a project**: Use [`project validate`](../../../products/tools/cli/validation.md#scanning-a-project) to discover and validate the extensions and configured bundles in a Shopware project.
- **Manage a Store listing as code**: Keep Store metadata and images in Git with [`extension info pull` and `extension info push`](../../../products/tools/cli/shopware-account-commands/updating-store-page.md).
- **Release to the Shopware Store**: Follow the [Store release workflow](../../../products/tools/cli/shopware-account-commands/releasing-extension-to-shopware-store.md) to validate the release artifact, upload it, and understand which review stages still happen in the Store.
- **Design for upgrades**: Review [Code structure](code-structure.md) and [Upgrades and Migrations](../../upgrades-migrations/index.md) before introducing new cross-extension dependencies or compatibility constraints.

## MCP Server extensibility

Both plugins and apps can contribute custom tools, prompts, and resources to Shopware's built-in [MCP Server](../../../products/tools/mcp-server/index.md). This lets AI clients access your extension's capabilities alongside core platform tools.

- [Extend the MCP Server via Plugin](../../plugins/plugins/mcp-server.md)
- [Extend the MCP Server via App](../../plugins/apps/mcp-server.md)

## Extension guides

These guides provide essential information on how to create, configure, and extend your store with Shopware extensions:

<PageRef page="../../../guides/plugins/plugins/plugin-base-guide" />

<PageRef page="../../../guides/plugins/apps/app-base-guide" />

<PageRef page="../../../guides/plugins/themes/theme-base-guide" />
