---
nav:
  title: About MCP
  position: 30

---

# MCP Support in Shopware

## What is MCP?

The Model Context Protocol (MCP) is a standardized interface that allows AI agents to interact with Shopware.

Instead of building custom integrations for every AI platform, Shopware exposes its capabilities through an MCP server that any MCP-compatible client, including Claude, Cursor, Codex, ChatGPT, Shopware Copilot, and other AI assistants, can consume.

At a high level:

```text

AI Client (Claude, Cursor, Codex, Copilot, ...)
          ↓
      MCP Client
          ↓
 Shopware MCP Server
          ↓
    Shopware Core

```

The MCP server acts as a universal translation layer between AI agents and Shopware. It exposes tools, resources, and prompts that help agents understand what they can do and how to safely interact with a Shopware instance.

## Why does Shopware provide MCP?

AI agents are becoming a new way to interact with software. Instead of navigating user interfaces or integrating directly with APIs, users can delegate tasks to agents using natural language.

MCP allows Shopware to expose its capabilities in a way that AI agents can understand while maintaining security, permissions, and operational control.

With MCP, agents can:

- Discover available tools and capabilities dynamically
- Access Shopware resources and reference data
- Understand data models through schema introspection
- Resolve entities without manually providing UUIDs
- Execute multi-step workflows without human hand-off
- Interact through a single standardized endpoint
- Operate with strict permission and security controls

## What does the Shopware MCP Server provide?

The Shopware MCP Server exposes three types of capabilities that AI agents can discover and use:

| Capability    | Purpose                                                                                                        | Examples                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tools**     | Allow agents to perform actions and operations within Shopware                                                | Product search, entity retrieval, entity creation and updates, order state changes, media uploads, system configuration updates, checkout-related operations |
| **Resources** | Provide structured reference information that helps agents understand the Shopware environment and data model | Entity definitions, sales channels, currencies, languages, state machines, business events, extensions                                                       |
| **Prompts**   | Provide domain-specific guidance and context for AI agents                                                    | Shopware context, query patterns, data model guidance, best practices                                                                                        |

:::info

- Write operations support **dry-run execution**, allowing agents to validate actions before committing changes.
- Available capabilities depend on the configured integration, allowlist, and permissions.
- Together, tools, resources, and prompts help AI agents understand Shopware and perform tasks safely and efficiently.

:::

## Security and control

Shopware MCP is designed with security and governance in mind.

### Access control

Every MCP request is validated against Shopware permissions.

- ACL checks are enforced on every call
- Agents only see the capabilities they are allowed to use
- Permissions are separated from capability visibility

### Allowlists

Administrators can define exactly which tools, resources, and prompts an agent may access.
This enables persona-specific integrations, for example:

- Buyer agent
- Merchant assistant
- Reporting bot
- Developer assistant

Each agent receives only the capabilities required for its job.

### Safe write operations

Write tools support dry-run execution by default, allowing agents to preview changes before committing them.

## Common use cases

### Shopper

Build buyer agents that help users discover and purchase products. Example: "Find me running shoes under €100 and add the best-rated option to my cart."

Potential capabilities:

- Product discovery
- Product comparison
- Cart management
- Checkout assistance

### Merchant

Enable AI assistants that help manage and operate a Shopware store.

Examples:

- Generate product descriptions
- Analyze customer behavior
- Update product information
- Create reports
- Manage catalog changes
- Review orders

### Developer

Build AI-powered integrations and automation workflows.

Examples:

- Store migrations
- Data imports and transformations
- Development assistants
- Custom MCP tools
- Operational automation

Developers can also extend MCP using plugins, bundles, apps, and custom integrations.

## Extending MCP

The Shopware MCP Server can be extended to expose custom capabilities.

Supported extension paths include:

- Plugins
- Symfony bundles
- Apps using webhooks
- Apps using scripts

This allows partners and developers to expose custom tools, resources, and prompts tailored to their business requirements.

## MCP ecosystem

| Component | Purpose |
|-----------|---------|
| [`shopware/shopware`](https://github.com/shopware/shopware) | Core MCP server implementation |
| [`SwagMcpDevTools`](https://github.com/shopware/SwagMcpDevTools) | Development and debugging tools (log search, log stream, notifications) |
| [`SwagMcpMerchantTools`](https://github.com/shopware/SwagMcpMerchantTools) | Merchant-focused workflows and tools |

## Status

The Shopware MCP Server is currently available as an experimental feature.

:::info
Introduced in Shopware 6.7.11.0
Behind the MCP_SERVER feature flag
Based on the MCP specification
Available through the /api/_mcp endpoint
:::

As the feature evolves, APIs, capabilities, and extension points may change based on community and partner feedback.

## Summary

The Shopware MCP Server provides a standardized and secure way for AI agents to interact with Shopware.
By exposing tools, resources, and prompts through MCP, Shopware enables developers, merchants, and AI systems to build powerful commerce experiences without relying on custom integrations.
Whether you want to build a buyer agent, create a merchant assistant, or extend Shopware with custom AI capabilities, MCP provides the foundation for Agentic Commerce.

## Next steps

Now that you understand about MCP, continue with the technical documentation to learn how to set up, configure, and extend the [Shopware MCP Server](../mcp-server/intro.md)
