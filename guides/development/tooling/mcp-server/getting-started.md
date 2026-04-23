---
nav:
  title: Getting Started
  position: 20

---

# Getting Started

This guide walks you through connecting an AI client to a Shopware shop using the built-in MCP server.

## Prerequisites

- Shopware 6.7 or later
- `symfony/mcp-bundle` installed (`composer require symfony/mcp-bundle`)
- The `MCP_SERVER` feature flag enabled (see [Configuration](./configuration.md))

## Step 1: Enable the feature flag

Add the following to your `.env` file:

```
MCP_SERVER=1
```

This activates the MCP endpoint at `/api/_mcp` and registers all tools, resources, and prompts.

## Step 2: Create an integration

Create a Shopware integration for the MCP client. The integration provides the credentials the client will use to authenticate.

```bash
bin/console integration:create "My MCP Client" --admin
```

This outputs an access key and secret:

```
SHOPWARE_ACCESS_KEY_ID=SWIA...
SHOPWARE_SECRET_ACCESS_KEY=...
```

:::info Restrict access
The `--admin` flag grants full Admin API access. For production use, omit `--admin`, create a dedicated ACL role with only the required permissions, and assign it to the integration. See [Configuration](./configuration.md#acl-and-permissions) for details.
:::

## Step 3: Configure your AI client

### Claude Desktop and Cursor

Both clients use `"type": "streamable-http"`. Add the following config to the appropriate file:

| Client | Config file |
|---|---|
| Claude Desktop (macOS) | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json` |
| Cursor (project) | `.cursor/mcp.json` in your project root |
| Cursor (user) | `~/.cursor/mcp.json` |

```json
{
    "mcpServers": {
        "shopware": {
            "type": "streamable-http",
            "url": "https://your-shop.example.com/api/_mcp",
            "headers": {
                "sw-access-key": "SWIA...",
                "sw-secret-access-key": "..."
            }
        }
    }
}
```

### Claude Code

Claude Code uses `"type": "http"` — the MCP spec calls the transport `"streamable-http"`, but Claude Code only accepts the shorter form. Create `.mcp.json` in your project root:

```json
{
    "mcpServers": {
        "shopware": {
            "type": "http",
            "url": "http://localhost:8000/api/_mcp",
            "headers": {
                "sw-access-key": "SWIA...",
                "sw-secret-access-key": "..."
            }
        }
    }
}
```

Or register via CLI:

```bash
claude mcp add --transport http shopware http://localhost:8000/api/_mcp \
  --header "sw-access-key: SWIA..." \
  --header "sw-secret-access-key: ..."
```

:::warning Keep credentials out of version control
Never commit `.mcp.json`, `.cursor/mcp.json`, or other files containing integration credentials. These files are already listed in the `.gitignore` of the Shopware project template.
:::

### Codex

Codex stores MCP servers in `config.toml`, not in a JSON file. Add the server to `~/.codex/config.toml` (global) or `.codex/config.toml` in a trusted project:

```toml
[mcp_servers.shopware]
url = "https://your-shop.example.com/api/_mcp"
env_http_headers = { "sw-access-key" = "SHOPWARE_MCP_ACCESS_KEY", "sw-secret-access-key" = "SHOPWARE_MCP_SECRET_KEY" }
enabled = true
```

The `url` field tells Codex this is an HTTP MCP server. No `type` field is needed. The `env_http_headers` values are environment variable names, not the credentials themselves. Export the actual values in your shell:

```bash
export SHOPWARE_MCP_ACCESS_KEY='SWIA...'
export SHOPWARE_MCP_SECRET_KEY='...'
```

:::info Why not `codex mcp add --url`?
The CLI shortcut supports bearer-token auth but not custom HTTP headers. For Shopware's `sw-access-key` / `sw-secret-access-key` auth, editing `config.toml` directly is required.
:::

## Step 4: First connection

After adding the configuration, open or restart your AI client and look for the Shopware MCP server in the tools panel. The first connection may take a few seconds while Shopware boots its kernel and warms up caches. If the client shows "No tools" briefly, wait a moment and refresh.

Verify the server is working with the CLI:

```bash
bin/console debug:mcp
```

This lists all registered tools, prompts, and resources, the same view the AI client sees.

## Authentication methods

### Integration credentials (recommended)

Pass `sw-access-key` and `sw-secret-access-key` as HTTP headers. Credentials are valid as long as the integration exists with no token expiration or manual refresh.

### Bearer token

Standard Admin API OAuth bearer tokens also work. Obtain one via the `/api/oauth/token` endpoint. Tokens expire (default: 10 minutes), so integration credentials are preferred for persistent MCP clients.

## Controlling which tools are available

By default an admin integration can call all registered tools. To restrict access:

1. Go to **Settings → Integrations**
2. Open the context menu for your integration → **Edit MCP Tools**

<img src="../../../../assets/mcp-integrations-edit-mcp-tools-action.png" alt="Edit MCP Tools action in the Integrations list" width="700">

3. Disable the "All tools" toggle and select only the tools this integration should use

<img src="../../../../assets/mcp-integrations-tool-selection-modal.png" alt="Tool selection modal" width="500">

When a tool is enabled, its declared dependencies are automatically included. For example, enabling `shopware-entity-delete` also enables `shopware-entity-search` and `shopware-entity-schema` because they are required for it to work.

See [Configuration](./configuration.md) for the global `allowed_tools` safety switch and session store options.

## Next steps

- [Tools Reference](./tools-reference.md): explore all built-in tools and resources
- [Examples](./examples.md): try common workflows end-to-end
- [Troubleshooting](./troubleshooting.md): fix connection and permission issues
