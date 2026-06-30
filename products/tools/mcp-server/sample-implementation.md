---
nav:
  title: Build an AI Merchant Assistant
  position: 15

---


# Build an AI Merchant Assistant using the Shopware Admin MCP Server

## Overview

The Shopware Admin MCP Server enables AI agents to interact with Shopware MCP. Instead of integrating directly with the Shopware Administration API, AI clients discover and execute Shopware capabilities exposed by the MCP Server.

In this tutorial, you'll build an AI-powered merchant assistant that can perform common administrative tasks through natural language while abiding by Shopware's authentication and authorization model.

At the end of this tutorial, your assistant will be able to:

- Connect to a Shopware instance
- Discover available MCP capabilities
- Retrieve Shopware entities
- Execute merchant operations
- Abide Shopware ACL permissions
- Execute write operations safely

## Use case

You're developing an AI-powered administration assistant for a Shopware project.

Instead of implementing custom integrations against the Shopware Administration API, you'll use the `shopware-admin-mcp` server to expose Shopware capabilities to any MCP-compatible AI client.

The resulting assistant can help merchants perform administrative tasks such as:

- Searching products
- Retrieving order information
- Updating product data
- Reviewing inventory
- Managing media
- Generating reports

Because the assistant communicates through the Shopware MCP Server, all requests follow Shopware's authentication, authorization, and extension mechanisms.

# What you'll build

By the end of this tutorial, your architecture will look like this:

```text
Merchant

↓

Claude Desktop / Cursor / Codex

↓

Shopware Admin MCP Server

↓

Shopware Administration API

↓

Shopware Core
```

The assistant communicates with Shopware through MCP instead of calling the Administration API directly.

# Prerequisites

Before you begin, ensure you have:

- Shopware **6.7.11.0** or later
- [Shopware Admin MCP Server](https://github.com/shopware/shopware-admin-mcp)
- API credentials
- An MCP-compatible AI client
- Access to the Shopware Administration

If you haven't configured the MCP Server yet, complete:

- Install the Shopware Admin MCP Server
- Configure Authentication

# Step 1 — Install the Shopware Admin MCP Server

Follow the installation guide:

[Install the Shopware Admin MCP Server](https://github.com/shopware/shopware-admin-mcp#installation)

Once installed, verify that the MCP endpoint is available.

# Step 2 — Configure authentication

Configure your preferred authentication method.

Supported methods include:

- Bearer Token
- SW Access Key

The authenticated user determines which MCP capabilities are available.

# Step 3 — Connect an MCP-compatible AI client

Connect your preferred AI client.

Supported examples include:

- Claude Desktop
- Cursor
- Codex
- Shopware Copilot

Once connected, verify that the client discovers the Shopware MCP Server.

# Step 4 — Discover available Shopware capabilities

After establishing the connection, the AI client automatically discovers the capabilities exposed by the Shopware MCP Server.

These include:

| Capability | Description |
|------------|-------------|
| Tools | Execute Shopware operations |
| Resources | Access Shopware reference information |
| Prompts | Provide Shopware-specific guidance |

The available capabilities depend on:

- Installed extensions
- Authenticated user
- Configured allowlists

# Step 5 — Execute merchant operations

Your assistant can now perform merchant operations using natural language.

Example prompts:

> Show products that are currently out of stock.

> List all pending orders.

> Find products without descriptions.

The MCP Server automatically discovers the appropriate tools and executes the requested operations.

# Step 6 — Execute write operations safely

Write operations support **Dry Run** mode.

Before updating Shopware data, execute the operation in Dry Run mode to validate:

- Permissions
- Entity resolution
- Parameters

Once validated, execute the operation normally.

# Step 7 — Restrict your assistant

Merchant assistants rarely require unrestricted access.

Restrict the assistant using:

- ACL permissions
- Tool allowlists
- Resource allowlists
- Prompt allowlists

For example:

| Allowed | Restricted |
|----------|------------|
| Search Products | Delete Products |
| Read Orders | Create Users |
| Generate Reports | Modify System Configuration |

# Step 8 — Extend the assistant

You can expose additional capabilities by creating custom:

- Tools
- Resources
- Prompts

using:

- Plugins
- Symfony Bundles
- Apps

The Shopware MCP Server automatically exposes these extensions to connected AI clients.

# Verify the implementation

Verify that your assistant can:

- Discover Shopware capabilities
- Retrieve Shopware entities
- Execute merchant operations
- Respect ACL permissions
- Execute write operations

If the assistant cannot discover tools, verify:

- Authentication
- MCP configuration
- User permissions

# Related repositories

| Repository | Purpose |
|------------|---------|
| `shopware/shopware` | Core Shopware platform |
| `shopware-admin-mcp` | Shopware Admin MCP Server |
| `SwagMcpMerchantTools` | Merchant-specific MCP capabilities |
| `SwagMcpDevTools` | Development and debugging tools |

# Next steps

Now that you've built a merchant assistant, continue with:

- Connect additional MCP clients
- Extend the Shopware MCP Server
- Create custom MCP Tools
- Create custom Resources
- Create custom Prompts
- Explore the MCP Server Reference
