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
Before choosing an extension type, review the recommended [code structure](code-structure.md) to proactively reduce upgrade friction and prevent long-term maintenance issues.
:::

A storefront theme is *not* a distinct extension type, but a stripped-down plugin consisting of a customized storefront UI. In Cloud environments, storefront themes are delivered via apps.

## Monetization

To sell an extension or offer paid features, see the [Monetization guide](../../development/monetization/index.md) for available models such as paid extensions, In-App Purchases, and commission-based integrations.

## Which type to build?

This comparison table helps you decide which Shopware extension type best fits your use case.

| Task                                    | Plugin (incl. Theme) | App  | Remarks                                                                                                             |
| :-------------------------------------- | :------------------- | :--- | :------------------------------------------------------------------------------------------------------------------ |
| Change Storefront appearance            | ✅                   | ✅   | Themes are storefront-focused plugins. In Cloud, themes are delivered via Apps.                                     |
| Add admin modules                       | ✅                   | ✅   | Themes do not add admin modules.                                                                                    |
| Execute webhooks                        | ✅                   | ✅   | Apps are webhook-first. Plugins can also call external services.                                                    |
| Add custom entities                     | ✅                   | ✅   | —                                                                                                                   |
| Modify database structure               | ✅                   | ❌   | Apps cannot modify the database schema.                                                                             |
| Integrate payment providers             | ✅                   | ✅   | —                                                                                                                   |
| Publish in the Shopware Store           | ✅                   | ✅   | —                                                                                                                   |
| Install in Shopware 6 Cloud shops       | ❌                   | ✅   | Plugins (including theme plugins) cannot run in Cloud.                                                              |
| Install in Shopware 6 self-hosted shops | ✅                   | ✅   | Since Shopware 6.4.0.0, apps can be installed and used in self-hosted shops.                                        |
| Add custom logic/routes/commands        | ✅                   | ⚠️   | Apps implement logic externally via services and webhooks; they cannot add internal Symfony routes or CLI commands. |
| Control style/template inheritance      | ✅                   | ✅   | This capability is specific to theme plugins.                                                                       |

:::info Version compatibility
Extensions must explicitly support target Shopware versions. Review the [Upgrades and Migrations](../../upgrades-migrations/index.md) section before releasing updates to ensure compatibility with upcoming core changes.
:::

## Common extension workflows

Use these entry points for common development and maintenance tasks:

- **Create a plugin**: Start with the [Plugin base guide](../../plugins/plugins/plugin-base-guide.md). If you use PHPStorm, the [Shopware 6 Toolbox](../tooling/shopware-toolbox.md) can generate plugins and common extension components directly from the IDE.
- **Validate one extension**: Use [`extension validate`](../../../products/tools/cli/validation.md#validating-an-extension) during development and against the packaged zip before a Store upload.
- **Validate extensions assembled in a project**: Use [`project validate`](../../../products/tools/cli/validation.md#scanning-a-project) to discover and validate the extensions and configured bundles in a Shopware project.
- **Manage a Store listing as code**: Keep Store metadata and images in Git with [`extension info pull` and `extension info push`](../../../products/tools/cli/shopware-account-commands/updating-store-page.md).
- **Release to the Shopware Store**: Follow the [Store release workflow](../../../products/tools/cli/shopware-account-commands/releasing-extension-to-shopware-store.md) to validate the release artifact, upload it, and understand which review stages still happen in the Store.
- **Design for upgrades**: Review the [Code Structure](code-structure.md) and [Upgrades and Migrations](../../upgrades-migrations/index.md) guides before introducing new cross-extension dependencies or compatibility constraints.
- **Use stable extension points**: Prefer documented events, hooks, DAL extension points, decorators, app actions, and standard Symfony service configuration over depending on Shopware core implementation details such as internal framework classes or core compiler passes.

## Dependency injection best practices

When wiring your extension, use native Symfony dependency injection features in your own extension instead of relying on Shopware core compiler-pass classes.

Recommended approaches include:

- define services in `services.xml` or `services.yaml`
- use `tags` for Symfony- or Shopware-documented extension points
- use constructor injection
- use service decoration where explicitly supported
- create compiler passes only for your own plugin when you need to transform your own container configuration

### Example: register and tag a service

```xml
<!-- src/Resources/config/services.xml -->
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services">
    <services>
        <service id="Swag\Example\Service\ExampleHandler">
            <tag name="shopware.event_subscriber" />
        </service>
    </services>
</container>
```

### Example: use constructor injection

```php
<?php declare(strict_types=1);

namespace Swag\Example\Service;

use Psr\Log\LoggerInterface;

class ExampleService
{
    public function __construct(
        private readonly LoggerInterface $logger
    ) {
    }

    public function run(): void
    {
        $this->logger->info('Example service executed');
    }
}
```

### Example: decorate a Shopware service

Use decoration only where replacing or extending a service is a documented customization pattern.

```xml
<service id="Swag\Example\Core\Content\Product\SalesChannel\Listing\ExampleRouteDecorator"
         decorates="Shopware\Core\Content\Product\SalesChannel\Listing\ProductListingRoute">
    <argument type="service" id="Swag\Example\Core\Content\Product\SalesChannel\Listing\ExampleRouteDecorator.inner" />
</service>
```

### Avoid coupling to core compiler passes

Do not subclass, reference, or depend on Shopware core compiler-pass implementations. Treat them as framework internals.

Instead of reusing a core compiler pass:

1. identify the actual extension point you need
2. register your own service or tag
3. decorate the target service if decoration is supported
4. add your own compiler pass only for processing services defined by your extension

This keeps your extension portable across Shopware updates and avoids coupling to non-public container internals.

## MCP Server extensibility

Both plugins and apps can contribute custom tools, prompts, and resources to Shopware's built-in [MCP Server](../../../products/tools/mcp-server/index.md). This lets AI clients access your extension's capabilities alongside core platform tools.

- [Extend the MCP Server via Plugin](../../plugins/plugins/mcp-server.md)
- [Extend the MCP Server via App](../../plugins/apps/mcp-server.md)

## Extension guides

These guides provide essential information on how to create, configure, and extend your store with Shopware extensions:

<PageRef page="../../../guides/plugins/plugins/plugin-base-guide" />

<PageRef page="../../../guides/plugins/apps/app-base-guide" />

<PageRef page="../../../guides/plugins/themes/theme-base-guide" />