---
nav:
  title: MCP Server Extension
  position: 80

---

# Extending the MCP Server via Plugin

Shopware plugins and Symfony bundles can add custom tools, prompts, and resources to the MCP server. This guide covers the plugin path: in-process PHP with full DAL access and the Shopware plugin lifecycle.

Use a plugin when:

- Your tool needs deep access to DAL repositories, services, or the Symfony container
- You want to ship via the Shopware Marketplace
- Your capability is tightly coupled to Shopware's plugin lifecycle (install, activate, deactivate)

For remote/webhook-based capabilities, see [Extending via App](../apps/mcp-server.md). For a general overview of the three extension types, see the [MCP Server index](../../development/tooling/mcp-server/index.md#architecture).

## Naming convention

All capability names must only contain `a-zA-Z0-9_-` (no dots). Use a hyphen-separated vendor prefix to avoid conflicts:

- **Core:** `shopware-{name}` (reserved; do not use in extensions)
- **Plugin / Bundle:** `{vendor-name}-{tool-name}` (e.g., `swag-erp-sync-orders`)
- **App:** `{app-name}-{tool-name}` (auto-prefixed)

This convention applies uniformly to tools, prompts, and resources.

## Plugin structure

```text
custom/plugins/SwagMyPlugin/
├── composer.json
└── src/
    ├── SwagMyPlugin.php              # Plugin class
    ├── Mcp/
    │   └── Tool/
    │       └── MyTool.php            # MCP tool class
    └── Resources/
        └── config/
            └── services.xml          # Service registration
```

## Step 1: Create the tool class

The `#[McpTool]` attribute must be on the **class**, not on `__invoke()`. Extend `McpToolResponse` to get consistent response envelopes and built-in helpers.

```php
<?php declare(strict_types=1);

namespace Swag\MyPlugin\Mcp\Tool;

use Mcp\Capability\Attribute\McpTool;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Mcp\Attribute\McpToolDependsOn;
use Shopware\Core\Framework\Mcp\Attribute\McpToolRequires;
use Shopware\Core\Framework\Mcp\Tool\McpToolResponse;

#[McpTool(name: 'swag-my-plugin-orders', description: 'List recent orders for a given customer email.')]
#[McpToolDependsOn('shopware-entity-schema')]
#[McpToolRequires('order:read')]
class MyTool extends McpToolResponse
{
    public function __construct(
        private readonly EntityRepository $orderRepository,
    ) {
    }

    public function __invoke(string $email, int $limit = 10, Context $context = new Context()): string
    {
        $this->requirePrivilege($context, 'order:read');

        $criteria = new Criteria();
        $criteria->addFilter(/* ... */);
        $criteria->setLimit($limit);

        $orders = $this->orderRepository->search($criteria, $context);

        return $this->success(
            $orders->map(fn($o) => ['id' => $o->getId(), 'orderNumber' => $o->getOrderNumber()]),
            ['total' => $orders->getTotal()]
        );
    }
}
```

**Key rules:**

- `#[McpTool]` goes on the class, not on `__invoke()`. The compiler pass reads class-level attributes; method-level attributes are silently ignored.
- Names must only contain `a-zA-Z0-9_-`.
- Parameter types on `__invoke()` are mapped to JSON schema. Supported: `string`, `int`, `float`, `bool`. Default values make parameters optional. `Context` is injected by the framework and is not exposed as an agent parameter.
- Always call `$this->requirePrivilege($context, '...')` at the top of `__invoke()`. `#[McpToolRequires]` is declarative only; without `requirePrivilege()` there is no runtime enforcement.
- Never use `Context::createDefaultContext()` inside a tool. It bypasses the integration's ACL. Use the injected `$context` instead.
- Return a `string` from `__invoke()`. The MCP SDK wraps the return value into the protocol response automatically.
- Extend `McpToolResponse` to use `$this->success()` and `$this->error()` helpers.

## Step 2: Declare dependencies and privileges

### Tool dependencies

When your tool only makes sense after the agent has used another tool, declare that relationship with `#[McpToolDependsOn]`:

```php
#[McpToolDependsOn('shopware-entity-schema')]   // agent should know the schema first
#[McpToolDependsOn('shopware-entity-search')]    // and be able to search
```

The attribute is repeatable. When an operator enables your tool in the Admin UI, all declared dependencies (and their transitive dependencies) are automatically added to the integration's allowlist.

Only declare a dependency when it is genuinely required; unnecessary dependencies inflate every integration's allowlist.

### Required privileges

Declare the ACL privileges your tool needs with `#[McpToolRequires]` so operators can configure roles correctly:

```php
// Static privilege
#[McpToolRequires('order:read')]

// Dynamic privilege (entity name comes from a runtime parameter)
#[McpToolRequires(entityParam: 'entity', operations: ['read', 'update'])]
```

The attribute is **declarative only**: it populates the Admin UI coverage warnings and `bin/console debug:mcp` output. You still must call `$this->requirePrivilege($context, 'order:read')` inside `__invoke()` for actual runtime enforcement.

## Step 3: Register the service

In `src/Resources/config/services.xml`, tag the service with `shopware.mcp.tool`:

```xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services
               http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\MyPlugin\Mcp\Tool\MyTool">
            <argument type="service" id="order.repository"/>
            <tag name="shopware.mcp.tool"/>
        </service>
    </services>
</container>
```

Plugin tools use `shopware.mcp.tool` (not `mcp.tool`). The `McpToolCompilerPass` remaps this tag to `mcp.tool` at compile time and registers the tool with the MCP server builder. You do not need a `shopware.feature` flag tag; the MCP feature flag gates the server endpoint itself, and once it is enabled, all registered tools are available.

### Available tags

| Shopware tag | Purpose |
|---|---|
| `shopware.mcp.tool` | Register a tool |
| `shopware.mcp.prompt` | Register a prompt |
| `shopware.mcp.resource` | Register a resource |

## Step 4: Install and verify

```bash
bin/console plugin:refresh
bin/console plugin:install --activate SwagMyPlugin
bin/console cache:clear
```

Verify the tool is registered:

```bash
bin/console debug:mcp
```

If the tool appears here, it is available in the live HTTP endpoint. If it does not appear, check:

- Plugin is installed and active
- Service has `<tag name="shopware.mcp.tool"/>`
- `#[McpTool]` is on the class, not on `__invoke()`

## Adding prompts

Follow the same pattern with `#[McpPrompt]` and `shopware.mcp.prompt`:

```php
use Mcp\Capability\Attribute\McpPrompt;

#[McpPrompt(name: 'swag-my-plugin-context', description: 'Context for using the My Plugin MCP tools.')]
class MyPluginContextPrompt
{
    public function __invoke(): array
    {
        return [
            ['role' => 'user', 'content' => 'You are working with the My Plugin Shopware extension...'],
        ];
    }
}
```

## Adding resources

Follow the same pattern with `#[McpResource]` and `shopware.mcp.resource`:

```php
use Mcp\Capability\Attribute\McpResource;

#[McpResource(uri: 'swag-my-plugin://config', name: 'My Plugin Config', description: 'Current configuration values.')]
class MyPluginConfigResource
{
    public function __invoke(): array
    {
        return [
            'uri' => 'swag-my-plugin://config',
            'mimeType' => 'application/json',
            'text' => json_encode(['key' => 'value']),
        ];
    }
}
```

## Extending via Symfony bundle

Symfony bundles (not Shopware plugins) follow the same `shopware.mcp.tool` tag mechanism. The key differences:

- The bundle class extends `Symfony\Component\HttpKernel\Bundle\Bundle`, not `Shopware\Core\Framework\Plugin`
- No Shopware install/activate lifecycle; the bundle is always active when registered in `config/bundles.php`
- Gate services in the bundle's `build()` method instead of using `shopware.feature` tags:

```php
public function build(ContainerBuilder $container): void
{
    if (!Feature::has('MCP_SERVER')) {
        return;
    }
    $loader = new XmlFileLoader($container, new FileLocator(__DIR__ . '/Resources/config'));
    $loader->load('services.xml');
}
```

## Common pitfalls

### Dots in capability names

Names must only contain `a-zA-Z0-9_-`. Dots are not allowed:

```php
// Wrong
#[McpTool(name: 'swag-my-plugin.orders', description: '...')]

// Correct
#[McpTool(name: 'swag-my-plugin-orders', description: '...')]
```

### Attribute on the wrong level

`#[McpTool]` must be on the class. Placing it on `__invoke()` silently drops the tool:

```php
// Wrong (tool is silently skipped)
class MyTool extends McpToolResponse
{
    #[McpTool(name: 'swag-my-plugin-orders', description: '...')]
    public function __invoke(): string { ... }
}

// Correct
#[McpTool(name: 'swag-my-plugin-orders', description: '...')]
class MyTool extends McpToolResponse
{
    public function __invoke(): string { ... }
}
```

### Unhandled exceptions

Unhandled exceptions in `__invoke()` produce a generic MCP error (`-32603`). Catch known exceptions and return `$this->error($message)` instead:

```php
public function __invoke(string $entity): string
{
    try {
        return $this->success(['result' => $data]);
    } catch (\Throwable $e) {
        return $this->error($e->getMessage());
    }
}
```

For write tools, use `$this->executeWithDryRun()`, which catches exceptions automatically and returns structured error responses.

## Further reading

- [MCP Concepts](../../development/tooling/mcp-server/mcp-concepts.md): tools, resources, and prompts explained
- [Best Practices](../../development/tooling/mcp-server/best-practices.md): design principles for MCP tools
- [Configuration](../../development/tooling/mcp-server/configuration.md): allowlist, ACL, and CLI debugging
