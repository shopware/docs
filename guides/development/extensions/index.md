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

## Build extensions that are safe to upgrade

When your extension must work across Shopware major upgrades, validate it against the target runtime and check for assumptions in request handling and locale-sensitive output.

### 1. Test against the target runtime stack

Before you declare compatibility for a new Shopware major version, run your extension test suite and static analysis on the same stack that the target Shopware version expects:

- supported PHP version
- supported MySQL or MariaDB version
- supported Symfony and Twig ecosystem versions

This is especially important for extensions that:

- decorate Symfony services
- use Symfony request objects directly
- render custom Twig templates
- depend on third-party Symfony bundles or Twig extensions

### 2. Read request data from the correct request bag

If your plugin reads values from a Symfony `Request`, access the correct source explicitly instead of relying on mixed lookup behavior.

Use:

- `$request->query` for query string parameters
- `$request->request` for submitted form data
- `$request->attributes` for route and framework attributes

#### Example: read from query parameters

```php
use Symfony\Component\HttpFoundation\Request;

public function load(Request $request): void
{
    $page = $request->query->getInt('page', 1);
    $sort = $request->query->get('sort');
}
```

#### Example: read from submitted form data

```php
use Symfony\Component\HttpFoundation\Request;

public function submit(Request $request): void
{
    $productId = $request->request->get('productId');
    $quantity = $request->request->getInt('quantity', 1);
}
```

#### Example: read route attributes separately

```php
use Symfony\Component\HttpFoundation\Request;

public function detail(Request $request): void
{
    $productId = $request->attributes->get('productId');
}
```

Do not assume that a helper or generic getter will read all of these sources in the same order. If your logic depends on where a value comes from, always choose the bag explicitly.

### 3. Audit helper-based request access

If your extension uses helper methods such as `RequestParamHelper::get()`, review every call site and verify which input source is intended:

- query string
- form submission
- route attributes

Refactor ambiguous code to explicit bag access where possible.

#### Prefer explicit access over mixed helper lookups

```php
// Avoid ambiguous lookup when only query parameters are valid
$search = $request->query->get('search');
```

```php
// Avoid ambiguous lookup when only posted form data is valid
$csrfToken = $request->request->get('_csrf_token');
```

```php
// Route data should be read from attributes
$orderId = $request->attributes->get('orderId');
```

This makes controller behavior predictable and avoids regressions during major upgrades.

### 4. Verify locale-sensitive behavior

If your extension formats, parses, or validates localized values, test it with the exact locales you support.

Typical areas to check:

- number and currency formatting
- date and time formatting
- translated snippets with locale-specific placeholders
- import/export formats
- custom form validation with localized input

Prepare automated tests or manual QA cases for your supported locales before you publish compatibility for a major upgrade.

### 5. Revalidate packaged artifacts before release

After adapting your extension for a target Shopware version:

1. run your unit, integration, and storefront/admin tests
2. validate the extension in the project context
3. validate the packaged zip you intend to release
4. test installation, update, activation, and deactivation on a clean Shopware instance

## MCP Server extensibility

Both plugins and apps can contribute custom tools, prompts, and resources to Shopware's built-in [MCP Server](../../../products/tools/mcp-server/index.md). This lets AI clients access your extension's capabilities alongside core platform tools.

- [Extend the MCP Server via Plugin](../../plugins/plugins/mcp-server.md)
- [Extend the MCP Server via App](../../plugins/apps/mcp-server.md)

## Extension guides

These guides provide essential information on how to create, configure, and extend your store with Shopware extensions:

<PageRef page="../../../guides/plugins/plugins/plugin-base-guide" />

<PageRef page="../../../guides/plugins/apps/app-base-guide" />

<PageRef page="../../../guides/plugins/themes/theme-base-guide" />