---
nav:
  title: Store API MCP
  position: 75

---

# Store API MCP

Next to the Admin API MCP server at `/api/_mcp`, Shopware exposes a second, sales-channel-facing MCP server at `/store-api/_mcp`. It runs in a Store API sales-channel context instead of an Admin API session, which makes it the endpoint for shopper-side agents: an AI client that browses a shop, resolves the current context, and works with the same data a storefront would see.

:::info Experimental
The Store API MCP server was introduced in Shopware 6.7.11.0 and, like the Admin API server, is experimental until Shopware 6.8. Tool names and payloads may still change.
:::

## Endpoint

| Property    | Value                                     |
|-------------|-------------------------------------------|
| Path        | `/store-api/_mcp`                         |
| Methods     | `GET`, `POST`, `DELETE`, `OPTIONS`         |
| Transport   | Streamable HTTP                            |
| Route scope | `store-api`                                |

`POST` carries the JSON-RPC messages, `GET` opens a stream for server-initiated messages such as `notifications/tools/list_changed`, and `DELETE` ends the MCP session and releases its state.

If `symfony/mcp-bundle` is not installed, the endpoint answers with HTTP 404.

## Authentication and authorization

The endpoint uses standard Store API authentication:

| Header             | Required | Purpose                                                                     |
|--------------------|----------|-----------------------------------------------------------------------------|
| `sw-access-key`    | yes      | Sales channel access key, as for any other Store API route                   |
| `sw-context-token` | no       | Continues an existing sales-channel context. Without it, Shopware creates an anonymous context |
| `Mcp-Session-Id`   | no       | Returned by `initialize`; required for session-scoped features such as toolsets |

No customer login is required. Whether a customer is logged in only changes what the context reports and what the sales-channel context permits.

Authorization differs from the Admin API server in two important ways:

- **No Admin API ACL.** Access is bounded by the Store API and the current sales-channel context, not by ACL privileges.
- **No MCP allowlist.** The per-integration and per-user allowlists apply to the Admin API server only. Every tool registered for the Store API scope is reachable by every client that can authenticate against the sales channel.

Keep both in mind when you register your own Store API tools: the sales channel context is the entire security boundary, so each tool must validate its own input and scope its own data access.

## Progressive discovery

The Store API server uses the same progressive discovery flow as the Admin API server. A fresh session advertises only the discovery tools; every other tool is deferred until its toolset is enabled.

:::warning Behavior change
Since Shopware 6.7.14.0, a bare `tools/list` on `/store-api/_mcp` no longer returns the full catalogue. Even `shopware-store-api-context` is deferred behind the `store-api` toolset. Clients that expected the complete list must either follow the discovery flow or enable the toolset explicitly.
:::

The server advertises `instructions` during `initialize` that state the same thing:

> This MCP server exposes Store API capabilities. All operations run in the current sales-channel context and use Store API authentication headers. The advertised tool list is not the full catalogue: if no advertised tool matches the requested action, call shopware-tool-search first instead of assuming the action is unsupported, then use shopware-toolsets-list and shopware-toolset-enable to make a matched tool callable if your client cannot invoke it inline.

## Tools

The discovery tools use the same names and parameters as on the Admin API — see [Discovery tools](./tools-reference.md#discovery-tools):

- `shopware-tool-search`
- `shopware-toolsets-list`
- `shopware-toolset-enable`

Core ships one domain tool:

### shopware-store-api-context

Reads the current sales-channel context for the session. It has no parameters and belongs to the `store-api` toolset.

```json
{
  "success": true,
  "data": {
    "salesChannelId": "...",
    "token": "...",
    "languageId": "...",
    "currencyId": "...",
    "customerAuthenticated": false,
    "customerId": null
  }
}
```

If the request carries no resolvable sales-channel context, the tool returns `No Store API sales-channel context is available for this MCP request.`

Core registers no prompts or resources for the Store API scope.

## Sessions and rate limiting

MCP sessions and enabled toolsets use the same storage as the Admin API server, including the `mcp_toolset_session` table and its daily cleanup task — see [Session store](./configuration.md#session-store). Toolset names are not namespaced per endpoint.

Rate limiting uses its own bucket, `mcp_store_api`: 120 requests per minute and 600 per 10 minutes, keyed on the sales channel and context token, plus an additional per-client-IP limit. The limits are deliberately tighter than the Admin API's, because a context token is cheap to rotate. See [Rate limiting](./configuration.md#rate-limiting).

## Advertising the endpoint

Headless and API sales channels can advertise the endpoint through the `agentic` file family, in `/.well-known/ai-catalog.json`. Shopware adds the entry only when all of the following are true:

- The `agentic` file family is enabled for the sales channel in the Administration.
- The sales channel resolves a base URL from one of its domains.
- The sales channel is of type API (headless).

The generated entry looks like this:

```json
{
  "identifier": "urn:air:example.com:server:store-api-mcp",
  "displayName": "Shopware Store API MCP Server",
  "type": "application/mcp-server-card+json",
  "url": "https://example.com/store-api/_mcp",
  "tags": ["shopware", "store-api", "mcp"],
  "capabilities": ["shopware-store-api-context"]
}
```

The endpoint itself has no toggle: it is reachable for every sales channel with a valid access key, whether or not it is advertised. See [Agentic files](../../../guides/plugins/plugins/storefront/templates/agentic-files.md) for how to enable and override the templates.

## Extending the Store API server

Registering a Store API capability works like the Admin API equivalent, but with its own service tags:

| Tag                             | Registers                          |
|---------------------------------|------------------------------------|
| `shopware.store_api_mcp.tool`   | A tool on `/store-api/_mcp`        |
| `shopware.store_api_mcp.prompt` | A prompt on `/store-api/_mcp`      |
| `shopware.store_api_mcp.resource` | A resource on `/store-api/_mcp`   |

Notes for extension developers:

- Use `StoreApiMcpContextProvider` to obtain the sales-channel context. There is no Admin API context and no `requirePrivilege()` equivalent.
- Assign a group with `#[McpToolGroup]` so clients can discover and enable your tools — the same grouping rules apply as for the Admin API. See [Assign a tool group](../../../guides/plugins/plugins/mcp-server.md#step-2-assign-a-tool-group).
- Registering the same tool name for both scopes requires two classes. The MCP SDK binds a tool to the class that carries the `#[McpTool]` attribute, which is why core has separate Admin API and Store API discovery tool classes.
- `bin/console debug:mcp` covers the Admin API server only. Store API capabilities do not appear in its output.
