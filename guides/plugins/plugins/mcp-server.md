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

For remote/webhook-based capabilities, see [Extending via App](../apps/mcp-server.md). For a side-by-side comparison of all three extension types, see [Extending the MCP Server](../../../products/tools/mcp-server/extending.md).

:::info Version requirements
This guide describes Shopware 6.7.14.0 and later. Earlier 6.7 versions need `MCP_SERVER=1` in the environment and have no tool groups or toolsets, so skip [Step 2](#step-2-assign-a-tool-group) there. See [Configuration](../../../products/tools/mcp-server/configuration.md) for details.
:::

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
 └── services.php          # Service registration
```

## Step 1: Create the tool class

The `#[McpTool]` attribute must be on the **class**, not on `__invoke()`. Extend `McpToolResponse` to get the helpers that build the tool result.

```php
<?php declare(strict_types=1);

namespace Swag\MyPlugin\Mcp\Tool;

use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Mcp\Attribute\McpToolDependsOn;
use Shopware\Core\Framework\Mcp\Attribute\McpToolGroup;
use Shopware\Core\Framework\Mcp\Attribute\McpToolRequires;
use Shopware\Core\Framework\Mcp\Context\McpContextProvider;
use Shopware\Core\Framework\Mcp\Result\McpToolResult;
use Shopware\Core\Framework\Mcp\Tool\McpToolResponse;

#[McpTool(name: 'swag-my-plugin-orders', title: 'Order List', description: 'List recent orders for a given customer email.')]
#[McpToolGroup('swag-my-plugin')]
#[McpToolDependsOn('shopware-entity-schema')]
#[McpToolRequires('order:read')]
class MyTool extends McpToolResponse
{
    public function __construct(
        private readonly EntityRepository $orderRepository,
        private readonly McpContextProvider $contextProvider,
    ) {
    }

    public function __invoke(
        #[Schema(description: 'The customer\'s email address.')]
        string $email,
        #[Schema(description: 'How many orders to return, newest first.')]
        int $limit = 10,
    ): McpToolResult
    {
        $context = $this->contextProvider->getContext();
        if ($error = $this->requirePrivilegeResult($context, 'order:read')) {
            return $error;
        }

        $criteria = new Criteria();
        $criteria->addFilter(/* ... */);
        $criteria->setLimit($limit);

        $orders = $this->orderRepository->search($criteria, $context);

        return $this->successResult(
            $orders->map(fn($o) => ['id' => $o->getId(), 'orderNumber' => $o->getOrderNumber()]),
            ['total' => $orders->getTotal()],
            \sprintf('%d orders found.', $orders->getTotal()),
        );
    }
}
```

**Key rules:**

- `#[McpTool]` goes on the class, not on `__invoke()`. The MCP compiler reads class-level attributes; method-level attributes are silently ignored.
- `title` is optional. When set, MCP clients (Claude Desktop, Cursor, etc.) display it in their tool list instead of the machine-readable `name`. Omit it if you have no better label to offer.
- Names must only contain `a-zA-Z0-9_-`.
- Parameter types on `__invoke()` are mapped to JSON schema. Supported: `string`, `int`, `float`, `bool`. Default values make parameters optional.
- Describe each parameter with `#[Schema(description: '...')]` from `Mcp\Capability\Attribute\Schema` on the `__invoke()` parameter. The MCP SDK copies the text into the parameter's `description` in `inputSchema`. A `@param` docblock works as a fallback, but core uses the attribute, and the attribute wins when both are present. See [Best Practices](../../../products/tools/mcp-server/best-practices.md#write-tool-descriptions-for-agent-routing).
- Obtain the request context via `McpContextProvider::getContext()` injected through the constructor. Do not add a `Context` parameter to `__invoke()`. The MCP SDK does not inject it there.
- `requirePrivilegeResult()` returns a failure if a privilege is missing and `null` otherwise; check its return value with `if ($error = $this->requirePrivilegeResult(...)) { return $error; }`. `#[McpToolRequires]` is declarative only; without this call there is no runtime enforcement.
  A tool that needs no privilege declares `#[McpToolRequiresNoPrivilege]` instead, see [Required privileges](#required-privileges).
- Never use `Context::createDefaultContext()` inside a tool. It bypasses the integration's ACL. Use `McpContextProvider::getContext()` instead.
- Declare `McpToolResult` as the return type of `__invoke()` and return the result of a `McpToolResponse` helper, see [Return a tool result](#return-a-tool-result).
  Shopware turns it into the MCP result, including `structuredContent`, `isError`, and `_meta`, see [Response format](../../../products/tools/mcp-server/tools-reference.md#response-format).
  Clients on protocol `2025-06-18` or later get your data as plain JSON text and as `structuredContent`, older clients get the `{"success": …}` envelope as text.
  Since 6.7.17.0, the negotiated protocol revision decides this, not the `v6.8.0.0` feature flag.
  `successResult()` always returns the full data.
  Since 6.7.17.0, Shopware decides when it renders the MCP result whether the result is too large to return inline, see [Large tool results](../../../products/tools/mcp-server/tools-reference.md#large-tool-results).
- Since 6.7.16.0, a `%` in a description or schema is kept as written. Before, text between two `%` without whitespace, such as "5%-10%", was read as a container parameter and broke the MCP endpoint. If you wrote `%%` as a workaround, remove it, otherwise the description now shows `%%`.

### Return a tool result

Starting with Shopware 6.7.17.0, a tool returns a `Shopware\Core\Framework\Mcp\Result\McpToolResult`.
The result holds the data, an optional summary for the model, metadata, or an error, and Shopware renders it in the format of the client's protocol revision.
Build it with the helpers of `McpToolResponse`:

| Helper                                                                   | Returns                                                                                                         |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `successResult($data, $meta = [], $summary = null)`                      | A success with the data, metadata such as `total`, and an optional short summary, for example "3 orders found." |
| `errorResult($message, $code = McpToolError::TOOL_ERROR, $details = [])` | A failure with a message, a stable error code, and optional details the model needs to fix the call             |
| `requirePrivilegeResult($context, ...$privileges)`                       | A failure if a privilege is missing, otherwise `null`                                                           |
| `missingPrivilegesResult($privileges)`                                   | The failure for missing privileges, with the message prefix `Missing privilege:`                                |
| `invalidCriteriaResult($exception)`                                      | A failure with the code `invalid_arguments`, built from the exception that rejected a criteria                  |
| `decodeJsonOrErrorResult($json, $fieldName = 'input')`                   | The decoded array, or a failure if the JSON is malformed or not an object or array                              |
| `executeWithDryRunResult($connection, $context, $operation)`             | The result of `$operation`, a callable that returns a `McpToolResult`, run in a transaction that is rolled back |

The error codes are the constants of `Shopware\Core\Framework\Mcp\Result\McpToolError`: `TOOL_ERROR`, `MISSING_PRIVILEGE`, `INVALID_ARGUMENTS`, and `NOT_FOUND`.
Clients match on the code, not on the message.

A tool that has no data to return, only text for the model, returns `McpToolResult::text('…')`.
Every client gets the text as it is.

:::info Compatibility with Shopware 6.7.16
The `…Result()` helpers and `McpToolResult::text()` exist since Shopware 6.7.17.0.
`McpToolResult` itself exists since 6.7.16.0, so an extension that must also run on 6.7.16 returns `McpToolResult::success($data, $meta)` and `McpToolResult::failure($message, McpToolError::NOT_FOUND)` directly.
For a missing privilege, it checks `$context->isAllowed()` and returns `McpToolResult::failure('Missing privilege: order:read', McpToolError::MISSING_PRIVILEGE)`.
:::

#### Migrate from the legacy string

Before 6.7.17.0, tools declared `__invoke(): string` and returned the `{"success": …}` JSON string that the helpers `success()` and `error()` build.
Starting with Shopware 6.7.17.0, returning that string is deprecated, whether a helper builds it or the tool builds it by hand.
It keeps working in 6.7, but it cannot carry a summary or error details.
The string helpers are marked `@deprecated tag:v6.8.0`. They trigger a deprecation when called and throw once the `v6.8.0.0` feature flag is active.
A tool that returns any other string, such as plain text, triggers the same deprecation.
Run your tests with the `v6.8.0.0` feature flag to find the calls that are left.

Change the return type of `__invoke()` to `McpToolResult` and replace each helper with its counterpart:

| Deprecated helper          | Replacement                 |
| -------------------------- | --------------------------- |
| `success()`                | `successResult()`           |
| `error()`                  | `errorResult()`             |
| `requirePrivilege()`       | `requirePrivilegeResult()`  |
| `missingPrivilegesError()` | `missingPrivilegesResult()` |
| `invalidCriteriaError()`   | `invalidCriteriaResult()`   |
| `decodeJsonOrError()`      | `decodeJsonOrErrorResult()` |
| `executeWithDryRun()`      | `executeWithDryRunResult()` |
| A plain text string        | `McpToolResult::text()`     |

```php
// Before
public function __invoke(string $id): string
{
    return $this->success(['id' => $id]);
}

// After
public function __invoke(string $id): McpToolResult
{
    return $this->successResult(['id' => $id]);
}
```

The callable you pass to `executeWithDryRunResult()` returns a `McpToolResult` as well.
A tool that still fails with `MCP tool "…" returned a string` or `returned the legacy {"success": …} JSON string` still returns a string.
App tools are not affected; their webhook responses keep the `{"success": …}` envelope, see [Returning a response](../apps/mcp-server.md#returning-a-response).

The PHPStan rule `shopware.mcpToolLegacyStringResult` reports an `#[McpTool]` method whose native return type is `string`, `?string`, a union containing `string`, `mixed`, or missing.
In 6.7 it is registered in `core-rules.neon` only, so it does not fail the build of an extension. It moves to `rules.neon` with 6.8.0.
To check your tools now, add it to your `phpstan.neon`:

```yaml
rules:
    - Shopware\Core\DevOps\StaticAnalyze\PHPStan\Rules\McpToolLegacyStringResultRule
```

### Declare tool annotations

MCP clients read the tool annotations of the MCP specification to decide when to ask the user before a call.
Declare them with the `annotations` argument of `#[McpTool]`:

```php
use Mcp\Schema\ToolAnnotations;

#[McpTool(
    name: 'swag-my-plugin-orders',
    title: 'Order List',
    annotations: new ToolAnnotations(readOnlyHint: true, openWorldHint: false),
    description: 'List recent orders for a given customer email.',
)]
```

- `readOnlyHint: true` for a tool that never changes shop data, configuration, or session state. Leave out `destructiveHint` and `idempotentHint` then, the specification only reads them for tools that are not read-only.
- `readOnlyHint: false` as soon as one action of the tool writes, even if `dryRun` defaults to `true`.
- `destructiveHint: true` for a tool that can remove or overwrite existing data, `false` for a tool that only adds data.
- `idempotentHint: true` when repeating a call with the same arguments has no further effect.
- `openWorldHint: false` for a tool that only acts on the shop, `true` for one that reaches external systems.

A tool without annotations gets the defaults of the specification, which describe a destructive tool that reaches outside the shop.
The hints are not enforced, ACL and `dryRun` still protect the shop.
Starting with Shopware 6.7.17.0, all core tools declare their annotations.

## Step 2: Assign a tool group

For in-process extensions, including plugins and Symfony bundles, assign every tool to a focused group with `#[McpToolGroup]`:

```php
#[McpToolGroup('swag-my-plugin')]
```

Groups organize tools in the Administration allowlist and `debug:mcp`. Each group also becomes a toolset that an MCP client can enable for its current session. Use a stable, hyphenated name that keeps related tools together without loading unrelated schemas. A tool belongs to exactly one group, so the attribute cannot be repeated. The toolset title is generated from the group name — `swag-my-plugin` becomes "Swag my plugin tools".

Starting with Shopware 6.7.17.0, describe the whole toolset with the `description` argument, so a model can tell from `shopware-toolsets-list` which toolset fits a task:

```php
#[McpToolGroup('swag-my-plugin', description: 'Orders and customers of My Plugin. Enable it for questions about plugin orders.')]
```

Set the description on one tool of the group. Without one, the toolset gets the generated description `Tools explicitly assigned to the "<group>" MCP tool group.`
If several extension tools of a group set a description, the one of the tool whose name sorts first wins.
You can add tools to a core toolset such as `entity`, but you cannot change its description.
When the allowlist of the caller hides some tools of a toolset, the toolset falls back to the generated description, so describe what the whole toolset does.

The attribute is optional. Without it, Shopware uses the longest hyphen-separated name prefix that the tool shares with another tool that also has no explicit group. For example, `swag-my-plugin-orders` and `swag-my-plugin-products` form the group `swag-my-plugin`. A tool without a longer shared prefix falls back to its first name segment, such as `swag`. Prefixes are compared segment by segment and case-insensitively, so `swagfoo-orders` and `swag-orders` share nothing.

Because the inferred group depends on which other tools are registered without a group, declare the group explicitly when you need a stable toolset name or want a different grouping. An explicit group also takes precedence over the group Shopware derives for app tools.

The `discovery` group is reserved for the core discovery tools `shopware-tool-search`, `shopware-toolsets-list`, and `shopware-toolset-enable`. Do not use it for your own tools.

Starting with Shopware 6.7.16.0, a tool that declares `#[McpToolGroup('discovery')]` is moved to the `other` toolset when the container is built. It stays callable and can be enabled, but it is no longer advertised at the start of a session. `bin/console debug:mcp` lists such tools in a warning, and the PHPStan rule `shopware.mcpReservedToolGroup` reports them. To make your tools visible on the first `tools/list`, give them a group of their own and let clients select it with `?toolsets=<group>`, see [Select toolsets when connecting](../../../products/tools/mcp-server/getting-started.md#select-toolsets-when-connecting).

Before 6.7.16.0, a tool in the `discovery` group was always advertised and could be neither enabled nor disabled.

## Step 3: Declare dependencies and privileges

### Tool dependencies

When your tool only makes sense after the agent has used another tool, declare that relationship with `#[McpToolDependsOn]`:

```php
#[McpToolDependsOn('shopware-entity-schema')]   // agent should know the schema first
#[McpToolDependsOn('shopware-entity-search')]    // and be able to search
```

The attribute is repeatable. When an operator enables your tool in the Admin UI, all declared dependencies (and their transitive dependencies) are automatically added to the integration's allowlist.

Only declare a dependency when it is genuinely required; unnecessary dependencies inflate every integration's allowlist.

### Required privileges

Declare the [ACL privileges](../../../products/tools/mcp-server/configuration.md#acl-and-permissions) your tool needs with `#[McpToolRequires]` so operators can configure roles correctly:

```php
// Static privilege
#[McpToolRequires('order:read')]

// Dynamic privilege (entity name comes from a runtime parameter)
#[McpToolRequires(entityParam: 'entity', operations: ['read', 'update'])]
```

The attribute is **declarative only**: it populates the Admin UI coverage warnings and `bin/console debug:mcp` output. You still must call `$this->requirePrivilegeResult($context, 'order:read')` inside `__invoke()` for actual runtime enforcement.

A tool that reads no shop data and needs no privilege declares `#[McpToolRequiresNoPrivilege]` instead, with a reason for reviewers and operators:

```php
use Shopware\Core\Framework\Mcp\Attribute\McpToolRequiresNoPrivilege;

#[McpTool(name: 'swag-my-plugin-schema', description: '...')]
#[McpToolRequiresNoPrivilege(reason: 'Reads entity definitions only, never a repository.')]
class MySchemaTool extends McpToolResponse
```

Core uses it for `shopware-entity-schema` and the three discovery tools.
Like `#[McpToolRequires]`, it grants nothing at runtime, and the DAL still checks the ACL of every repository call.
The attribute exists since Shopware 6.7.17.0.

Tools on the Store API endpoint (`shopware.store_api_mcp.tool`) run in a sales channel context, where Admin ACL privileges do not apply.
Do not declare `#[McpToolRequires]` on them, and do not call `requirePrivilegeResult()` or `requirePrivilege()`.

### Check privileges with PHPStan

Starting with Shopware 6.7.17.0, the Shopware PHPStan rule set checks the privileges of MCP tools from plugins and bundles:

| Identifier                             | Reports                                                                                                                                                                                          | Fix                                                                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `shopware.mcpAdminToolMissingRequires` | An Admin API tool (`/api/_mcp`) with neither `#[McpToolRequires]` nor `#[McpToolRequiresNoPrivilege]` on its class, or with both                                                                 | Declare every privilege the tool needs with `#[McpToolRequires]`, and keep checking them with `requirePrivilegeResult()`. Only a tool that needs no privilege declares `#[McpToolRequiresNoPrivilege]` |
| `shopware.mcpStoreApiToolAdminAcl`     | A Store API tool (`/store-api/_mcp`) that declares `#[McpToolRequires]` or calls `requirePrivilegeResult()` or `requirePrivilege()`, also in a method it inherits from a parent class or a trait | Remove the attribute and the call, and rely on the sales channel context and the Store API routes it calls                                                                                             |

Every Admin API tool declares exactly one of the two attributes on its class.
An attribute on `__invoke()` does not count, because Shopware only reads it from the class.
The Store API rule does not follow calls into helper services.
A tool class registered on both endpoints is checked by both rules, so it can only declare `#[McpToolRequiresNoPrivilege]`.

Both rules tell the two endpoints apart by the service tags in the compiled container, `shopware.store_api_mcp.tool` for the Store API and `shopware.mcp.tool` or `mcp.tool` for the Admin API.
They need [phpstan/phpstan-symfony](https://github.com/phpstan/phpstan-symfony) with `parameters.symfony.containerXmlPath` pointing to a compiled container that registers your tools.
Without it, or with a container that does not contain your plugin, both rules report nothing:

```yaml
# phpstan.neon
includes:
    - vendor/shopware/core/DevOps/StaticAnalyze/PHPStan/rules.neon

parameters:
    symfony:
        containerXmlPath: var/cache/dev_h<hash>/Shopware_Core_KernelDevDebugContainer.xml
```

Build the container with your plugin installed and active, for example with `bin/console cache:clear`, before you run PHPStan.
The cache directory name contains a hash and the file name depends on your kernel class and environment, so check the path in your `var/cache` directory.

## Step 4: Register the service

In `src/Resources/config/services.php`, tag the service with `shopware.mcp.tool`:

```php
<?php declare(strict_types=1);

use Shopware\Core\Framework\Mcp\Context\McpContextProvider;
use Swag\MyPlugin\Mcp\Tool\MyTool;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(MyTool::class)
        ->args([
            service('order.repository'),
            service(McpContextProvider::class),
        ])
        ->tag('shopware.mcp.tool');
};
```

Plugin tools use `shopware.mcp.tool` (not `mcp.tool`). The MCP compiler remaps this tag to `mcp.tool` at compile time and assigns the tool to the Admin API server (`/api/_mcp`). You do not need a `shopware.feature` flag tag, and you do not need to list your plugin's namespace or directory in any MCP configuration.

### Available tags

| Shopware tag            | Purpose             |
| ----------------------- | ------------------- |
| `shopware.mcp.tool`     | Register a tool     |
| `shopware.mcp.prompt`   | Register a prompt   |
| `shopware.mcp.resource` | Register a resource |

## Step 5: Install and verify

```bash
bin/console plugin:refresh
bin/console plugin:install --activate SwagMyPlugin
bin/console cache:clear
```

Verify the tool is registered:

```bash
bin/console debug:mcp
```

If the tool appears here, it is registered in the live HTTP endpoint and can be discovered through its toolset. If it does not appear, check:

- Plugin is installed and active
- Service is tagged with `shopware.mcp.tool`
- `#[McpTool]` is on the class, not on `__invoke()`

Since Shopware 6.7.16.0, `debug:mcp` also warns about tools that were moved from the reserved `discovery` group to `other`. Give such a tool a group of its own.

Since Shopware 6.7.15.0, `debug:mcp` lists tools only. Use `bin/console debug:mcp --native` to verify prompts and resources.

Starting with Shopware 6.7.16.0, integrations and non-admin users can only call your tool after it is selected in their MCP allowlist. Tell operators which tools to select, or group them so that one toolset covers the use case.

## Adding prompts

Follow the same pattern with `#[McpPrompt]` and `shopware.mcp.prompt`:

```php
use Mcp\Capability\Attribute\McpPrompt;

#[McpPrompt(name: 'swag-my-plugin-context', title: 'My Plugin Context', description: 'Context for using the My Plugin MCP tools.')]
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

#[McpResource(uri: 'swag-my-plugin://config', name: 'swag-my-plugin-config', description: 'Current configuration values.')]
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
- Load services unconditionally in the bundle's `build()` method:

```php
public function build(ContainerBuilder $container): void
{
    $loader = new PhpFileLoader($container, new FileLocator(__DIR__ . '/Resources/config'));
    $loader->load('services.php');
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

`#[McpTool]` must be in the class. Placing it on `__invoke()` silently drops the tool:

```php
// Wrong (tool is silently skipped)
class MyTool extends McpToolResponse
{
 #[McpTool(name: 'swag-my-plugin-orders', description: '...')]
    public function __invoke(): McpToolResult { ... }
}

// Correct
#[McpTool(name: 'swag-my-plugin-orders', description: '...')]
class MyTool extends McpToolResponse
{
    public function __invoke(): McpToolResult { ... }
}
```

### Unhandled exceptions

Unhandled exceptions in `__invoke()` produce a generic MCP error (`-32603`). Catch known exceptions and return `$this->errorResult($message)` instead:

```php
public function __invoke(string $entity): McpToolResult
{
    try {
        return $this->successResult(['result' => $data]);
    } catch (\Throwable $e) {
        return $this->errorResult($e->getMessage());
    }
}
```

For write tools, use `$this->executeWithDryRunResult()`, which catches exceptions automatically and returns them as a failure.

## Further reading

- [MCP Concepts](../../../products/tools/mcp-server/mcp-concepts.md): tools, resources, and prompts explained
- [Best Practices](../../../products/tools/mcp-server/best-practices.md): design principles for MCP tools
- [Configuration](../../../products/tools/mcp-server/configuration.md): allowlist, ACL, and CLI debugging
- [SwagMcpAdminUsers](https://github.com/shopwareLabs/SwagMcpAdminUsers): example plugin registering tools, prompts, and resources for admin user management
