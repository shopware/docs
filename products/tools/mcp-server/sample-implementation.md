---
nav:
  title: Build an AI Catalog Quality Assistant
  position: 15

---

# Build an AI Catalog Quality Assistant using the Shopware Admin MCP Server

## Overview

In this tutorial, you'll build an AI-powered catalog quality assistant that helps merchants identify and improve incomplete or inconsistent product data using the Shopware Admin MCP Server.

Instead of implementing custom integrations against the Shopware Administration API, you'll use the Shopware Admin MCP Server to expose Shopware capabilities to any MCP-compatible AI client.

The assistant will help merchants maintain a high-quality product catalog by identifying missing or incomplete product information and enriching it using AI.

## Use case

Catalog quality has a direct impact on customer experience, search relevance, and conversion rates. As product catalogs grow, manually identifying and correcting incomplete product data becomes increasingly time-consuming.

In this tutorial, you'll build an AI assistant that can help merchants:

- Identify products without descriptions.
- Find products missing images.
- Detect missing SEO metadata.
- Identify incomplete product attributes.
- Review inconsistent catalog data.
- Generate or improve product descriptions.
- Enrich missing catalog information.
- Safely apply bulk updates after validation.

The assistant communicates with Shopware through the Shopware Admin MCP Server and performs all operations using the authenticated user's permissions.

# What you'll build

By the end of this tutorial, you'll have an AI assistant capable of:

- Connecting to the Shopware Admin MCP Server.
- Discovering available MCP capabilities.
- Searching and retrieving Shopware entities.
- Identifying catalog quality issues.
- Enriching catalog data.
- Previewing changes using Dry Run.
- Applying validated updates.

# Prerequisites

Before you begin, ensure you have:

- Shopware **6.7.11.0** or later
- Shopware Admin MCP Server configured
- API credentials with appropriate permissions
- An MCP-compatible AI client (Claude Desktop, Cursor, Codex, ChatGPT, or another compatible client)

If you haven't configured the Shopware Admin MCP Server yet, complete the following guides first:

- Install the Shopware Admin MCP Server
- Configure Authentication

# Architecture

```text
Merchant

        │

        ▼

AI Client
(Claude, Cursor, Codex, ...)

        │

        ▼

Shopware Admin MCP Server

        │

        ▼

Shopware Administration API

        │

        ▼

Shopware Core
```

The Shopware Admin MCP Server exposes Shopware capabilities as MCP Tools, Resources, and Prompts that AI clients can discover automatically.

# Step 1 — Connect your AI client

Connect your preferred MCP-compatible AI client to the Shopware Admin MCP Server.

After connecting, verify that the client successfully discovers the Shopware MCP Server and its available capabilities.

# Step 2 — Discover available capabilities

Once connected, the AI client automatically retrieves the capabilities exposed by the Shopware Admin MCP Server.

These include:

| Capability | Description |
|------------|-------------|
| Tools | Execute Shopware operations |
| Resources | Access Shopware reference information |
| Prompts | Provide Shopware-specific context |

The available capabilities depend on the authenticated user, installed extensions, and configured permissions.

# Step 3 — Identify catalog quality issues

Ask your assistant to analyze your product catalog.

Example prompts:

> Find all products without descriptions.

> Find products missing images.

> List products without SEO metadata.

> Identify products with missing manufacturer information.

> Show products that are missing required attributes.

The assistant discovers the appropriate MCP tools and retrieves the requested information from Shopware.

# Step 4 — Enrich catalog data

Once quality issues have been identified, ask the assistant to generate or improve the missing information.

Examples:

> Generate descriptions for products without descriptions.

> Create SEO titles and meta descriptions for products missing metadata.

> Suggest alternative text for product images.

> Improve existing product descriptions based on product specifications.

The generated content can be reviewed before applying any changes.

# Step 5 — Validate changes

Before modifying Shopware data, execute the operation using **Dry Run** mode.

Dry Run validates:

- User permissions
- Entity resolution
- Operation parameters
- Expected changes

without updating any Shopware data.

Review the generated changes before continuing.

# Step 6 — Apply updates

Once you've reviewed the proposed changes, execute the update.

Example:

> Apply the generated descriptions to all reviewed products.

The Shopware Admin MCP Server performs the requested operations using the authenticated user's permissions.

# Step 7 — Secure the assistant

Restrict the assistant to only the capabilities required for catalog management.

For example:

| Allowed | Restricted |
|----------|------------|
| Search Products | Delete Products |
| Update Products | Create Users |
| Read Categories | Modify System Configuration |
| Generate Product Content | Manage Integrations |

Access is controlled using:

- Shopware ACL permissions
- Tool allowlists
- Resource allowlists
- Prompt allowlists

# Extend the assistant

The Shopware MCP ecosystem can be extended with custom capabilities.

You can create custom:

- Tools
- Resources
- Prompts

using:

- Plugins
- Symfony Bundles
- Apps

These extensions become automatically discoverable by connected MCP clients.

# Result

Congratulations!

You have built an AI-powered catalog quality assistant that can:

- Analyze your Shopware product catalog.
- Identify incomplete or inconsistent product data.
- Generate enriched product content.
- Preview changes safely using Dry Run.
- Apply validated updates through the Shopware Admin MCP Server.

# Next steps

Continue exploring the Shopware MCP ecosystem:

- Build an AI Inventory Assistant
- Build an AI Order Operations Assistant
- Extend the Shopware Admin MCP Server
- Create Custom MCP Tools
- Create Custom Resources
- Create Custom Prompts
- Explore the MCP Server Reference
