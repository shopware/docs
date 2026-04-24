---
nav:
  title: Extending the MCP Server
  position: 60

---

# Extending the MCP Server

You can add three capability types to the MCP server: **tools**, **prompts**, and **resources**. There are three ways to implement them: as an **app** (webhook-based, works in Shopware Cloud), a **plugin** (in-process PHP, full DAL access), or a **Symfony bundle** (in-process, always active, no install lifecycle).

This page is a quick reference. For step-by-step guides, see:

- [Extending via Plugin](../../../plugins/plugins/mcp-server.md)
- [Extending via App](../../../plugins/apps/mcp-server.md)

**Working examples:**

- [shopwareLabs/SwagMcpAdminUsers](https://github.com/shopwareLabs/SwagMcpAdminUsers): plugin with tools, prompts, and resources for admin user management
- [shopwareLabs/McpHelloWorld](https://github.com/shopwareLabs/McpHelloWorld): minimal app with tools, prompts, and resources

## Tools

Tools let the AI agent call your code to take action or fetch data.

<Tabs>

<Tab title="App">

Declare in `Resources/mcp.xml`, handle via webhook POST. The full name is auto-prefixed with the app name.

```xml
<mcp-tools>
    <mcp-tool name="sync-orders" url="https://app.example.com/mcp/sync-orders">
        <label>Sync Orders</label>
        <description>Synchronize orders with the ERP</description>
        <input-schema>
            <property name="since" type="string" description="ISO 8601 date" required="true"/>
        </input-schema>
    </mcp-tool>
</mcp-tools>
```

Webhook response: return a JSON string, ideally following the `{"success": bool, "data": ...}` envelope.

→ [Full app guide](../../../plugins/apps/mcp-server.md): webhook protocol, signature verification, lifecycle

</Tab>

<Tab title="Plugin">

PHP class with `#[McpTool]` on the class, tagged `shopware.mcp.tool` in `services.xml`.

```php
#[McpTool(name: 'swag-my-plugin-orders', description: 'List recent orders.')]
#[McpToolRequires('order:read')]
class OrdersTool extends McpToolResponse
{
    public function __invoke(int $limit = 10): string
    {
        $context = $this->contextProvider->getContext();
        if ($error = $this->requirePrivilege($context, 'order:read')) {
            return $error;
        }
        // ... query and return $this->success([...])
    }
}
```

→ [Full plugin guide](../../../plugins/plugins/mcp-server.md): class structure, DI, pitfalls, verification

</Tab>

<Tab title="Bundle">

Identical PHP class and `services.xml` as a plugin. Gate service loading in the bundle's `build()` method:

```php
public function build(ContainerBuilder $container): void
{
    if (!Feature::has('MCP_SERVER')) {
        return;
    }
    // load services.xml with shopware.mcp.tool tag
}
```

Bundles have no install/activate lifecycle. They are always active when registered in `config/bundles.php`.

→ [Plugin guide](../../../plugins/plugins/mcp-server.md): the PHP class and services.xml patterns are identical

</Tab>

</Tabs>

## Prompts

Prompts give the AI context and instructions before tool calls start. Return an array of `{role, content}` message objects.

<Tabs>

<Tab title="App">

Declare in `Resources/mcp.xml`. Webhook body uses `prompt` instead of `tool`. Return an array of message objects:

```xml
<mcp-prompts>
    <mcp-prompt name="erp-context" url="https://app.example.com/mcp/prompt/erp-context">
        <label>ERP Context</label>
        <description>Background context for ERP-synced data</description>
    </mcp-prompt>
</mcp-prompts>
```

```json
[{"role": "user", "content": "You are working with ERP-synced Shopware data..."}]
```

→ [Full app guide](../../../plugins/apps/mcp-server.md#webhook-protocol)

</Tab>

<Tab title="Plugin">

PHP class with `#[McpPrompt]`, tagged `shopware.mcp.prompt`. No need to extend `McpToolResponse`.

```php
#[McpPrompt(name: 'swag-my-plugin-context', description: 'Context for My Plugin tools.')]
class MyPluginContextPrompt
{
    public function __invoke(): array
    {
        return [
            ['role' => 'user', 'content' => 'You have access to order management tools...'],
        ];
    }
}
```

→ [Full plugin guide](../../../plugins/plugins/mcp-server.md#adding-prompts)

</Tab>

<Tab title="Bundle">

Identical to the plugin pattern. Register with `shopware.mcp.prompt` and gate on the feature flag in `build()`.

</Tab>

</Tabs>

## Resources

Resources expose read-only reference data via a URI without using up tool call budget. Return `{uri, mimeType, text}`.

<Tabs>

<Tab title="App">

Declare in `Resources/mcp.xml` with both a `uri` (MCP identifier) and a `url` (webhook endpoint). Webhook body uses `resource` instead of `tool`:

```xml
<mcp-resources>
    <mcp-resource name="erp-status" uri="my-erp://status"
        url="https://app.example.com/mcp/resource/status" mime-type="application/json">
        <label>ERP Status</label>
        <description>Current ERP connection status</description>
    </mcp-resource>
</mcp-resources>
```

```json
{"uri": "my-erp://status", "mimeType": "application/json", "text": "{\"connected\": true}"}
```

→ [Full app guide](../../../plugins/apps/mcp-server.md#webhook-protocol)

</Tab>

<Tab title="Plugin">

PHP class with `#[McpResource]`, tagged `shopware.mcp.resource`. Returns `array{uri, mimeType, text}`.

```php
#[McpResource(uri: 'swag-my-plugin://config', name: 'swag-my-plugin-config',
    description: 'Current plugin configuration.')]
class MyPluginConfigResource
{
    public function __invoke(): array
    {
        return [
            'uri' => 'swag-my-plugin://config',
            'mimeType' => 'application/json',
            'text' => json_encode(['mode' => 'production'], \JSON_THROW_ON_ERROR),
        ];
    }
}
```

→ [Full plugin guide](../../../plugins/plugins/mcp-server.md#adding-resources)

</Tab>

<Tab title="Bundle">

Identical to the plugin pattern. Register with `shopware.mcp.resource` and gate on the feature flag in `build()`.

</Tab>

</Tabs>

## Summary

| | App | Plugin | Bundle |
|---|---|---|---|
| **Tool** | `<mcp-tool>` in `mcp.xml` + webhook handler | `#[McpTool]` class + `shopware.mcp.tool` tag | Same as plugin |
| **Prompt** | `<mcp-prompt>` in `mcp.xml` + webhook returns message array | `#[McpPrompt]` class + `shopware.mcp.prompt` tag | Same as plugin |
| **Resource** | `<mcp-resource>` in `mcp.xml` + webhook returns `{uri, mimeType, text}` | `#[McpResource]` class + `shopware.mcp.resource` tag | Same as plugin |
| **Context access** | Via `source.shopId` in webhook body | `McpContextProvider::getContext()` | Same as plugin |
| **DAL access** | No (remote process) | Full | Full |
| **Lifecycle** | App install/update | Plugin install/activate | Always active |
