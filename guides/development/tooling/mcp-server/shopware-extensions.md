---
nav:
  title: Shopware Extensions
  position: 80

---

# Shopware MCP Extensions

Shopware ships several MCP-related projects beyond the core platform. This page covers what each one does, who it is for, and how to get it.

## Shopware Copilot

Shopware Copilot is the AI assistant embedded directly in the Shopware Administration. It is the primary production consumer of the MCP server; merchants can ask questions, get recommendations, and carry out store management tasks through a conversational interface without leaving the Admin.

Copilot connects to the shop's `/api/_mcp` endpoint under the hood. No extra configuration is needed to use Copilot: once the MCP server is enabled, Copilot automatically has access to the registered tools and can use them on behalf of the merchant.

## SwagMcpMerchantAssistant

**Repository:** `shopware/SwagMcpMerchantAssistant`\
**Distribution:** Shopware Marketplace\
**Tool prefix:** `merchant-*`

A Shopware plugin that extends the MCP server with merchant-focused workflow tools. Where core tools are DAL primitives (search, read, upsert, delete), the MerchantAssistant tools are high-level workflows with human-readable parameters designed for merchant operators.

### Available tools

| Tool | What it does |
|---|---|
| `merchant-order-summary` | Formatted overview of an order including customer, line items, totals, and current state |
| `merchant-customer-lookup` | Find a customer by email address, customer number, or UUID |
| `merchant-product-create` | Create a product with natural parameters (gross price, tax rate, currency code) and resolve IDs internally |
| `merchant-revenue-report` | Revenue breakdown for a date range, grouped by day, week, or month |
| `merchant-bestseller-report` | Top products by quantity sold for a date range |
| `merchant-storefront-search` | Customer-facing product search with resolved prices and customer-specific pricing |
| `merchant-cart-manage` | Create, inspect, and modify a cart |
| `merchant-cart-checkout` | Complete a cart checkout |
| `merchant-checkout-methods` | List available payment and shipping methods for a sales channel |

All write tools default to `dryRun=true`.

## SwagMcpDevTools

**Repository:** `shopware/SwagMcpDevTools`\
**Distribution:** Shopware CLI (`shopware extension install SwagMcpDevTools`)\
**Tool prefix:** `swag-dev-tools-*`

A Symfony bundle (not a plugin) that adds developer diagnostic tools to the MCP server. It targets environments where host-side tools cannot reach the Shopware instance directly, for example SaaS environments, staging servers, and on-premise deployments.

### Available tools

| Tool | What it does |
|---|---|
| `swag-dev-tools-log-stream` | Read recent Monolog entries from disk, filtered by level and timestamp |
| `swag-dev-tools-log-search` | Search log files for substring matches, with optional level and filename filters |

Access is read-only and controlled by MCP authentication and the per-integration allowlist. Sensitive fields (passwords, tokens, auth headers) are automatically redacted; values longer than 300 characters are truncated.

Install via one line in `config/bundles.php` after requiring the package, which is simpler than plugin lifecycle management.

## ai-coding-tools

**Repository:** `shopwareLabs/ai-coding-tools`\
**Distribution:** Shopware Labs (experimental)

A separate project for **developer-facing** local MCP tools: code generation, testing, linting, cache clearing, and deployment operations. This is distinct from the shop's `/api/_mcp` endpoint.

Where `/api/_mcp` gives AI clients access to shop data and merchant operations, `ai-coding-tools` gives AI coding assistants in your IDE access to the Shopware development environment itself. Use this when you want your IDE's AI to run `bin/console`, execute tests, or generate boilerplate code against a local Shopware installation.

:::info Experimental
`ai-coding-tools` lives under the `shopwareLabs` GitHub organization and is considered experimental. APIs may change without notice.
:::
