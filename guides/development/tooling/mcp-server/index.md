---
nav:
  title: MCP Server
  position: 2040

---

# MCP Server

The Model Context Protocol (MCP) is an open standard that lets AI clients (Claude Desktop, Cursor, and Claude Code) talk to external systems through a structured, tool-based interface. Instead of copy-pasting data into a chat window, an AI agent can call a tool like `shopware-entity-search` directly and receive structured results it can reason about.

Shopware ships a native MCP server as part of the core platform. It exposes an endpoint at `/api/_mcp` that any MCP-compatible AI client can connect to using integration credentials.

:::info Experimental
The MCP server is behind the `MCP_SERVER` feature flag and is considered experimental until Shopware 6.8. APIs and tool names may change before the stable release.
:::

## What the MCP server provides

| Capability | Details |
|---|---|
| **HTTP endpoint** | `POST /api/_mcp` via Streamable HTTP transport |
| **Authentication** | Integration credentials or OAuth bearer tokens |
| **Authorization** | Full Admin API ACL enforcement per tool call |
| **Tool allowlist** | Per-integration tool selection in Admin UI |
| **Rate limiting** | Per-integration rate limiting |
| **Discovery** | `bin/console debug:mcp` lists all registered capabilities |
| **Extensibility** | Plugins, bundles, and apps can contribute custom tools, prompts, and resources |

## Architecture

**Core** owns the platform foundation: the HTTP endpoint, authentication bridge, ACL enforcement, rate limiting, capability discovery, and a set of low-level data access primitives (`shopware-entity-*`, `shopware-system-config-*`).

**Plugins and Symfony bundles** run in-process with full access to DAL repositories, the service container, and the Shopware plugin lifecycle. They register tools, prompts, and resources via Symfony service tags. Shopware ships [SwagMcpMerchantAssistant](./shopware-extensions.md) (merchant workflow tools) and [SwagMcpDevTools](./shopware-extensions.md) (developer diagnostics) as examples of what plugins and bundles can do, but extension developers are free to build any capability as a plugin.

**Apps** register capabilities declaratively in `Resources/mcp.xml`. Shopware calls the app's endpoint over HTTP with an HMAC-signed request at runtime. Use an app when your logic runs on a remote service, needs cloud compatibility, or should deploy independently from Shopware.

### Plugin or App?

**Use a plugin or Symfony bundle when:**

- Your tool needs direct DAL / service container access
- You want to ship via the Shopware Marketplace
- Your capability is tightly coupled to Shopware's install / activate lifecycle

**Use an app when:**

- Your logic runs on a remote service (ERP, PIM, CRM, SaaS backend)
- You need Cloud compatibility (apps work where plugins cannot)
- Your capability should deploy and scale independently from Shopware

## Spec coverage and known limitations

Shopware's MCP server is built on `symfony/mcp-bundle`, which implements the [MCP specification (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25). The bundle may not cover every feature in the latest spec revision, and some areas of the spec are only partially implemented. Known gaps:

| Area | Status |
|---|---|
| `listChanged` notifications for tools, prompts, and resources | Not implemented |
| Resource templates and resource subscriptions | Not implemented |
| Protocol-level pagination | Not implemented (Shopware uses application-level `limit`/`page`) |
| Completion utility for prompt/URI template arguments | Not implemented |
| `structuredContent` and `isError` in tool results | Not used; Shopware uses its own `{"success": bool, ...}` envelope |
| ACL checks on resources | Not implemented (resources are public within the authenticated session) |

If a feature you need is missing from `symfony/mcp-bundle`, check its [repository](https://github.com/symfony/mcp-bundle) for open issues and pending releases before building a workaround.

## In this section

| Page | What you will find |
|---|---|
| [MCP Concepts](./mcp-concepts.md) | What tools, resources, and prompts are and when to use each |
| [Getting Started](./getting-started.md) | Connect your first AI client to a Shopware shop |
| [Tools Reference](./tools-reference.md) | All built-in tools, resources, and prompts with parameters |
| [Configuration](./configuration.md) | Feature flag, allowlist, session store, rate limiting, CLI |
| [Best Practices](./best-practices.md) | Design principles for building MCP tools |
| [Extending the MCP Server](./extending.md) | Tools, prompts, and resources for all three extension types side by side |
| [Examples](./examples.md) | Step-by-step workflows for common tasks |
| [Troubleshooting](./troubleshooting.md) | Fix common connection and permission issues |
| [Shopware Extensions](./shopware-extensions.md) | Copilot, SwagMcpMerchantAssistant, SwagMcpDevTools, ai-coding-tools |

## Extension guides

To extend the MCP server with your own tools:

- [Extending via Plugin](../../plugins/plugins/mcp-server.md): in-process PHP with full DAL access, Shopware lifecycle
- [Extending via App](../../plugins/apps/mcp-server.md): webhook-based, works in Shopware Cloud
- [Side-by-side comparison](./extending.md): all three capability types for all three extension types
