---
nav:
  title: Extending the MCP Server
  position: 55

---

# Extending the MCP Server

You can add three capability types to the MCP server: **tools**, **prompts**, and **resources**. There are three ways to implement them: as an **app** (webhook-based, works in Shopware Cloud), a **plugin** (in-process PHP, full DAL access), or a **Symfony bundle** (in-process, always active, no install lifecycle).

:::info Compatibility with earlier Shopware versions
When using MCP on a Shopware 6.7 version earlier than 6.7.14.0, enable the server
by setting `MCP_SERVER=1` in the environment. Starting with Shopware 6.7.14.0,
the feature flag is removed and the MCP server is always enabled.

Register extension capabilities normally in both cases. The flag controls the
MCP server itself; extension services do not need a `shopware.feature` tag.
:::

This page is a quick reference. For step-by-step guides, see:

- [Extending via Plugin](../../../guides/plugins/plugins/mcp-server.md)
- [Extending via App](../../../guides/plugins/apps/mcp-server.md)

**Working examples:**

- [shopwareLabs/SwagMcpAdminUsers](https://github.com/shopwareLabs/SwagMcpAdminUsers): plugin with tools, prompts, and resources for admin user management
- [shopwareLabs/McpHelloWorld](https://github.com/shopwareLabs/McpHelloWorld): minimal app with tools, prompts, and resources

## Tools

Tools let the AI agent call your code to take action or fetch data.

<Tabs>

<Tab title="App">

Declare in `Resources/mcp.xml`, handle via webhook POST. The full name is auto-prefixed with the app name, and all tools from the app form a toolset named after the app. Use `<required-privileges>` to help the admin UI warn operators about missing ACL roles. Use `url="/..."` to route to an app script instead of an external URL.

```xml
<mcp-tools>
    <mcp-tool name="sync-orders" url="https://app.example.com/mcp/sync-orders">
        <label>Sync Orders</label><!-- shown as the tool title in MCP client UIs -->
        <description>Synchronize orders with the ERP</description>
        <input-schema>
            <property name="since" type="string" description="ISO 8601 date" required="true"/>
        </input-schema>
        <required-privileges>
            <privilege>order:read</privilege>
        </required-privileges>
    </mcp-tool>
</mcp-tools>
```

Webhook response: return a JSON object, ideally following the `{"success": bool, "data": ...}` envelope.

→ [Full app guide](../../../guides/plugins/apps/mcp-server.md): webhook protocol, signature verification, lifecycle

</Tab>

<Tab title="Plugin">

PHP class with `#[McpTool]` on the class, tagged `shopware.mcp.tool` in `services.xml`.

```php
#[McpTool(name: 'swag-my-plugin-orders', title: 'Order List', description: 'List recent orders.')]
#[McpToolGroup('swag-my-plugin')]
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

`#[McpToolGroup]` is optional. Without it, Shopware uses the longest
hyphen-separated name prefix that the tool shares with another tool without an
explicit group. For example, `swag-my-plugin-orders` and
`swag-my-plugin-products` form the group `swag-my-plugin`. A tool without a
longer shared prefix falls back to its first name segment, such as `swag`.
Define the attribute explicitly when the inferred group should not change with
the registered tool catalogue.

→ [Full plugin guide](../../../guides/plugins/plugins/mcp-server.md): class structure, DI, pitfalls, verification

</Tab>

<Tab title="Bundle">

Identical PHP class and `services.xml` as a plugin. Load services unconditionally in the bundle's `build()` method:

```php
public function build(ContainerBuilder $container): void
{
    // load services.xml with shopware.mcp.tool tag
}
```

Bundles have no install/activate lifecycle. They are always active when registered in `config/bundles.php`.

→ [Plugin guide](../../../guides/plugins/plugins/mcp-server.md): the PHP class and services.xml patterns are identical

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

→ [Full app guide](../../../guides/plugins/apps/mcp-server.md#webhook-protocol)

</Tab>

<Tab title="Plugin">

PHP class with `#[McpPrompt]`, tagged `shopware.mcp.prompt`. No need to extend `McpToolResponse`.

```php
#[McpPrompt(name: 'swag-my-plugin-context', title: 'My Plugin Context', description: 'Context for My Plugin tools.')]
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

→ [Full plugin guide](../../../guides/plugins/plugins/mcp-server.md#adding-prompts)

</Tab>

<Tab title="Bundle">

Identical to the plugin pattern. Register with `shopware.mcp.prompt` and load services unconditionally in `build()`.

</Tab>

</Tabs>

## Resources

Resources expose read-only reference data via a URI without consuming the tool's call budget. Return `{uri, mimeType, text}`.

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

→ [Full app guide](../../../guides/plugins/apps/mcp-server.md#webhook-protocol)

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

→ [Full plugin guide](../../../guides/plugins/plugins/mcp-server.md#adding-resources)

</Tab>

<Tab title="Bundle">

Identical to the plugin pattern. Register with `shopware.mcp.resource` and load services unconditionally in `build()`.

</Tab>

</Tabs>

## Summary

|                    | App                                                                     | Plugin                                               | Bundle         |
|--------------------|-------------------------------------------------------------------------|------------------------------------------------------|----------------|
| **Tool**           | `<mcp-tool>` in `mcp.xml` + webhook handler                             | Attributes + `shopware.mcp.tool` service tag         | Same as plugin |
| **Prompt**         | `<mcp-prompt>` in `mcp.xml` + webhook returns message array             | `#[McpPrompt]` class + `shopware.mcp.prompt` tag     | Same as plugin |
| **Resource**       | `<mcp-resource>` in `mcp.xml` + webhook returns `{uri, mimeType, text}` | `#[McpResource]` class + `shopware.mcp.resource` tag | Same as plugin |
| **Context access** | Via `source.shopId` in webhook body                                     | `McpContextProvider::getContext()`                   | Same as plugin |
| **DAL access**     | No (remote process)                                                     | Full                                                 | Full           |
| **Lifecycle**      | App install/update                                                      | Plugin install/activate                              | Always active  |
